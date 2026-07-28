import type { CSSProperties, ReactNode } from "react";

import { cn } from "@/lib/utils";

/**
 * The shadcn `.dark` palette is a cool blue-grey. Overriding the same custom
 * properties inline (inline styles beat the class selector) warms it to a
 * whisky-bar palette, so every shadcn primitive inside — Calendar, Input,
 * Checkbox — themes itself with no per-component overrides.
 *
 * Values are bare HSL channels because index.css wraps them in hsl().
 */
const BAR_PALETTE = {
  "--background": "30 9% 6%",
  "--foreground": "40 26% 92%",
  "--card": "30 9% 9%",
  "--card-foreground": "40 26% 92%",
  "--popover": "30 9% 9%",
  "--popover-foreground": "40 26% 92%",
  "--primary": "38 58% 56%",
  "--primary-foreground": "30 12% 8%",
  "--secondary": "30 8% 14%",
  "--secondary-foreground": "40 22% 88%",
  "--muted": "30 8% 14%",
  "--muted-foreground": "36 11% 62%",
  "--accent": "30 9% 16%",
  "--accent-foreground": "40 24% 90%",
  "--destructive": "6 62% 48%",
  "--destructive-foreground": "0 0% 98%",
  "--border": "32 9% 18%",
  "--input": "32 9% 20%",
  "--ring": "38 58% 56%",
} as CSSProperties;

export function BarTheme({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "dark bg-background font-['Inter',sans-serif] text-foreground antialiased",
        className,
      )}
      style={BAR_PALETTE}
    >
      {children}
    </div>
  );
}

/** Small caps eyebrow used above every section heading. */
export function Eyebrow({ children }: { children: string }) {
  return (
    <p className="text-[11px] uppercase tracking-[0.35em] text-primary">
      {children}
    </p>
  );
}
