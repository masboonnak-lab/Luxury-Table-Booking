# Luxury Table Booking

A table-reservation and event-ticket app for a Bangkok cocktail bar: pick a night, pick a table off the floor plan, pay a deposit by PromptPay slip, and keep the booking in "My tickets". Thai-first, white-labelled so the same build can be re-skinned per venue.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server (port 5000)
- `pnpm --filter @workspace/api-server run seed` — load zones, tables and events (idempotent upserts; never touches orders)
- `PORT=5173 BASE_PATH=/ pnpm --filter @workspace/mockup-sandbox run dev` — the UI mockups, at `/preview/<ComponentName>`
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- `pnpm --filter @workspace/db run generate` — regenerate `lib/db/drizzle/*.sql`, a plain SQL file that creates every table from scratch
- `pnpm --filter @workspace/api-server run check:booking` — the pure booking, pricing and floor-geometry assertions (no DB, no runner)
- Required env: `DATABASE_URL` — Postgres connection string
- Optional env: `RECEIPT_PREFIX` (default `TLD`), `VENUE_TIME_ZONE` (default `Asia/Bangkok`), `HOST` (set `::` on Windows so `localhost` resolves)

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- API: Express 5
- DB: PostgreSQL + Drizzle ORM
- Validation: Zod (`zod/v4`), `drizzle-zod`
- API codegen: Orval (from OpenAPI spec)
- Build: esbuild (CJS bundle)
- Mockups: Vite + React 19 + Tailwind 4

## Where things live

- **API contract** — `lib/api-spec/openapi.yaml`. Source of truth; `lib/api-zod` and `lib/api-client-react` are generated from it and must never be hand-edited.
- **DB schema** — `lib/db/src/schema/`, one file per table, re-exported from `index.ts`.
- **Server rules** — `artifacts/api-server/src/domain/`: `money.ts` (deposit + VAT), `venue.ts` (slots, hold window, timezone), `holds.ts` (what "holding inventory" means), `codes.ts` (reference codes + advisory-lock keys).
- **Routes** — `artifacts/api-server/src/routes/`: `venue.ts` (read-only floor/events/availability), `orders.ts` (the booking and payment flow).
- **Seed data** — `artifacts/api-server/src/seed.ts`.
- **UI mockups** — `artifacts/mockup-sandbox/src/components/mockups/`, with the shared pieces in `_shared/` and pure-logic assertions in `_shared/__checks__/booking.check.ts`.

## Architecture decisions

- **Money is integer satang everywhere inside the server**; THB only appears at the API edge. Nothing rounds twice, so the deposit, the VAT split and the receipt can't drift apart.
- **One `orders` table for both kinds.** Table bookings and ticket orders share a payment flow, a slip, a reference and a "My tickets" list; a check constraint makes the wrong-shaped row impossible rather than merely discouraged.
- **Availability is derived, never stored.** `holdsInventory()` — paid, or pending inside its payment window — is the single definition read by the floor map, the tickets-left count and the double-booking guard.
- **`pg_advisory_xact_lock` around check-then-insert.** Two guests racing for the last table serialise on `table:<id>:<date>:<slot>`; the loser gets a 409, not a duplicate booking.
- **Slip duplication is enforced by a unique index on the SHA-256**, not by the client. Authenticity is *not* checked — `pendingBankCheck` stays true until a slip-verification provider is wired up.
- **No accounts yet.** Guest name and phone are denormalised onto the order, and the booking phone is what proves ownership on cancel. The mockup's login screen is not backed by anything.

## Product

- Browse the room as a floor plan; pick a table that fits the party on a given date and seating slot
- Deposit priced from the zone's minimum spend (30%, rounded to a clean hundred) or ฿300 per head
- 10-minute payment hold, PromptPay QR or mobile banking, slip upload with a real duplicate check
- Event tickets with live remaining counts
- "My tickets" by phone number; cancel releases the hold
- Thai/English, four palettes, three type scales — all data-driven from `_shared/brand.ts`

## User preferences

- Conversation is in Thai; UI copy is Thai-first with English as the second language.

## Gotchas

- **Never hand-edit `lib/api-zod/src/generated` or `lib/api-client-react/src/generated`** — Orval wipes them (`clean: true`). Change `openapi.yaml` and re-run codegen.
- **Nothing hand-written goes in `lib/api-zod/src/index.ts` either** — Orval appends its exports there on every run, so anything added duplicates itself. Put it in a sibling file with its own `exports` entry, the way `src/errors.ts` does.
- **Bookable slots are defined in two places** and must match: `_shared/booking.ts` `SLOT_GROUPS` (what the picker shows) and the `Slot` enum in `openapi.yaml` (what the API accepts, mirrored in `domain/venue.ts`). Last seating is 23:00.
- **On Windows set `HOST=::`** for the Vite sandbox, or `localhost` resolves to IPv6 and the `0.0.0.0` bind refuses the connection.
- The mockups' `_shared/booking.ts` and the server's `domain/money.ts` implement the same deposit and VAT rules. If one moves, move the other.
- **The room exists twice**: `_shared/floor.ts` (what the map draws) and `api-server/src/seed.ts` (what the API serves). They must stay identical. `booking.check.ts` asserts the mockup copy is sane — no overlapping tables, nothing through a wall, whole-number coordinates because the DB columns are integers — but nothing yet compares the two files, so changing one means changing both by hand.
- **Every push to `main` deploys the landing page** via `.github/workflows/deploy-landing.yml`, gated on typecheck and the booking checks. It needs the `CLOUDFLARE_API_TOKEN` repository secret.
- `lib/db/src/index.ts` throws at import time when `DATABASE_URL` is unset, so anything importing `@workspace/db` needs it — including the seed.

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
