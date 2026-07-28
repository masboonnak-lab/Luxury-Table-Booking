import { useState } from "react";
import { MessageCircle, ShieldCheck } from "lucide-react";

import { useApp } from "./AppContext";
import { normalisePhone } from "./booking";
import {
  Body,
  CheckRow,
  Field,
  GoldButton,
  GoldFrame,
  Modal,
  Screen,
  TextInput,
} from "./ui";

const PHONE = /^0\d{8,9}$/;

/**
 * PDPA gate. The spec puts this before the form on both screens, so neither
 * screen renders its fields until consent is given.
 */
function ConsentGate({
  open,
  onAccept,
  onCancel,
}: {
  open: boolean;
  onAccept: () => void;
  onCancel: () => void;
}) {
  const { t } = useApp();
  const [checked, setChecked] = useState(false);
  const [error, setError] = useState<string | null>(null);

  return (
    <Modal
      open={open}
      title={t("consentTitle")}
      onClose={onCancel}
      closeLabel={t("close")}
    >
      <div className="flex items-start gap-3">
        <ShieldCheck className="mt-0.5 size-5 shrink-0 text-[var(--brand-gold)]" />
        <Body className="text-sm">{t("consentBody")}</Body>
      </div>

      <div className="mt-5">
        <CheckRow
          checked={checked}
          onChange={(v) => {
            setChecked(v);
            if (v) setError(null);
          }}
          error={error ?? undefined}
        >
          {t("confirm")} — {t("consentTitle")}
        </CheckRow>
      </div>

      <div className="mt-6 flex gap-3">
        <GoldButton variant="ghost" className="flex-1" onClick={onCancel}>
          {t("cancel")}
        </GoldButton>
        <GoldButton
          className="flex-1"
          onClick={() => {
            if (!checked) {
              setError(t("mustConsent"));
              return;
            }
            onAccept();
          }}
        >
          {t("confirm")}
        </GoldButton>
      </div>
    </Modal>
  );
}

function LineButton({ label }: { label: string }) {
  return (
    <GoldButton variant="outline" className="w-full" type="button">
      <MessageCircle className="size-4" />
      {label}
    </GoldButton>
  );
}

/* ----------------------------------------------------------------- login */

export function LoginScreen({
  onDone,
  onGoRegister,
}: {
  onDone: () => void;
  onGoRegister: () => void;
}) {
  const { t, signIn } = useApp();
  const [consented, setConsented] = useState(false);
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<{ name?: string; password?: string }>({});

  function submit() {
    const next: typeof errors = {};
    if (name.trim().length < 2) next.name = t("required");
    if (password.length < 6) next.password = t("passwordShort");
    setErrors(next);
    if (Object.keys(next).length > 0) {
      return;
    }
    signIn({ name: name.trim(), phone: "" });
    onDone();
  }

  return (
    <Screen title={t("login")}>
      <ConsentGate
        open={!consented}
        onAccept={() => setConsented(true)}
        onCancel={onDone}
      />

      {consented ? (
        <GoldFrame className="space-y-4 p-6">
          <Field label={t("name")} required error={errors.name}>
            <TextInput
              value={name}
              autoComplete="username"
              invalid={Boolean(errors.name)}
              onChange={(e) => setName(e.target.value)}
            />
          </Field>

          <Field label={t("password")} required error={errors.password}>
            <TextInput
              type="password"
              value={password}
              autoComplete="current-password"
              invalid={Boolean(errors.password)}
              onChange={(e) => setPassword(e.target.value)}
            />
          </Field>

          <GoldButton className="w-full" onClick={submit}>
            {t("login")}
          </GoldButton>

          <div className="flex items-center gap-3">
            <span className="h-px flex-1" style={{ background: "var(--brand-line)" }} />
            <span className="text-xs text-[var(--brand-text-muted)]">หรือ</span>
            <span className="h-px flex-1" style={{ background: "var(--brand-line)" }} />
          </div>

          <LineButton label={t("loginWithLine")} />

          <Body muted className="pt-2 text-center text-xs">
            {t("noAccount")}{" "}
            <button
              type="button"
              onClick={onGoRegister}
              className="text-[var(--brand-gold)] underline-offset-4 hover:underline"
            >
              {t("register")}
            </button>
          </Body>

          <Body muted className="text-center text-[11px]">
            การเข้าสู่ระบบเป็นการจำลอง ยังไม่ได้ตรวจรหัสผ่านกับเซิร์ฟเวอร์จริง
          </Body>
        </GoldFrame>
      ) : null}
    </Screen>
  );
}

/* -------------------------------------------------------------- register */

export function RegisterScreen({
  onDone,
  onGoLogin,
}: {
  onDone: () => void;
  onGoLogin: () => void;
}) {
  const { t, signIn } = useApp();
  const [consented, setConsented] = useState(false);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<{
    name?: string;
    phone?: string;
    password?: string;
  }>({});

  function submit() {
    const next: typeof errors = {};
    if (name.trim().length < 2) next.name = t("required");
    const digits = normalisePhone(phone);
    if (!digits) next.phone = t("required");
    else if (!PHONE.test(digits)) next.phone = t("invalidPhone");
    if (password.length < 6) next.password = t("passwordShort");
    setErrors(next);
    if (Object.keys(next).length > 0) {
      return;
    }
    signIn({ name: name.trim(), phone: phone.trim() });
    onDone();
  }

  return (
    <Screen title={t("register")}>
      <ConsentGate
        open={!consented}
        onAccept={() => setConsented(true)}
        onCancel={onDone}
      />

      {consented ? (
        <GoldFrame className="space-y-4 p-6">
          <Field label={t("name")} required error={errors.name}>
            <TextInput
              value={name}
              autoComplete="name"
              invalid={Boolean(errors.name)}
              onChange={(e) => setName(e.target.value)}
            />
          </Field>

          <Field label={t("phone")} required error={errors.phone}>
            <TextInput
              type="tel"
              inputMode="tel"
              autoComplete="tel"
              placeholder="081-234-5678"
              value={phone}
              invalid={Boolean(errors.phone)}
              onChange={(e) => setPhone(e.target.value)}
            />
          </Field>

          <Field label={t("password")} required error={errors.password}>
            <TextInput
              type="password"
              value={password}
              autoComplete="new-password"
              invalid={Boolean(errors.password)}
              onChange={(e) => setPassword(e.target.value)}
            />
          </Field>

          <GoldButton className="w-full" onClick={submit}>
            {t("register")}
          </GoldButton>

          <GoldButton variant="ghost" className="w-full" onClick={onGoLogin}>
            {t("login")}
          </GoldButton>

          <div className="flex items-center gap-3">
            <span className="h-px flex-1" style={{ background: "var(--brand-line)" }} />
            <span className="text-xs text-[var(--brand-text-muted)]">หรือ</span>
            <span className="h-px flex-1" style={{ background: "var(--brand-line)" }} />
          </div>

          <LineButton label={t("loginWithLine")} />

          <Body muted className="text-center text-[11px]">
            LINE Login ต้องตั้งค่า channel ที่ LINE Developers ก่อน
            ปุ่มนี้จึงยังไม่ทำงานจริง
          </Body>
        </GoldFrame>
      ) : null}
    </Screen>
  );
}
