# Kirayo audit — 26 Oct 2026

PROGRESS.md said every phase was done. This audit checked that claim by running everything and walking the product in a real browser. Below: what was actually broken, what was fixed, and what was missing.

## How it was checked

| Check | Result on arrival | Result now |
|---|---|---|
| `npm install` | OK, but `npm audit`: **1 critical, 3 high, 1 moderate** | Critical and moderate fixed (see 2). The 3 high remain in Prisma's CLI tooling |
| `prisma generate` | OK | OK |
| `prisma migrate` | **Not possible**: no `prisma/migrations`, schema only ever `db push`ed | Baseline + feature migration, `migrate deploy` (see 1) |
| Seed | OK | OK, with the new owner statuses |
| `npm run typecheck` | OK | OK |
| `npm run build` | OK, **2 warnings** (whole project traced into the server bundle) | OK, 0 warnings |
| `npm run test:unit` | 29/29 | 29/29 |
| `npm run e2e` (lib-level) | 71/71 | **97/97** (+23 owner-application / moderation, +3 "deal pakki" payment guard) |
| Real-browser walk, Riya + Arjun + admin (`tools/ui/walk.mjs`) | Didn't exist | **33/33** steps |
| Home + motion + dark/light checks (`tools/ui/home-check.mjs`) | Didn't exist | **54/54** |
| Link crawl at 360 px as guest / Riya / Arjun / Kabir / admin (`tools/ui/crawl.mjs`) | 0 problems on 221 pages | 0 problems on 266 pages (HTTP ≥ 400, page/console errors, horizontal overflow) |
| Access control spot checks | OK | OK. Another user's booking/chat → 404, ID images 403/401 for others, non-admin `/admin` → redirect |

The browser walk used the real UI end to end, with no injected sessions: OTP signup → location → list item (photo upload) → admin approval → browse/search → item page → request in chat → owner counters → renter accepts (arrives via the 5 s poll) → checkout → demo payment → pickup photos + OTP → return photos + OTP → All OK → reviews from both sides → owner earnings → admin marks the payout paid → every admin page. **The existing core flow worked.** No booking, payment, handover or settlement bug turned up.

## What was broken, and the fix

1. **No migrations.** The project used `prisma db push` only, so `prisma migrate` couldn't run and there was no migration history for production.
   *Fix:* created `prisma/migrations/0_init` from the schema, marked it applied on the existing DB (no data loss), and added `20261026120000_owner_application` for Phase B. `setup` / `db:reset` now use `prisma migrate deploy` (`db:push` script removed; new `db:migrate`). Checked by migrating and seeding a throwaway empty database from scratch.
2. **Security advisories.** `next@16.4.0` had a *critical* advisory (unauthenticated RCE in image optimisation with SVG; RCE in `use cache` with typed arrays; Server Actions DoS). `nodemailer@10.1.x` had address-parser injection bugs (moderate).
   *Fix:* `npm audit fix` (non-breaking) → `next@16.4.3`, `nodemailer@10.2.1`. **Not fixed:** 3 *high* advisories in `deepmerge-ts` pulled in by Prisma's CLI config loader. The fix is Prisma 7, a major upgrade, so it was left out. It affects the dev/CLI tooling, not the request path.
3. **Build warnings.** `lib/storage.ts` read uploads with a dynamic `fs.readFile`, making Turbopack trace the whole project (incl. `public/`) into the server output.
   *Fix:* `/*turbopackIgnore: true*/` on the two reads of user upload folders. Build is now warning-free.
4. **Seed side effect (documented, not changed).** The seed wipes and refills the shared `./uploads` and `./private-uploads` folders. Seeding a second database in the same folder therefore breaks the first one's seeded ID images. Run `npm run db:reset` on the DB you use.

## What was missing (built in Phase B / C)

Missing, not broken, compared with the new brief:

- **Owner application.** There was none: any ID-verified user could open the owner panel. Added `ownerStatus` NONE → PENDING → APPROVED / REJECTED (with reason), `/owner/apply`, the admin `/admin/owners` page, emails, and gates in the `(dash)` layout, listing approval, browse, item page and chat (`lib/owner-gate.ts`, `lib/moderation.ts`). ID verification is still required as well. Existing owners were migrated to APPROVED, so nobody lost access.
- **Admin:** no KPI row (users / active listings / bookings / revenue / open disputes), no owner-approval queue or badge, and the user "drawer" was an inline block without owner status. All added. Listing moderation, bookings and contact "Mark resolved" already existed and work.
- **Chat:** polling existed in a thread but the inbox list never refreshed; no "Booking agreed" card. Both added.
- **Browse / item:** sort (newest, price ↑/↓, nearest area) and pagination already existed and work. On phones the gallery only showed the first photo; now it's a swipeable strip with dots, and the full-screen viewer swipes too.
- **Home page:** replaced with a carousel and the requested sections and animations (Phase C).

## Things that were *not* bugs

The first walk-script runs failed several times because of the test harness, not the app. Uploads ran before React hydrated, a test navigated away before a server action finished, Next's hidden route announcer duplicated `<h1>` text, and the app's 30 s OTP resend limit blocked quick reruns. The walk script now handles each of these.

## Environment notes

- A `next dev` for this project was already running on port 3001 (started before this session) on the pre-upgrade Next binary. It held the Prisma engine DLL, so `prisma generate` failed with EPERM. It was stopped, and a fresh `npm run dev` was started on 3001 at the end.
- Browser checks run against a production build (`next start -p 3011`) using the installed Microsoft Edge.

## Known limitations (still true)

- **No Razorpay webhook.** Payments are confirmed when the browser returns from Checkout (signature + Payments API check). A renter who closes the tab right after paying must be reconciled by hand. See README → *How to go live*.
- Owner payouts are manual transfers that the admin records. There's no Razorpay Route / X integration.
- `npm run e2e` drives `lib/` directly; the HTTP/UI layer is covered by the browser walk instead.
- The browser walk adds a walk user and test item each run. `npm run db:reset` clears them.
