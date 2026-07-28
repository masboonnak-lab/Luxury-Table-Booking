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
  // Front of stage — four rounds facing the stage block.
  { id: "S1", zoneId: "stage", shape: "round", x: 14, y: 22, w: 9, h: 9, minSeats: 2, maxSeats: 6 },
  { id: "S2", zoneId: "stage", shape: "round", x: 26, y: 22, w: 9, h: 9, minSeats: 2, maxSeats: 6 },
  { id: "S3", zoneId: "stage", shape: "round", x: 38, y: 22, w: 9, h: 9, minSeats: 2, maxSeats: 6 },
  { id: "S4", zoneId: "stage", shape: "round", x: 50, y: 22, w: 9, h: 9, minSeats: 2, maxSeats: 6 },

  // Bar counter seats, running down the left face of the bar.
  { id: "B1", zoneId: "counter", shape: "rect", x: 71, y: 11, w: 7, h: 6, minSeats: 1, maxSeats: 4 },
  { id: "B2", zoneId: "counter", shape: "rect", x: 71, y: 19, w: 7, h: 6, minSeats: 1, maxSeats: 4 },
  { id: "B3", zoneId: "counter", shape: "rect", x: 71, y: 27, w: 7, h: 6, minSeats: 1, maxSeats: 4 },
  { id: "B4", zoneId: "counter", shape: "rect", x: 71, y: 35, w: 7, h: 6, minSeats: 1, maxSeats: 4 },

  // Main floor.
  { id: "T1", zoneId: "table", shape: "round", x: 14, y: 36, w: 9, h: 9, minSeats: 2, maxSeats: 6 },
  { id: "T2", zoneId: "table", shape: "round", x: 26, y: 36, w: 9, h: 9, minSeats: 2, maxSeats: 6 },
  { id: "T3", zoneId: "table", shape: "round", x: 38, y: 36, w: 9, h: 9, minSeats: 2, maxSeats: 6 },
  { id: "T4", zoneId: "table", shape: "round", x: 50, y: 36, w: 9, h: 9, minSeats: 2, maxSeats: 6 },
  { id: "T5", zoneId: "table", shape: "round", x: 14, y: 48, w: 9, h: 9, minSeats: 2, maxSeats: 6 },
  { id: "T6", zoneId: "table", shape: "round", x: 26, y: 48, w: 9, h: 9, minSeats: 2, maxSeats: 6 },
  { id: "T7", zoneId: "table", shape: "round", x: 38, y: 48, w: 9, h: 9, minSeats: 2, maxSeats: 6 },
  { id: "T8", zoneId: "table", shape: "round", x: 50, y: 48, w: 9, h: 9, minSeats: 2, maxSeats: 6 },

  // Sofa lounge along the back wall.
  { id: "L1", zoneId: "lounge", shape: "rect", x: 17, y: 65, w: 22, h: 14, minSeats: 4, maxSeats: 10 },
  { id: "L2", zoneId: "lounge", shape: "rect", x: 43, y: 65, w: 22, h: 14, minSeats: 4, maxSeats: 10 },
  { id: "L3", zoneId: "lounge", shape: "rect", x: 67, y: 65, w: 22, h: 14, minSeats: 4, maxSeats: 10 },

  // Private rooms.
  { id: "V1", zoneId: "vip", shape: "rect", x: 88, y: 49, w: 17, h: 14, minSeats: 6, maxSeats: 20 },
  { id: "V2", zoneId: "vip", shape: "rect", x: 88, y: 67, w: 17, h: 14, minSeats: 6, maxSeats: 20 },
];

/** Fixed furniture, drawn but never bookable. */
export const FIXTURES = {
  stage: { x: 8, y: 4, w: 38, h: 10, label: "เวที" },
  bar: { x: 76, y: 5, w: 21, h: 34, label: "บาร์" },
  entrance: { x: 3, y: 74, label: "ทางเข้า" },
} as const;

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
