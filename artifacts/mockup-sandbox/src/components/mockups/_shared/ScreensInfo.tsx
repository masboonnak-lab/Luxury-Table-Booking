import { useState } from "react";
import {
  Bot,
  ExternalLink,
  Facebook,
  Headphones,
  Instagram,
  Mail,
  MapPin,
  MessageCircle,
  Phone,
  UserRound,
} from "lucide-react";

import { useApp } from "./AppContext";
import { FAQ, TERMS } from "./data";
import { Body, GoldButton, GoldFrame, Heading, Screen } from "./ui";

/* --------------------------------------------------------------- contact */

interface ChatTurn {
  from: "bot" | "user";
  text: string;
}

function Chatbot() {
  const { t, lang } = useApp();
  const [turns, setTurns] = useState<ReadonlyArray<ChatTurn>>([
    { from: "bot", text: t("chatbotGreeting") },
  ]);
  const [handedOff, setHandedOff] = useState(false);

  const asked = new Set(
    turns.filter((x) => x.from === "user").map((x) => x.text),
  );
  const remaining = FAQ.filter((f) => !asked.has(f.q[lang]));

  function ask(id: string) {
    const entry = FAQ.find((f) => f.id === id);
    if (!entry) {
      return;
    }
    setTurns((prev) => [
      ...prev,
      { from: "user", text: entry.q[lang] },
      { from: "bot", text: entry.a[lang] },
    ]);
  }

  function handOff() {
    setHandedOff(true);
    setTurns((prev) => [
      ...prev,
      { from: "user", text: t("askAdmin") },
      { from: "bot", text: t("adminHandoff") },
    ]);
  }

  return (
    <GoldFrame className="p-5">
      <Heading as="h3" className="flex items-center gap-2 text-sm">
        <Bot className="size-4" />
        {t("chatbotTitle")}
      </Heading>

      <div className="mt-4 space-y-3">
        {turns.map((turn, i) => (
          <div
            key={`${i}-${turn.text.slice(0, 12)}`}
            className={turn.from === "user" ? "flex justify-end" : undefined}
          >
            <div
              className="max-w-[85%] rounded-xl px-3.5 py-2.5 text-sm leading-relaxed"
              style={
                turn.from === "user"
                  ? {
                      background: "var(--brand-gold)",
                      color: "#000",
                    }
                  : {
                      border: "1px solid var(--brand-line)",
                      color: "var(--brand-text)",
                    }
              }
            >
              {turn.text}
            </div>
          </div>
        ))}
      </div>

      {remaining.length > 0 ? (
        <div className="mt-5">
          <Body muted className="mb-2 text-xs">
            {t("otherQuestion")}
          </Body>
          <div className="flex flex-wrap gap-2">
            {remaining.map((f) => (
              <button
                key={f.id}
                type="button"
                onClick={() => ask(f.id)}
                className="rounded-full border px-3.5 py-1.5 text-left text-xs text-[var(--brand-text)] transition-colors hover:border-[var(--brand-gold)] hover:text-[var(--brand-gold)]"
                style={{ borderColor: "var(--brand-line)" }}
              >
                {f.q[lang]}
              </button>
            ))}
          </div>
        </div>
      ) : null}

      {!handedOff ? (
        <GoldButton variant="outline" className="mt-5 w-full" onClick={handOff}>
          <Headphones className="size-4" />
          {t("askAdmin")}
        </GoldButton>
      ) : null}

      <Body muted className="mt-3 text-[11px]">
        {lang === "th"
          ? "แชทบอทตอบจากชุดคำถามที่เตรียมไว้ ยังไม่ได้ต่อกับ LLM หรือระบบตั๋วของแอดมิน"
          : "The bot answers from a fixed script; it is not wired to an LLM or a helpdesk yet."}
      </Body>
    </GoldFrame>
  );
}

export function ContactScreen() {
  const { t, brand } = useApp();

  const channels = [
    { Icon: MessageCircle, label: "LINE Official", value: brand.lineOfficial },
    { Icon: Facebook, label: "Facebook", value: brand.facebook },
    { Icon: Instagram, label: "Instagram", value: brand.instagram },
    { Icon: Phone, label: t("phone"), value: brand.phone },
    { Icon: Mail, label: "Email", value: brand.email },
  ];

  return (
    <Screen title={t("contact")} subtitle={t("contactDesc")}>
      <GoldFrame className="p-5">
        <Heading as="h3" className="text-sm">
          {t("contactChannels")}
        </Heading>
        <ul className="mt-4 space-y-3">
          {channels.map((c) => (
            <li key={c.label} className="flex items-center gap-3">
              <c.Icon className="size-4 shrink-0 text-[var(--brand-gold)]" />
              <span className="w-28 shrink-0 text-xs text-[var(--brand-gold)]">
                {c.label}
              </span>
              <span className="text-sm text-[var(--brand-text)]">{c.value}</span>
            </li>
          ))}
        </ul>
      </GoldFrame>

      <div className="mt-5">
        <Heading as="h3" className="mb-3 flex items-center gap-2 text-sm">
          <UserRound className="size-4" />
          {t("reportIssue")}
        </Heading>
        <Chatbot />
      </div>
    </Screen>
  );
}

/* -------------------------------------------------------------- location */

export function LocationScreen() {
  const { t, brand } = useApp();
  const query = encodeURIComponent(brand.mapQuery);

  return (
    <Screen title={t("location")} subtitle={t("locationDesc")}>
      <GoldFrame className="overflow-hidden">
        <iframe
          title={t("location")}
          src={`https://maps.google.com/maps?q=${query}&z=16&output=embed`}
          className="h-[320px] w-full border-0"
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
        />
        <div className="p-5">
          <p className="flex items-start gap-3 text-sm text-[var(--brand-text)]">
            <MapPin className="mt-0.5 size-4 shrink-0 text-[var(--brand-gold)]" />
            {brand.address}
          </p>

          <GoldButton
            variant="outline"
            className="mt-4 w-full"
            onClick={() =>
              window.open(
                `https://www.google.com/maps/search/?api=1&query=${query}`,
                "_blank",
                "noopener,noreferrer",
              )
            }
          >
            <ExternalLink className="size-4" />
            {t("openInMaps")}
          </GoldButton>
        </div>
      </GoldFrame>

      <Body muted className="mt-4 text-center text-xs">
        แผนที่ฝังจาก Google Maps ตามพิกัดใน brand.ts — เปลี่ยน mapQuery
        เพื่อชี้ไปที่ร้านจริง
      </Body>
    </Screen>
  );
}

/* ----------------------------------------------------------------- terms */

export function TermsScreen() {
  const { t, lang } = useApp();

  return (
    <Screen title={t("terms")} subtitle={t("termsDesc")}>
      <div className="space-y-4">
        {TERMS.map((section) => (
          <GoldFrame key={section.id} className="p-5">
            <Heading as="h3" className="text-sm">
              {section.title[lang]}
            </Heading>
            <ul className="mt-3 space-y-2">
              {section.items[lang].map((item) => (
                <li
                  key={item}
                  className="flex gap-2 text-sm leading-relaxed text-[var(--brand-text)]"
                >
                  <span className="text-[var(--brand-gold)]">•</span>
                  {item}
                </li>
              ))}
            </ul>
          </GoldFrame>
        ))}
      </div>
    </Screen>
  );
}
