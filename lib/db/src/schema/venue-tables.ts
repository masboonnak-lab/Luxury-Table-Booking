import { boolean, integer, pgEnum, pgTable, text } from "drizzle-orm/pg-core";

import { zonesTable } from "./zones";

export const tableShapeEnum = pgEnum("table_shape", ["round", "rect"]);

/**
 * The room, as rows. This is the only table inventory — availability is always
 * derived from these rows minus live orders, never from a second counter.
 *
 * Coordinates live in the same 100 x 80 space the floor map SVG draws in.
 */
export const venueTablesTable = pgTable("venue_tables", {
  id: text("id").primaryKey(),
  zoneId: text("zone_id")
    .notNull()
    .references(() => zonesTable.id),
  shape: tableShapeEnum("shape").notNull(),
  /** Centre point. */
  x: integer("x").notNull(),
  y: integer("y").notNull(),
  /** Full width/height (diameter for round). */
  w: integer("w").notNull(),
  h: integer("h").notNull(),
  minSeats: integer("min_seats").notNull(),
  maxSeats: integer("max_seats").notNull(),
  /** Taken out of service without losing its booking history. */
  active: boolean("active").notNull().default(true),
});

export type VenueTable = typeof venueTablesTable.$inferSelect;
export type InsertVenueTable = typeof venueTablesTable.$inferInsert;
