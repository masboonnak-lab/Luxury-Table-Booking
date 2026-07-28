import { sql } from "drizzle-orm";
import {
  check,
  date,
  index,
  integer,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";

import { eventsTable } from "./events";
import { venueTablesTable } from "./venue-tables";

export const orderKindEnum = pgEnum("order_kind", ["table", "ticket"]);

/**
 * `pending` holds inventory until `holdExpiresAt`; after that the row still
 * says pending but no longer blocks anyone. A sweep flips it to `expired`.
 */
export const orderStatusEnum = pgEnum("order_status", [
  "pending",
  "paid",
  "cancelled",
  "expired",
]);

/**
 * One row per table booking *and* per ticket order — the two share a payment
 * flow, a slip, a reference code and a "My tickets" list, so splitting them
 * into two tables would mean duplicating all of that. The discriminator is
 * `kind`, and the check constraint below makes the wrong-shaped row impossible
 * rather than merely discouraged.
 *
 * Guest identity is denormalised onto the order (name + phone): there are no
 * accounts yet, and a booking must survive a guest record being removed under
 * PDPA.
 */
export const ordersTable = pgTable(
  "orders",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    /** Customer-facing reference, e.g. TLD-4F2A81. */
    code: text("code").notNull().unique(),
    kind: orderKindEnum("kind").notNull(),
    status: orderStatusEnum("status").notNull().default("pending"),

    bookerName: text("booker_name").notNull(),
    /** Digits only, so 081-234-5678 and 0812345678 are the same guest. */
    phone: text("phone").notNull(),
    email: text("email"),
    occasion: text("occasion"),
    notes: text("notes"),

    /** Service date, yyyy-MM-dd. */
    date: date("date").notNull(),
    /** Seating slot / doors time, HH:mm. */
    slot: text("slot").notNull(),
    /** Latest the guest may claim the table, HH:mm. */
    holdUntil: text("hold_until").notNull(),

    // kind = "table"
    tableId: text("table_id").references(() => venueTablesTable.id),
    guests: integer("guests"),

    // kind = "ticket"
    eventId: text("event_id").references(() => eventsTable.id),
    quantity: integer("quantity"),

    /** Deposit or ticket total, VAT inclusive, in satang. */
    amountSatang: integer("amount_satang").notNull(),
    /** End of the payment window. */
    holdExpiresAt: timestamp("hold_expires_at", {
      withTimezone: true,
    }).notNull(),

    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    paidAt: timestamp("paid_at", { withTimezone: true }),
    cancelledAt: timestamp("cancelled_at", { withTimezone: true }),
  },
  (t) => [
    index("orders_phone_idx").on(t.phone, t.createdAt),
    // Availability reads this: "is table X taken on date D at slot S".
    index("orders_table_slot_idx").on(t.tableId, t.date, t.slot),
    index("orders_event_idx").on(t.eventId),
    check(
      "orders_kind_shape_ck",
      sql`(
        ${t.kind} = 'table'
          AND ${t.tableId} IS NOT NULL AND ${t.guests} IS NOT NULL
          AND ${t.eventId} IS NULL AND ${t.quantity} IS NULL
      ) OR (
        ${t.kind} = 'ticket'
          AND ${t.eventId} IS NOT NULL AND ${t.quantity} IS NOT NULL
          AND ${t.tableId} IS NULL AND ${t.guests} IS NULL
      )`,
    ),
    check("orders_amount_ck", sql`${t.amountSatang} >= 0`),
  ],
);

export type Order = typeof ordersTable.$inferSelect;
export type InsertOrder = typeof ordersTable.$inferInsert;
export type OrderKind = (typeof orderKindEnum.enumValues)[number];
export type OrderStatus = (typeof orderStatusEnum.enumValues)[number];
