import { useState } from "react";
import { CalendarDays, CheckCircle2, ChevronRight, Ticket } from "lucide-react";

import { cn } from "@/lib/utils";

import { useApp, type BookingRecord, type EventTicket } from "./AppContext";
import { BookingFormFields } from "./BookingForm";
import {
  emptyBookingForm,
  validateBookingForm,
  type BookingFormErrors,
  type BookingFormValues,
} from "./forms";
import { PaymentFlow } from "./PaymentFlow";
import { TicketView } from "./TicketView";
import { bookingCode, bookingReference, formatThb } from "./booking";
import {
  EVENTS,
  EVENT_KIND_LABEL,
  ticketsLeft,
  type VenueEvent,
} from "./data";
import { Body, GoldButton, GoldFrame, Heading, Screen } from "./ui";

/* ------------------------------------------------------------ my tickets */

export function MyTicketsScreen() {
  const { t, lang, records } = useApp();
  const [tab, setTab] = useState<"table" | "ticket">("table");
  const [openId, setOpenId] = useState<string | null>(null);

  const shown = records.filter((r) => r.kind === tab);
  const open = records.find((r) => r.id === openId) ?? null;

  if (open) {
    return (
      <Screen title={t("myTickets")}>
        <TicketView record={open} />
        <GoldButton
          variant="outline"
          className="mt-6 w-full"
          onClick={() => setOpenId(null)}
        >
          {t("back")}
        </GoldButton>
      </Screen>
    );
  }

  return (
    <Screen title={t("myTickets")} subtitle={t("myTicketsDesc")}>
      <div className="mb-5 grid grid-cols-2 gap-2">
        {(
          [
            { id: "table" as const, label: t("tabBookings"), Icon: CalendarDays },
            { id: "ticket" as const, label: t("tabTickets"), Icon: Ticket },
          ]
        ).map(({ id, label, Icon }) => (
          <button
            key={id}
            type="button"
            onClick={() => setTab(id)}
            aria-pressed={tab === id}
            className={cn(
              "flex items-center justify-center gap-2 rounded-lg border px-3 py-2.5 text-sm transition-colors",
              tab === id
                ? "border-[var(--brand-gold)] bg-[var(--brand-gold)]/10 text-[var(--brand-gold)]"
                : "text-[var(--brand-text-muted)] hover:text-[var(--brand-text)]",
            )}
            style={tab === id ? undefined : { borderColor: "var(--brand-line)" }}
          >
            <Icon className="size-4" />
            {label}
          </button>
        ))}
      </div>

      {shown.length === 0 ? (
        <GoldFrame className="px-6 py-14 text-center">
          <Body muted className="text-sm">
            {t("noRecords")}
          </Body>
        </GoldFrame>
      ) : (
        <ul className="space-y-3">
          {shown.map((r: BookingRecord) => (
            <li key={r.id}>
              <button
                type="button"
                onClick={() => setOpenId(r.id)}
                className="w-full rounded-xl border p-4 text-left transition-colors hover:border-[var(--brand-gold)]"
                style={{ borderColor: "var(--brand-line)" }}
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm text-[var(--brand-gold)]">
                      {r.kind === "table"
                        ? `${t("tableNo")} ${r.tableId ?? "—"}`
                        : r.eventTitle}
                    </p>
                    <p className="mt-1 truncate text-xs text-[var(--brand-text-muted)]">
                      {r.date} ·{" "}
                      {r.kind === "table"
                        ? `${r.guests} ${t("guests")}`
                        : `${r.quantity} ${t("tickets")}`}{" "}
                      · ฿{formatThb(r.amount)}
                    </p>
                    <p className="mt-1 font-mono text-[11px] text-[var(--brand-text-muted)]">
                      {r.code}
                    </p>
                  </div>
                  <ChevronRight className="size-4 shrink-0 text-[var(--brand-gold)]" />
                </div>
              </button>
            </li>
          ))}
        </ul>
      )}

      <Body muted className="mt-5 text-center text-xs">
        {lang === "th"
          ? "รายการจะหายเมื่อรีเฟรชหน้า เพราะยังไม่มีฐานข้อมูล"
          : "Records reset on reload — there is no database yet."}
      </Body>
    </Screen>
  );
}

/* ----------------------------------------------------------- buy tickets */

type Stage = "list" | "form" | "payment" | "done";

export function BuyTicketScreen({ onHome }: { onHome: () => void }) {
  const { t, lang, brand, addRecord, markSlipUsed, user } = useApp();

  const [stage, setStage] = useState<Stage>("list");
  const [event, setEvent] = useState<VenueEvent | null>(null);
  const [values, setValues] = useState<BookingFormValues>(() => ({
    ...emptyBookingForm(brand.tableHoldUntil),
    name: user?.name ?? "",
    phone: user?.phone ?? "",
  }));
  const [errors, setErrors] = useState<BookingFormErrors>({});
  const [record, setRecord] = useState<EventTicket | null>(null);

  const maxTickets = event ? Math.min(10, ticketsLeft(event)) : 10;
  const amount = event ? event.price * values.count : 0;
  const code = event
    ? bookingCode(values.date, event.id, `x${values.count}`, values.phone)
    : "";
  const reference = bookingReference(brand.receiptPrefix, code);

  function pick(e: VenueEvent) {
    setEvent(e);
    setValues((prev) => ({ ...prev, date: e.date, count: 1 }));
    setErrors({});
    setStage("form");
  }

  function submitForm() {
    const next = validateBookingForm(values, t, maxTickets);
    setErrors(next);
    if (Object.keys(next).length > 0) {
      return;
    }
    setStage("payment");
  }

  function completePayment(slipHash: string) {
    if (!event) {
      return;
    }
    markSlipUsed(slipHash);
    const created: EventTicket = {
      kind: "ticket",
      id: `${code}-${event.id}`,
      code: reference,
      bookerName: values.name.trim(),
      phone: values.phone.trim(),
      eventId: event.id,
      eventTitle: event.title,
      quantity: values.count,
      date: values.date,
      holdUntil: values.pickupTime,
      amount,
      createdAt: Date.now(),
    };
    addRecord(created);
    setRecord(created);
    setStage("done");
  }

  if (stage === "done" && record) {
    return (
      <Screen title={t("ticketSuccess")}>
        <div className="mb-5 flex items-center justify-center gap-2 text-sm text-[var(--brand-success)]">
          <CheckCircle2 className="size-4" />
          {t("savedToMyTickets")}
        </div>
        <TicketView record={record} />
        <GoldButton variant="outline" className="mt-6 w-full" onClick={onHome}>
          {t("backHome")}
        </GoldButton>
      </Screen>
    );
  }

  if (stage === "payment" && event) {
    return (
      <Screen title={t("payment")} subtitle={event.title}>
        <PaymentFlow
          reference={reference}
          amount={amount}
          onPaid={completePayment}
          onCancel={() => setStage("form")}
        />
      </Screen>
    );
  }

  if (stage === "form" && event) {
    return (
      <Screen title={event.title} subtitle={event.artist[lang]}>
        <GoldFrame className="p-6">
          <BookingFormFields
            values={values}
            errors={errors}
            countLabel={t("tickets")}
            maxCount={maxTickets}
            onChange={(k, v) => setValues((prev) => ({ ...prev, [k]: v }))}
          />

          <div
            className="mt-5 flex items-baseline justify-between border-t pt-4"
            style={{ borderColor: "var(--brand-line)" }}
          >
            <span className="text-sm text-[var(--brand-gold)]">{t("amount")}</span>
            <span className="text-xl tabular-nums text-[var(--brand-gold)]">
              ฿{formatThb(amount)}
            </span>
          </div>

          <div className="mt-5 flex gap-3">
            <GoldButton
              variant="ghost"
              className="flex-1"
              onClick={() => setStage("list")}
            >
              {t("back")}
            </GoldButton>
            <GoldButton className="flex-[2]" onClick={submitForm}>
              {t("confirm")}
            </GoldButton>
          </div>
        </GoldFrame>
      </Screen>
    );
  }

  return (
    <Screen title={t("buyTicket")} subtitle={t("allEvents")}>
      <ul className="space-y-3">
        {EVENTS.map((e) => {
          const left = ticketsLeft(e);
          const out = left === 0;

          return (
            <li key={e.id}>
              <button
                type="button"
                disabled={out}
                onClick={() => pick(e)}
                className={cn(
                  "w-full rounded-xl border p-5 text-left transition-colors",
                  out
                    ? "cursor-not-allowed opacity-45"
                    : "hover:border-[var(--brand-gold)]",
                )}
                style={{ borderColor: "var(--brand-line)" }}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-[10px] uppercase tracking-[0.25em] text-[var(--brand-gold)]">
                      {EVENT_KIND_LABEL[e.kind][lang]}
                    </p>
                    <Heading as="h3" className="mt-1.5 text-lg">
                      {e.title}
                    </Heading>
                    <Body muted className="mt-1 text-xs">
                      {e.artist[lang]}
                    </Body>
                    <Body muted className="mt-2 text-xs">
                      {e.date} · {t("holdTime")} {e.doorsAt} น.
                    </Body>
                  </div>

                  <div className="shrink-0 text-right">
                    <p className="tabular-nums text-[var(--brand-gold)]">
                      ฿{formatThb(e.price)}
                    </p>
                    <p className="mt-0.5 text-[10px] text-[var(--brand-text-muted)]">
                      {t("perTicket")}
                    </p>
                    <p
                      className="mt-2 text-[11px]"
                      style={{
                        color: out
                          ? "var(--brand-danger)"
                          : "var(--brand-text-muted)",
                      }}
                    >
                      {out ? t("soldOut") : `เหลือ ${left}`}
                    </p>
                  </div>
                </div>
              </button>
            </li>
          );
        })}
      </ul>
    </Screen>
  );
}
