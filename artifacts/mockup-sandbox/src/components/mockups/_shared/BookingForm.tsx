import { useApp } from "./AppContext";
import { pickupOptions, type BookingFormErrors, type BookingFormValues } from "./forms";
import { todayIso } from "./forms";
import { CheckRow, Field, TextInput } from "./ui";

export function BookingFormFields({
  values,
  errors,
  countLabel,
  maxCount,
  onChange,
}: {
  values: BookingFormValues;
  errors: BookingFormErrors;
  countLabel: string;
  maxCount: number;
  onChange: <K extends keyof BookingFormValues>(
    key: K,
    value: BookingFormValues[K],
  ) => void;
}) {
  const { t, brand } = useApp();
  const times = pickupOptions(brand.tableHoldUntil);

  return (
    <div className="space-y-4">
      <Field label={t("bookerName")} required error={errors.name}>
        <TextInput
          value={values.name}
          autoComplete="name"
          invalid={Boolean(errors.name)}
          onChange={(e) => onChange("name", e.target.value)}
        />
      </Field>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label={countLabel} required error={errors.count}>
          <TextInput
            type="number"
            min={1}
            max={maxCount}
            inputMode="numeric"
            value={values.count}
            invalid={Boolean(errors.count)}
            onChange={(e) =>
              onChange("count", Math.trunc(Number(e.target.value) || 0))
            }
          />
        </Field>

        <Field label={t("bookingDate")} required error={errors.date}>
          <TextInput
            type="date"
            min={todayIso()}
            value={values.date}
            invalid={Boolean(errors.date)}
            onChange={(e) => onChange("date", e.target.value)}
          />
        </Field>
      </div>

      <Field label={t("contactPhone")} required error={errors.phone}>
        <TextInput
          type="tel"
          inputMode="tel"
          autoComplete="tel"
          placeholder="081-234-5678"
          value={values.phone}
          invalid={Boolean(errors.phone)}
          onChange={(e) => onChange("phone", e.target.value)}
        />
      </Field>

      <Field label={t("holdTime")} required error={errors.pickupTime}>
        <select
          value={values.pickupTime}
          onChange={(e) => onChange("pickupTime", e.target.value)}
          className="w-full rounded-lg border bg-black/40 px-3.5 py-2.5 text-sm text-[var(--brand-text)] focus:outline-none focus:ring-2 focus:ring-[var(--brand-gold)]/45"
          style={{ borderColor: "var(--brand-line)" }}
        >
          {times.map((time) => (
            <option key={time} value={time} className="bg-black">
              {time} น.
            </option>
          ))}
        </select>
      </Field>

      <CheckRow
        checked={values.ackHold}
        onChange={(v) => onChange("ackHold", v)}
        error={errors.ackHold}
      >
        {t("holdAck", { time: brand.tableHoldUntil })}
      </CheckRow>
    </div>
  );
}
