import type { Order as OrderRow, OrderStatus } from "@workspace/db";
import type { Order as OrderView } from "@workspace/api-zod";

import { taxBreakdown, toThb } from "./money";

export interface OrderContext {
  zoneId?: string | null;
  zoneName?: string | null;
  eventTitle?: string | null;
}

/**
 * A pending hold whose window has closed is no longer holding anything, so it
 * must not still read as "pending" to the guest. The row is flipped to
 * `expired` when a write touches it; reads report the truth immediately.
 */
export function effectiveStatus(row: OrderRow, now: Date): OrderStatus {
  if (row.status === "pending" && row.holdExpiresAt.getTime() <= now.getTime()) {
    return "expired";
  }
  return row.status;
}

/** Undefined properties are dropped by JSON.stringify, which is what the
 *  contract wants: absent rather than null for the other kind's fields. */
export function toOrderView(
  row: OrderRow,
  ctx: OrderContext = {},
  now: Date = new Date(),
): OrderView {
  const tax = taxBreakdown(row.amountSatang);

  return {
    code: row.code,
    kind: row.kind,
    status: effectiveStatus(row, now),
    bookerName: row.bookerName,
    phone: row.phone,
    email: row.email ?? undefined,
    occasion: row.occasion ?? undefined,
    notes: row.notes ?? undefined,
    date: row.date,
    slot: row.slot,
    holdUntil: row.holdUntil,
    guests: row.guests ?? undefined,
    tableId: row.tableId ?? undefined,
    zoneId: ctx.zoneId ?? undefined,
    zoneName: ctx.zoneName ?? undefined,
    eventId: row.eventId ?? undefined,
    eventTitle: ctx.eventTitle ?? undefined,
    quantity: row.quantity ?? undefined,
    amount: toThb(tax.totalSatang),
    amountBase: toThb(tax.baseSatang),
    amountVat: toThb(tax.vatSatang),
    holdExpiresAt: row.holdExpiresAt,
    createdAt: row.createdAt,
    paidAt: row.paidAt ?? undefined,
    cancelledAt: row.cancelledAt ?? undefined,
  };
}
