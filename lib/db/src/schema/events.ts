import { date, integer, pgEnum, pgTable, text } from "drizzle-orm/pg-core";

export const eventKindEnum = pgEnum("event_kind", [
  "concert",
  "dj",
  "festival",
  "special",
]);

/**
 * Ticketed nights. There is no `sold` column on purpose: tickets sold through
 * this system are counted from `orders`, so the two can never disagree.
 * `baseSold` only carries the count that existed before the system went live.
 */
export const eventsTable = pgTable("events", {
  id: text("id").primaryKey(),
  kind: eventKindEnum("kind").notNull(),
  title: text("title").notNull(),
  artistTh: text("artist_th").notNull(),
  artistEn: text("artist_en").notNull(),
  /** Calendar date of the event, yyyy-MM-dd. */
  date: date("date").notNull(),
  /** Doors open, HH:mm. */
  doorsAt: text("doors_at").notNull(),
  priceSatang: integer("price_satang").notNull(),
  capacity: integer("capacity").notNull(),
  /** Tickets already sold off-system when the event was imported. */
  baseSold: integer("base_sold").notNull().default(0),
});

export type VenueEvent = typeof eventsTable.$inferSelect;
export type InsertVenueEvent = typeof eventsTable.$inferInsert;
