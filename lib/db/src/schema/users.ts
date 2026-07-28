import { pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";

/**
 * A guest account. Phone is the login identifier because that is what a Thai
 * venue already collects and what a booking is looked up by — email is
 * optional and only used for receipts.
 *
 * `pdpaConsentAt` is a column rather than a boolean: PDPA asks when consent
 * was given, not merely whether it was.
 */
export const usersTable = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  /** Digits only — the same normalisation orders use. */
  phone: text("phone").notNull().unique(),
  email: text("email"),
  /** `scrypt$<salt>$<key>`, both base64url. Never a bare digest. */
  passwordHash: text("password_hash").notNull(),
  pdpaConsentAt: timestamp("pdpa_consent_at", { withTimezone: true }).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  lastLoginAt: timestamp("last_login_at", { withTimezone: true }),
});

export type User = typeof usersTable.$inferSelect;
export type InsertUser = typeof usersTable.$inferInsert;
