import { useMemo, useState } from "react";
import { addDays, format, isSameDay } from "date-fns";
import { th } from "date-fns/locale";
import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Clock,
  X,
} from "lucide-react";

import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";

import { SLOT_GROUPS, slotTablesLeft } from "./booking";

const RAIL_DAYS = 7;
const RAIL_HORIZON = 60;

function dayKey(d: Date): string {
  return format(d, "yyyy-MM-dd");
}

/** Availability across the whole day — drives the dot on each date chip. */
function dayLoad(d: Date): "open" | "busy" | "full" {
  const key = dayKey(d);
  const openSlots = SLOT_GROUPS.flatMap((g) => g.slots).filter(
    (s) => slotTablesLeft(key, s) > 0,
  ).length;

  if (openSlots === 0) return "full";
  if (openSlots <= 3) return "busy";
  return "open";
}

const LOAD_DOT: Record<ReturnType<typeof dayLoad>, string> = {
  open: "bg-emerald-500",
  busy: "bg-amber-500",
  full: "bg-destructive",
};

const LOAD_TEXT: Record<ReturnType<typeof dayLoad>, string> = {
  open: "ว่างหลายรอบ",
  busy: "เหลือน้อย",
  full: "เต็ม",
};

/* ------------------------------------------------------------- date strip */

function DateRail({
  today,
  offset,
  selected,
  onOffset,
  onPick,
}: {
  today: Date;
  offset: number;
  selected: Date | undefined;
  onOffset: (next: number) => void;
  onPick: (d: Date) => void;
}) {
  const days = useMemo(
    () =>
      Array.from({ length: RAIL_DAYS }, (_, i) => addDays(today, offset + i)),
    [today, offset],
  );

  const atStart = offset === 0;
  const atEnd = offset + RAIL_DAYS >= RAIL_HORIZON;

  return (
    <div className="flex items-stretch gap-2">
      <button
        type="button"
        aria-label="สัปดาห์ก่อนหน้า"
        disabled={atStart}
        onClick={() => onOffset(Math.max(0, offset - RAIL_DAYS))}
        className="grid w-9 shrink-0 place-content-center rounded-md border border-border bg-card transition-colors hover:border-primary disabled:cursor-not-allowed disabled:opacity-35"
      >
        <ChevronLeft className="size-4" />
      </button>

      <ul className="grid flex-1 grid-cols-4 gap-2 sm:grid-cols-7">
        {days.map((d, i) => {
          const load = dayLoad(d);
          const isFull = load === "full";
          const isActive = selected ? isSameDay(d, selected) : false;
          // The rail only ever shows 4 chips on narrow screens.
          const hiddenOnMobile = i >= 4;

          return (
            <li
              key={dayKey(d)}
              className={hiddenOnMobile ? "hidden sm:block" : undefined}
            >
              <button
                type="button"
                disabled={isFull}
                onClick={() => onPick(d)}
                aria-pressed={isActive}
                title={LOAD_TEXT[load]}
                className={cn(
                  "flex w-full flex-col items-center gap-1 rounded-md border px-1 py-2.5 transition-colors",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40",
                  isFull &&
                    "cursor-not-allowed border-border/60 bg-muted/40 text-muted-foreground",
                  !isFull &&
                    !isActive &&
                    "border-border bg-card hover:border-primary hover:bg-primary/5",
                  isActive && "border-primary bg-primary text-primary-foreground",
                )}
              >
                <span className="text-[10px] uppercase tracking-wider opacity-70">
                  {format(d, "EEE", { locale: th })}
                </span>
                <span className="text-lg font-medium leading-none tabular-nums">
                  {format(d, "d")}
                </span>
                <span className="text-[10px] opacity-70">
                  {format(d, "MMM", { locale: th })}
                </span>
                <span
                  aria-hidden
                  className={cn(
                    "mt-0.5 size-1.5 rounded-full",
                    isActive ? "bg-primary-foreground" : LOAD_DOT[load],
                  )}
                />
              </button>
            </li>
          );
        })}
      </ul>

      <button
        type="button"
        aria-label="สัปดาห์ถัดไป"
        disabled={atEnd}
        onClick={() => onOffset(offset + RAIL_DAYS)}
        className="grid w-9 shrink-0 place-content-center rounded-md border border-border bg-card transition-colors hover:border-primary disabled:cursor-not-allowed disabled:opacity-35"
      >
        <ChevronRight className="size-4" />
      </button>
    </div>
  );
}

/* -------------------------------------------------------------- time slots */

function SlotCard({
  slot,
  dateKey,
  isActive,
  onSelect,
}: {
  slot: string;
  dateKey: string;
  isActive: boolean;
  onSelect: (s: string) => void;
}) {
  const left = slotTablesLeft(dateKey, slot);
  const isFull = left === 0;
  const isLow = left > 0 && left <= 3;

  return (
    <button
      type="button"
      disabled={isFull}
      onClick={() => onSelect(slot)}
      aria-pressed={isActive}
      className={cn(
        "flex flex-col items-start rounded-md border px-3 py-2.5 transition-colors",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40",
        isFull &&
          "cursor-not-allowed border-border/60 bg-muted/40 text-muted-foreground",
        !isFull &&
          !isActive &&
          "border-border bg-card hover:border-primary hover:bg-primary/5",
        isActive && "border-primary bg-primary text-primary-foreground",
      )}
    >
      <span className="text-base tabular-nums leading-none">{slot}</span>
      <span
        className={cn(
          "mt-1.5 text-[10px] leading-none",
          isActive
            ? "text-primary-foreground/80"
            : isFull
              ? "text-muted-foreground"
              : isLow
                ? "text-amber-500"
                : "text-emerald-500",
        )}
      >
        {isFull ? "เต็มแล้ว" : isLow ? `เหลือ ${left} โต๊ะ` : "ว่าง"}
      </span>
    </button>
  );
}

/* ----------------------------------------------------------------- picker */

export function DateTimePicker({
  today,
  date,
  slot,
  dateKey,
  onDate,
  onSlot,
}: {
  today: Date;
  date: Date | undefined;
  slot: string | null;
  dateKey: string;
  onDate: (d: Date | undefined) => void;
  onSlot: (s: string) => void;
}) {
  const [offset, setOffset] = useState(0);
  const [calendarOpen, setCalendarOpen] = useState(false);

  const horizonEnd = useMemo(
    () => addDays(today, RAIL_HORIZON - 1),
    [today],
  );

  function pickFromCalendar(next: Date | undefined) {
    onDate(next);
    if (next) {
      // Keep the rail in sync so the chosen day is visible when the calendar closes.
      const diff = Math.floor(
        (next.getTime() - today.getTime()) / 86_400_000,
      );
      setOffset(Math.max(0, Math.floor(diff / RAIL_DAYS) * RAIL_DAYS));
      setCalendarOpen(false);
    }
  }

  return (
    <div className="space-y-7">
      {/* Date */}
      <section>
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <CalendarDays className="size-3.5 text-primary" />
            <span className="text-xs font-medium uppercase tracking-[0.18em] text-primary">
              เลือกวันที่
            </span>
          </div>

          <button
            type="button"
            onClick={() => setCalendarOpen((v) => !v)}
            className="flex items-center gap-1.5 rounded-md border border-border px-3 py-1.5 text-xs transition-colors hover:border-primary hover:text-primary"
          >
            {calendarOpen ? (
              <>
                <X className="size-3.5" />
                ปิดปฏิทิน
              </>
            ) : (
              <>
                <CalendarDays className="size-3.5" />
                เลือกจากปฏิทิน
              </>
            )}
          </button>
        </div>

        <DateRail
          today={today}
          offset={offset}
          selected={date}
          onOffset={setOffset}
          onPick={onDate}
        />

        {calendarOpen ? (
          <div className="mt-3 rounded-lg border border-border bg-card p-3">
            <Calendar
              mode="single"
              selected={date}
              onSelect={pickFromCalendar}
              disabled={{ before: today, after: horizonEnd }}
              locale={th}
              className="mx-auto bg-transparent p-0 [--cell-size:2.3rem]"
            />
          </div>
        ) : null}

        <ul className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-muted-foreground">
          {(["open", "busy", "full"] as const).map((k) => (
            <li key={k} className="flex items-center gap-1.5">
              <span className={cn("size-1.5 rounded-full", LOAD_DOT[k])} />
              {LOAD_TEXT[k]}
            </li>
          ))}
        </ul>
      </section>

      {/* Time */}
      <section>
        <div className="mb-3 flex items-center gap-2">
          <Clock className="size-3.5 text-primary" />
          <span className="text-xs font-medium uppercase tracking-[0.18em] text-primary">
            เลือกรอบเวลา
          </span>
        </div>

        {!date ? (
          <p className="rounded-lg border border-dashed border-border py-12 text-center text-sm text-muted-foreground">
            กรุณาเลือกวันที่ก่อน
          </p>
        ) : (
          <div className="space-y-4">
            {SLOT_GROUPS.map((group) => (
              <div
                key={group.title}
                className="rounded-lg border border-border bg-card/50 p-4"
              >
                <div className="mb-3 flex items-baseline justify-between gap-3">
                  <h4 className="text-sm font-medium">{group.title}</h4>
                  <span className="text-xs text-muted-foreground">
                    {group.hint}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                  {group.slots.map((s) => (
                    <SlotCard
                      key={s}
                      slot={s}
                      dateKey={dateKey}
                      isActive={slot === s}
                      onSelect={onSlot}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
