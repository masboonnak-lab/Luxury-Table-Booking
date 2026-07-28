import { useRef } from "react";
import {
  Clock,
  Facebook,
  Instagram,
  Mail,
  MapPin,
  MessageCircle,
  Music,
  Phone,
  ShieldCheck,
  type LucideIcon,
} from "lucide-react";

import { BarTheme, Eyebrow } from "./_shared/BarTheme";
import { BookingFlow } from "./_shared/BookingFlow";
import { Photo } from "./_shared/Photo";
import { formatThb } from "./_shared/booking";
import { ZONES, tablesInZone, zoneCapacity } from "./_shared/floor";
import { PHOTOS } from "./_shared/images";
import { VENUE } from "./_shared/venue";

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

export default function LandingPage() {
  const bookingRef = useRef<HTMLElement>(null);

  // scrollIntoView rather than an #anchor: `scroll-behavior` would have to live
  // on <html>, which a preview-mounted component does not own.
  function scrollToBooking() {
    bookingRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

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
          <button
            type="button"
            onClick={scrollToBooking}
            className="rounded-md bg-primary px-5 py-2 text-xs font-medium uppercase tracking-[0.15em] text-primary-foreground transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40"
          >
            จองโต๊ะ
          </button>
        </div>
      </nav>

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

          <ul className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {SIGNATURES.map((drink) => (
              <li
                key={drink.name}
                className="group overflow-hidden rounded-lg border border-border bg-card"
              >
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
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Atmosphere — photographs only, the room speaks for itself */}
      <section className="border-b border-border bg-[hsl(30_9%_8%)]">
        <div className="mx-auto max-w-5xl px-6 py-20">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <Photo
              photo={PHOTOS.interiorTall}
              className="aspect-[4/5] rounded-lg sm:row-span-2 sm:aspect-auto"
            />
            <Photo
              photo={PHOTOS.interiorWide}
              className="aspect-[4/3] rounded-lg"
            />
            <Photo
              photo={PHOTOS.bartender}
              className="aspect-[4/3] rounded-lg"
            />
          </div>
        </div>
      </section>

      {/* Zones */}
      <section className="border-b border-border">
        <div className="mx-auto max-w-5xl px-6 py-20">
          <div className="text-center">
            <Eyebrow>โซนที่นั่ง</Eyebrow>
            <h2 className="mt-4 font-['Playfair_Display',serif] text-3xl font-medium">
              เลือกบรรยากาศที่ใช่
            </h2>
            <p className="mx-auto mt-4 max-w-md text-sm leading-relaxed text-muted-foreground">
              ตอนจองจะมีแผนผังร้านให้เลือกโต๊ะได้เองว่าอยากนั่งตรงไหน
              ตั้งแต่ติดเวทีไปจนถึงห้องส่วนตัว
            </p>
          </div>

          <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {ZONES.map((zone) => {
              const cap = zoneCapacity(zone.id);
              const count = tablesInZone(zone.id).length;

              return (
                <article
                  key={zone.id}
                  className="rounded-lg border border-border bg-card p-5"
                >
                  <div className="flex items-baseline justify-between gap-3">
                    <h3 className="font-medium">{zone.name}</h3>
                    <span className="shrink-0 text-[11px] text-primary">
                      {count} โต๊ะ
                    </span>
                  </div>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                    {zone.desc}
                  </p>
                  <div className="mt-4 flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-muted-foreground">
                    <span>
                      {cap.min}–{cap.max} ท่าน
                    </span>
                    <span>
                      {zone.minSpend > 0
                        ? `ขั้นต่ำ ฿${formatThb(zone.minSpend)}`
                        : "ไม่มีขั้นต่ำ"}
                    </span>
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      {/* Lineup + info */}
      <section className="border-b border-border">
        <div className="mx-auto grid max-w-5xl gap-12 px-6 py-20 md:grid-cols-2">
          <div>
            <Eyebrow>ดนตรีประจำสัปดาห์</Eyebrow>
            <ul className="mt-5 space-y-3">
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

          <div>
            <Eyebrow>ช่องทางติดต่อ</Eyebrow>
            <ul className="mt-5 space-y-2.5">
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
                      className="flex items-center gap-3 border-b border-border pb-2.5 text-sm transition-colors hover:text-primary focus-visible:outline-none focus-visible:text-primary"
                    >
                      <Icon className="size-4 shrink-0 text-primary" />
                      <span className="text-muted-foreground">
                        {channel.label}
                      </span>
                      <span className="ml-auto text-right">
                        {channel.handle}
                      </span>
                    </a>
                  </li>
                );
              })}
            </ul>

            <p className="mt-6 flex gap-3 text-sm text-muted-foreground">
              <MapPin className="mt-0.5 size-4 shrink-0 text-primary" />
              <span className="leading-relaxed">{VENUE.address}</span>
            </p>
          </div>
        </div>
      </section>

      {/* Booking */}
      <section ref={bookingRef} className="scroll-mt-20 bg-[hsl(30_9%_8%)]">
        <div className="mx-auto max-w-5xl px-6 py-20">
          <div className="mb-10 text-center">
            <Eyebrow>สำรองโต๊ะ</Eyebrow>
            <h2 className="mt-4 font-['Playfair_Display',serif] text-3xl font-medium">
              จองและชำระมัดจำใน 5 ขั้นตอน
            </h2>
          </div>

          <BookingFlow />
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
