import { useState } from "react";
import { AlertTriangle, CheckCircle2 } from "lucide-react";

import { useApp, type TableBooking } from "./AppContext";
import { BookingFormFields } from "./BookingForm";
import {
  emptyBookingForm,
  validateBookingForm,
  type BookingFormErrors,
  type BookingFormValues,
} from "./forms";
import { FloorMap } from "./FloorMap";
import { PaymentFlow } from "./PaymentFlow";
import { TicketView } from "./TicketView";
import { bookingCode, bookingReference, depositFor, formatThb } from "./booking";
import { MAX_GUESTS } from "./booking";
import { getTable, getZone, isTableFree, tableFitsParty } from "./floor";
import { Body, GoldButton, GoldFrame, Heading, InfoRow, Screen } from "./ui";

type Stage = "form" | "table" | "summary" | "payment" | "done";

/** Slot the floor map prices against — one seating per night in this flow. */
const SEATING_SLOT = "21:00";

export function BookTableScreen({ onHome }: { onHome: () => void }) {
  const { t, brand, addRecord, markSlipUsed, user } = useApp();

  const [stage, setStage] = useState<Stage>("form");
  const [values, setValues] = useState<BookingFormValues>(() => ({
    ...emptyBookingForm(brand.tableHoldUntil),
    name: user?.name ?? "",
    phone: user?.phone ?? "",
  }));
  const [errors, setErrors] = useState<BookingFormErrors>({});
  const [tableId, setTableId] = useState<string | null>(null);
  const [tableError, setTableError] = useState<string | null>(null);
  const [record, setRecord] = useState<TableBooking | null>(null);

  const table = tableId ? getTable(tableId) : undefined;
  const zone = table ? getZone(table.zoneId) : undefined;
  const deposit = zone ? depositFor(zone, values.count) : 0;
  const code = bookingCode(values.date, SEATING_SLOT, tableId ?? "-", values.phone);
  const reference = bookingReference(brand.receiptPrefix, code);

  function set<K extends keyof BookingFormValues>(
    key: K,
    value: BookingFormValues[K],
  ) {
    setValues((prev) => {
      const next = { ...prev, [key]: value };
      // Changing the party or the date can invalidate an already-picked table.
      if (key === "count" || key === "date") {
        const picked = tableId ? getTable(tableId) : undefined;
        if (
          picked &&
          (!tableFitsParty(picked, next.count) ||
            !isTableFree(next.date, SEATING_SLOT, picked.id))
        ) {
          setTableId(null);
        }
      }
      return next;
    });
  }

  function submitForm() {
    const next = validateBookingForm(values, t, MAX_GUESTS);
    setErrors(next);
    if (Object.keys(next).length > 0) {
      return;
    }
    setStage(brand.hasFloorPlan ? "table" : "summary");
  }

  /** Spec: re-check the table is still free before letting the guest continue. */
  function confirmTable() {
    if (!tableId) {
      setTableError(t("pickTable"));
      return;
    }
    if (!isTableFree(values.date, SEATING_SLOT, tableId)) {
      setTableId(null);
      setTableError(t("tableTaken"));
      return;
    }
    setTableError(null);
    setStage("summary");
  }

  function completePayment(slipHash: string) {
    markSlipUsed(slipHash);
    const created: TableBooking = {
      kind: "table",
      id: `${code}-${values.date}`,
      code: reference,
      bookerName: values.name.trim(),
      phone: values.phone.trim(),
      guests: values.count,
      date: values.date,
      holdUntil: values.pickupTime,
      tableId: tableId,
      zoneName: zone?.name ?? null,
      amount: deposit || values.count * 300,
      createdAt: Date.now(),
    };
    addRecord(created);
    setRecord(created);
    setStage("done");
  }

  /* ------------------------------------------------------------- render */

  if (stage === "done" && record) {
    return (
      <Screen title={t("bookingSuccess")}>
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

  if (stage === "payment") {
    return (
      <Screen title={t("payment")}>
        <PaymentFlow
          reference={reference}
          amount={deposit || values.count * 300}
          onPaid={completePayment}
          onCancel={() => setStage("summary")}
        />
      </Screen>
    );
  }

  if (stage === "summary") {
    return (
      <Screen title={t("summary")}>
        <GoldFrame className="p-5">
          <dl>
            <InfoRow label={t("bookerName")} value={values.name} />
            {brand.hasFloorPlan ? (
              <InfoRow label={t("tableNo")} value={tableId ?? "—"} mono />
            ) : null}
            {zone ? <InfoRow label={t("zone")} value={zone.name} /> : null}
            <InfoRow label={t("bookingDate")} value={values.date} />
            <InfoRow label={t("guests")} value={`${values.count}`} />
            <InfoRow label={t("holdTime")} value={`${values.pickupTime} น.`} />
            <InfoRow label={t("contactPhone")} value={values.phone} />
            <InfoRow
              label={t("amount")}
              value={`฿${formatThb(deposit || values.count * 300)}`}
            />
          </dl>
        </GoldFrame>

        <GoldFrame className="mt-4 p-5">
          <Heading as="h3" className="text-sm">
            {t("conditions")}
          </Heading>
          <ul className="mt-3 space-y-2">
            {[
              "เกินเวลารับโต๊ะ ระบบจะยกเลิกการจองอัตโนมัติ",
              "เมื่อจองแล้วไม่สามารถคืนเงินได้ทุกกรณี",
              "ขอสงวนสิทธิ์ในการเปลี่ยนแปลงโต๊ะ",
            ].map((line) => (
              <li
                key={line}
                className="flex gap-2 text-xs leading-relaxed text-[var(--brand-text-muted)]"
              >
                <span className="text-[var(--brand-gold)]">•</span>
                {line}
              </li>
            ))}
          </ul>
        </GoldFrame>

        <div className="mt-6 flex gap-3">
          <GoldButton
            variant="ghost"
            className="flex-1"
            onClick={() => setStage(brand.hasFloorPlan ? "table" : "form")}
          >
            {t("back")}
          </GoldButton>
          <GoldButton className="flex-[2]" onClick={() => setStage("payment")}>
            {t("confirm")}
          </GoldButton>
        </div>
      </Screen>
    );
  }

  if (stage === "table") {
    return (
      <Screen title={t("selectTable")} subtitle={`${values.date} · ${values.count} ท่าน`}>
        {tableError ? (
          <p
            className="mb-4 flex items-start gap-2 rounded-lg border px-4 py-3 text-sm text-[var(--brand-danger)]"
            style={{ borderColor: "var(--brand-danger)" }}
          >
            <AlertTriangle className="mt-0.5 size-4 shrink-0" />
            {tableError}
          </p>
        ) : null}

        <FloorMap
          dateKey={values.date}
          slot={SEATING_SLOT}
          guests={values.count}
          selectedTableId={tableId}
          onSelect={(id) => {
            setTableId(id);
            setTableError(null);
          }}
        />

        <div className="mt-6 flex gap-3">
          <GoldButton
            variant="ghost"
            className="flex-1"
            onClick={() => setStage("form")}
          >
            {t("back")}
          </GoldButton>
          <GoldButton className="flex-[2]" onClick={confirmTable}>
            {t("next")}
          </GoldButton>
        </div>
      </Screen>
    );
  }

  return (
    <Screen title={t("bookTable")} subtitle={t("bookTableDesc")}>
      <GoldFrame className="p-6">
        <BookingFormFields
          values={values}
          errors={errors}
          countLabel={t("guests")}
          maxCount={MAX_GUESTS}
          onChange={set}
        />
        <GoldButton className="mt-6 w-full" onClick={submitForm}>
          {t("next")}
        </GoldButton>
      </GoldFrame>

      <Body muted className="mt-4 text-center text-xs">
        {t("mockNotice")}
      </Body>
    </Screen>
  );
}
