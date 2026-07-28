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
  venueTablesTable,
  zonesTable,
  type InsertVenueEvent,
  type InsertVenueTable,
  type InsertZone,
} from "@workspace/db";

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
  // Counter seats, tucked under the bar at the top left.
  { id: "B1", zoneId: "counter", shape: "rect", x: 11, y: 27, w: 7, h: 6, minSeats: 1, maxSeats: 4 },
  { id: "B2", zoneId: "counter", shape: "rect", x: 19, y: 27, w: 7, h: 6, minSeats: 1, maxSeats: 4 },
  { id: "B3", zoneId: "counter", shape: "rect", x: 27, y: 27, w: 7, h: 6, minSeats: 1, maxSeats: 4 },
  { id: "B4", zoneId: "counter", shape: "rect", x: 35, y: 27, w: 7, h: 6, minSeats: 1, maxSeats: 4 },

  // Stage front — the row facing the stage, first to sell out.
  { id: "S1", zoneId: "stage", shape: "rect", x: 60, y: 27, w: 9, h: 6, minSeats: 2, maxSeats: 6 },
  { id: "S2", zoneId: "stage", shape: "rect", x: 70, y: 27, w: 9, h: 6, minSeats: 2, maxSeats: 6 },
  { id: "S3", zoneId: "stage", shape: "rect", x: 80, y: 27, w: 9, h: 6, minSeats: 2, maxSeats: 6 },
  { id: "S4", zoneId: "stage", shape: "rect", x: 90, y: 27, w: 9, h: 6, minSeats: 2, maxSeats: 6 },

  // Main floor — two rows of four, split by the centre walkway.
  { id: "T1", zoneId: "table", shape: "rect", x: 14, y: 40, w: 12, h: 10, minSeats: 2, maxSeats: 6 },
  { id: "T2", zoneId: "table", shape: "rect", x: 28, y: 40, w: 12, h: 10, minSeats: 2, maxSeats: 6 },
  { id: "T3", zoneId: "table", shape: "rect", x: 42, y: 40, w: 12, h: 10, minSeats: 2, maxSeats: 6 },
  { id: "T4", zoneId: "table", shape: "rect", x: 56, y: 40, w: 12, h: 10, minSeats: 2, maxSeats: 6 },
  { id: "T5", zoneId: "table", shape: "rect", x: 14, y: 52, w: 12, h: 10, minSeats: 2, maxSeats: 6 },
  { id: "T6", zoneId: "table", shape: "rect", x: 28, y: 52, w: 12, h: 10, minSeats: 2, maxSeats: 6 },
  { id: "T7", zoneId: "table", shape: "rect", x: 42, y: 52, w: 12, h: 10, minSeats: 2, maxSeats: 6 },
  { id: "T8", zoneId: "table", shape: "rect", x: 56, y: 52, w: 12, h: 10, minSeats: 2, maxSeats: 6 },

  // Private rooms, stacked down the right-hand wall.
  { id: "V1", zoneId: "vip", shape: "rect", x: 82, y: 39, w: 22, h: 11, minSeats: 6, maxSeats: 20 },
  { id: "V2", zoneId: "vip", shape: "rect", x: 82, y: 51, w: 22, h: 11, minSeats: 6, maxSeats: 20 },

  // Sofa lounge across the back, behind the main walkway.
  { id: "L1", zoneId: "lounge", shape: "rect", x: 16, y: 68, w: 20, h: 13, minSeats: 4, maxSeats: 10 },
  { id: "L2", zoneId: "lounge", shape: "rect", x: 38, y: 68, w: 20, h: 13, minSeats: 4, maxSeats: 10 },
  { id: "L3", zoneId: "lounge", shape: "rect", x: 60, y: 68, w: 20, h: 13, minSeats: 4, maxSeats: 10 },
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

  logger.info(
    { zones: ZONES.length, tables: TABLES.length, events: EVENTS.length },
    "Seed complete",
  );
}

seed()
  .then(() => pool.end())
  .catch(async (err: unknown) => {
    logger.error({ err }, "Seed failed");
    await pool.end();
    process.exit(1);
  });
