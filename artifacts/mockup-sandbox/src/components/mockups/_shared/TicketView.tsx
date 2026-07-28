import { useApp, type BookingRecord } from "./AppContext";
import { QrCodePlaceholder } from "./QrCode";
import { formatThb } from "./booking";
import { Body, GoldFrame, Heading, InfoRow } from "./ui";

/** The QR pass a guest shows at the door — used by both booking types. */
export function TicketView({ record }: { record: BookingRecord }) {
  const { t } = useApp();

  return (
    <GoldFrame className="overflow-hidden">
      <div className="border-b p-6 text-center" style={{ borderColor: "var(--brand-line)" }}>
        <Heading as="h3" className="text-lg">
          {record.kind === "table" ? t("bookTable") : record.eventTitle}
        </Heading>

        <div className="mx-auto mt-4 w-full max-w-[200px] rounded-xl bg-white p-3">
          <QrCodePlaceholder seed={record.code} className="w-full" />
        </div>

        <p className="mt-3 font-mono text-lg tracking-widest text-[var(--brand-gold)]">
          {record.code}
        </p>
        <Body muted className="mt-1 text-xs">
          {t("showAtDoor")}
        </Body>
      </div>

      <dl className="p-5">
        {record.kind === "table" ? (
          <>
            <InfoRow
              label={t("tableNo")}
              value={record.tableId ?? "—"}
              mono={Boolean(record.tableId)}
            />
            {record.zoneName ? (
              <InfoRow label={t("zone")} value={record.zoneName} />
            ) : null}
            <InfoRow label={t("bookerName")} value={record.bookerName} />
            <InfoRow label={t("guests")} value={`${record.guests}`} />
            <InfoRow label={t("bookingDate")} value={record.date} />
            <InfoRow label={t("holdTime")} value={`${record.holdUntil} น.`} />
          </>
        ) : (
          <>
            <InfoRow label={t("bookerName")} value={record.bookerName} />
            <InfoRow label={t("tickets")} value={`${record.quantity}`} />
            <InfoRow label={t("bookingDate")} value={record.date} />
            <InfoRow label={t("holdTime")} value={`${record.holdUntil} น.`} />
          </>
        )}
        <InfoRow label={t("contactPhone")} value={record.phone} />
        <InfoRow label={t("amount")} value={`฿${formatThb(record.amount)}`} />
      </dl>
    </GoldFrame>
  );
}
