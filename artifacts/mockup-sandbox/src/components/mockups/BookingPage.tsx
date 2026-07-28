import { BarTheme, Eyebrow } from "./_shared/BarTheme";
import { BookingFlow } from "./_shared/BookingFlow";
import { VENUE } from "./_shared/venue";

/** The booking flow on its own page — same component the landing page embeds. */
export default function BookingPage() {
  return (
    <BarTheme className="min-h-screen px-4 py-10 sm:px-6">
      <div className="mx-auto max-w-5xl">
        <header className="mb-10 text-center">
          <Eyebrow>{VENUE.name}</Eyebrow>
          <h1 className="mt-4 font-['Playfair_Display',serif] text-3xl font-medium sm:text-4xl">
            สำรองโต๊ะ
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            {VENUE.kind} · {VENUE.tagline}
          </p>
        </header>

        <BookingFlow />
      </div>
    </BarTheme>
  );
}
