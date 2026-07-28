import { useCallback, useMemo, useState } from "react";
import { format } from "date-fns";
import { th } from "date-fns/locale";
import {
  AlertCircle,
  Check,
  ChevronLeft,
  ChevronRight,
  QrCode,
} from "lucide-react";

import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

import { DateTimePicker } from "./DateTimePicker";
import { PaymentStep } from "./PaymentStep";
import { Receipt } from "./Receipt";
import { StepTable } from "./StepTable";
import {
  EMPTY_CONTACT,
  MAX_GUESTS,
  MIN_GUESTS,
  OCCASIONS,
  PAYMENT_WINDOW_MINUTES,
  bookingCode,
  bookingReference,
  depositFor,
  formatThb,
  validateContact,
  type ContactDraft,
  type Occasion,
} from "./booking";
import {
  getTable,
  getZone,
  isTableSelectable,
  tableFitsParty,
  type TableSpec,
  type Zone,
} from "./floor";
import { VENUE } from "./venue";

const STEPS = [
  "วันและเวลา",
  "จำนวนคนและโต๊ะ",
  "ข้อมูลผู้จอง",
  "ตรวจสอบ",
  "ชำระมัดจำ",
];

function startOfToday(): Date {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}

function FieldError({ message }: { message?: string }) {
  if (!message) {
    return null;
  }
  return (
    <p className="mt-1.5 flex items-center gap-1.5 text-xs text-destructive">
      <AlertCircle className="size-3.5 shrink-0" />
      {message}
    </p>
  );
}

function SectionTitle({ children }: { children: string }) {
  return (
    <div className="mb-3 flex items-center gap-2">
      <Check className="size-3.5 text-primary" />
      <span className="text-xs font-medium uppercase tracking-[0.18em] text-primary">
        {children}
      </span>
    </div>
  );
}

function ReviewRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4 border-b border-border py-2.5 text-sm last:border-b-0">
      <dt className="shrink-0 text-muted-foreground">{label}</dt>
      <dd className="text-right">{value}</dd>
    </div>
  );
}

/* ---------------------------------------------------------------- step nav */

function StepNav({
  step,
  canEnter,
  onGo,
}: {
  step: number;
  canEnter: (index: number) => boolean;
  onGo: (index: number) => void;
}) {
  return (
    <ol className="mb-8 grid grid-cols-2 gap-2 sm:grid-cols-5">
      {STEPS.map((label, i) => {
        const state = i === step ? "current" : i < step ? "done" : "todo";
        const reachable = canEnter(i);

        return (
          <li key={label}>
            <button
              type="button"
              disabled={!reachable}
              onClick={() => onGo(i)}
              aria-current={state === "current" ? "step" : undefined}
              className={cn(
                "flex w-full items-center gap-2 rounded-md border px-2.5 py-2.5 text-left transition-colors",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40",
                state === "current" && "border-primary bg-primary/10",
                state === "done" &&
                  "border-border bg-card hover:border-primary/60",
                state === "todo" && "border-border/60 bg-transparent",
                !reachable && "cursor-not-allowed opacity-45",
              )}
            >
              <span
                className={cn(
                  "grid size-6 shrink-0 place-content-center rounded-full text-[11px] font-medium",
                  state === "current" && "bg-primary text-primary-foreground",
                  state === "done" && "bg-primary/20 text-primary",
                  state === "todo" && "bg-muted text-muted-foreground",
                )}
              >
                {state === "done" ? <Check className="size-3.5" /> : i + 1}
              </span>
              <span
                className={cn(
                  "truncate text-xs",
                  state === "todo" ? "text-muted-foreground" : "text-foreground",
                )}
              >
                {label}
              </span>
            </button>
          </li>
        );
      })}
    </ol>
  );
}

/* --------------------------------------------------------- step 3: contact */

function StepContact({
  contact,
  errorFor,
  onChange,
  onBlur,
}: {
  contact: ContactDraft;
  errorFor: (field: keyof ContactDraft) => string | undefined;
  onChange: <K extends keyof ContactDraft>(
    field: K,
    value: ContactDraft[K],
  ) => void;
  onBlur: (field: keyof ContactDraft) => void;
}) {
  return (
    <div className="space-y-5">
      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <Label htmlFor="bk-name">
            ชื่อ-นามสกุล <span className="text-destructive">*</span>
          </Label>
          <Input
            id="bk-name"
            value={contact.name}
            autoComplete="name"
            placeholder="สมชาย ใจดี"
            onChange={(e) => onChange("name", e.target.value)}
            onBlur={() => onBlur("name")}
            aria-invalid={Boolean(errorFor("name"))}
            className="mt-1.5"
          />
          <FieldError message={errorFor("name")} />
        </div>

        <div>
          <Label htmlFor="bk-phone">
            เบอร์โทรศัพท์ <span className="text-destructive">*</span>
          </Label>
          <Input
            id="bk-phone"
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            placeholder="081-234-5678"
            value={contact.phone}
            onChange={(e) => onChange("phone", e.target.value)}
            onBlur={() => onBlur("phone")}
            aria-invalid={Boolean(errorFor("phone"))}
            className="mt-1.5"
          />
          <FieldError message={errorFor("phone")} />
        </div>
      </div>

      <div>
        <Label htmlFor="bk-email">อีเมล (ไม่บังคับ)</Label>
        <Input
          id="bk-email"
          type="email"
          autoComplete="email"
          placeholder="you@example.com"
          value={contact.email}
          onChange={(e) => onChange("email", e.target.value)}
          onBlur={() => onBlur("email")}
          aria-invalid={Boolean(errorFor("email"))}
          className="mt-1.5"
        />
        <FieldError message={errorFor("email")} />
        <p className="mt-1.5 text-xs text-muted-foreground">
          ใส่ไว้เพื่อรับใบเสร็จและลิงก์แก้ไขการจองทางอีเมล
        </p>
      </div>

      <div>
        <Label>โอกาสพิเศษ</Label>
        <div className="mt-2 flex flex-wrap gap-2">
          {OCCASIONS.map((o) => (
            <button
              key={o}
              type="button"
              onClick={() => onChange("occasion", o as Occasion)}
              aria-pressed={contact.occasion === o}
              className={cn(
                "rounded-full border px-3.5 py-1.5 text-xs transition-colors",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40",
                contact.occasion === o
                  ? "border-primary bg-primary/15 text-primary"
                  : "border-border bg-card text-muted-foreground hover:border-primary/60",
              )}
            >
              {o}
            </button>
          ))}
        </div>
      </div>

      <div>
        <Label htmlFor="bk-notes">คำขอเพิ่มเติม</Label>
        <Textarea
          id="bk-notes"
          rows={3}
          maxLength={300}
          placeholder="เช่น ขอโต๊ะมุมเงียบ ๆ / มีคนแพ้ถั่ว / ขอเค้กวันเกิดตอน 22:00"
          value={contact.notes}
          onChange={(e) => onChange("notes", e.target.value)}
          className="mt-1.5"
        />
        <p className="mt-1.5 text-right text-xs tabular-nums text-muted-foreground">
          {contact.notes.length}/300
        </p>
      </div>

      <div className="space-y-3 rounded-lg border border-border bg-card p-4">
        <div>
          <div className="flex items-start gap-3">
            <Checkbox
              id="bk-age"
              checked={contact.ageConfirmed}
              onCheckedChange={(v) => {
                onChange("ageConfirmed", v === true);
                onBlur("ageConfirmed");
              }}
              className="mt-0.5"
            />
            <Label htmlFor="bk-age" className="leading-relaxed">
              ยืนยันว่าข้าพเจ้าอายุ {VENUE.minimumAge} ปีบริบูรณ์ขึ้นไป
              และพร้อมแสดงบัตรประชาชนที่หน้าประตู
            </Label>
          </div>
          <FieldError message={errorFor("ageConfirmed")} />
        </div>

        <div>
          <div className="flex items-start gap-3">
            <Checkbox
              id="bk-terms"
              checked={contact.agreedTerms}
              onCheckedChange={(v) => {
                onChange("agreedTerms", v === true);
                onBlur("agreedTerms");
              }}
              className="mt-0.5"
            />
            <Label htmlFor="bk-terms" className="leading-relaxed">
              ยอมรับเงื่อนไขการจองและนโยบายเงินมัดจำ
            </Label>
          </div>
          <FieldError message={errorFor("agreedTerms")} />
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------- shell */

export function BookingFlow({
  /**
   * Pre-picked from the landing page's plan, the way a cinema seat map hands
   * a seat straight to checkout. The guest still confirms date, party and
   * time — the table is only carried forward, never assumed booked.
   */
  initialTableId = null,
}: {
  initialTableId?: string | null;
} = {}) {
  const today = useMemo(startOfToday, []);

  const [step, setStep] = useState(0);
  const [date, setDate] = useState<Date | undefined>(today);
  const [slot, setSlot] = useState<string | null>(null);
  const [guests, setGuests] = useState(2);
  const [tableId, setTableId] = useState<string | null>(initialTableId);
  const [contact, setContact] = useState<ContactDraft>(EMPTY_CONTACT);
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [showAllErrors, setShowAllErrors] = useState(false);

  const [deadline, setDeadline] = useState(0);
  const [expired, setExpired] = useState(false);
  const [paidAt, setPaidAt] = useState<Date | null>(null);

  const dateKey = date ? format(date, "yyyy-MM-dd") : "";
  const errors = validateContact(contact);

  const table: TableSpec | undefined = tableId ? getTable(tableId) : undefined;
  const zone: Zone | undefined = table ? getZone(table.zoneId) : undefined;
  const deposit = zone ? depositFor(zone, guests) : 0;

  const code =
    date && slot && table
      ? bookingCode(dateKey, slot, table.id, contact.phone)
      : "";
  const reference = code ? bookingReference(VENUE.receiptPrefix, code) : "";

  const stepDone = [
    Boolean(date && slot),
    Boolean(table && slot && isTableSelectable(table, dateKey, slot, guests)),
    Object.keys(errors).length === 0,
    true,
    paidAt !== null,
  ];

  function canEnter(index: number): boolean {
    for (let i = 0; i < index; i++) {
      if (!stepDone[i]) {
        return false;
      }
    }
    return true;
  }

  /* -- cascade: a later choice can never contradict an earlier one -- */

  function handleDate(next: Date | undefined) {
    setDate(next);
    setSlot(null);
    setTableId(null);
  }

  function handleSlot(next: string) {
    setSlot(next);
    // Inventory is per (date, slot, table) — the old table may be taken now.
    setTableId(null);
  }

  function handleGuests(next: number) {
    const clamped = Math.min(MAX_GUESTS, Math.max(MIN_GUESTS, next));
    setGuests(clamped);
    if (table && !tableFitsParty(table, clamped)) {
      setTableId(null);
    }
  }

  function updateContact<K extends keyof ContactDraft>(
    field: K,
    value: ContactDraft[K],
  ) {
    setContact((prev) => ({ ...prev, [field]: value }));
  }

  function markTouched(field: keyof ContactDraft) {
    setTouched((prev) => ({ ...prev, [field]: true }));
  }

  function errorFor(field: keyof ContactDraft): string | undefined {
    return showAllErrors || touched[field] ? errors[field] : undefined;
  }

  function openPayment() {
    setDeadline(Date.now() + PAYMENT_WINDOW_MINUTES * 60_000);
    setExpired(false);
    setStep(4);
  }

  const handleExpire = useCallback(() => setExpired(true), []);

  function renewQr() {
    setDeadline(Date.now() + PAYMENT_WINDOW_MINUTES * 60_000);
    setExpired(false);
  }

  function goNext() {
    if (step === 2 && !stepDone[2]) {
      setShowAllErrors(true);
      return;
    }
    if (step === 3) {
      openPayment();
      return;
    }
    if (!stepDone[step]) {
      return;
    }
    setStep((s) => Math.min(STEPS.length - 1, s + 1));
  }

  function goBack() {
    setStep((s) => Math.max(0, s - 1));
  }

  function reset() {
    setStep(0);
    setDate(today);
    setSlot(null);
    setGuests(2);
    setTableId(null);
    setContact(EMPTY_CONTACT);
    setTouched({});
    setShowAllErrors(false);
    setDeadline(0);
    setExpired(false);
    setPaidAt(null);
  }

  const prettyDate = date
    ? format(date, "EEEEที่ d MMMM yyyy", { locale: th })
    : "—";
  const tableLabel = table && zone ? `${table.id} · ${zone.name}` : "ยังไม่เลือก";

  /* ------------------------------------------------------------- receipt */

  if (paidAt && date && slot && table && zone) {
    return (
      <Receipt
        reference={reference}
        code={code}
        issuedAt={paidAt}
        bookingDate={date}
        slot={slot}
        guests={guests}
        table={table}
        zone={zone}
        deposit={deposit}
        contact={contact}
        onRestart={reset}
      />
    );
  }

  /* ------------------------------------------------------------------ flow */

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_300px]">
      <div className="min-w-0 rounded-xl border border-border bg-card p-5 sm:p-6">
        <StepNav step={step} canEnter={canEnter} onGo={setStep} />

        {step === 0 ? (
          <DateTimePicker
            today={today}
            date={date}
            slot={slot}
            dateKey={dateKey}
            onDate={handleDate}
            onSlot={handleSlot}
          />
        ) : null}

        {step === 1 && slot ? (
          <StepTable
            guests={guests}
            tableId={tableId}
            dateKey={dateKey}
            slot={slot}
            onGuests={handleGuests}
            onTable={setTableId}
          />
        ) : null}

        {step === 2 ? (
          <StepContact
            contact={contact}
            errorFor={errorFor}
            onChange={updateContact}
            onBlur={markTouched}
          />
        ) : null}

        {step === 3 && date && slot && table && zone ? (
          <div>
            <SectionTitle>ตรวจสอบก่อนชำระเงิน</SectionTitle>
            <dl>
              <ReviewRow label="วันที่" value={prettyDate} />
              <ReviewRow label="เวลา" value={`${slot} น.`} />
              <ReviewRow label="จำนวน" value={`${guests} ท่าน`} />
              <ReviewRow label="โต๊ะ" value={table.id} />
              <ReviewRow label="โซน" value={zone.name} />
              <ReviewRow
                label="ยอดขั้นต่ำโซน"
                value={
                  zone.minSpend > 0 ? `฿${formatThb(zone.minSpend)}` : "ไม่มี"
                }
              />
              <ReviewRow label="ผู้จอง" value={contact.name} />
              <ReviewRow label="เบอร์โทร" value={contact.phone} />
              {contact.email ? (
                <ReviewRow label="อีเมล" value={contact.email} />
              ) : null}
              <ReviewRow label="โอกาส" value={contact.occasion} />
              {contact.notes.trim() ? (
                <ReviewRow label="คำขอเพิ่มเติม" value={contact.notes} />
              ) : null}
              <ReviewRow label="เงินมัดจำ" value={`฿${formatThb(deposit)}`} />
            </dl>

            <ul className="mt-5 space-y-1.5">
              {VENUE.house.map((rule) => (
                <li
                  key={rule}
                  className="flex gap-2 text-xs leading-relaxed text-muted-foreground"
                >
                  <span className="text-primary">•</span>
                  {rule}
                </li>
              ))}
            </ul>
          </div>
        ) : null}

        {step === 4 && zone ? (
          <PaymentStep
            reference={reference}
            deposit={deposit}
            deadline={deadline}
            expired={expired}
            onExpire={handleExpire}
            onRenew={renewQr}
            onPaid={() => setPaidAt(new Date())}
          />
        ) : null}

        {/* Controls */}
        <div className="mt-8 flex items-center justify-between gap-3 border-t border-border pt-5">
          <button
            type="button"
            onClick={goBack}
            disabled={step === 0}
            className="flex items-center gap-1.5 rounded-md px-3 py-2 text-sm text-muted-foreground transition-colors hover:text-foreground disabled:cursor-not-allowed disabled:opacity-40"
          >
            <ChevronLeft className="size-4" />
            ย้อนกลับ
          </button>

          {step < 4 ? (
            <button
              type="button"
              onClick={goNext}
              disabled={step !== 2 && !stepDone[step]}
              className={cn(
                "flex items-center gap-1.5 rounded-md px-6 py-2.5 text-sm font-medium transition-colors",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40",
                step !== 2 && !stepDone[step]
                  ? "cursor-not-allowed bg-muted text-muted-foreground"
                  : "bg-primary text-primary-foreground hover:bg-primary/90",
              )}
            >
              {step === 3 ? (
                <>
                  <QrCode className="size-4" />
                  ไปชำระมัดจำ
                </>
              ) : (
                <>
                  ถัดไป
                  <ChevronRight className="size-4" />
                </>
              )}
            </button>
          ) : null}
        </div>
      </div>

      {/* Summary rail */}
      <aside className="lg:sticky lg:top-20 lg:self-start">
        <div className="rounded-xl border border-border bg-card p-5">
          <h3 className="text-xs uppercase tracking-[0.25em] text-primary">
            สรุปการจอง
          </h3>

          <dl className="mt-4">
            <ReviewRow
              label="วันที่"
              value={date ? prettyDate : "ยังไม่เลือก"}
            />
            <ReviewRow
              label="เวลา"
              value={slot ? `${slot} น.` : "ยังไม่เลือก"}
            />
            <ReviewRow label="จำนวน" value={`${guests} ท่าน`} />
            <ReviewRow label="โต๊ะ" value={tableLabel} />
          </dl>

          {zone ? (
            <div className="mt-4 rounded-md bg-primary/10 px-3 py-2.5">
              <div className="flex items-baseline justify-between gap-3">
                <span className="text-xs text-primary">เงินมัดจำ</span>
                <span className="text-lg tabular-nums text-primary">
                  ฿{formatThb(deposit)}
                </span>
              </div>
              <p className="mt-1 text-[11px] leading-relaxed text-primary/80">
                {zone.minSpend > 0
                  ? `30% ของยอดขั้นต่ำ ฿${formatThb(zone.minSpend)}`
                  : `฿300 × ${guests} ท่าน`}
              </p>
            </div>
          ) : null}

          <p className="mt-4 text-xs leading-relaxed text-muted-foreground">
            ที่นั่งว่าง การชำระเงิน และใบเสร็จ เป็นข้อมูลจำลองสำหรับ mockup
            เท่านั้น
          </p>
        </div>
      </aside>
    </div>
  );
}
