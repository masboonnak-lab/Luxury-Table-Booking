import { useEffect, useRef, useState } from "react";
import {
  AlertTriangle,
  Building2,
  CheckCircle2,
  Clock,
  Loader2,
  QrCode,
  RefreshCw,
  Upload,
} from "lucide-react";

import { cn } from "@/lib/utils";

import { useApp } from "./AppContext";
import { QrCodePlaceholder } from "./QrCode";
import { formatThb2, taxBreakdown } from "./booking";
import { assessSlip, slipFileError, type SlipAssessment } from "./slip";
import { Body, GoldButton, GoldFrame, Heading, InfoRow } from "./ui";

type Method = "promptpay" | "banking";

const BANKS = [
  { id: "kbank", name: "กสิกรไทย", short: "KBank" },
  { id: "scb", name: "ไทยพาณิชย์", short: "SCB" },
  { id: "bbl", name: "กรุงเทพ", short: "BBL" },
  { id: "ktb", name: "กรุงไทย", short: "KTB" },
];

function mmss(ms: number): string {
  const total = Math.max(0, Math.ceil(ms / 1000));
  return `${Math.floor(total / 60)}:${String(total % 60).padStart(2, "0")}`;
}

export function PaymentFlow({
  reference,
  amount,
  onPaid,
  onCancel,
}: {
  reference: string;
  amount: number;
  onPaid: (slipHash: string) => void;
  onCancel: () => void;
}) {
  const { t, brand, isSlipUsed } = useApp();

  const windowMs = brand.paymentWindowMinutes * 60_000;
  const [deadline, setDeadline] = useState(() => Date.now() + windowMs);
  const [now, setNow] = useState(() => Date.now());
  const [method, setMethod] = useState<Method>("promptpay");
  const [checking, setChecking] = useState(false);
  const [slip, setSlip] = useState<SlipAssessment | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const id = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(id);
  }, []);

  const remaining = deadline - now;
  const expired = remaining <= 0;
  const tax = taxBreakdown(amount);
  const ready = slip !== null && !slip.duplicate && !expired;

  function renew() {
    setDeadline(Date.now() + windowMs);
    setNow(Date.now());
  }

  async function handleFile(file: File | undefined) {
    if (!file) {
      return;
    }
    const err = slipFileError(file);
    setSlip(null);
    setFileError(err);
    if (err) {
      return;
    }
    setChecking(true);
    try {
      setSlip(await assessSlip(file, isSlipUsed));
    } catch {
      setFileError("อ่านไฟล์ไม่สำเร็จ กรุณาลองใหม่");
    } finally {
      setChecking(false);
    }
  }

  return (
    <div className="space-y-5">
      {/* Countdown */}
      <GoldFrame
        className={cn("flex items-center gap-3 px-4 py-3")}
        style={{
          borderColor: expired ? "var(--brand-danger)" : "var(--brand-line)",
        }}
      >
        <Clock
          className="size-4 shrink-0"
          style={{
            color: expired ? "var(--brand-danger)" : "var(--brand-gold)",
          }}
        />
        {expired ? (
          <div className="flex flex-1 flex-wrap items-center justify-between gap-2">
            <span className="text-sm text-[var(--brand-danger)]">
              {t("expired")}
            </span>
            <GoldButton variant="outline" className="px-4 py-1.5" onClick={renew}>
              <RefreshCw className="size-3.5" />
              {t("renew")}
            </GoldButton>
          </div>
        ) : (
          <span className="text-sm text-[var(--brand-text)]">
            {t("payWithin")}{" "}
            <span
              className="tabular-nums"
              style={{
                color:
                  remaining <= 60_000
                    ? "var(--brand-danger)"
                    : "var(--brand-gold)",
              }}
            >
              {mmss(remaining)}
            </span>{" "}
            {t("minutes")}
          </span>
        )}
      </GoldFrame>

      {/* Amount */}
      <GoldFrame className="p-4">
        <dl>
          <InfoRow label={t("bookingNo")} value={reference} mono />
          <InfoRow
            label="มูลค่าก่อนภาษี"
            value={`฿${formatThb2(tax.base)}`}
          />
          <InfoRow label="ภาษีมูลค่าเพิ่ม 7%" value={`฿${formatThb2(tax.vat)}`} />
        </dl>
        <div
          className="mt-3 flex items-baseline justify-between border-t pt-3"
          style={{ borderColor: "var(--brand-line)" }}
        >
          <span className="text-sm text-[var(--brand-gold)]">{t("amount")}</span>
          <span className="text-2xl tabular-nums text-[var(--brand-gold)]">
            ฿{formatThb2(tax.total)}
          </span>
        </div>
      </GoldFrame>

      {/* Method */}
      <div className="grid grid-cols-2 gap-3">
        {(
          [
            { id: "promptpay" as const, label: t("qrPromptpay"), Icon: QrCode },
            { id: "banking" as const, label: t("mobileBanking"), Icon: Building2 },
          ]
        ).map(({ id, label, Icon }) => (
          <button
            key={id}
            type="button"
            onClick={() => setMethod(id)}
            aria-pressed={method === id}
            className={cn(
              "flex items-center justify-center gap-2 rounded-lg border px-4 py-3 text-sm transition-colors",
              method === id
                ? "border-[var(--brand-gold)] bg-[var(--brand-gold)]/10 text-[var(--brand-gold)]"
                : "text-[var(--brand-text-muted)] hover:text-[var(--brand-text)]",
            )}
            style={
              method === id ? undefined : { borderColor: "var(--brand-line)" }
            }
          >
            <Icon className="size-4" />
            {label}
          </button>
        ))}
      </div>

      {method === "promptpay" ? (
        <GoldFrame className="p-5 text-center">
          <div
            className={cn(
              "mx-auto w-full max-w-[220px] rounded-xl bg-white p-3 transition-opacity",
              expired && "opacity-25",
            )}
          >
            <QrCodePlaceholder seed={reference} className="w-full" />
          </div>
          <Body muted className="mt-3 text-xs">
            {brand.legalName} · {brand.promptPayId}
          </Body>
          <Body muted className="mt-1 text-[11px]">
            QR นี้เป็นภาพจำลอง สแกนด้วยแอปธนาคารจริงไม่ได้
          </Body>
        </GoldFrame>
      ) : (
        <GoldFrame className="p-4">
          <Body muted className="mb-3 text-xs">
            เลือกธนาคารเพื่อเปิดแอปและโอนเข้าบัญชี {brand.promptPayId}
          </Body>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            {BANKS.map((b) => (
              <div
                key={b.id}
                className="rounded-lg border px-3 py-3 text-center"
                style={{ borderColor: "var(--brand-line)" }}
              >
                <p className="text-sm text-[var(--brand-gold)]">{b.short}</p>
                <p className="mt-0.5 text-[11px] text-[var(--brand-text-muted)]">
                  {b.name}
                </p>
              </div>
            ))}
          </div>
        </GoldFrame>
      )}

      {/* Slip */}
      <GoldFrame className="p-4">
        <Heading as="h3" className="text-sm">
          {t("uploadSlip")}
        </Heading>
        <Body muted className="mt-1.5 text-xs">
          {t("slipHint")}
        </Body>

        <input
          ref={inputRef}
          type="file"
          accept="image/png,image/jpeg,image/webp"
          className="hidden"
          onChange={(e) => {
            void handleFile(e.target.files?.[0]);
            // Allow re-picking the same file after a rejection.
            e.target.value = "";
          }}
        />

        <GoldButton
          variant="outline"
          className="mt-3 w-full"
          disabled={checking || expired}
          onClick={() => inputRef.current?.click()}
        >
          {checking ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <Upload className="size-4" />
          )}
          {t("uploadSlip")}
        </GoldButton>

        {fileError ? (
          <p className="mt-3 flex items-start gap-2 text-xs text-[var(--brand-danger)]">
            <AlertTriangle className="mt-0.5 size-3.5 shrink-0" />
            {fileError}
          </p>
        ) : null}

        {slip ? (
          slip.duplicate ? (
            <div
              className="mt-3 rounded-lg border px-3 py-2.5"
              style={{ borderColor: "var(--brand-danger)" }}
            >
              <p className="flex items-start gap-2 text-xs text-[var(--brand-danger)]">
                <AlertTriangle className="mt-0.5 size-3.5 shrink-0" />
                {t("slipDuplicate")}
              </p>
              <p className="mt-1.5 break-all font-mono text-[10px] text-[var(--brand-text-muted)]">
                SHA-256 {slip.hash.slice(0, 24)}…
              </p>
            </div>
          ) : (
            <div
              className="mt-3 rounded-lg border px-3 py-2.5"
              style={{ borderColor: "var(--brand-line)" }}
            >
              <p className="flex items-start gap-2 text-xs text-[var(--brand-success)]">
                <CheckCircle2 className="mt-0.5 size-3.5 shrink-0" />
                {t("slipAccepted")} · {slip.fileName}
              </p>
              <p className="mt-1.5 break-all font-mono text-[10px] text-[var(--brand-text-muted)]">
                SHA-256 {slip.hash.slice(0, 24)}…
              </p>
              <p className="mt-1.5 text-[10px] leading-relaxed text-[var(--brand-text-muted)]">
                ตรวจซ้ำเรียบร้อย · การตรวจว่าสลิปจริงหรือปลอมต้องยิงไปที่ API
                ธนาคารจากฝั่งเซิร์ฟเวอร์ ยังไม่ได้ทำใน mockup นี้
              </p>
            </div>
          )
        ) : null}
      </GoldFrame>

      <div className="flex gap-3">
        <GoldButton variant="ghost" className="flex-1" onClick={onCancel}>
          {t("back")}
        </GoldButton>
        <GoldButton
          className="flex-[2]"
          disabled={!ready}
          onClick={() => slip && onPaid(slip.hash)}
        >
          {t("confirmPayment")}
        </GoldButton>
      </div>
    </div>
  );
}
