import { useState } from "react";
import { Check, Info } from "lucide-react";

import { cn } from "@/lib/utils";

import { formatThb } from "./booking";
import {
  CANVAS,
  FIXTURES,
  ROOM_OUTLINE,
  TABLES,
  getZone,
  isTableFree,
  isTableSelectable,
  tableFitsParty,
  type TableSpec,
} from "./floor";

type TableState = "selected" | "open" | "wrongSize" | "taken";

function stateOf(
  table: TableSpec,
  dateKey: string,
  slot: string,
  guests: number,
  selectedId: string | null,
): TableState {
  if (selectedId === table.id) return "selected";
  if (!isTableFree(dateKey, slot, table.id)) return "taken";
  if (!tableFitsParty(table, guests)) return "wrongSize";
  return "open";
}

/**
 * Solid fills, read at a glance: green is free, red is gone, gold is yours.
 * Grey is the table that exists but cannot seat this party — visible, so the
 * room still reads as a room, but obviously not on offer.
 */
const FILL: Record<TableState, string> = {
  open: "hsl(151 40% 30%)",
  selected: "hsl(38 58% 56%)",
  wrongSize: "hsl(30 6% 19%)",
  taken: "hsl(5 52% 36%)",
};

const STROKE: Record<TableState, string> = {
  open: "hsl(151 44% 46%)",
  selected: "hsl(38 62% 72%)",
  wrongSize: "hsl(32 8% 28%)",
  taken: "hsl(5 58% 50%)",
};

const TEXT: Record<TableState, string> = {
  open: "hsl(150 30% 92%)",
  selected: "hsl(30 12% 8%)",
  wrongSize: "hsl(36 8% 46%)",
  taken: "hsl(6 30% 90%)",
};

const LEGEND: Array<{ state: TableState; label: string }> = [
  { state: "open", label: "ว่าง" },
  { state: "taken", label: "จองแล้ว" },
  { state: "selected", label: "โต๊ะที่เลือก" },
  { state: "wrongSize", label: "ที่นั่งไม่พอดี" },
];

const ROOM_PATH = `M ${ROOM_OUTLINE.map(([x, y]) => `${x} ${y}`).join(" L ")} Z`;

/** Signage, not decoration — a plan without extinguishers is not a floor plan. */
function Extinguisher({ x, y }: { x: number; y: number }) {
  return (
    <g transform={`translate(${x} ${y})`} aria-hidden>
      <rect x={-1} y={-1.6} width={2} height={3.6} rx={0.8} fill="hsl(5 62% 48%)" />
      <rect x={-0.3} y={-2.6} width={1.4} height={1.1} rx={0.4} fill="hsl(5 62% 48%)" />
    </g>
  );
}

function ExitBadge({
  x,
  y,
  label,
  tone,
}: {
  x: number;
  y: number;
  label: string;
  tone: "primary" | "danger";
}) {
  const bg = tone === "danger" ? "hsl(5 62% 45%)" : "hsl(38 58% 56%)";
  const fg = tone === "danger" ? "hsl(0 0% 98%)" : "hsl(30 12% 8%)";
  const width = label.length * 2.1 + 5;

  return (
    <g aria-hidden>
      <rect
        x={x - width / 2}
        y={y - 3}
        width={width}
        height={6}
        rx={3}
        fill={bg}
      />
      <text
        x={x}
        y={y + 1.3}
        textAnchor="middle"
        fontSize={3.4}
        fill={fg}
        style={{ letterSpacing: "0.06em" }}
      >
        {label}
      </text>
    </g>
  );
}

export function FloorMap({
  dateKey,
  slot,
  guests,
  selectedTableId,
  onSelect,
}: {
  dateKey: string;
  slot: string;
  guests: number;
  selectedTableId: string | null;
  onSelect: (tableId: string) => void;
}) {
  const [hovered, setHovered] = useState<string | null>(null);

  const focusTable = TABLES.find((t) => t.id === (hovered ?? selectedTableId));
  const focusZone = focusTable ? getZone(focusTable.zoneId) : undefined;

  const openCount = TABLES.filter((t) =>
    isTableSelectable(t, dateKey, slot, guests),
  ).length;

  return (
    <div>
      <div className="overflow-hidden rounded-xl border border-border bg-[hsl(30_9%_7%)]">
        {/* Status key, above the plan the way a printed one carries it */}
        <div className="flex flex-wrap items-center gap-x-5 gap-y-2 border-b border-border px-4 py-3">
          <span className="text-[11px] uppercase tracking-[0.22em] text-primary">
            สถานะโต๊ะ
          </span>
          {LEGEND.map((l) => (
            <span
              key={l.state}
              className="flex items-center gap-2 text-xs text-muted-foreground"
            >
              <span
                aria-hidden
                className="inline-block size-3.5 shrink-0 rounded-[3px] border"
                style={{ background: FILL[l.state], borderColor: STROKE[l.state] }}
              />
              {l.label}
            </span>
          ))}
        </div>

        <div className="p-3">
          <svg
            viewBox={`0 0 ${CANVAS.w} ${CANVAS.h}`}
            className="w-full"
            role="group"
            aria-label="แผนผังโต๊ะภายในร้าน"
          >
            {/* Room shell — the cut corner is the entrance side */}
            <path
              d={ROOM_PATH}
              fill="hsl(30 9% 10%)"
              stroke="hsl(38 58% 56% / 0.85)"
              strokeWidth={0.8}
              strokeLinejoin="round"
            />

            {/* Stage */}
            <rect
              x={FIXTURES.stage.x}
              y={FIXTURES.stage.y}
              width={FIXTURES.stage.w}
              height={FIXTURES.stage.h}
              rx={1.5}
              fill="hsl(30 8% 14%)"
              stroke="hsl(38 58% 56% / 0.35)"
              strokeWidth={0.5}
            />
            <text
              x={FIXTURES.stage.x + FIXTURES.stage.w / 2}
              y={FIXTURES.stage.y + FIXTURES.stage.h / 2 + 1.6}
              textAnchor="middle"
              fontSize={4.4}
              fill="hsl(40 26% 88%)"
              style={{ letterSpacing: "0.28em" }}
            >
              {FIXTURES.stage.label}
            </text>

            {/* Bar */}
            <rect
              x={FIXTURES.bar.x}
              y={FIXTURES.bar.y}
              width={FIXTURES.bar.w}
              height={FIXTURES.bar.h}
              rx={1.5}
              fill="hsl(30 8% 14%)"
              stroke="hsl(32 9% 24%)"
              strokeWidth={0.5}
            />
            <text
              x={FIXTURES.bar.x + FIXTURES.bar.w / 2}
              y={FIXTURES.bar.y + FIXTURES.bar.h / 2 + 1.6}
              textAnchor="middle"
              fontSize={4.4}
              fill="hsl(40 20% 80%)"
              style={{ letterSpacing: "0.28em" }}
            >
              {FIXTURES.bar.label}
            </text>

            {FIXTURES.extinguishers.map((e) => (
              <Extinguisher key={`${e.x}-${e.y}`} x={e.x} y={e.y} />
            ))}

            {/* Tables */}
            {TABLES.map((t) => {
              const state = stateOf(t, dateKey, slot, guests, selectedTableId);
              const interactive = state === "open" || state === "selected";
              const zone = getZone(t.zoneId);

              const title = `${t.id} · ${zone?.name ?? ""} · ${t.minSeats}–${t.maxSeats} ท่าน · ${
                state === "taken"
                  ? "ถูกจองแล้ว"
                  : state === "wrongSize"
                    ? "ที่นั่งไม่พอดี"
                    : "ว่าง"
              }`;

              return (
                <g
                  key={t.id}
                  role={interactive ? "button" : undefined}
                  tabIndex={interactive ? 0 : undefined}
                  aria-label={title}
                  aria-pressed={state === "selected"}
                  onClick={interactive ? () => onSelect(t.id) : undefined}
                  onKeyDown={
                    interactive
                      ? (e) => {
                          if (e.key === "Enter" || e.key === " ") {
                            e.preventDefault();
                            onSelect(t.id);
                          }
                        }
                      : undefined
                  }
                  onMouseEnter={() => setHovered(t.id)}
                  onMouseLeave={() => setHovered((h) => (h === t.id ? null : h))}
                  onFocus={() => setHovered(t.id)}
                  onBlur={() => setHovered((h) => (h === t.id ? null : h))}
                  className={cn(
                    "outline-none transition-opacity",
                    interactive ? "cursor-pointer" : "cursor-not-allowed",
                  )}
                  style={{ opacity: state === "taken" ? 0.8 : 1 }}
                >
                  <title>{title}</title>

                  <rect
                    x={t.x - t.w / 2}
                    y={t.y - t.h / 2}
                    width={t.w}
                    height={t.h}
                    rx={1.4}
                    fill={FILL[state]}
                    stroke={STROKE[state]}
                    strokeWidth={
                      state === "selected"
                        ? 1.2
                        : hovered === t.id
                          ? 0.9
                          : 0.5
                    }
                  />

                  <text
                    x={t.x}
                    y={t.y + 1.4}
                    textAnchor="middle"
                    fontSize={3.8}
                    fill={TEXT[state]}
                    style={{ pointerEvents: "none", letterSpacing: "0.04em" }}
                  >
                    {t.id}
                  </text>
                </g>
              );
            })}

            {FIXTURES.exits.map((e) => (
              <ExitBadge
                key={e.id}
                x={e.x}
                y={e.y}
                label={e.label}
                tone={e.tone}
              />
            ))}
          </svg>
        </div>
      </div>

      {/* Focused table detail */}
      <div className="mt-3 min-h-[4.5rem] rounded-lg border border-border bg-card p-3.5">
        {focusTable && focusZone ? (
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="flex items-center gap-2 text-sm font-medium">
                <span className="font-mono">{focusTable.id}</span>
                <span className="text-muted-foreground">·</span>
                {focusZone.name}
                {selectedTableId === focusTable.id ? (
                  <Check className="size-4 text-primary" />
                ) : null}
              </p>
              <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">
                {focusZone.desc}
              </p>
            </div>
            <div className="shrink-0 text-right text-[11px] text-muted-foreground">
              <p>
                {focusTable.minSeats}–{focusTable.maxSeats} ท่าน
              </p>
              <p className="mt-1">
                {focusZone.minSpend > 0
                  ? `ขั้นต่ำ ฿${formatThb(focusZone.minSpend)}`
                  : "ไม่มีขั้นต่ำ"}
              </p>
            </div>
          </div>
        ) : (
          <p className="flex items-center gap-2 text-xs text-muted-foreground">
            <Info className="size-3.5 shrink-0" />
            แตะหรือชี้ที่โต๊ะบนแผนผังเพื่อดูรายละเอียด — ขณะนี้มี {openCount}{" "}
            โต๊ะที่รองรับ {guests} ท่าน
          </p>
        )}
      </div>
    </div>
  );
}
