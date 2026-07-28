/**
 * Booking rules that are not about the room itself — timings, the contact
 * form, money and document numbers. Anything to do with tables, zones or
 * availability lives in ./floor.
 */

import { ZONES, freeTablesAt, type Zone } from "./floor";

export interface SlotGroup {
  title: string;
  hint: string;
  slots: ReadonlyArray<string>;
}

export const SLOT_GROUPS: ReadonlyArray<SlotGroup> = [
  {
    title: "ช่วงต้นค่ำ",
    hint: "เงียบกว่า คุยงานได้",
    slots: ["18:00", "19:00", "20:00"],
  },
  {
    title: "ไพร์มไทม์",
    hint: "มีดนตรีสด ร้านแน่น",
    slots: ["21:00", "22:00", "23:00"],
  },
];

export const ALL_SLOTS: ReadonlyArray<string> = SLOT_GROUPS.flatMap(
  (g) => g.slots,
);

export const MIN_GUESTS = 1;
export const MAX_GUESTS = 20;

/** Re-exported so callers have one import for the booking domain. */
export { freeTablesAt as slotTablesLeft };

/* ---------------------------------------------------------------- contact */

export const OCCASIONS = [
  "ไม่มีโอกาสพิเศษ",
  "วันเกิด",
  "ครบรอบ",
  "เลี้ยงบริษัท",
  "พบปะเพื่อน",
] as const;

export type Occasion = (typeof OCCASIONS)[number];

export interface ContactDraft {
  name: string;
  phone: string;
  email: string;
  occasion: Occasion;
  notes: string;
  ageConfirmed: boolean;
  agreedTerms: boolean;
}

export const EMPTY_CONTACT: ContactDraft = {
  name: "",
  phone: "",
  email: "",
  occasion: "ไม่มีโอกาสพิเศษ",
  notes: "",
  ageConfirmed: false,
  agreedTerms: false,
};

export type ContactErrors = Partial<Record<keyof ContactDraft, string>>;

const THAI_PHONE = /^0\d{8,9}$/;
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

/** Digits only, so "081-234-5678" and "081 234 5678" both validate. */
export function normalisePhone(raw: string): string {
  return raw.replace(/\D/g, "");
}

export function validateContact(c: ContactDraft): ContactErrors {
  const errors: ContactErrors = {};

  if (c.name.trim().length < 2) {
    errors.name = "กรุณากรอกชื่อ-นามสกุล";
  }

  const phone = normalisePhone(c.phone);
  if (!phone) {
    errors.phone = "กรุณากรอกเบอร์โทรศัพท์";
  } else if (!THAI_PHONE.test(phone)) {
    errors.phone = "เบอร์โทรไม่ถูกต้อง (ขึ้นต้นด้วย 0 และมี 9–10 หลัก)";
  }

  if (c.email.trim() && !EMAIL.test(c.email.trim())) {
    errors.email = "รูปแบบอีเมลไม่ถูกต้อง";
  }

  if (!c.ageConfirmed) {
    errors.ageConfirmed = "ต้องยืนยันอายุก่อนจอง";
  }

  if (!c.agreedTerms) {
    errors.agreedTerms = "ต้องยอมรับเงื่อนไขการจอง";
  }

  return errors;
}

/* ------------------------------------------------------------------ money */

export function formatThb(amount: number): string {
  return new Intl.NumberFormat("th-TH").format(amount);
}

/** Two decimals — receipts must not hide satang. */
export function formatThb2(amount: number): string {
  return new Intl.NumberFormat("th-TH", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

export const DEPOSIT_PER_GUEST = 300;
export const VAT_RATE = 0.07;
export const PAYMENT_WINDOW_MINUTES = 10;

/**
 * Zones with a minimum spend take 30% of it up front (rounded to a clean
 * hundred); the rest is a flat per-head deposit.
 */
export function depositFor(zone: Zone, guests: number): number {
  if (zone.minSpend > 0) {
    return Math.round((zone.minSpend * 0.3) / 100) * 100;
  }
  return guests * DEPOSIT_PER_GUEST;
}

export interface TaxBreakdown {
  /** VAT-exclusive amount. */
  base: number;
  vat: number;
  /** What the customer actually pays — the deposit, VAT included. */
  total: number;
}

/** The deposit is VAT-inclusive, so tax is backed out of it, never added on. */
export function taxBreakdown(total: number): TaxBreakdown {
  const totalSatang = Math.round(total * 100);
  const baseSatang = Math.round(totalSatang / (1 + VAT_RATE));
  return {
    base: baseSatang / 100,
    vat: (totalSatang - baseSatang) / 100,
    total: totalSatang / 100,
  };
}

/* ------------------------------------------------------------- references */

function hash(input: string): number {
  let h = 2166136261;
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 16777619) >>> 0;
  }
  return h;
}

function pad(n: number, width: number): string {
  return String(n).padStart(width, "0");
}

/** Derived from the booking itself, so it never changes on re-render. */
export function bookingCode(
  dateKey: string,
  slot: string,
  tableId: string,
  phone: string,
): string {
  return hash(`${dateKey}|${slot}|${tableId}|${normalisePhone(phone)}`)
    .toString(36)
    .toUpperCase()
    .padStart(6, "0")
    .slice(-6);
}

export function bookingReference(prefix: string, code: string): string {
  return `${prefix}-${code}`;
}

/** e.g. TLD-202607-4F2A81 — stable for a given booking. */
export function receiptNumber(
  prefix: string,
  issuedAt: Date,
  code: string,
): string {
  const ym = `${issuedAt.getFullYear()}${pad(issuedAt.getMonth() + 1, 2)}`;
  return `${prefix}-${ym}-${code}`;
}

export { ZONES };
export type { Zone };
