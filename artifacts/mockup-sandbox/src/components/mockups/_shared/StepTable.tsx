import { AlertCircle, Minus, Plus, Sofa, Users } from "lucide-react";

import { cn } from "@/lib/utils";

import { FloorMap } from "./FloorMap";
import { MAX_GUESTS, MIN_GUESTS, formatThb } from "./booking";
import {
  ZONES,
  isTableSelectable,
  selectableTables,
  tablesInZone,
  zoneCapacity,
} from "./floor";
import { VENUE } from "./venue";

const GUEST_PRESETS = [2, 4, 6, 8];

function SectionTitle({
  icon: Icon,
  children,
}: {
  icon: typeof Users;
  children: string;
}) {
  return (
    <div className="mb-3 flex items-center gap-2">
      <Icon className="size-3.5 text-primary" />
      <span className="text-xs font-medium uppercase tracking-[0.18em] text-primary">
        {children}
      </span>
    </div>
  );
}

export function StepTable({
  guests,
  tableId,
  dateKey,
  slot,
  onGuests,
  onTable,
}: {
  guests: number;
  tableId: string | null;
  dateKey: string;
  slot: string;
  onGuests: (n: number) => void;
  onTable: (id: string) => void;
}) {
  const available = selectableTables(dateKey, slot, guests);

  return (
    <div className="space-y-8">
      {/* Party size */}
      <div>
        <SectionTitle icon={Users}>จำนวนผู้เข้าร่วม</SectionTitle>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1 rounded-md border border-border bg-card p-1">
            <button
              type="button"
              aria-label="ลดจำนวนคน"
              disabled={guests <= MIN_GUESTS}
              onClick={() => onGuests(guests - 1)}
              className="grid size-8 place-content-center rounded transition-colors hover:bg-accent disabled:cursor-not-allowed disabled:opacity-40"
            >
              <Minus className="size-4" />
            </button>
            <span className="w-14 text-center text-lg tabular-nums">
              {guests}
            </span>
            <button
              type="button"
              aria-label="เพิ่มจำนวนคน"
              disabled={guests >= MAX_GUESTS}
              onClick={() => onGuests(guests + 1)}
              className="grid size-8 place-content-center rounded transition-colors hover:bg-accent disabled:cursor-not-allowed disabled:opacity-40"
            >
              <Plus className="size-4" />
            </button>
          </div>

          <div className="flex gap-2">
            {GUEST_PRESETS.map((n) => (
              <button
                key={n}
                type="button"
                onClick={() => onGuests(n)}
                className={cn(
                  "rounded-md border px-3 py-1.5 text-sm tabular-nums transition-colors",
                  guests === n
                    ? "border-primary bg-primary/15 text-primary"
                    : "border-border bg-card hover:border-primary/60",
                )}
              >
                {n}
              </button>
            ))}
          </div>
        </div>

        <p className="mt-2 text-xs text-muted-foreground">
          มากกว่า {MAX_GUESTS} ท่าน กรุณาโทร {VENUE.phone} เพื่อจัดงานแบบเหมาร้าน
        </p>
      </div>

      {/* Floor plan */}
      <div>
        <SectionTitle icon={Sofa}>เลือกโต๊ะจากแผนผัง</SectionTitle>

        {available.length === 0 ? (
          <p className="mb-4 flex items-start gap-2 rounded-md border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm leading-relaxed text-destructive">
            <AlertCircle className="mt-0.5 size-4 shrink-0" />
            <span>
              รอบ {slot} น. ไม่มีโต๊ะใดรองรับ {guests} ท่านแล้ว ลองปรับจำนวนคน
              หรือย้อนกลับไปเลือกรอบเวลาอื่น
            </span>
          </p>
        ) : null}

        <FloorMap
          dateKey={dateKey}
          slot={slot}
          guests={guests}
          selectedTableId={tableId}
          onSelect={onTable}
        />
      </div>

      {/* Zone list — the same inventory, reachable without the map */}
      <div>
        <SectionTitle icon={Sofa}>หรือเลือกจากรายการโซน</SectionTitle>

        <div className="space-y-3">
          {ZONES.map((zone) => {
            const cap = zoneCapacity(zone.id);
            const open = tablesInZone(zone.id).filter((t) =>
              isTableSelectable(t, dateKey, slot, guests),
            );

            return (
              <div
                key={zone.id}
                className="rounded-lg border border-border bg-card p-4"
              >
                <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
                  <h4 className="font-medium">{zone.name}</h4>
                  <span className="text-[11px] text-muted-foreground">
                    {cap.min}–{cap.max} ท่าน ·{" "}
                    {zone.minSpend > 0
                      ? `ขั้นต่ำ ฿${formatThb(zone.minSpend)}`
                      : "ไม่มีขั้นต่ำ"}
                  </span>
                </div>

                <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">
                  {zone.desc}
                </p>

                {open.length === 0 ? (
                  <p className="mt-3 text-xs text-muted-foreground">
                    ไม่มีโต๊ะว่างที่รองรับ {guests} ท่านในโซนนี้
                  </p>
                ) : (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {open.map((t) => (
                      <button
                        key={t.id}
                        type="button"
                        onClick={() => onTable(t.id)}
                        aria-pressed={tableId === t.id}
                        className={cn(
                          "rounded-md border px-3 py-1.5 font-mono text-xs transition-colors",
                          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40",
                          tableId === t.id
                            ? "border-primary bg-primary text-primary-foreground"
                            : "border-border hover:border-primary hover:text-primary",
                        )}
                      >
                        {t.id}
                        <span className="ml-1.5 opacity-70">
                          {t.minSeats}–{t.maxSeats}
                        </span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
