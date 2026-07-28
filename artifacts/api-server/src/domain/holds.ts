import { and, eq, gt, or, type SQL } from "drizzle-orm";
import { ordersTable } from "@workspace/db";

/**
 * The one definition of "this order is holding inventory right now": either it
 * is paid, or it is unpaid but still inside its payment window. Availability,
 * the tickets-left count and the double-booking guard all read this, so they
 * cannot drift apart.
 */
export function holdsInventory(now: Date): SQL | undefined {
  return or(
    eq(ordersTable.status, "paid"),
    and(eq(ordersTable.status, "pending"), gt(ordersTable.holdExpiresAt, now)),
  );
}

/** Postgres SQLSTATE off an unknown driver error. */
export function pgErrorCode(err: unknown): string | undefined {
  if (typeof err === "object" && err !== null && "code" in err) {
    const code = (err as { code: unknown }).code;
    return typeof code === "string" ? code : undefined;
  }
  return undefined;
}

export const UNIQUE_VIOLATION = "23505";
