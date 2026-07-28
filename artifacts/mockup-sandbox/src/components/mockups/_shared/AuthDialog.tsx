import { useEffect, useRef, useState } from "react";
import { ShieldCheck, X } from "lucide-react";

import { cn } from "@/lib/utils";

import { normalisePhone } from "./booking";

type Mode = "login" | "register";

/** Matches the server's `registerBodyPasswordMin`. */
const MIN_PASSWORD = 8;
const PHONE = /^0\d{8,9}$/;

interface Values {
  name: string;
  phone: string;
  password: string;
  consent: boolean;
}

type Errors = Partial<Record<keyof Values, string>>;

function validate(mode: Mode, v: Values): Errors {
  const errors: Errors = {};

  if (mode === "register" && v.name.trim().length < 2) {
    errors.name = "กรุณากรอกชื่อ-นามสกุล";
  }

  const phone = normalisePhone(v.phone);
  if (!phone) {
    errors.phone = "กรุณากรอกเบอร์โทรศัพท์";
  } else if (!PHONE.test(phone)) {
    errors.phone = "เบอร์โทรไม่ถูกต้อง (ขึ้นต้นด้วย 0 และมี 9–10 หลัก)";
  }

  if (v.password.length < MIN_PASSWORD) {
    errors.password = `รหัสผ่านอย่างน้อย ${MIN_PASSWORD} ตัวอักษร`;
  }

  // PDPA: consent is collected before the account is created, not after.
  if (mode === "register" && !v.consent) {
    errors.consent = "ต้องยินยอมให้เก็บข้อมูลส่วนบุคคลก่อนสมัครสมาชิก";
  }

  return errors;
}

function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="text-xs text-muted-foreground">{label}</span>
      <div className="mt-1.5">{children}</div>
      {error ? (
        <span className="mt-1.5 block text-xs text-destructive">{error}</span>
      ) : null}
    </label>
  );
}

const inputClass =
  "w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground/70 focus:border-primary";

export function AuthDialog({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const [mode, setMode] = useState<Mode>("login");
  const [values, setValues] = useState<Values>({
    name: "",
    phone: "",
    password: "",
    consent: false,
  });
  const [errors, setErrors] = useState<Errors>({});
  const [submitted, setSubmitted] = useState(false);
  const firstFieldRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!open) {
      return;
    }
    firstFieldRef.current?.focus();

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

  function set<K extends keyof Values>(key: K, value: Values[K]) {
    setValues((prev) => ({ ...prev, [key]: value }));
    setSubmitted(false);
  }

  function switchMode(next: Mode) {
    setMode(next);
    setErrors({});
    setSubmitted(false);
  }

  function submit() {
    const next = validate(mode, values);
    setErrors(next);
    if (Object.keys(next).length > 0) {
      return;
    }
    // The account API exists (POST /api/auth/login | /auth/register) but this
    // page is served as static files with no server behind it yet, so saying
    // "signed in" here would be a lie.
    setSubmitted(true);
  }

  return (
    <div
      className="fixed inset-0 z-[60] flex items-end justify-center bg-black/70 p-4 backdrop-blur-sm sm:items-center"
      role="dialog"
      aria-modal="true"
      aria-label={mode === "login" ? "เข้าสู่ระบบ" : "สมัครสมาชิก"}
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div className="w-full max-w-sm rounded-xl border border-border bg-card p-6 shadow-2xl">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="font-['Playfair_Display',serif] text-2xl">
              {mode === "login" ? "เข้าสู่ระบบ" : "สมัครสมาชิก"}
            </h2>
            <p className="mt-1 text-xs text-muted-foreground">
              ใช้เบอร์โทรศัพท์เป็นชื่อผู้ใช้
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="ปิด"
            className="-mr-1.5 -mt-1.5 rounded p-1.5 text-muted-foreground transition-colors hover:text-foreground"
          >
            <X className="size-4" />
          </button>
        </div>

        <div className="mt-5 grid grid-cols-2 gap-2">
          {(
            [
              { id: "login" as const, label: "เข้าสู่ระบบ" },
              { id: "register" as const, label: "สมัครสมาชิก" },
            ]
          ).map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => switchMode(tab.id)}
              aria-pressed={mode === tab.id}
              className={cn(
                "rounded-md border px-3 py-2 text-sm transition-colors",
                mode === tab.id
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-border text-muted-foreground hover:text-foreground",
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="mt-5 space-y-4">
          {mode === "register" ? (
            <Field label="ชื่อ-นามสกุล" error={errors.name}>
              <input
                ref={firstFieldRef}
                type="text"
                autoComplete="name"
                value={values.name}
                onChange={(e) => set("name", e.target.value)}
                className={inputClass}
              />
            </Field>
          ) : null}

          <Field label="เบอร์โทรศัพท์" error={errors.phone}>
            <input
              ref={mode === "login" ? firstFieldRef : undefined}
              type="tel"
              inputMode="tel"
              autoComplete="tel"
              placeholder="081-234-5678"
              value={values.phone}
              onChange={(e) => set("phone", e.target.value)}
              className={inputClass}
            />
          </Field>

          <Field label="รหัสผ่าน" error={errors.password}>
            <input
              type="password"
              autoComplete={
                mode === "login" ? "current-password" : "new-password"
              }
              value={values.password}
              onChange={(e) => set("password", e.target.value)}
              className={inputClass}
            />
          </Field>

          {mode === "register" ? (
            <div>
              <label className="flex cursor-pointer items-start gap-2.5 text-xs leading-relaxed text-muted-foreground">
                <input
                  type="checkbox"
                  checked={values.consent}
                  onChange={(e) => set("consent", e.target.checked)}
                  className="mt-0.5 size-4 shrink-0 accent-[hsl(38_58%_56%)]"
                />
                <span className="flex items-start gap-1.5">
                  <ShieldCheck className="mt-0.5 size-3.5 shrink-0 text-primary" />
                  ยินยอมให้เก็บชื่อ เบอร์โทร และประวัติการจอง เพื่อใช้ในการ
                  สำรองโต๊ะเท่านั้น
                </span>
              </label>
              {errors.consent ? (
                <span className="mt-1.5 block text-xs text-destructive">
                  {errors.consent}
                </span>
              ) : null}
            </div>
          ) : null}
        </div>

        <button
          type="button"
          onClick={submit}
          className="mt-6 w-full rounded-md bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
        >
          {mode === "login" ? "เข้าสู่ระบบ" : "สมัครสมาชิก"}
        </button>

        {submitted ? (
          <p className="mt-4 rounded-md border border-border bg-background/50 px-3 py-2.5 text-xs leading-relaxed text-muted-foreground">
            ข้อมูลถูกต้องครบถ้วน — แต่หน้านี้ยังเป็นไฟล์สแตติก
            ยังไม่ได้ต่อกับเซิร์ฟเวอร์บัญชีผู้ใช้ จึงยังเข้าสู่ระบบจริงไม่ได้
          </p>
        ) : null}
      </div>
    </div>
  );
}
