import { integer, pgEnum, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";

import { ordersTable } from "./orders";

/**
 * `pendingBankCheck` is the honest default: we know the file has not been used
 * before, we do not yet know the transfer is real. Flipping to `verified`
 * requires a server-side call to a slip-verification API (EasySlip / SlipOK /
 * the bank's own OpenAPI), which is not wired up.
 */
export const slipStatusEnum = pgEnum("slip_status", [
  "pending_bank_check",
  "verified",
  "rejected",
]);

/**
 * Uploaded transfer slips. The unique index on `hash` is what makes the
 * duplicate check real — re-submitting the same image fails in Postgres, not
 * in a client-side list that an attacker controls.
 */
export const slipsTable = pgTable("slips", {
  id: uuid("id").primaryKey().defaultRandom(),
  /** SHA-256 of the uploaded file, lowercase hex. */
  hash: text("hash").notNull().unique(),
  orderId: uuid("order_id")
    .notNull()
    .references(() => ordersTable.id, { onDelete: "cascade" }),
  fileName: text("file_name").notNull(),
  sizeBytes: integer("size_bytes").notNull(),
  status: slipStatusEnum("status").notNull().default("pending_bank_check"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export type Slip = typeof slipsTable.$inferSelect;
export type InsertSlip = typeof slipsTable.$inferInsert;
