import { useState } from "react";
import { Check, DoorOpen, Info } from "lucide-react";

import { cn } from "@/lib/utils";

import { formatThb } from "./booking";
import {
  FIXTURES,
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

const FILL: Record<TableState, string> = {
  selected: "hsl(38 58% 56%)",
  open: "hsl(30 9% 16%)",
  wrongSize: "hsl(30 8% 11%)",
  taken: "hsl(30 8% 10%)",
};

const STROKE: Record<TableState, string> = {
  selected: "hsl(38 58% 66%)",
  open: "hsl(38 58% 56%)",
  wrongSize: "hsl(32 9% 22%)",
  taken: "hsl(6 62% 40%)",
};

const TEXT: Record<TableState, string> = {
  selected: "hsl(30 12% 8%)",
  open: "hsl(40 26% 88%)",
  wrongSize: "hsl(36 8% 40%)",
  taken: "hsl(36 8% 34%)",
};

const LEGEND: Array<{ state: TableState; label: string }> = [
  { state: "open", label: "ว่าง เลือกได้" },
  { state: "selected", label: "โต๊ะที่เลือก" },
  { state: "wrongSize", label: "ที่นั่งไม่พอดีจำนวนคน" },
  { state: "taken", label: "ถูกจองแล้ว" },
];

function LegendSwatch({ state }: { state: TableState }) {
  return (
    <span
      aria-hidden
      className="inline-block size-3 shrink-0 rounded-sm border"
      style={{ background: FILL[state], borderColor: STROKE[state] }}
    />
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
      <div className="rounded-lg border border-border bg-[hsl(30_9%_7%)] p-3">
        <svg
          viewBox="0 0 100 80"
          className="w-full"
          role="group"
          aria-label="แผนผังโต๊ะภายในร้าน"
        >
          {/* Room shell */}
          <rect
            x={1}
            y={1}
            width={98}
            height={78}
            rx={2}
            fill="hsl(30 9% 9%)"
            stroke="hsl(32 9% 18%)"
            strokeWidth={0.5}
          />

          {/* Stage */}
          <rect
            x={FIXTURES.stage.x}
            y={FIXTURES.stage.y}
            width={FIXTURES.stage.w}
            height={FIXTURES.stage.h}
            rx={1.5}
            fill="hsl(38 58% 56% / 0.16)"
            stroke="hsl(38 58% 56% / 0.5)"
            strokeWidth={0.5}
          />
          <text
            x={FIXTURES.stage.x + FIXTURES.stage.w / 2}
            y={FIXTURES.stage.y + FIXTURES.stage.h / 2 + 1.4}
            textAnchor="middle"
            fontSize={4}
            fill="hsl(38 58% 66%)"
            style={{ letterSpacing: "0.2em" }}
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
            fill="hsl(30 8% 13%)"
            stroke="hsl(32 9% 22%)"
            strokeWidth={0.5}
          />
          <text
            x={FIXTURES.bar.x + FIXTURES.bar.w / 2}
            y={FIXTURES.bar.y + FIXTURES.bar.h / 2 + 1.4}
            textAnchor="middle"
            fontSize={4}
            fill="hsl(36 11% 55%)"
            style={{ letterSpacing: "0.2em" }}
          >
            {FIXTURES.bar.label}
          </text>

          {/* Entrance */}
          <text
            x={FIXTURES.entrance.x}
            y={FIXTURES.entrance.y}
            fontSize={3.2}
            fill="hsl(36 11% 50%)"
          >
            ▸ {FIXTURES.entrance.label}
          </text>

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

            const common = {
              fill: FILL[state],
              stroke: STROKE[state],
              strokeWidth: state === "selected" ? 1.1 : 0.6,
              strokeDasharray: state === "taken" ? "1.4 1.2" : undefined,
            };

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
                  "outline-none",
                  interactive ? "cursor-pointer" : "cursor-not-allowed",
                )}
                style={{ opacity: state === "taken" ? 0.55 : 1 }}
              >
                <title>{title}</title>

                {t.shape === "round" ? (
                  <circle cx={t.x} cy={t.y} r={t.w / 2} {...common} />
                ) : (
                  <rect
                    x={t.x - t.w / 2}
                    y={t.y - t.h / 2}
                    width={t.w}
                    height={t.h}
                    rx={1.2}
                    {...common}
                  />
                )}

                <text
                  x={t.x}
                  y={t.y + 1.3}
                  textAnchor="middle"
                  fontSize={3.6}
                  fill={TEXT[state]}
                  style={{ pointerEvents: "none" }}
                >
                  {t.id}
                </text>

                {state === "selected" ? (
                  <circle
                    cx={t.x}
                    cy={t.y}
                    r={t.w / 2 + 1.8}
                    fill="none"
                    stroke="hsl(38 58% 56% / 0.55)"
                    strokeWidth={0.5}
                  />
                ) : null}
              </g>
            );
          })}
        </svg>
      </div>

      {/* Legend */}
      <ul className="mt-3 flex flex-wrap gap-x-4 gap-y-1.5 text-[11px] text-muted-foreground">
        {LEGEND.map((l) => (
          <li key={l.state} className="flex items-center gap-1.5">
            <LegendSwatch state={l.state} />
            {l.label}
          </li>
        ))}
      </ul>

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

      <p className="mt-2 flex items-center gap-1.5 text-[11px] text-muted-foreground">
        <DoorOpen className="size-3 shrink-0" />
        เวทีอยู่ด้านบนของผัง บาร์อยู่ขวามือ ห้อง VIP อยู่มุมขวาล่าง
      </p>
    </div>
  );
}
