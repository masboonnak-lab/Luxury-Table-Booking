import { useEffect, useState } from "react";
import {
  BookOpen,
  ChevronLeft,
  Clock,
  ExternalLink,
  Facebook,
  Instagram,
  Mail,
  MapPin,
  MessageCircle,
  Music,
  Phone,
  ShieldCheck,
  UserRound,
  type LucideIcon,
} from "lucide-react";

import { AuthDialog } from "./_shared/AuthDialog";
import { BarTheme, Eyebrow } from "./_shared/BarTheme";
import { BookingFlow } from "./_shared/BookingFlow";
import { FloorMap } from "./_shared/FloorMap";
import { MenuDialog } from "./_shared/MenuDialog";
import { Photo } from "./_shared/Photo";
import { SwipeItem, SwipeRow } from "./_shared/SwipeRow";
import { formatThb } from "./_shared/booking";
import { todayIso } from "./_shared/forms";
import { PHOTOS } from "./_shared/images";
import { VENUE } from "./_shared/venue";

/** The slot the preview plan is drawn for — the venue's main seating. */
const PREVIEW_SLOT = "21:00";

/** A search link rather than an embed: no third-party script, no consent banner. */
const MAP_URL = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
  `${VENUE.name} ${VENUE.address}`,
)}`;

const ATMOSPHERE = [
  PHOTOS.interiorTall,
  PHOTOS.interiorWide,
  PHOTOS.bartender,
  PHOTOS.whiskyPour,
];

const SIGNATURES = [
  {
    name: "Smoked Old Fashioned",
    base: "Bourbon · เชอร์รี่รมควัน",
    price: 420,
    photo: PHOTOS.smokedCocktail,
  },
  {
    name: "Barrel-Aged Manhattan",
    base: "Rye · บ่มถัง 60 วัน",
    price: 520,
    photo: PHOTOS.whiskyPour,
  },
  {
    name: "Lemongrass Highball",
    base: "Japanese whisky · ตะไคร้",
    price: 380,
    photo: PHOTOS.herbHighball,
  },
  {
    name: "Bangkok Negroni",
    base: "Gin · มะขาม · คัมปารี",
    price: 450,
    photo: PHOTOS.bartender,
  },
];

const CHANNEL_ICON: Record<(typeof VENUE.online)[number]["id"], LucideIcon> = {
  line: MessageCircle,
  facebook: Facebook,
  instagram: Instagram,
  email: Mail,
  phone: Phone,
};

const LINEUP = [
  { day: "อังคาร", act: "Vinyl Night — Jazz & Soul" },
  { day: "พุธ – พฤหัสบดี", act: "Resident DJ · Deep House" },
  { day: "ศุกร์ – เสาร์", act: "Live Band 21:30 น." },
];

/**
 * The booking flow used to sit at the bottom of the landing page, where every
 * visitor scrolled through a five-step form they had not asked for. It is its
 * own screen now, reached only by pressing จองโต๊ะ.
 */
function BookingScreen({ onBack }: { onBack: () => void }) {
  return (
    <div className="min-h-screen">
      <div className="sticky top-0 z-50 border-b border-border bg-background/90 backdrop-blur">
        <div className="mx-auto flex max-w-5xl items-center gap-3 px-6 py-4">
          <button
            type="button"
            onClick={onBack}
            className="flex items-center gap-1.5 rounded-md border border-border px-3 py-2 text-xs uppercase tracking-[0.15em] text-muted-foreground transition-colors hover:border-primary hover:text-primary"
          >
            <ChevronLeft className="size-3.5" />
            กลับ
          </button>
          <div className="min-w-0 flex-1 text-center">
            <p className="truncate text-sm uppercase tracking-[0.3em]">
              {VENUE.name}
            </p>
          </div>
          {/* Balances the back button so the name stays centred. */}
          <div className="w-[74px] shrink-0" aria-hidden />
        </div>
      </div>

      <div className="mx-auto max-w-5xl px-6 py-12">
        <div className="mb-10 text-center">
          <Eyebrow>สำรองโต๊ะ</Eyebrow>
          <h2 className="mt-4 font-['Playfair_Display',serif] text-3xl font-medium">
            จองและชำระมัดจำใน 5 ขั้นตอน
          </h2>
        </div>

        <BookingFlow />
      </div>
    </div>
  );
}

export default function LandingPage() {
  const [booking, setBooking] = useState(false);
  const [authOpen, setAuthOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  // A history entry, so a phone's back gesture leaves the booking form instead
  // of leaving the site.
  useEffect(() => {
    if (!booking) {
      return;
    }
    window.history.pushState({ booking: true }, "");
    const onPop = () => setBooking(false);
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, [booking]);

  function openBooking() {
    setBooking(true);
    setMenuOpen(false);
    setAuthOpen(false);
    window.scrollTo({ top: 0 });
  }

  function closeBooking() {
    setBooking(false);
    window.scrollTo({ top: 0 });
  }

  if (booking) {
    return (
      <BarTheme className="min-h-screen">
        <BookingScreen onBack={closeBooking} />
      </BarTheme>
    );
  }

  const scrollToBooking = openBooking;

  return (
    <BarTheme className="min-h-screen">
      {/* Nav */}
      <nav className="sticky top-0 z-50 border-b border-border bg-background/85 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <div>
            <p className="text-sm uppercase tracking-[0.35em]">{VENUE.name}</p>
            <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
              {VENUE.kind}
            </p>
          </div>
          <div className="flex items-center gap-2 sm:gap-3">
            <button
              type="button"
              onClick={() => setAuthOpen(true)}
              className="flex items-center gap-1.5 rounded-md border border-border px-3 py-2 text-xs font-medium uppercase tracking-[0.15em] text-muted-foreground transition-colors hover:border-primary hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40 sm:px-4"
            >
              <UserRound className="size-3.5" />
              <span className="hidden sm:inline">เข้าสู่ระบบ</span>
            </button>
            <button
              type="button"
              onClick={scrollToBooking}
              className="rounded-md bg-primary px-4 py-2 text-xs font-medium uppercase tracking-[0.15em] text-primary-foreground transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40 sm:px-5"
            >
              จองโต๊ะ
            </button>
          </div>
        </div>
      </nav>

      <AuthDialog open={authOpen} onClose={() => setAuthOpen(false)} />
      <MenuDialog open={menuOpen} onClose={() => setMenuOpen(false)} />

      {/* Hero */}
      <header className="relative isolate overflow-hidden border-b border-border">
        <Photo
          photo={PHOTOS.interiorWide}
          priority
          className="absolute inset-0 -z-10"
          imgClassName="opacity-45"
        />
        <div
          aria-hidden
          className="absolute inset-0 -z-10 bg-[linear-gradient(180deg,hsl(30_9%_6%/0.75),hsl(30_9%_6%/0.55)_40%,hsl(30_9%_6%)_100%)]"
        />

        <div className="relative mx-auto max-w-3xl px-6 py-28 text-center sm:py-36">
          <Eyebrow>{VENUE.tagline}</Eyebrow>
          <h1 className="mt-6 font-['Playfair_Display',serif] text-4xl font-medium leading-[1.15] drop-shadow-sm sm:text-6xl">
            ค็อกเทลดี ๆ
            <br />
            ไม่ควรต้องยืนรอโต๊ะ
          </h1>
          <p className="mx-auto mt-6 max-w-md text-[15px] leading-relaxed text-foreground/75">
            บาร์ชั้นสองย่านสาทร วิสกี้กว่า 200 ฉลาก
            และค็อกเทลซิกเนเจอร์ที่เปลี่ยนทุกฤดู จองโต๊ะพร้อมชำระมัดจำได้ในหน้าเดียว
          </p>
          <button
            type="button"
            onClick={scrollToBooking}
            className="mt-9 rounded-md bg-primary px-8 py-3 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40"
          >
            เลือกวันและเวลา
          </button>

          <div className="mt-10 flex flex-wrap justify-center gap-x-8 gap-y-2 text-xs text-foreground/70">
            <span className="flex items-center gap-1.5">
              <Clock className="size-3.5 text-primary" />
              เปิด 18:00 – 02:00
            </span>
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="size-3.5 text-primary" />
              อายุ {VENUE.minimumAge} ปีขึ้นไป
            </span>
            <span className="flex items-center gap-1.5">
              <MapPin className="size-3.5 text-primary" />
              สาทร ใต้ BTS ช่องนนทรี
            </span>
          </div>
        </div>
      </header>

      {/* Signatures */}
      <section className="border-b border-border">
        <div className="mx-auto max-w-5xl px-6 py-20">
          <div className="text-center">
            <Eyebrow>ซิกเนเจอร์</Eyebrow>
            <h2 className="mt-4 font-['Playfair_Display',serif] text-3xl font-medium">
              แก้วที่คนสั่งซ้ำมากที่สุด
            </h2>
          </div>

          <div className="mt-10">
            <SwipeRow label="ค็อกเทลซิกเนเจอร์">
              {SIGNATURES.map((drink) => (
                <SwipeItem key={drink.name}>
                  <div className="group h-full overflow-hidden rounded-lg border border-border bg-card">
                    <Photo
                      photo={drink.photo}
                      className="aspect-[4/5]"
                      imgClassName="transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="p-4">
                      <h3 className="font-['Playfair_Display',serif] text-lg leading-snug">
                        {drink.name}
                      </h3>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {drink.base}
                      </p>
                      <p className="mt-3 text-sm tabular-nums text-primary">
                        ฿{formatThb(drink.price)}
                      </p>
                    </div>
                  </div>
                </SwipeItem>
              ))}
            </SwipeRow>
          </div>

          <div className="mt-8 text-center">
            <button
              type="button"
              onClick={() => setMenuOpen(true)}
              className="inline-flex items-center gap-2 rounded-md border border-border px-6 py-3 text-sm transition-colors hover:border-primary hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40"
            >
              <BookOpen className="size-4 text-primary" />
              ดูเมนูอื่น ๆ ในร้าน
            </button>
          </div>
        </div>
      </section>

      {/* Atmosphere — photographs only, the room speaks for itself */}
      <section className="border-b border-border bg-[hsl(30_9%_8%)]">
        <div className="mx-auto max-w-5xl px-6 py-16">
          <div className="mb-8 flex justify-center">
            <a
              href={MAP_URL}
              target="_blank"
              rel="noreferrer noopener"
              className="inline-flex items-center gap-2 rounded-md border border-border px-6 py-3 text-sm transition-colors hover:border-primary hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40"
            >
              <MapPin className="size-4 text-primary" />
              เปิดแผนที่ร้านใน Google Maps
              <ExternalLink className="size-3.5 opacity-60" />
            </a>
          </div>

          <SwipeRow label="บรรยากาศภายในร้าน">
            {ATMOSPHERE.map((photo) => (
              <SwipeItem
                key={photo.src}
                className="w-[82%] sm:w-[58%] lg:w-[42%]"
              >
                <Photo photo={photo} className="aspect-[4/3] rounded-lg" />
              </SwipeItem>
            ))}
          </SwipeRow>
        </div>
      </section>

      {/* Floor plan — the room itself, rather than a description of it */}
      <section className="border-b border-border">
        <div className="mx-auto max-w-4xl px-6 py-20">
          <div className="text-center">
            <Eyebrow>ผังร้าน</Eyebrow>
            <h2 className="mt-4 font-['Playfair_Display',serif] text-3xl font-medium">
              รู้ว่าจะได้นั่งตรงไหน ก่อนจอง
            </h2>
            <p className="mx-auto mt-4 max-w-md text-sm leading-relaxed text-muted-foreground">
              ตอนจองจะเลือกโต๊ะเองได้จากผังนี้ ตั้งแต่ติดเวทีไปจนถึงห้องส่วนตัว
            </p>
          </div>

          <div className="mt-10">
            <FloorMap
              readOnly
              dateKey={todayIso()}
              slot={PREVIEW_SLOT}
              guests={2}
              selectedTableId={null}
              onSelect={() => undefined}
            />
          </div>

          <div className="mt-8 text-center">
            <button
              type="button"
              onClick={scrollToBooking}
              className="inline-flex items-center gap-2 rounded-md bg-primary px-6 py-3 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40"
            >
              เลือกโต๊ะและจอง
            </button>
          </div>
        </div>
      </section>

      {/* Lineup */}
      <section className="border-b border-border">
        <div className="mx-auto max-w-3xl px-6 py-20">
          <div className="text-center">
            <Eyebrow>ดนตรีประจำสัปดาห์</Eyebrow>
          </div>
          <ul className="mx-auto mt-8 max-w-md space-y-3">
            {LINEUP.map((row) => (
              <li
                key={row.day}
                className="flex items-start gap-3 border-b border-border pb-3 text-sm"
              >
                <Music className="mt-0.5 size-4 shrink-0 text-primary" />
                <div>
                  <p>{row.act}</p>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {row.day}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Contact — last, so it is where a visitor looks after deciding */}
      <section className="border-t border-border">
        <div className="mx-auto max-w-3xl px-6 py-20">
          <div className="text-center">
            <Eyebrow>ช่องทางติดต่อ</Eyebrow>
            <h2 className="mt-4 font-['Playfair_Display',serif] text-3xl font-medium">
              คุยกับเราได้ทุกช่องทาง
            </h2>
          </div>

          <ul className="mx-auto mt-9 max-w-md space-y-2.5">
            {VENUE.online.map((channel) => {
              const Icon = CHANNEL_ICON[channel.id];
              // tel: and mailto: stay in the app; profiles open in a new tab.
              const external = channel.href.startsWith("http");

              return (
                <li key={channel.id}>
                  <a
                    href={channel.href}
                    {...(external
                      ? { target: "_blank", rel: "noreferrer noopener" }
                      : {})}
                    className="flex items-center gap-3 rounded-lg border border-border px-4 py-3.5 text-sm transition-colors hover:border-primary hover:text-primary focus-visible:outline-none focus-visible:border-primary"
                  >
                    <Icon className="size-4 shrink-0 text-primary" />
                    <span className="text-muted-foreground">
                      {channel.label}
                    </span>
                    <span className="ml-auto truncate text-right">
                      {channel.handle}
                    </span>
                  </a>
                </li>
              );
            })}
          </ul>

          <a
            href={MAP_URL}
            target="_blank"
            rel="noreferrer noopener"
            className="mx-auto mt-4 flex max-w-md items-start gap-3 rounded-lg border border-border px-4 py-3.5 text-sm text-muted-foreground transition-colors hover:border-primary hover:text-primary"
          >
            <MapPin className="mt-0.5 size-4 shrink-0 text-primary" />
            <span className="leading-relaxed">{VENUE.address}</span>
            <ExternalLink className="mt-0.5 size-3.5 shrink-0 opacity-60" />
          </a>
        </div>
      </section>

      <footer className="border-t border-border py-10 text-center">
        <p className="text-sm uppercase tracking-[0.35em]">{VENUE.name}</p>
        <p className="mt-2 text-xs text-muted-foreground">{VENUE.kind}</p>
        <p className="mt-4 text-xs text-muted-foreground">
          ดื่มไม่ขับ · จำหน่ายสุราแก่ผู้มีอายุ {VENUE.minimumAge} ปีขึ้นไปเท่านั้น
        </p>
        <p className="mt-3 text-[10px] text-muted-foreground/70">
          ภาพประกอบจาก Unsplash ใช้สำหรับ mockup เท่านั้น
        </p>
      </footer>
    </BarTheme>
  );
}
