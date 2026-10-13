# Kirayo

Kirayo is a peer-to-peer **rental marketplace for India**: people rent cameras, tools, tents, consoles and more from verified neighbours. Prices are in ₹ INR and all dates are Asia/Kolkata. Roles: **Renter → Owner → one Admin**. It covers listings, availability, one-time ID checks, OTP handover and return, deposits, claims and payouts.

**Stack:** Next.js 16 (App Router, TypeScript, React 19) · PostgreSQL + Prisma 6 · the Kirayo design-kit CSS (no Tailwind/UI kit) · email OTP auth (nodemailer) · Razorpay **test mode** or a demo payment screen · zod-validated Server Actions, plus route handlers for uploads, chat polling, payments, cron and file serving.

---

## Windows setup

1. **Node 20.9+** (`node -v`).
2. **Database** — Kirayo runs its **own Postgres container on port 5437**. On this machine 5432 is Dobara's Postgres and 5433 is already used by another project, so option B from the brief was moved to 5437:
   ```bat
   docker run --name kirayo-db -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=kirayo -p 5437:5432 --restart unless-stopped -d postgres:16
   ```
   `DATABASE_URL="postgresql://postgres:postgres@localhost:5437/kirayo?schema=public"` (already in `.env.example`).
   *Alternative (option A, no Docker):* create a `kirayo` database in an existing local Postgres (`createdb kirayo` or pgAdmin) and point `DATABASE_URL` at it, e.g. `…@localhost:5432/kirayo?schema=public`.
3. `copy .env.example .env`
4. `npm install`
5. `npm run setup` — generates the Prisma client, pushes the schema and loads the full demo.
6. `npm run dev` → **http://localhost:3001** (3000 is Dobara's).

### Optional: real email (SMTP)
Leave `SMTP_HOST` empty in development: OTP codes and all notification emails are printed in the terminal, and the OTP is shown on the verify page. For Gmail: `SMTP_HOST=smtp.gmail.com`, `SMTP_PORT=465`, `SMTP_USER=you@gmail.com`, `SMTP_PASS=<16-char app password>` (Google Account → Security → App passwords). `@*.test` demo addresses always show the code on screen in dev, even with SMTP set.

### Optional: Razorpay test mode
Set `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET` and `NEXT_PUBLIC_RAZORPAY_KEY_ID` to your **test** keys. Checkout then opens Razorpay; pay with UPI `success@razorpay` (or `failure@razorpay` to see the failure screen) or card `4111 1111 1111 1111`, any future expiry, any CVV. Deposits are refunded through the Refunds API. With the keys empty you get the **demo payment** screen ("Pay" / "Simulate failed payment") and refunds are simply marked refunded.

---

## Demo logins

Full list grouped by city → area: **[LOGINS.md](LOGINS.md)**. Log in with the email; the 6-digit code appears on the verify page in development.

| Who | Email | Try |
|---|---|---|
| Admin | `admin@kirayo.test` | Approve Neha's ID and pending listings, decide the disputed claim, pay the pending payout, resolve the complaint |
| Renter (verified) | `riya@kirayo.test` | Has a booking in every state: pay the held projector, pickup OTP for tomorrow's tent, cash-at-pickup drill, in-use guitar, overdue bike, answer the speaker claim |
| Owner (verified) | `arjun@kirayo.test` | 16 items in Bengaluru + Mumbai: answer the camera request, hand over the tent, check the returned ladder, earnings, reviews |
| ID pending | `neha@kirayo.test` | Chat works; paying/listing blocked until approved |
| ID rejected | `vikram@kirayo.test` | Rejected screen with reason, re-upload |

Two-user test: open a normal window as Riya and an incognito window as Arjun — every booking page and chat shows a step progress bar and a **Next:** card telling each side what to do.

---

## The flow → pages

| # | Step | Route |
|---|---|---|
| 1 | Visit | `/` |
| 2 | Select location once (city + area, saved on user + cookie, header chip) | `/location` |
| 3 | Browse nearby available items (area order, date filter, price, deposit, handover, search, sort, pages) | `/browse` |
| 4–5 | Item page: gallery, prices, refundable deposit, availability calendar, owner card, reviews | `/items/[id]` (S04 "not free" when dates clash) |
| 6 | Chat with owner (5 s polling, unread, read receipts, quick replies) | `/chat`, `/chat/[id]`, `/chat/new?item=` |
| 7 | Booking request in chat: request / accept / decline / counter / withdraw → 12 h hold | `/chat/[id]` |
| 8 | Booking summary / checkout (pickup or delivery, breakdown, terms) | `/book/[bookingId]` |
| 9 | Identity verification (ID + selfie, private storage) | `/verify-id` |
| 10 | Payment: online now (Razorpay/demo) or pay at pickup | `/pay/[bookingId]` → `/bookings/[id]/confirmed` |
| 11 | Pickup handover (owner photos ≥2, cash tick, renter's OTP) | `/bookings/[id]`, `/owner/bookings/[id]` |
| 12 | In use: days left / OVERDUE, extension (+payment), report a problem | `/bookings/[id]` |
| 13 | Return handover (owner photos ≥2, return OTP) | `/owner/bookings/[id]` |
| 14 | Owner confirms (All OK / claim); renter accepts or disputes; 48 h auto rules | `/owner/bookings/[id]`, `/bookings/[id]` |
| 15 | Deposit refund → owner payout | `/bookings/[id]`, `/admin/refunds`, `/admin/payouts` |
| 16 | Reviews (renter → owner + item, owner → renter) | `/bookings/[id]/review`, `/owner/reviews` |

**Owner panel** (`/owner`, needs a verified ID; `/owner/start` explains how to become an owner): dashboard with "Needs your action" `/owner` · list an item `/owner/new` · edit `/owner/items/[id]/edit` · my listings `/owner/listings` · booking requests `/owner/requests` · bookings `/owner/bookings` · calendar `/owner/calendar` · earnings `/owner/earnings` · reviews `/owner/reviews`.

**Admin** (`/admin`, the single seeded admin): dashboard · ID verifications `/admin/ids` · listing approvals `/admin/listings` · users `/admin/users` · bookings `/admin/bookings` · deposit disputes `/admin/disputes` · complaints & contact `/admin/complaints` · payouts `/admin/payouts` · deposit refunds `/admin/refunds`. Every list has search + pagination.

**Other pages:** `/profile`, `/bookings`, `/about`, `/how-it-works`, `/contact`, `/terms`, `/privacy`, `/deposit-policy`, 404.

---

## Rules (single source of truth: `lib/bookings.ts`, pure math in `lib/pricing.ts`)

- **Pricing:** `days = max(1, return − pickup)`; the item is occupied pickup..return inclusive. Rent = `days × perDay`, or with a weekly price `min(days × perDay, ⌊days/7⌋ × perWeek + (days mod 7) × perDay)`. Delivery is a flat `DELIVERY_FEE` (drop-off + collection). Total = rent + deposit + delivery; the deposit is always shown as refundable. `PLATFORM_FEE_PERCENT` is taken from the owner's payout only.
- **Hold:** when a request is accepted, one transaction (with a per-item lock) re-checks the dates and creates a `PENDING_PAYMENT` booking holding them for **12 h**; overlapping pending requests are declined with a chat message. Expired holds are cancelled and the dates freed. Submitting an ID adds 12 h.
- **Payment confirmation:** atomic and idempotent — status still pending and dates still free → `CONFIRMED`, otherwise cancelled and an online payment is refunded in full. Renters pay only with a verified ID.
- **Cancellation (before pickup):** renter ≥ 24 h before pickup → full refund; < 24 h → one day's rent to the owner, rest refunded; owner cancels → full refund and it's recorded on the owner. **No-show** (from the day after pickup): everything except one day's rent is refunded.
- **Deposit / claim / refund:** after the return the owner has 48 h for "All OK" or a claim (≤ deposit; may include late fee = per-day × late days). The renter has 48 h to accept or dispute (silence = accept); the admin decides disputes (₹0 to the claim) with both condition reports side by side. Refund = deposit − accepted/decided claim (Razorpay Refunds API or demo); then `DEPOSIT_REFUNDED`.
- **Cash at pickup:** only if the item allows it; confirmed immediately (dates held), the owner must tick "I collected ₹X" before entering the OTP, returns the deposit in cash. Kirayo records it but moves no money (no refund API, no payout).
- **Payouts:** online bookings only, created when the deposit is settled: rent (incl. extensions) − fee + approved claim (or the one day kept on late cancellation / no-show). The admin marks them paid with a UTR/UPI reference.
- **Overdue** is computed (not a status); renters get a daily reminder email. Jobs (`lib/jobs.ts`) run on the relevant pages and via `GET /api/cron?secret=CRON_SECRET`.

---

## Useful commands

| Command | What it does |
|---|---|
| `npm run dev` / `npm run build` / `npm start` | Dev server / production build / production server on **3001** |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run setup` | `prisma generate` + `db push` + seed (full demo) |
| `npm run db:reset` | Sync schema and reload the demo. The seed wipes data **only if every user is a `@*.test` demo account**; with real users it just tops up cities/admin/area owners |
| `npm run db:add-demo-owners` | Add the 2–3 verified owners per area (with items) to an existing DB, without wiping |
| `npm run e2e` | End-to-end flow through `lib/` against the real DB (71 PASS/FAIL checks, cleans up after itself) |
| `npm run test:unit` | Pricing / overlap / min-max unit checks |
| `npx prisma studio` | Browse the database |
| `npx tsx tools/write-logins.ts` | Regenerate `LOGINS.md` from the DB |

## Troubleshooting

- **Port 3001 busy:** find it with `netstat -ano | findstr :3001` and stop that process (`taskkill /PID <pid> /F`), or change `-p 3001` in `package.json` and `APP_URL`.
- **Postgres port conflict:** another container already uses the port — pick a free one (e.g. `-p 5438:5432`) and update `DATABASE_URL`. `docker ps` shows what's taken.
- **`EPERM ... query_engine-windows.dll.node` on `prisma generate`:** stop `npm run dev` first (it locks the engine), then run the command again.
- **A layout or server-action change doesn't show in dev:** restart `npm run dev` (Turbopack occasionally misses those).
- Uploaded files live in `./uploads` (public) and `./private-uploads` (ID images, served only to their owner and the admin). Both are git-ignored.

**Not in scope:** GPS/maps/live tracking, WebSockets, wallet, coupons, delivery-partner app, notifications centre, wishlist, multi-language, native apps, analytics charts, automated KYC (the admin checks IDs by hand).

Demo item photos are local copies from Wikimedia Commons — see `public/demo/CREDITS.md`.
