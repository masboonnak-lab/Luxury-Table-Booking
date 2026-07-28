/**
 * The room, as data. Every availability number in the app is derived from the
 * tables below — there is no second inventory to fall out of sync with.
 *
 * Coordinates live in a 100 x 80 SVG space; x grows right, y grows down.
 */

export interface Zone {
  id: string;
  name: string;
  desc: string;
  /** Minimum spend in THB. 0 means none. */
  minSpend: number;
}

export const ZONES: ReadonlyArray<Zone> = [
  {
    id: "stage",
    name: "หน้าเวที",
    desc: "ติดเวทีที่สุด เห็นวงเต็มตา เสียงดังกำลังดี เหมาะกับคืนมีดนตรีสด",
    minSpend: 2000,
  },
  {
    id: "counter",
    name: "บาร์เคาน์เตอร์",
    desc: "นั่งหน้าบาร์ ดูบาร์เทนเดอร์เชคสด เหมาะกับมาคนเดียวหรือมาคู่",
    minSpend: 0,
  },
  {
    id: "table",
    name: "โต๊ะทั่วไป",
    desc: "โซนกลางร้าน บรรยากาศเป็นกันเอง คุยกันได้สบาย",
    minSpend: 0,
  },
  {
    id: "lounge",
    name: "โซฟาเลานจ์",
    desc: "โซฟาหนังโซนใน แสงสลัว ห่างจากลำโพง คุยงานได้",
    minSpend: 3000,
  },
  {
    id: "vip",
    name: "ห้อง VIP",
    desc: "ห้องส่วนตัว ระบบเสียงแยก พร้อมพนักงานดูแลเฉพาะโต๊ะ",
    minSpend: 12000,
  },
];

export type TableShape = "round" | "rect";

export interface TableSpec {
  id: string;
  zoneId: string;
  shape: TableShape;
  /** Centre point. */
  x: number;
  y: number;
  /** Full width/height (diameter for round). */
  w: number;
  h: number;
  minSeats: number;
  maxSeats: number;
}

export const TABLES: ReadonlyArray<TableSpec> = [
  // Stage front — one row facing the stage, the tables that sell out first.
  { id: "S1", zoneId: "stage", shape: "rect", x: 52, y: 25, w: 10, h: 9, minSeats: 2, maxSeats: 6 },
  { id: "S2", zoneId: "stage", shape: "rect", x: 64, y: 25, w: 10, h: 9, minSeats: 2, maxSeats: 6 },
  { id: "S3", zoneId: "stage", shape: "rect", x: 76, y: 25, w: 10, h: 9, minSeats: 2, maxSeats: 6 },
  { id: "S4", zoneId: "stage", shape: "rect", x: 88, y: 25, w: 10, h: 9, minSeats: 2, maxSeats: 6 },

  // Main floor — three columns filling the middle of the room.
  { id: "T1", zoneId: "table", shape: "rect", x: 30, y: 38, w: 12, h: 9, minSeats: 2, maxSeats: 6 },
  { id: "T2", zoneId: "table", shape: "rect", x: 44, y: 38, w: 12, h: 9, minSeats: 2, maxSeats: 6 },
  { id: "T3", zoneId: "table", shape: "rect", x: 58, y: 38, w: 12, h: 9, minSeats: 2, maxSeats: 6 },
  { id: "T4", zoneId: "table", shape: "rect", x: 30, y: 50, w: 12, h: 9, minSeats: 2, maxSeats: 6 },
  { id: "T5", zoneId: "table", shape: "rect", x: 44, y: 50, w: 12, h: 9, minSeats: 2, maxSeats: 6 },
  { id: "T6", zoneId: "table", shape: "rect", x: 58, y: 50, w: 12, h: 9, minSeats: 2, maxSeats: 6 },
  { id: "T7", zoneId: "table", shape: "rect", x: 30, y: 62, w: 12, h: 9, minSeats: 2, maxSeats: 6 },
  { id: "T8", zoneId: "table", shape: "rect", x: 44, y: 62, w: 12, h: 9, minSeats: 2, maxSeats: 6 },

  // Private rooms, down the right-hand wall.
  { id: "V1", zoneId: "vip", shape: "rect", x: 87, y: 42, w: 14, h: 12, minSeats: 6, maxSeats: 20 },
  { id: "V2", zoneId: "vip", shape: "rect", x: 87, y: 56, w: 14, h: 12, minSeats: 6, maxSeats: 20 },

  // Bar counter seats, running down the left face of the bar.
  // Whole numbers throughout: `venue_tables` stores these as integers, so a
  // half-unit here would not survive the round trip through the database.
  { id: "B1", zoneId: "counter", shape: "rect", x: 64, y: 64, w: 7, h: 5, minSeats: 1, maxSeats: 4 },
  { id: "B2", zoneId: "counter", shape: "rect", x: 64, y: 70, w: 7, h: 5, minSeats: 1, maxSeats: 4 },
  { id: "B3", zoneId: "counter", shape: "rect", x: 64, y: 76, w: 7, h: 5, minSeats: 1, maxSeats: 4 },
  { id: "B4", zoneId: "counter", shape: "rect", x: 64, y: 82, w: 7, h: 5, minSeats: 1, maxSeats: 4 },

  // Sofa lounge along the bottom wall.
  { id: "L1", zoneId: "lounge", shape: "rect", x: 20, y: 76, w: 14, h: 11, minSeats: 4, maxSeats: 10 },
  { id: "L2", zoneId: "lounge", shape: "rect", x: 36, y: 76, w: 14, h: 11, minSeats: 4, maxSeats: 10 },
  { id: "L3", zoneId: "lounge", shape: "rect", x: 52, y: 76, w: 14, h: 11, minSeats: 4, maxSeats: 10 },
];

/**
 * The coordinate space every position in this file is expressed in. The SVG
 * viewBox and the layout assertions both read it, so the plan cannot silently
 * outgrow the canvas it is drawn on.
 */
export const CANVAS = { w: 100, h: 92 } as const;

/**
 * The room's own outline, clockwise from the top of the diagonal wall. Drawn
 * as a polygon rather than a rectangle because the cut corner by the entrance
 * is what makes the plan recognisable as this room.
 */
export const ROOM_OUTLINE: ReadonlyArray<readonly [number, number]> = [
  [32, 4],
  [96, 4],
  [96, 86],
  [8, 86],
  [8, 40],
];

/** Fixed furniture and wayfinding, drawn but never bookable. */
export const FIXTURES = {
  stage: { x: 40, y: 6, w: 54, h: 11, label: "เวที" },
  bar: { x: 68, y: 62, w: 26, h: 22, label: "บาร์" },
  /** Wayfinding badges, pinned just outside the wall they sit on. */
  exits: [
    { id: "entry", x: 16, y: 91, label: "ทางเข้า–ออก", tone: "primary" },
    { id: "fire", x: 58, y: 91, label: "ทางหนีไฟ", tone: "danger" },
  ],
  /** Fire extinguisher positions, mandated signage on a real plan. */
  extinguishers: [
    { x: 44, y: 11 },
    { x: 13, y: 45 },
    { x: 81, y: 73 },
  ],
} as const;

/** True when the point sits inside {@link ROOM_OUTLINE} — ray casting. */
export function isInsideRoom(x: number, y: number): boolean {
  let inside = false;
  for (
    let i = 0, j = ROOM_OUTLINE.length - 1;
    i < ROOM_OUTLINE.length;
    j = i++
  ) {
    const [xi, yi] = ROOM_OUTLINE[i]!;
    const [xj, yj] = ROOM_OUTLINE[j]!;
    if (
      yi > y !== yj > y &&
      x < ((xj - xi) * (y - yi)) / (yj - yi) + xi
    ) {
      inside = !inside;
    }
  }
  return inside;
}

/** Every coordinate is a whole number so it survives the integer DB columns. */
export function isWholeGeometry(t: TableSpec): boolean {
  return [t.x, t.y, t.w, t.h].every(Number.isInteger);
}

/** Per-zone share of tables that stay open — VIP sells out first. */
const OPEN_RATE: Record<string, number> = {
  counter: 78,
  table: 72,
  stage: 58,
  lounge: 62,
  vip: 52,
};

/** Stable 32-bit hash — keeps mock availability identical across re-renders. */
function hash(input: string): number {
  let h = 2166136261;
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 16777619) >>> 0;
  }
  return h;
}

const TABLE_BY_ID = new Map(TABLES.map((t) => [t.id, t]));
const ZONE_BY_ID = new Map(ZONES.map((z) => [z.id, z]));

export function getTable(id: string): TableSpec | undefined {
  return TABLE_BY_ID.get(id);
}

export function getZone(id: string): Zone | undefined {
  return ZONE_BY_ID.get(id);
}

export function tablesInZone(zoneId: string): ReadonlyArray<TableSpec> {
  return TABLES.filter((t) => t.zoneId === zoneId);
}

/** Capacity is read off the tables, so it can never contradict the room. */
export function zoneCapacity(zoneId: string): { min: number; max: number } {
  const ts = tablesInZone(zoneId);
  if (ts.length === 0) {
    return { min: 0, max: 0 };
  }
  return {
    min: Math.min(...ts.map((t) => t.minSeats)),
    max: Math.max(...ts.map((t) => t.maxSeats)),
  };
}

export function tableFitsParty(table: TableSpec, guests: number): boolean {
  return guests >= table.minSeats && guests <= table.maxSeats;
}

/** Mock inventory, resolved per individual table. */
export function isTableFree(
  dateKey: string,
  slot: string,
  tableId: string,
): boolean {
  if (!dateKey || !slot) {
    return false;
  }
  const table = TABLE_BY_ID.get(tableId);
  if (!table) {
    return false;
  }
  const rate = OPEN_RATE[table.zoneId] ?? 65;
  return hash(`${dateKey}|${slot}|${table.id}`) % 100 < rate;
}

export function isTableSelectable(
  table: TableSpec,
  dateKey: string,
  slot: string,
  guests: number,
): boolean {
  return tableFitsParty(table, guests) && isTableFree(dateKey, slot, table.id);
}

export function freeTablesInZone(
  zoneId: string,
  dateKey: string,
  slot: string,
): number {
  return tablesInZone(zoneId).filter((t) => isTableFree(dateKey, slot, t.id))
    .length;
}

/** Total free tables at a date+slot — what the time picker shows. */
export function freeTablesAt(dateKey: string, slot: string): number {
  return TABLES.filter((t) => isTableFree(dateKey, slot, t.id)).length;
}

export function selectableTables(
  dateKey: string,
  slot: string,
  guests: number,
): ReadonlyArray<TableSpec> {
  return TABLES.filter((t) => isTableSelectable(t, dateKey, slot, guests));
}
