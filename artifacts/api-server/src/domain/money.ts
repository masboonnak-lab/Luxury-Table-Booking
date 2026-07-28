/**
 * All money is integer satang inside the server; THB only appears at the edge.
 * These rules mirror the mockup's `_shared/booking.ts` exactly — if one moves,
 * the other has to move with it.
 */

export const VAT_RATE = 0.07;
export const DEPOSIT_PER_GUEST_SATANG = 300 * 100;
const HUNDRED_BAHT_SATANG = 100 * 100;

/**
 * Zones with a minimum spend take 30% of it up front, rounded to a clean
 * hundred baht; the rest is a flat per-head deposit.
 */
export function depositSatang(
  minSpendSatang: number,
  guests: number,
): number {
  if (minSpendSatang > 0) {
    return (
      Math.round((minSpendSatang * 0.3) / HUNDRED_BAHT_SATANG) *
      HUNDRED_BAHT_SATANG
    );
  }
  return guests * DEPOSIT_PER_GUEST_SATANG;
}

export interface TaxBreakdown {
  /** VAT-exclusive amount, in satang. */
  baseSatang: number;
  vatSatang: number;
  totalSatang: number;
}

/** The amount charged is VAT-inclusive, so tax is backed out, never added on. */
export function taxBreakdown(totalSatang: number): TaxBreakdown {
  const baseSatang = Math.round(totalSatang / (1 + VAT_RATE));
  return {
    baseSatang,
    vatSatang: totalSatang - baseSatang,
    totalSatang,
  };
}

export function toThb(satang: number): number {
  return satang / 100;
}
