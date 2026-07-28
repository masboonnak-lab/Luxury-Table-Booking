import { pgEnum, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";

/**
 * Two roles is all this venue needs. Anything finer — a host who may see
 * tonight's bookings but not change prices — can be added as a third value
 * without touching the rows that already exist.
 */
export const userRoleEnum = pgEnum("user_role", ["member", "admin"]);

/**
 * A guest account. Phone is the login identifier because that is what a Thai
 * venue already collects and what a booking is looked up by. Email is required
 * too: it is the only channel that can carry a receipt or a booking change
 * once the guest has left.
 *
 * `pdpaConsentAt` is a column rather than a boolean: PDPA asks when consent
 * was given, not merely whether it was.
 */
export const usersTable = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  /** Digits only — the same normalisation orders use. */
  phone: text("phone").notNull().unique(),
  email: text("email").notNull().unique(),
  role: userRoleEnum("role").notNull().default("member"),
  /** `scrypt$<salt>$<key>`, both base64url. Never a bare digest. */
  passwordHash: text("password_hash").notNull(),
  pdpaConsentAt: timestamp("pdpa_consent_at", { withTimezone: true }).notNull(),
  /**
   * Set rather than deleting the row: a suspended member's bookings and
   * receipts still have to exist.
   */
  suspendedAt: timestamp("suspended_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  lastLoginAt: timestamp("last_login_at", { withTimezone: true }),
});

export type User = typeof usersTable.$inferSelect;
export type InsertUser = typeof usersTable.$inferInsert;
export type UserRole = (typeof userRoleEnum.enumValues)[number];
