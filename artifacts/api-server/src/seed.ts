/**
 * Loads the room and the event calendar. Idempotent — every row is an upsert,
 * so running it again after editing a zone's minimum spend just corrects it.
 * Orders and slips are never touched.
 *
 *   pnpm --filter @workspace/api-server run seed
 */

import { sql, type SQL } from "drizzle-orm";
import {
  db,
  eventsTable,
  pool,
  usersTable,
  venueTablesTable,
  zonesTable,
  type InsertVenueEvent,
  type InsertVenueTable,
  type InsertZone,
} from "@workspace/db";

import { hashPassword, MIN_PASSWORD_LENGTH } from "./domain/password";
import { normalisePhone } from "./domain/phone";
import { logger } from "./lib/logger";

const thb = (baht: number): number => baht * 100;

/** In an upsert, `excluded` is the row Postgres was about to insert. */
function incoming(column: string): SQL {
  return sql.raw(`excluded."${column}"`);
}

const ZONES: ReadonlyArray<InsertZone> = [
  {
    id: "stage",
    name: "หน้าเวที",
    description:
      "ติดเวทีที่สุด เห็นวงเต็มตา เสียงดังกำลังดี เหมาะกับคืนมีดนตรีสด",
    minSpendSatang: thb(2000),
    sortOrder: 1,
  },
  {
    id: "counter",
    name: "บาร์เคาน์เตอร์",
    description: "นั่งหน้าบาร์ ดูบาร์เทนเดอร์เชคสด เหมาะกับมาคนเดียวหรือมาคู่",
    minSpendSatang: 0,
    sortOrder: 2,
  },
  {
    id: "table",
    name: "โต๊ะทั่วไป",
    description: "โซนกลางร้าน บรรยากาศเป็นกันเอง คุยกันได้สบาย",
    minSpendSatang: 0,
    sortOrder: 3,
  },
  {
    id: "lounge",
    name: "โซฟาเลานจ์",
    description: "โซฟาหนังโซนใน แสงสลัว ห่างจากลำโพง คุยงานได้",
    minSpendSatang: thb(3000),
    sortOrder: 4,
  },
  {
    id: "vip",
    name: "ห้อง VIP",
    description: "ห้องส่วนตัว ระบบเสียงแยก พร้อมพนักงานดูแลเฉพาะโต๊ะ",
    minSpendSatang: thb(12000),
    sortOrder: 5,
  },
];

/**
 * Coordinates match the 100 x 100 space the floor map SVG draws in, and must
 * stay identical to `_shared/floor.ts` in the mockup — the geometry assertions
 * in `booking.check.ts` guard that file, and this table is what the API serves.
 */
const TABLES: ReadonlyArray<InsertVenueTable> = [
  // Counter seats under the bar, mirrored by the stage-front row.
  { id: "B1", zoneId: "counter", shape: "rect", x: 17, y: 28, w: 8, h: 7, minSeats: 1, maxSeats: 4 },
  { id: "B2", zoneId: "counter", shape: "rect", x: 26, y: 28, w: 8, h: 7, minSeats: 1, maxSeats: 4 },
  { id: "B3", zoneId: "counter", shape: "rect", x: 35, y: 28, w: 8, h: 7, minSeats: 1, maxSeats: 4 },
  { id: "B4", zoneId: "counter", shape: "rect", x: 44, y: 28, w: 8, h: 7, minSeats: 1, maxSeats: 4 },

  // Stage front — the row facing the stage, first to sell out.
  { id: "S1", zoneId: "stage", shape: "rect", x: 56, y: 28, w: 8, h: 7, minSeats: 2, maxSeats: 6 },
  { id: "S2", zoneId: "stage", shape: "rect", x: 65, y: 28, w: 8, h: 7, minSeats: 2, maxSeats: 6 },
  { id: "S3", zoneId: "stage", shape: "rect", x: 74, y: 28, w: 8, h: 7, minSeats: 2, maxSeats: 6 },
  { id: "S4", zoneId: "stage", shape: "rect", x: 83, y: 28, w: 8, h: 7, minSeats: 2, maxSeats: 6 },

  // Main floor — two rows of four, centred on the room.
  { id: "T1", zoneId: "table", shape: "rect", x: 20, y: 45, w: 16, h: 11, minSeats: 2, maxSeats: 6 },
  { id: "T2", zoneId: "table", shape: "rect", x: 40, y: 45, w: 16, h: 11, minSeats: 2, maxSeats: 6 },
  { id: "T3", zoneId: "table", shape: "rect", x: 60, y: 45, w: 16, h: 11, minSeats: 2, maxSeats: 6 },
  { id: "T4", zoneId: "table", shape: "rect", x: 80, y: 45, w: 16, h: 11, minSeats: 2, maxSeats: 6 },
  { id: "T5", zoneId: "table", shape: "rect", x: 20, y: 58, w: 16, h: 11, minSeats: 2, maxSeats: 6 },
  { id: "T6", zoneId: "table", shape: "rect", x: 40, y: 58, w: 16, h: 11, minSeats: 2, maxSeats: 6 },
  { id: "T7", zoneId: "table", shape: "rect", x: 60, y: 58, w: 16, h: 11, minSeats: 2, maxSeats: 6 },
  { id: "T8", zoneId: "table", shape: "rect", x: 80, y: 58, w: 16, h: 11, minSeats: 2, maxSeats: 6 },

  // Back row: a private room at each end, the sofas between them.
  { id: "V1", zoneId: "vip", shape: "rect", x: 14, y: 76, w: 16, h: 12, minSeats: 6, maxSeats: 20 },
  { id: "L1", zoneId: "lounge", shape: "rect", x: 32, y: 76, w: 16, h: 12, minSeats: 4, maxSeats: 10 },
  { id: "L2", zoneId: "lounge", shape: "rect", x: 50, y: 76, w: 16, h: 12, minSeats: 4, maxSeats: 10 },
  { id: "L3", zoneId: "lounge", shape: "rect", x: 68, y: 76, w: 16, h: 12, minSeats: 4, maxSeats: 10 },
  { id: "V2", zoneId: "vip", shape: "rect", x: 86, y: 76, w: 16, h: 12, minSeats: 6, maxSeats: 20 },
];

/**
 * `baseSold` is what was sold off-system before this server existed; anything
 * bought through the API is counted from `orders` instead.
 */
const EVENTS: ReadonlyArray<InsertVenueEvent> = [
  {
    id: "ev-neon-soul",
    kind: "concert",
    title: "NEON SOUL LIVE",
    artistTh: "วงเนออน โซล · ฟูลแบนด์",
    artistEn: "Neon Soul · full band",
    date: "2026-08-08",
    doorsAt: "20:00",
    priceSatang: thb(1200),
    capacity: 180,
    baseSold: 122,
  },
  {
    id: "ev-midnight-tokyo",
    kind: "dj",
    title: "MIDNIGHT IN TOKYO",
    artistTh: "ดีเจ ริว (โตเกียว)",
    artistEn: "DJ Ryu (Tokyo)",
    date: "2026-08-15",
    doorsAt: "21:00",
    priceSatang: thb(900),
    capacity: 200,
    baseSold: 200,
  },
  {
    id: "ev-rooftop-fest",
    kind: "festival",
    title: "ROOFTOP FESTIVAL",
    artistTh: "8 ศิลปิน 2 เวที",
    artistEn: "8 artists · 2 stages",
    date: "2026-08-22",
    doorsAt: "17:00",
    priceSatang: thb(1800),
    capacity: 400,
    baseSold: 231,
  },
  {
    id: "ev-anniversary",
    kind: "special",
    title: "5TH ANNIVERSARY NIGHT",
    artistTh: "ปาร์ตี้ครบรอบ 5 ปี · เชิญเฉพาะสมาชิก",
    artistEn: "Members-only anniversary party",
    date: "2026-09-05",
    doorsAt: "19:30",
    priceSatang: thb(2500),
    capacity: 120,
    baseSold: 96,
  },
];

async function seed(): Promise<void> {
  await db
    .insert(zonesTable)
    .values([...ZONES])
    .onConflictDoUpdate({
      target: zonesTable.id,
      set: {
        name: incoming("name"),
        description: incoming("description"),
        minSpendSatang: incoming("min_spend_satang"),
        sortOrder: incoming("sort_order"),
      },
    });

  await db
    .insert(venueTablesTable)
    .values([...TABLES])
    .onConflictDoUpdate({
      target: venueTablesTable.id,
      set: {
        zoneId: incoming("zone_id"),
        shape: incoming("shape"),
        x: incoming("x"),
        y: incoming("y"),
        w: incoming("w"),
        h: incoming("h"),
        minSeats: incoming("min_seats"),
        maxSeats: incoming("max_seats"),
      },
    });

  await db
    .insert(eventsTable)
    .values([...EVENTS])
    .onConflictDoUpdate({
      target: eventsTable.id,
      set: {
        kind: incoming("kind"),
        title: incoming("title"),
        artistTh: incoming("artist_th"),
        artistEn: incoming("artist_en"),
        date: incoming("date"),
        doorsAt: incoming("doors_at"),
        priceSatang: incoming("price_satang"),
        capacity: incoming("capacity"),
        baseSold: incoming("base_sold"),
      },
    });

  await seedAdmin();

  logger.info(
    { zones: ZONES.length, tables: TABLES.length, events: EVENTS.length },
    "Seed complete",
  );
}

/**
 * The first admin, because there is no other way to become one — the API only
 * lets an existing admin promote somebody. Credentials come from the
 * environment so they are never committed, and the account is only created
 * when all three are set.
 */
async function seedAdmin(): Promise<void> {
  const phone = process.env["ADMIN_PHONE"];
  const email = process.env["ADMIN_EMAIL"];
  const password = process.env["ADMIN_PASSWORD"];

  if (!phone || !email || !password) {
    logger.info(
      "ADMIN_PHONE / ADMIN_EMAIL / ADMIN_PASSWORD not all set — no admin seeded",
    );
    return;
  }

  if (password.length < MIN_PASSWORD_LENGTH) {
    throw new Error(
      `ADMIN_PASSWORD must be at least ${MIN_PASSWORD_LENGTH} characters`,
    );
  }

  const digits = normalisePhone(phone);
  const now = new Date();
  const passwordHash = await hashPassword(password);

  await db
    .insert(usersTable)
    .values({
      name: process.env["ADMIN_NAME"] ?? "ผู้ดูแลระบบ",
      phone: digits,
      email: email.trim().toLowerCase(),
      role: "admin",
      passwordHash,
      pdpaConsentAt: now,
    })
    .onConflictDoUpdate({
      target: usersTable.phone,
      // Re-running the seed resets the admin password, which is the intended
      // recovery path when it is lost.
      set: {
        role: incoming("role"),
        email: incoming("email"),
        passwordHash: incoming("password_hash"),
        updatedAt: incoming("updated_at"),
      },
    });

  logger.info({ phone: digits }, "Admin account ready");
}

seed()
  .then(() => pool.end())
  .catch(async (err: unknown) => {
    logger.error({ err }, "Seed failed");
    await pool.end();
    process.exit(1);
  });
