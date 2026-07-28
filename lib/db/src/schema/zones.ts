import { integer, pgTable, text } from "drizzle-orm/pg-core";

/**
 * Seating zones. `minSpendSatang` is what drives the deposit rule, so it is
 * stored here rather than hard-coded in the pricing module.
 *
 * Money is stored in satang (1 THB = 100 satang) everywhere in this schema —
 * integers only, so no rounding can drift between the deposit, the VAT split
 * and the receipt.
 */
export const zonesTable = pgTable("zones", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  /** Minimum spend in satang. 0 means the zone has none. */
  minSpendSatang: integer("min_spend_satang").notNull().default(0),
  /** Display order on the floor map legend. */
  sortOrder: integer("sort_order").notNull().default(0),
});

export type Zone = typeof zonesTable.$inferSelect;
export type InsertZone = typeof zonesTable.$inferInsert;
