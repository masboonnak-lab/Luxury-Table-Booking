/**
 * Standalone assertions over the pure booking + floor logic.
 *
 * Not wired to a test runner — bundle and run it with the workspace's esbuild:
 *
 *   artifacts/api-server/node_modules/.bin/esbuild \
 *     artifacts/mockup-sandbox/src/components/mockups/_shared/__checks__/booking.check.ts \
 *     --bundle --platform=node --format=esm --outfile=<tmp>/check.mjs
 *   node <tmp>/check.mjs
 */

import {
  ALL_SLOTS,
  MAX_GUESTS,
  MIN_GUESTS,
  bookingCode,
  bookingReference,
  depositFor,
  normalisePhone,
  receiptNumber,
  slotTablesLeft,
  taxBreakdown,
  validateContact,
  EMPTY_CONTACT,
} from "../booking";
import {
  CANVAS,
  FIXTURES,
  TABLES,
  ZONES,
  getZone,
  isInsideRoom,
  isWholeGeometry,
  isTableFree,
  isTableSelectable,
  selectableTables,
  tableFitsParty,
  tablesInZone,
  zoneCapacity,
  type TableSpec,
} from "../floor";
import { BRAND, BRAND_PRESETS, paletteToCssVars } from "../brand";
import { STRINGS, translate } from "../i18n";
import { EVENTS, FAQ, TERMS, ticketsLeft } from "../data";
import {
  emptyBookingForm,
  pickupOptions,
  todayIso,
  validateBookingForm,
} from "../forms";
import { slipFileError } from "../slip";

let failures = 0;
function check(name: string, ok: boolean, detail = ""): void {
  if (!ok) {
    failures++;
    console.log(`FAIL  ${name} ${detail}`);
  }
}

const DATES: Array<string> = [];
for (let i = 0; i < 120; i++) {
  const d = new Date(2026, 6, 27 + i);
  DATES.push(
    `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
      d.getDate(),
    ).padStart(2, "0")}`,
  );
}

/* ------------------------------------------------------------- geometry */

interface Box {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
}

function boxOf(t: TableSpec): Box {
  return {
    x1: t.x - t.w / 2,
    y1: t.y - t.h / 2,
    x2: t.x + t.w / 2,
    y2: t.y + t.h / 2,
  };
}

function overlaps(a: Box, b: Box): boolean {
  return a.x1 < b.x2 && b.x1 < a.x2 && a.y1 < b.y2 && b.y1 < a.y2;
}

const ids = new Set<string>();
for (const t of TABLES) {
  check(`unique id ${t.id}`, !ids.has(t.id));
  ids.add(t.id);
  check(`zone exists for ${t.id}`, getZone(t.zoneId) !== undefined, t.zoneId);
  check(`seats sane ${t.id}`, t.minSeats >= 1 && t.minSeats <= t.maxSeats);
  // The DB stores these as integers; a fractional coordinate would be lost
  // between the mockup and what the API actually serves.
  check(`${t.id} geometry is whole numbers`, isWholeGeometry(t));

  const b = boxOf(t);
  check(
    `${t.id} inside canvas`,
    b.x1 >= 0 && b.y1 >= 0 && b.x2 <= CANVAS.w && b.y2 <= CANVAS.h,
    JSON.stringify(b),
  );

  // Being on the canvas is not enough — the room has a cut corner, so a table
  // can sit in bounds and still hang through a wall.
  for (const [cx, cy] of [
    [b.x1, b.y1],
    [b.x2, b.y1],
    [b.x1, b.y2],
    [b.x2, b.y2],
  ] as Array<[number, number]>) {
    check(`${t.id} corner (${cx},${cy}) inside room`, isInsideRoom(cx, cy));
  }
}

for (let i = 0; i < TABLES.length; i++) {
  for (let j = i + 1; j < TABLES.length; j++) {
    check(
      `no overlap ${TABLES[i].id}/${TABLES[j].id}`,
      !overlaps(boxOf(TABLES[i]), boxOf(TABLES[j])),
    );
  }
}

const fixtureBoxes: Array<[string, Box]> = [
  [
    "stage",
    {
      x1: FIXTURES.stage.x,
      y1: FIXTURES.stage.y,
      x2: FIXTURES.stage.x + FIXTURES.stage.w,
      y2: FIXTURES.stage.y + FIXTURES.stage.h,
    },
  ],
  [
    "bar",
    {
      x1: FIXTURES.bar.x,
      y1: FIXTURES.bar.y,
      x2: FIXTURES.bar.x + FIXTURES.bar.w,
      y2: FIXTURES.bar.y + FIXTURES.bar.h,
    },
  ],
];

for (const t of TABLES) {
  for (const [name, fb] of fixtureBoxes) {
    check(`${t.id} clear of ${name}`, !overlaps(boxOf(t), fb));
  }
}

/* -------------------------------------------------- capacity consistency */

for (const z of ZONES) {
  const ts = tablesInZone(z.id);
  check(`zone ${z.id} has tables`, ts.length > 0);
  const cap = zoneCapacity(z.id);
  check(
    `zone ${z.id} capacity matches tables`,
    cap.min === Math.min(...ts.map((t) => t.minSeats)) &&
      cap.max === Math.max(...ts.map((t) => t.maxSeats)),
  );
}

check(
  "every table belongs to a listed zone",
  TABLES.every((t) => ZONES.some((z) => z.id === t.zoneId)),
);

/* ---------------------------------------------------------- availability */

for (const dk of DATES.slice(0, 10)) {
  for (const s of ALL_SLOTS) {
    for (const t of TABLES) {
      check(
        "deterministic",
        isTableFree(dk, s, t.id) === isTableFree(dk, s, t.id),
      );
    }
  }
}

// The time picker's number must equal the map's free-table count exactly.
for (const dk of DATES) {
  for (const s of ALL_SLOTS) {
    const fromMap = TABLES.filter((t) => isTableFree(dk, s, t.id)).length;
    check("picker count == map count", slotTablesLeft(dk, s) === fromMap, `${dk} ${s}`);
  }
}

let deadDates = 0;
for (const dk of DATES) {
  if (!ALL_SLOTS.some((s) => slotTablesLeft(dk, s) > 0)) deadDates++;
}
check("no dead-end date", deadDates === 0, `${deadDates}`);

for (let g = MIN_GUESTS; g <= MAX_GUESTS; g++) {
  let blocked = 0;
  for (const dk of DATES) {
    if (!ALL_SLOTS.some((s) => selectableTables(dk, s, g).length > 0)) blocked++;
  }
  check(`party size ${g} reachable`, blocked === 0, `${blocked} blocked dates`);
}

// A selectable table must both fit and be free — no third path.
for (const dk of DATES.slice(0, 20)) {
  for (const s of ALL_SLOTS) {
    for (const g of [1, 4, 8, 20]) {
      for (const t of TABLES) {
        check(
          "selectable implies fits && free",
          isTableSelectable(t, dk, s, g) ===
            (tableFitsParty(t, g) && isTableFree(dk, s, t.id)),
          `${t.id} ${g}`,
        );
      }
    }
  }
}

check("no date -> not free", !isTableFree("", "21:00", "T1"));
check("unknown table -> not free", !isTableFree("2026-07-27", "21:00", "ZZ"));

/* --------------------------------------------------------------- deposit */

const counter = getZone("counter")!;
const lounge = getZone("lounge")!;
const vip = getZone("vip")!;
const stage = getZone("stage")!;

check("counter deposit per head", depositFor(counter, 3) === 900);
check("stage deposit = 30% of 2000", depositFor(stage, 4) === 600);
check("lounge deposit = 30% of 3000", depositFor(lounge, 4) === 900);
check("vip deposit = 30% of 12000", depositFor(vip, 8) === 3600);
check("min-spend deposit ignores head count", depositFor(vip, 6) === depositFor(vip, 20));

for (let g = MIN_GUESTS; g <= MAX_GUESTS; g++) {
  for (const z of ZONES) {
    const d = depositFor(z, g);
    check("deposit positive", d > 0, `${z.id} ${g}`);
    check("deposit whole baht", Number.isInteger(d), `${z.id} ${g} -> ${d}`);
  }
}

/* ------------------------------------------------------------------- vat */

for (let amount = 100; amount <= 6000; amount += 50) {
  const t = taxBreakdown(amount);
  check(
    "vat components sum to total",
    Math.round((t.base + t.vat) * 100) === Math.round(t.total * 100),
    `${amount}`,
  );
  check("total preserved", t.total === amount, `${amount}`);
  check("vat ~7% of base", Math.abs(t.vat - t.base * 0.07) < 0.01, `${amount}`);
}

const t900 = taxBreakdown(900);
check("900 base", t900.base === 841.12, String(t900.base));
check("900 vat", t900.vat === 58.88, String(t900.vat));

/* ------------------------------------------------------------ validation */

const base = {
  ...EMPTY_CONTACT,
  name: "สมชาย ใจดี",
  phone: "0812345678",
  ageConfirmed: true,
  agreedTerms: true,
};
check("valid contact passes", Object.keys(validateContact(base)).length === 0);
check("short name fails", validateContact({ ...base, name: "ก" }).name !== undefined);
check("dashed phone ok", validateContact({ ...base, phone: "081-234-5678" }).phone === undefined);
check("9-digit phone ok", validateContact({ ...base, phone: "021234567" }).phone === undefined);
check("no leading zero fails", validateContact({ ...base, phone: "812345678" }).phone !== undefined);
check("11 digits fails", validateContact({ ...base, phone: "08123456789" }).phone !== undefined);
check("empty email ok", validateContact({ ...base, email: "" }).email === undefined);
check("bad email fails", validateContact({ ...base, email: "a@b" }).email !== undefined);
check("age unchecked fails", validateContact({ ...base, ageConfirmed: false }).ageConfirmed !== undefined);
check("terms unchecked fails", validateContact({ ...base, agreedTerms: false }).agreedTerms !== undefined);
check("normalisePhone strips", normalisePhone("081-234 5678") === "0812345678");

/* --------------------------------------------------------- ref / receipt */

const c1 = bookingCode("2026-07-27", "21:00", "V1", "081-234-5678");
const c2 = bookingCode("2026-07-27", "21:00", "V1", "0812345678");
check("code stable across phone formatting", c1 === c2, `${c1} vs ${c2}`);
check("code is 6 chars", /^[0-9A-Z]{6}$/.test(c1), c1);
check("reference shape", /^TLD-[0-9A-Z]{6}$/.test(bookingReference("TLD", c1)));
check(
  "receipt no shape",
  /^TLD-202607-[0-9A-Z]{6}$/.test(receiptNumber("TLD", new Date(2026, 6, 27), c1)),
);
check(
  "receipt month zero-padded",
  receiptNumber("TLD", new Date(2026, 0, 5), c1).includes("-202601-"),
);

// Different tables on the same date+slot must not share a reference.
const codes = new Set<string>();
let collisions = 0;
for (const dk of DATES.slice(0, 40)) {
  for (const s of ALL_SLOTS) {
    for (const t of TABLES) {
      const c = bookingCode(dk, s, t.id, "0812345678");
      if (codes.has(c)) collisions++;
      codes.add(c);
    }
  }
}
check("no reference collisions", collisions === 0, `${collisions} of ${codes.size}`);

/* ------------------------------------------------------------------ i18n */

const thKeys = Object.keys(STRINGS.th).sort();
const enKeys = Object.keys(STRINGS.en).sort();
check(
  "th/en key sets identical",
  thKeys.join("|") === enKeys.join("|"),
  `th=${thKeys.length} en=${enKeys.length}`,
);

for (const lang of ["th", "en"] as const) {
  for (const [key, value] of Object.entries(STRINGS[lang])) {
    check(`${lang}.${key} non-empty`, typeof value === "string" && value.trim().length > 0);
  }
}

// Every menu tile needs both a label and a description string, in both languages.
for (const tile of BRAND.menu) {
  for (const lang of ["th", "en"] as const) {
    check(`${lang} label for ${tile.id}`, tile.id in STRINGS[lang]);
    check(`${lang} desc for ${tile.id}`, `${tile.id}Desc` in STRINGS[lang]);
  }
}

// The PDPA sentence is contractual — it must match the spec exactly.
check(
  "PDPA copy matches spec",
  STRINGS.th.consentBody ===
    "เมื่อกดยืนยัน ถือว่าท่านยินยอมให้ร้านสามารถจัดเก็บและใช้ข้อมูลส่วนบุคคล เพื่ออำนวยความสะดวกในการจองครั้งถัดไปตามนโยบายความเป็นส่วนตัว",
);

check(
  "holdAck interpolates",
  translate("th", "holdAck", { time: "20:30" }).includes("20:30"),
  translate("th", "holdAck", { time: "20:30" }),
);
check(
  "holdAck leaves no placeholder",
  !translate("en", "holdAck", { time: "20:30" }).includes("{"),
);

/* ----------------------------------------------------------------- brand */

const vars = paletteToCssVars(BRAND.palette, BRAND.typography);
for (const name of [
  "--brand-bg",
  "--brand-gold",
  "--brand-text",
  "--brand-line",
  "--brand-font-display",
  "--brand-font-body",
]) {
  check(`css var ${name} present`, Boolean(vars[name]), name);
}

check("background is black per spec", BRAND.palette.background === "#000000");
check("body text is white per spec", BRAND.palette.text === "#FFFFFF");
check("3 tiles on the left", BRAND.menu.filter((m) => m.side === "left").length === 3);
check("3 tiles on the right", BRAND.menu.filter((m) => m.side === "right").length === 3);
check("6 tiles total", BRAND.menu.length === 6);
check("menu ids unique", new Set(BRAND.menu.map((m) => m.id)).size === BRAND.menu.length);

for (const p of BRAND_PRESETS) {
  check(`preset ${p.id} keeps black bg`, p.palette.background === "#000000");
  check(`preset ${p.id} has gold`, /^#|rgba/.test(p.palette.gold));
}

/* ----------------------------------------------------------------- forms */

const times = pickupOptions(BRAND.tableHoldUntil);
check("pickup starts at 18:00", times[0] === "18:00", times[0]);
check(
  "pickup ends at the hold cut-off",
  times[times.length - 1] === BRAND.tableHoldUntil,
  times[times.length - 1],
);
check("pickup times ascend", times.every((v, i) => i === 0 || v > times[i - 1]));

const msg = (k: "required" | "invalidPhone" | "mustAckHold") => k;
const goodForm = {
  name: "สมชาย ใจดี",
  count: 4,
  date: todayIso(),
  phone: "0812345678",
  pickupTime: "20:00",
  ackHold: true,
};

check("valid form passes", Object.keys(validateBookingForm(goodForm, msg, 20)).length === 0);
check(
  "unticked hold blocks booking",
  validateBookingForm({ ...goodForm, ackHold: false }, msg, 20).ackHold !== undefined,
);
check(
  "past date rejected",
  validateBookingForm({ ...goodForm, date: "2020-01-01" }, msg, 20).date !== undefined,
);
check(
  "count over max rejected",
  validateBookingForm({ ...goodForm, count: 21 }, msg, 20).count !== undefined,
);
check(
  "zero count rejected",
  validateBookingForm({ ...goodForm, count: 0 }, msg, 20).count !== undefined,
);
check(
  "fractional count rejected",
  validateBookingForm({ ...goodForm, count: 2.5 }, msg, 20).count !== undefined,
);
check(
  "dashed phone accepted",
  validateBookingForm({ ...goodForm, phone: "081-234-5678" }, msg, 20).phone === undefined,
);
check(
  "bad phone rejected",
  validateBookingForm({ ...goodForm, phone: "12345" }, msg, 20).phone !== undefined,
);
check("empty form is blank", emptyBookingForm(BRAND.tableHoldUntil).name === "");
check(
  "empty form defaults to first pickup slot",
  emptyBookingForm(BRAND.tableHoldUntil).pickupTime === "18:00",
);
check(
  "empty form does not pre-tick the ack",
  emptyBookingForm(BRAND.tableHoldUntil).ackHold === false,
);

/* ------------------------------------------------------------ event data */

for (const e of EVENTS) {
  check(`${e.id} sold <= capacity`, e.sold <= e.capacity);
  check(`${e.id} price positive`, e.price > 0);
  check(`${e.id} left is correct`, ticketsLeft(e) === e.capacity - e.sold);
  check(`${e.id} has both languages`, Boolean(e.artist.th && e.artist.en));
  check(`${e.id} date is iso`, /^\d{4}-\d{2}-\d{2}$/.test(e.date));
}
check("event ids unique", new Set(EVENTS.map((e) => e.id)).size === EVENTS.length);
check("a sold-out event exists to exercise that path", EVENTS.some((e) => ticketsLeft(e) === 0));

for (const f of FAQ) {
  check(`faq ${f.id} bilingual`, Boolean(f.q.th && f.q.en && f.a.th && f.a.en));
}
check("faq ids unique", new Set(FAQ.map((f) => f.id)).size === FAQ.length);
check("all 8 spec FAQs present", FAQ.length >= 8, String(FAQ.length));

for (const s of TERMS) {
  check(`terms ${s.id} bilingual title`, Boolean(s.title.th && s.title.en));
  check(
    `terms ${s.id} same item count both languages`,
    s.items.th.length === s.items.en.length,
  );
  check(`terms ${s.id} has items`, s.items.th.length > 0);
}
check("all 6 spec policy sections present", TERMS.length === 6, String(TERMS.length));

/* ------------------------------------------------------------------ slip */

check("png accepted", slipFileError({ type: "image/png", size: 1000 } as File) === null);
check("pdf rejected", slipFileError({ type: "application/pdf", size: 1000 } as File) !== null);
check(
  "oversize rejected",
  slipFileError({ type: "image/png", size: 6 * 1024 * 1024 } as File) !== null,
);

check(
  "the stage is inside the room",
  isInsideRoom(FIXTURES.stage.x, FIXTURES.stage.y) &&
    isInsideRoom(
      FIXTURES.stage.x + FIXTURES.stage.w,
      FIXTURES.stage.y + FIXTURES.stage.h,
    ),
);
check(
  "the bar is inside the room",
  isInsideRoom(FIXTURES.bar.x, FIXTURES.bar.y) &&
    isInsideRoom(
      FIXTURES.bar.x + FIXTURES.bar.w,
      FIXTURES.bar.y + FIXTURES.bar.h,
    ),
);

console.log(
  failures === 0
    ? `ALL CHECKS PASSED — ${TABLES.length} tables, ${ZONES.length} zones, ${thKeys.length} i18n keys x2, ${EVENTS.length} events, ${codes.size} unique references`
    : `${failures} CHECK(S) FAILED`,
);
process.exit(failures === 0 ? 0 : 1);
