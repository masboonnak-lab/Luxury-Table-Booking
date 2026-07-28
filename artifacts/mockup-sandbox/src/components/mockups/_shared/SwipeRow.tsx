import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

import { cn } from "@/lib/utils";

/**
 * A row you swipe rather than a grid you scroll past.
 *
 * CSS scroll-snap does the work, so a touch drag lands on a card by itself
 * with no gesture library and no JavaScript on the critical path. The arrows
 * are for pointers only — they are hidden from assistive tech because the
 * list is already reachable by keyboard through its own scroll container.
 */
export function SwipeRow({
  children,
  itemClassName,
  label,
}: {
  children: ReactNode;
  /** Card width per breakpoint. Defaults suit a 4-item row. */
  itemClassName?: string;
  label: string;
}) {
  const trackRef = useRef<HTMLUListElement>(null);
  const [atStart, setAtStart] = useState(true);
  const [atEnd, setAtEnd] = useState(false);

  const sync = useCallback(() => {
    const el = trackRef.current;
    if (!el) {
      return;
    }
    setAtStart(el.scrollLeft <= 2);
    // 2px of slack: fractional layout widths never land exactly on the end.
    setAtEnd(el.scrollLeft + el.clientWidth >= el.scrollWidth - 2);
  }, []);

  useEffect(() => {
    sync();
    const el = trackRef.current;
    if (!el) {
      return;
    }
    const observer = new ResizeObserver(sync);
    observer.observe(el);
    return () => observer.disconnect();
  }, [sync]);

  function page(direction: 1 | -1) {
    const el = trackRef.current;
    if (!el) {
      return;
    }
    // Scroll by one card, not one viewport, so nothing is skipped over.
    const card = el.querySelector("li");
    const step = card ? card.clientWidth + 16 : el.clientWidth * 0.8;
    el.scrollBy({ left: step * direction, behavior: "smooth" });
  }

  return (
    <div className="relative">
      {/* Bleed to the viewport edge so a card can sit half off-screen — that
          overhang is what tells a thumb the row scrolls. */}
      <ul
        ref={trackRef}
        onScroll={sync}
        aria-label={label}
        className={cn(
          "-mx-6 flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-smooth px-6 pb-2",
          "[scrollbar-width:none] [&::-webkit-scrollbar]:hidden",
        )}
      >
        {children}
      </ul>

      {(
        [
          { dir: -1 as const, Icon: ChevronLeft, hidden: atStart, side: "left-0 -translate-x-1/2" },
          { dir: 1 as const, Icon: ChevronRight, hidden: atEnd, side: "right-0 translate-x-1/2" },
        ]
      ).map(({ dir, Icon, hidden, side }) => (
        <button
          key={dir}
          type="button"
          aria-hidden
          tabIndex={-1}
          onClick={() => page(dir)}
          className={cn(
            "absolute top-[42%] hidden size-9 -translate-y-1/2 items-center justify-center rounded-full border border-border bg-background/90 text-foreground shadow-lg backdrop-blur transition-opacity hover:border-primary hover:text-primary md:flex",
            side,
            hidden && "pointer-events-none opacity-0",
          )}
        >
          <Icon className="size-4" />
        </button>
      ))}
    </div>
  );
}

export function SwipeItem({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <li
      className={cn(
        "w-[76%] shrink-0 snap-start sm:w-[46%] lg:w-[30%] xl:w-[23%]",
        className,
      )}
    >
      {children}
    </li>
  );
}
