import { useEffect, useState } from "react";
import { CalendarDays, Clock, Music, Ticket, X } from "lucide-react";

import { cn } from "@/lib/utils";

import { formatThb } from "./booking";
import { todayIso } from "./forms";
import { GENRE_ART, GENRE_LABEL, upcomingActs, type Act } from "./lineup";
import { Photo } from "./Photo";
import { SwipeItem, SwipeRow } from "./SwipeRow";

const TH_MONTHS = [
  "ม.ค.",
  "ก.พ.",
  "มี.ค.",
  "เม.ย.",
  "พ.ค.",
  "มิ.ย.",
  "ก.ค.",
  "ส.ค.",
  "ก.ย.",
  "ต.ค.",
  "พ.ย.",
  "ธ.ค.",
];

const TH_DAYS = ["อา.", "จ.", "อ.", "พ.", "พฤ.", "ศ.", "ส."];

function parts(dateKey: string) {
  const [y, m, d] = dateKey.split("-").map(Number);
  const dt = new Date(Date.UTC(y ?? 0, (m ?? 1) - 1, d ?? 1));
  return {
    day: String(d).padStart(2, "0"),
    month: TH_MONTHS[(m ?? 1) - 1] ?? "",
    weekday: TH_DAYS[dt.getUTCDay()] ?? "",
    // Thai calendar years, which is what a poster in Bangkok would print.
    year: (y ?? 0) + 543,
  };
}

/**
 * Artwork for an act that has not supplied a press shot. A generated poster is
 * honest about being artwork; a stock photograph of an unrelated musician
 * would read as a picture of who is playing.
 */
function Poster({ act }: { act: Act }) {
  const art = GENRE_ART[act.genre];
  const initials = act.name.replace(/[^A-Za-zก-๙]/g, "").slice(0, 2);

  return (
    <div
      className="relative flex size-full items-center justify-center overflow-hidden"
      style={{
        background: `radial-gradient(120% 90% at 25% 15%, hsl(${art.from}), hsl(${art.to}) 70%)`,
      }}
      aria-hidden
    >
      {/* Concentric rings — a record, at poster scale */}
      <svg viewBox="0 0 100 100" className="absolute inset-0 size-full opacity-25">
        {[16, 26, 36, 46].map((r) => (
          <circle
            key={r}
            cx={50}
            cy={50}
            r={r}
            fill="none"
            stroke={`hsl(${art.accent})`}
            strokeWidth={0.6}
          />
        ))}
      </svg>
      <span
        className="relative font-['Playfair_Display',serif] text-5xl"
        style={{ color: `hsl(${art.accent})` }}
      >
        {initials}
      </span>
    </div>
  );
}

function DateBlock({ act }: { act: Act }) {
  const p = parts(act.date);
  return (
    <div className="flex shrink-0 flex-col items-center rounded-md border border-border bg-background/80 px-2.5 py-1.5 text-center backdrop-blur">
      <span className="text-[9px] uppercase tracking-widest text-muted-foreground">
        {p.weekday}
      </span>
      <span className="text-lg leading-none tabular-nums text-primary">
        {p.day}
      </span>
      <span className="text-[9px] text-muted-foreground">{p.month}</span>
    </div>
  );
}

function ActDialog({ act, onClose }: { act: Act; onClose: () => void }) {
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") {
        onClose();
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const p = parts(act.date);

  return (
    <div
      className="fixed inset-0 z-[60] flex items-end justify-center bg-black/70 p-0 backdrop-blur-sm sm:items-center sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-label={act.name}
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div className="max-h-[88vh] w-full max-w-md overflow-y-auto rounded-t-2xl border border-border bg-card sm:rounded-2xl">
        <div className="relative aspect-[16/10]">
          {act.photo ? (
            <Photo photo={{ src: act.photo, alt: act.name }} className="size-full" />
          ) : (
            <Poster act={act} />
          )}
          <button
            type="button"
            onClick={onClose}
            aria-label="ปิด"
            className="absolute right-3 top-3 rounded-full bg-background/80 p-2 text-foreground backdrop-blur transition-colors hover:text-primary"
          >
            <X className="size-4" />
          </button>
        </div>

        <div className="p-6">
          <p className="text-[11px] uppercase tracking-[0.28em] text-primary">
            {GENRE_LABEL[act.genre]}
          </p>
          <h3 className="mt-2 font-['Playfair_Display',serif] text-2xl">
            {act.name}
          </h3>
          <p className="mt-1 text-sm text-muted-foreground">{act.detail}</p>

          <dl className="mt-5 space-y-2.5 border-y border-border py-4 text-sm">
            <div className="flex items-center gap-3">
              <CalendarDays className="size-4 shrink-0 text-primary" />
              <dt className="text-muted-foreground">วันที่</dt>
              <dd className="ml-auto">
                {p.weekday} {p.day} {p.month} {p.year}
              </dd>
            </div>
            <div className="flex items-center gap-3">
              <Clock className="size-4 shrink-0 text-primary" />
              <dt className="text-muted-foreground">เปิดประตู / ขึ้นเวที</dt>
              <dd className="ml-auto tabular-nums">
                {act.doorsAt} · {act.showAt} น.
              </dd>
            </div>
            <div className="flex items-center gap-3">
              <Ticket className="size-4 shrink-0 text-primary" />
              <dt className="text-muted-foreground">ค่าเข้า</dt>
              <dd className="ml-auto tabular-nums">
                {act.soldOut
                  ? "บัตรหมด"
                  : act.cover === 0
                    ? "ไม่มีค่าเข้า"
                    : `฿${formatThb(act.cover)}`}
              </dd>
            </div>
          </dl>

          <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
            {act.about}
          </p>
        </div>
      </div>
    </div>
  );
}

export function LineupBoard() {
  const [openId, setOpenId] = useState<string | null>(null);
  const acts = upcomingActs(todayIso());
  const open = acts.find((a) => a.id === openId) ?? null;

  return (
    <>
      <SwipeRow label="ตารางศิลปินที่จะมาเล่น">
        {acts.map((act) => {
          const p = parts(act.date);

          return (
            <SwipeItem key={act.id} className="w-[74%] sm:w-[44%] lg:w-[29%]">
              <button
                type="button"
                onClick={() => setOpenId(act.id)}
                className="group h-full w-full overflow-hidden rounded-lg border border-border bg-card text-left transition-colors hover:border-primary focus-visible:outline-none focus-visible:border-primary"
              >
                <div className="relative aspect-[4/3]">
                  {act.photo ? (
                    <Photo
                      photo={{ src: act.photo, alt: act.name }}
                      className="size-full"
                      imgClassName="transition-transform duration-500 group-hover:scale-105"
                    />
                  ) : (
                    <Poster act={act} />
                  )}

                  <div className="absolute left-3 top-3">
                    <DateBlock act={act} />
                  </div>

                  {act.soldOut ? (
                    <span className="absolute right-3 top-3 rounded-full bg-destructive px-2.5 py-1 text-[10px] font-medium text-destructive-foreground">
                      บัตรหมด
                    </span>
                  ) : act.cover === 0 ? (
                    <span className="absolute right-3 top-3 rounded-full bg-primary px-2.5 py-1 text-[10px] font-medium text-primary-foreground">
                      เข้าฟรี
                    </span>
                  ) : null}
                </div>

                <div className="p-4">
                  <p className="text-[10px] uppercase tracking-[0.25em] text-primary">
                    {GENRE_LABEL[act.genre]}
                  </p>
                  <h3 className="mt-1.5 truncate font-['Playfair_Display',serif] text-lg leading-snug">
                    {act.name}
                  </h3>
                  <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-muted-foreground">
                    {act.detail}
                  </p>

                  <div className="mt-3 flex items-center gap-3 border-t border-border pt-3 text-[11px] text-muted-foreground">
                    <span className="flex items-center gap-1.5">
                      <Music className="size-3 text-primary" />
                      {act.showAt} น.
                    </span>
                    <span
                      className={cn(
                        "ml-auto tabular-nums",
                        !act.soldOut && act.cover > 0 && "text-primary",
                      )}
                    >
                      {act.soldOut
                        ? "—"
                        : act.cover === 0
                          ? "ไม่มีค่าเข้า"
                          : `฿${formatThb(act.cover)}`}
                    </span>
                  </div>
                </div>
              </button>
            </SwipeItem>
          );
        })}
      </SwipeRow>

      {open ? <ActDialog act={open} onClose={() => setOpenId(null)} /> : null}
    </>
  );
}
