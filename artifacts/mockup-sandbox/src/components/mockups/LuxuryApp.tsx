import { useEffect, useState } from "react";
import {
  CalendarCheck,
  ChevronLeft,
  Facebook,
  Globe,
  Instagram,
  LogIn,
  LogOut,
  Mail,
  MapPin,
  Menu as MenuIcon,
  MessageCircle,
  Palette,
  Phone,
  ScrollText,
  Ticket,
  Type,
  UserPlus,
  Wine,
} from "lucide-react";

import { cn } from "@/lib/utils";

import { AppProvider, useApp } from "./_shared/AppContext";
import { BRAND_PRESETS, FONT_SCALES, type MenuId } from "./_shared/brand";
import { BookTableScreen } from "./_shared/ScreensBooking";
import { ContactScreen, LocationScreen, TermsScreen } from "./_shared/ScreensInfo";
import { LoginScreen, RegisterScreen } from "./_shared/ScreensAuth";
import { BuyTicketScreen, MyTicketsScreen } from "./_shared/ScreensTickets";
import { Body, GoldButton, Heading, Modal } from "./_shared/ui";

type ScreenId = "home" | "login" | "register" | MenuId;

const TILE_ICON: Record<MenuId, typeof Ticket> = {
  myTickets: Ticket,
  buyTicket: Wine,
  contact: MessageCircle,
  bookTable: CalendarCheck,
  location: MapPin,
  terms: ScrollText,
};

/* ------------------------------------------------------------------ menu */

function Drawer({
  open,
  onClose,
  onNavigate,
}: {
  open: boolean;
  onClose: () => void;
  onNavigate: (s: ScreenId) => void;
}) {
  const {
    t,
    lang,
    setLang,
    user,
    signOut,
    paletteId,
    setPaletteId,
    fontScaleId,
    setFontScaleId,
  } = useApp();

  return (
    <Modal open={open} title={t("menu")} onClose={onClose} closeLabel={t("close")}>
      <div className="space-y-5">
        {user ? (
          <div
            className="rounded-lg border px-4 py-3"
            style={{ borderColor: "var(--brand-line)" }}
          >
            <p className="text-xs text-[var(--brand-gold)]">{t("loggedInAs")}</p>
            <p className="mt-1 text-sm text-[var(--brand-text)]">{user.name}</p>
            <GoldButton
              variant="ghost"
              className="mt-2 px-0"
              onClick={() => {
                signOut();
                onClose();
              }}
            >
              <LogOut className="size-4" />
              {t("logout")}
            </GoldButton>
          </div>
        ) : (
          <div className="space-y-2">
            <GoldButton
              variant="outline"
              className="w-full justify-start"
              onClick={() => onNavigate("login")}
            >
              <LogIn className="size-4" />
              {t("login")}
            </GoldButton>
            <GoldButton
              variant="outline"
              className="w-full justify-start"
              onClick={() => onNavigate("register")}
            >
              <UserPlus className="size-4" />
              {t("register")}
            </GoldButton>
          </div>
        )}

        {/* Language */}
        <div>
          <p className="mb-2 flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-[var(--brand-gold)]">
            <Globe className="size-3.5" />
            {t("language")}
          </p>
          <div className="grid grid-cols-2 gap-2">
            {(["th", "en"] as const).map((l) => (
              <button
                key={l}
                type="button"
                onClick={() => setLang(l)}
                aria-pressed={lang === l}
                className={cn(
                  "rounded-lg border px-3 py-2 text-sm transition-colors",
                  lang === l
                    ? "border-[var(--brand-gold)] bg-[var(--brand-gold)]/10 text-[var(--brand-gold)]"
                    : "text-[var(--brand-text-muted)] hover:text-[var(--brand-text)]",
                )}
                style={lang === l ? undefined : { borderColor: "var(--brand-line)" }}
              >
                {l === "th" ? t("thai") : t("english")}
              </button>
            ))}
          </div>
        </div>

        {/* Theme */}
        <div>
          <p className="mb-2 flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-[var(--brand-gold)]">
            <Palette className="size-3.5" />
            {t("theme")}
          </p>
          <div className="grid grid-cols-2 gap-2">
            {BRAND_PRESETS.map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => setPaletteId(p.id)}
                aria-pressed={paletteId === p.id}
                className={cn(
                  "flex items-center gap-2 rounded-lg border px-3 py-2 text-xs transition-colors",
                  paletteId === p.id
                    ? "border-[var(--brand-gold)] text-[var(--brand-gold)]"
                    : "text-[var(--brand-text-muted)] hover:text-[var(--brand-text)]",
                )}
                style={
                  paletteId === p.id ? undefined : { borderColor: "var(--brand-line)" }
                }
              >
                <span
                  className="size-3 shrink-0 rounded-full"
                  style={{ background: p.palette.gold }}
                />
                {p.label}
              </button>
            ))}
          </div>
        </div>

        {/* Text size */}
        <div>
          <p className="mb-2 flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-[var(--brand-gold)]">
            <Type className="size-3.5" />
            {t("textSize")}
          </p>
          <div className="grid grid-cols-3 gap-2">
            {FONT_SCALES.map((f) => (
              <button
                key={f.id}
                type="button"
                onClick={() => setFontScaleId(f.id)}
                aria-pressed={fontScaleId === f.id}
                className={cn(
                  "rounded-lg border py-2 transition-colors",
                  fontScaleId === f.id
                    ? "border-[var(--brand-gold)] bg-[var(--brand-gold)]/10 text-[var(--brand-gold)]"
                    : "text-[var(--brand-text-muted)] hover:text-[var(--brand-text)]",
                )}
                style={
                  fontScaleId === f.id ? undefined : { borderColor: "var(--brand-line)" }
                }
              >
                <span style={{ fontSize: `${f.scale}rem` }}>{f.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </Modal>
  );
}

/* ------------------------------------------------------------------ home */

function Home({ onNavigate }: { onNavigate: (s: ScreenId) => void }) {
  const { t, brand } = useApp();

  const left = brand.menu.filter((m) => m.side === "left" && m.enabled);
  const right = brand.menu.filter((m) => m.side === "right" && m.enabled);

  function Tile({ id }: { id: MenuId }) {
    const Icon = TILE_ICON[id];
    return (
      <button
        type="button"
        onClick={() => onNavigate(id)}
        className="flex w-full flex-col items-center gap-2.5 rounded-xl border bg-black px-4 py-6 text-center transition-colors hover:border-[var(--brand-gold)]"
        style={{ borderColor: "var(--brand-line)" }}
      >
        <Icon className="size-7 text-[var(--brand-gold)]" strokeWidth={1.4} />
        <span
          className="text-sm text-[var(--brand-gold)]"
          style={{ fontFamily: "var(--brand-font-display)" }}
        >
          {t(id)}
        </span>
        <span className="text-[11px] leading-relaxed text-[var(--brand-text)]">
          {t(`${id}Desc` as "myTicketsDesc")}
        </span>
      </button>
    );
  }

  return (
    <div className="mx-auto w-full max-w-3xl px-5 pb-8 pt-4">
      <div className="grid grid-cols-2 gap-3 sm:gap-4">
        <div className="space-y-3 sm:space-y-4">
          {left.map((m) => (
            <Tile key={m.id} id={m.id} />
          ))}
        </div>
        <div className="space-y-3 sm:space-y-4">
          {right.map((m) => (
            <Tile key={m.id} id={m.id} />
          ))}
        </div>
      </div>

      <Body muted className="mt-6 text-center text-xs">
        {t("mockNotice")}
      </Body>
    </div>
  );
}

/* ---------------------------------------------------------------- footer */

function Footer() {
  const { t, brand } = useApp();

  const rows = [
    { Icon: MessageCircle, label: "LINE Official", value: brand.lineOfficial },
    { Icon: Facebook, label: "Facebook", value: brand.facebook },
    { Icon: Instagram, label: "Instagram", value: brand.instagram },
    { Icon: Mail, label: "Email", value: brand.email },
    { Icon: Phone, label: t("phone"), value: brand.phone },
  ];

  return (
    <footer
      className="mt-auto border-t px-5 py-10"
      style={{ borderColor: "var(--brand-line)" }}
    >
      <div className="mx-auto max-w-3xl text-center">
        <p className="text-[11px] uppercase tracking-[0.32em] text-[var(--brand-gold)]">
          {t("followUs")}
        </p>

        {/* Spec: every line in the footer is gold. */}
        <ul className="mt-5 space-y-2.5">
          {rows.map((r) => (
            <li
              key={r.label}
              className="flex items-center justify-center gap-2.5 text-sm text-[var(--brand-gold)]"
            >
              <r.Icon className="size-4 shrink-0" />
              <span className="opacity-75">{r.label}</span>
              <span>{r.value}</span>
            </li>
          ))}
        </ul>

        <div
          className="mt-8 border-t pt-6"
          style={{ borderColor: "var(--brand-line)" }}
        >
          <p
            className="text-lg text-[var(--brand-gold)]"
            style={{ fontFamily: "var(--brand-font-display)", fontStyle: "italic" }}
          >
            {brand.signature.label}
          </p>
          <p className="mt-1.5 text-[11px] tracking-wider text-[var(--brand-gold)] opacity-70">
            © {new Date().getFullYear()} {brand.venueName} · {t("allRights")}
          </p>
        </div>
      </div>
    </footer>
  );
}

/* ------------------------------------------------------------------ root */

function Shell() {
  const { brand, cssVars, fontScaleId, t } = useApp();
  const [screen, setScreen] = useState<ScreenId>("home");
  const [drawerOpen, setDrawerOpen] = useState(false);

  // Tailwind sizes are rem-based, so the type scale has to move the root font
  // size. Restored on unmount so the sandbox shell is left as we found it.
  useEffect(() => {
    const scale = FONT_SCALES.find((f) => f.id === fontScaleId)?.scale ?? 1;
    const root = document.documentElement;
    const previous = root.style.fontSize;
    root.style.fontSize = `${16 * scale}px`;
    return () => {
      root.style.fontSize = previous;
    };
  }, [fontScaleId]);

  function go(next: ScreenId) {
    setScreen(next);
    setDrawerOpen(false);
    window.scrollTo({ top: 0 });
  }

  return (
    <div
      className="flex min-h-screen flex-col bg-[var(--brand-bg)] text-[var(--brand-text)] antialiased"
      style={{ ...cssVars, fontFamily: "var(--brand-font-body)" } as React.CSSProperties}
    >
      {/* Header: name centred, burger top-right */}
      <header
        className="sticky top-0 z-50 border-b bg-[var(--brand-bg)]/95 backdrop-blur"
        style={{ borderColor: "var(--brand-line)" }}
      >
        <div className="mx-auto flex max-w-3xl items-center gap-2 px-4 py-4">
          <div className="w-10 shrink-0">
            {screen !== "home" ? (
              <button
                type="button"
                onClick={() => go("home")}
                aria-label={t("back")}
                className="rounded p-2 text-[var(--brand-gold)] transition-colors hover:bg-[var(--brand-gold)]/10"
              >
                <ChevronLeft className="size-5" />
              </button>
            ) : null}
          </div>

          <div className="min-w-0 flex-1 text-center">
            <Heading as="h1" className="truncate text-xl sm:text-2xl">
              {brand.venueName}
            </Heading>
            <p className="mt-0.5 truncate text-[10px] uppercase tracking-[0.25em] text-[var(--brand-text)] opacity-60">
              {brand.venueTagline}
            </p>
          </div>

          <div className="w-10 shrink-0 text-right">
            <button
              type="button"
              onClick={() => setDrawerOpen(true)}
              aria-label={t("menu")}
              aria-expanded={drawerOpen}
              className="rounded p-2 text-[var(--brand-gold)] transition-colors hover:bg-[var(--brand-gold)]/10"
            >
              <MenuIcon className="size-6" />
            </button>
          </div>
        </div>
      </header>

      <Drawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        onNavigate={go}
      />

      <main className="flex-1">
        {screen === "home" ? <Home onNavigate={go} /> : null}
        {screen === "login" ? (
          <LoginScreen onDone={() => go("home")} onGoRegister={() => go("register")} />
        ) : null}
        {screen === "register" ? (
          <RegisterScreen onDone={() => go("home")} onGoLogin={() => go("login")} />
        ) : null}
        {screen === "myTickets" ? <MyTicketsScreen /> : null}
        {screen === "buyTicket" ? <BuyTicketScreen onHome={() => go("home")} /> : null}
        {screen === "contact" ? <ContactScreen /> : null}
        {screen === "bookTable" ? <BookTableScreen onHome={() => go("home")} /> : null}
        {screen === "location" ? <LocationScreen /> : null}
        {screen === "terms" ? <TermsScreen /> : null}
      </main>

      <Footer />
    </div>
  );
}

export default function LuxuryApp() {
  return (
    <AppProvider>
      <Shell />
    </AppProvider>
  );
}
