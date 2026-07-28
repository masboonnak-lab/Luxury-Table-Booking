import { useEffect, type ReactNode } from "react";
import { X } from "lucide-react";

import { cn } from "@/lib/utils";

/**
 * Brand-aware primitives. Every colour comes from the CSS variables written by
 * AppProvider, so a client swap needs no component edits.
 *
 * Deliberately no Radix Dialog/Select here — those render into a portal on
 * <body>, outside the element carrying the brand variables, which would strand
 * the popup on an unstyled white background.
 */

export function GoldFrame({
  children,
  className,
  interactive,
  ...rest
}: {
  children: ReactNode;
  className?: string;
  interactive?: boolean;
} & React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "rounded-xl border bg-[var(--brand-bg)]",
        interactive && "transition-colors hover:border-[var(--brand-gold)]",
        className,
      )}
      style={{ borderColor: "var(--brand-line)" }}
      {...rest}
    >
      {children}
    </div>
  );
}

export function GoldButton({
  children,
  className,
  variant = "solid",
  ...rest
}: {
  children: ReactNode;
  variant?: "solid" | "outline" | "ghost";
} & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-lg px-5 py-2.5 text-sm font-medium transition-colors",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand-gold)]/50",
        "disabled:cursor-not-allowed disabled:opacity-45",
        variant === "solid" &&
          "bg-[var(--brand-gold)] text-black hover:bg-[var(--brand-gold-soft)]",
        variant === "outline" &&
          "border border-[var(--brand-gold)] text-[var(--brand-gold)] hover:bg-[var(--brand-gold)]/10",
        variant === "ghost" &&
          "text-[var(--brand-text-muted)] hover:text-[var(--brand-text)]",
        className,
      )}
      {...rest}
    >
      {children}
    </button>
  );
}

export function Heading({
  children,
  className,
  as: Tag = "h2",
}: {
  children: ReactNode;
  className?: string;
  as?: "h1" | "h2" | "h3";
}) {
  return (
    <Tag
      className={cn("text-[var(--brand-gold)]", className)}
      style={{ fontFamily: "var(--brand-font-display)" }}
    >
      {children}
    </Tag>
  );
}

export function Eyebrow({ children }: { children: ReactNode }) {
  return (
    <p className="text-[11px] uppercase tracking-[0.32em] text-[var(--brand-gold)]">
      {children}
    </p>
  );
}

export function Body({
  children,
  className,
  muted,
}: {
  children: ReactNode;
  className?: string;
  muted?: boolean;
}) {
  return (
    <p
      className={cn(
        "leading-relaxed",
        muted ? "text-[var(--brand-text-muted)]" : "text-[var(--brand-text)]",
        className,
      )}
    >
      {children}
    </p>
  );
}

/* ------------------------------------------------------------------ form */

export function Field({
  label,
  error,
  hint,
  children,
  required,
}: {
  label: string;
  error?: string;
  hint?: string;
  children: ReactNode;
  required?: boolean;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm text-[var(--brand-gold)]">
        {label}
        {required ? <span className="ml-1 text-[var(--brand-danger)]">*</span> : null}
      </span>
      {children}
      {hint && !error ? (
        <span className="mt-1.5 block text-xs text-[var(--brand-text-muted)]">
          {hint}
        </span>
      ) : null}
      {error ? (
        <span className="mt-1.5 block text-xs text-[var(--brand-danger)]">
          {error}
        </span>
      ) : null}
    </label>
  );
}

export function TextInput({
  className,
  invalid,
  ...rest
}: { invalid?: boolean } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={cn(
        "w-full rounded-lg border bg-black/40 px-3.5 py-2.5 text-sm text-[var(--brand-text)]",
        "placeholder:text-[var(--brand-text-muted)]",
        "focus:outline-none focus:ring-2 focus:ring-[var(--brand-gold)]/45",
        className,
      )}
      style={{
        borderColor: invalid ? "var(--brand-danger)" : "var(--brand-line)",
      }}
      aria-invalid={invalid}
      {...rest}
    />
  );
}

export function CheckRow({
  checked,
  onChange,
  children,
  error,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  children: ReactNode;
  error?: string;
}) {
  return (
    <div>
      <label className="flex cursor-pointer items-start gap-3">
        <input
          type="checkbox"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          className="mt-0.5 size-4 shrink-0 accent-[var(--brand-gold)]"
        />
        <span className="text-sm leading-relaxed text-[var(--brand-text)]">
          {children}
        </span>
      </label>
      {error ? (
        <p className="mt-1.5 text-xs text-[var(--brand-danger)]">{error}</p>
      ) : null}
    </div>
  );
}

/* ----------------------------------------------------------------- modal */

export function Modal({
  open,
  title,
  onClose,
  children,
  closeLabel,
}: {
  open: boolean;
  title: string;
  onClose: () => void;
  children: ReactNode;
  closeLabel: string;
}) {
  useEffect(() => {
    if (!open) {
      return;
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") {
        onClose();
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-[100] flex items-end justify-center bg-black/80 p-4 sm:items-center"
      role="dialog"
      aria-modal="true"
      aria-label={title}
      onClick={onClose}
    >
      <div
        className="max-h-[85vh] w-full max-w-md overflow-y-auto rounded-2xl border bg-[var(--brand-bg)] p-6"
        style={{ borderColor: "var(--brand-line)" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-start justify-between gap-4">
          <Heading as="h3" className="text-lg">
            {title}
          </Heading>
          <button
            type="button"
            onClick={onClose}
            aria-label={closeLabel}
            className="rounded p-1 text-[var(--brand-text-muted)] transition-colors hover:text-[var(--brand-gold)]"
          >
            <X className="size-4" />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------- layout */

export function Screen({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: ReactNode;
}) {
  return (
    <div className="mx-auto w-full max-w-3xl px-5 py-8">
      <header className="mb-7 text-center">
        <Heading as="h1" className="text-2xl sm:text-3xl">
          {title}
        </Heading>
        {subtitle ? (
          <Body muted className="mt-2 text-sm">
            {subtitle}
          </Body>
        ) : null}
      </header>
      {children}
    </div>
  );
}

export function InfoRow({
  label,
  value,
  mono,
}: {
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div
      className="flex justify-between gap-4 border-b py-2.5 text-sm last:border-b-0"
      style={{ borderColor: "var(--brand-line)" }}
    >
      <dt className="shrink-0 text-[var(--brand-gold)]">{label}</dt>
      <dd
        className={cn(
          "text-right text-[var(--brand-text)]",
          mono && "font-mono",
        )}
      >
        {value}
      </dd>
    </div>
  );
}
