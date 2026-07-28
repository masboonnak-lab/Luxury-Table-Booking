/** Pure form logic, kept out of the .tsx so it can be checked without React. */

import { normalisePhone } from "./booking";

export interface BookingFormValues {
  name: string;
  count: number;
  date: string;
  phone: string;
  pickupTime: string;
  ackHold: boolean;
}

export type BookingFormErrors = Partial<Record<keyof BookingFormValues, string>>;

const PHONE = /^0\d{8,9}$/;

export function todayIso(): string {
  const d = new Date();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${m}-${day}`;
}

/** Half-hour marks from doors open up to the venue's hold cut-off. */
export function pickupOptions(holdUntil: string): Array<string> {
  const [endH, endM] = holdUntil.split(":").map(Number);
  const end = endH * 60 + endM;
  const out: Array<string> = [];
  for (let t = 18 * 60; t <= end; t += 30) {
    out.push(
      `${String(Math.floor(t / 60)).padStart(2, "0")}:${String(t % 60).padStart(2, "0")}`,
    );
  }
  return out;
}

export function emptyBookingForm(holdUntil: string): BookingFormValues {
  return {
    name: "",
    count: 2,
    date: todayIso(),
    phone: "",
    pickupTime: pickupOptions(holdUntil)[0],
    ackHold: false,
  };
}

export type FormMessageKey = "required" | "invalidPhone" | "mustAckHold";

export function validateBookingForm(
  v: BookingFormValues,
  t: (k: FormMessageKey) => string,
  maxCount: number,
): BookingFormErrors {
  const errors: BookingFormErrors = {};

  if (v.name.trim().length < 2) {
    errors.name = t("required");
  }
  if (!Number.isInteger(v.count) || v.count < 1 || v.count > maxCount) {
    errors.count = `1–${maxCount}`;
  }
  if (!v.date || v.date < todayIso()) {
    errors.date = t("required");
  }
  const phone = normalisePhone(v.phone);
  if (!phone) {
    errors.phone = t("required");
  } else if (!PHONE.test(phone)) {
    errors.phone = t("invalidPhone");
  }
  if (!v.pickupTime) {
    errors.pickupTime = t("required");
  }
  // Spec: the booking cannot proceed unless this is ticked.
  if (!v.ackHold) {
    errors.ackHold = t("mustAckHold");
  }

  return errors;
}
