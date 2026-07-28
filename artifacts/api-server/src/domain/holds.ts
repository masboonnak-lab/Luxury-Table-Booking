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

/**
 * Postgres SQLSTATE off an unknown driver error.
 *
 * Drizzle wraps driver errors in its own error type, so the SQLSTATE is one or
 * more `cause` links down rather than on the error it throws. Reading only the
 * top level turned every unique-violation into a 500.
 */
export function pgErrorCode(err: unknown): string | undefined {
  let current = err;
  for (let depth = 0; depth < 5 && current !== null && current !== undefined; depth++) {
    if (typeof current === "object" && "code" in current) {
      const code = (current as { code: unknown }).code;
      if (typeof code === "string") {
        return code;
      }
    }
    current =
      typeof current === "object" && "cause" in current
        ? (current as { cause: unknown }).cause
        : undefined;
  }
  return undefined;
}

/** The constraint a violation names, when the driver reports one. */
export function pgConstraint(err: unknown): string | undefined {
  let current = err;
  for (let depth = 0; depth < 5 && current !== null && current !== undefined; depth++) {
    if (typeof current === "object" && "constraint" in current) {
      const name = (current as { constraint: unknown }).constraint;
      if (typeof name === "string") {
        return name;
      }
    }
    current =
      typeof current === "object" && "cause" in current
        ? (current as { cause: unknown }).cause
        : undefined;
  }
  return undefined;
}

export const UNIQUE_VIOLATION = "23505";
