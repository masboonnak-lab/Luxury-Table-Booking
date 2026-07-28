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

/**
 * Whole numbers throughout: `venue_tables` stores these as integers, so a
 * half-unit here would not survive the round trip through the database.
 */
/**
 * Every row is symmetric about x = 50, and every row spans the same 6–94
 * width. An earlier layout let each group find its own width and left a hole
 * under the private rooms; balance here is a property of the numbers, and
 * `booking.check.ts` asserts it rather than trusting the eye.
 */
export const TABLES: ReadonlyArray<TableSpec> = [
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
 * The coordinate space every position in this file is expressed in. The SVG
 * viewBox and the layout assertions both read it, so the plan cannot silently
 * outgrow the canvas it is drawn on.
 */
export const CANVAS = { w: 100, h: 100 } as const;

/**
 * The room's own outline, clockwise from the top of the diagonal wall. Drawn
 * as a polygon rather than a rectangle because the cut corner by the entrance
 * is what makes the plan recognisable as this room.
 */
export const ROOM_OUTLINE: ReadonlyArray<readonly [number, number]> = [
  [4, 5],
  [96, 5],
  [96, 84],
  [4, 84],
];

/**
 * Fixed furniture and wayfinding, drawn but never bookable.
 *
 * Signage lives in the margin *outside* the walls rather than on top of the
 * room: an extinguisher drawn over the stage sat on its label and made both
 * unreadable.
 */
export const FIXTURES = {
  /**
   * The bar, the booth and the stage: three equal blocks with equal gaps, so
   * the band reads as one piece of furniture rather than three sizes.
   */
  bar: { x: 12, y: 8, w: 24, h: 12, label: "บาร์" },
  dj: { x: 38, y: 8, w: 24, h: 12, label: "ดีเจ" },
  stage: { x: 64, y: 8, w: 24, h: 12, label: "เวที" },

  /**
   * Walkways, spanning the same width as the tables so they read as aisles
   * rather than stray rectangles. Muted gold, deliberately not the green of
   * the reference plan — green already means "available" in the legend, and
   * one colour cannot carry two meanings on the same drawing.
   */
  walkways: [
    { id: "front", x: 6, y: 36, w: 88, h: 4 },
    { id: "back", x: 6, y: 66, w: 88, h: 4 },
  ],

  /** Wayfinding badges, below the wall they belong to, evenly spaced. */
  exits: [
    { id: "entry", x: 20, y: 91, label: "ทางเข้า–ออก", tone: "primary" },
    { id: "exit-mid", x: 50, y: 91, label: "ทางออก", tone: "danger" },
    { id: "exit-right", x: 80, y: 91, label: "ทางออก", tone: "danger" },
  ],

  /** Fire extinguishers, in the side margins so they never cover the room. */
  extinguishers: [
    { x: 2, y: 28 },
    { x: 2, y: 62 },
    { x: 98, y: 28 },
    { x: 98, y: 62 },
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
