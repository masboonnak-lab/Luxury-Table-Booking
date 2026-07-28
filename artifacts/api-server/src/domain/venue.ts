/**
 * Venue rules the server is the authority on. The mockup has its own copies of
 * these for rendering, but nothing here may be taken from the client.
 */

/** Last seating is 23:00 — the after-midnight rounds are not bookable. */
export const SLOTS = [
  "18:00",
  "19:00",
  "20:00",
  "21:00",
  "22:00",
  "23:00",
] as const;

export type Slot = (typeof SLOTS)[number];

/** One seating per night in the current booking flow. */
export const DEFAULT_SLOT: Slot = "21:00";

/** Latest a held table is released, HH:mm. */
export const DEFAULT_HOLD_UNTIL = "20:30";

export const PAYMENT_WINDOW_MINUTES = 10;

export const MIN_GUESTS = 1;
export const MAX_GUESTS = 20;
export const MAX_TICKETS_PER_ORDER = 10;

/** How far ahead a table may be booked. */
export const MAX_BOOKING_DAYS_AHEAD = 120;

export const RECEIPT_PREFIX = process.env["RECEIPT_PREFIX"] ?? "TLD";

/** The venue's wall clock, which is what "today" means for a booking date. */
export const VENUE_TIME_ZONE = process.env["VENUE_TIME_ZONE"] ?? "Asia/Bangkok";

export function isSlot(value: string): value is Slot {
  return (SLOTS as ReadonlyArray<string>).includes(value);
}

/** yyyy-MM-dd in the venue's timezone, not the server's. */
export function venueToday(now: Date = new Date()): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: VENUE_TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(now);
}

export function addDays(dateKey: string, days: number): string {
  const [y, m, d] = dateKey.split("-").map(Number);
  const dt = new Date(Date.UTC(y ?? 0, (m ?? 1) - 1, d ?? 1));
  dt.setUTCDate(dt.getUTCDate() + days);
  return dt.toISOString().slice(0, 10);
}
