You are building **Kirayo**, a peer-to-peer **RENTAL marketplace for India** (INR, Indian cities, all dates in Asia/Kolkata). People rent items from nearby people. Roles: **Renter → Owner (individual) → one Admin**. Scope: **listings, availability, identity checks, handover and return tracking, deposits.** The UI is already designed — your job is to turn it into a working website, phase by phase, without inventing extra features.

====================================================================
## 0. GOLDEN RULES (follow every time)
====================================================================

1. **Design is fixed.** The kit is in `./design`, in three parts: `design/user/`, `design/owner/`, `design/admin/` (each with `screens/*.png`, `html/*.html`, and shared `design/styles/*.css` + icon sprites). Copy structure and class names from the static HTML. Copy the design CSS into `public/` and use it **as-is — never edit it**. Put any small additions in `public/app.css`. No Tailwind, no UI kit.
   - In Phase 0, first **inventory the design folder** and write a table in `PROGRESS.md`: screen file → route → flow step.
   - If a needed screen has **no design** (for example ID verification, damage claim, extend request), build it from existing components and classes so it looks native, and note it in `PROGRESS.md` under "Screens without a design".
2. **Read the Next.js docs first.** This is Next.js 16 and it has breaking changes. Read the relevant guide in `node_modules/next/dist/docs/` before writing code. Known differences:
   - `params` and `searchParams` are **Promises** (`const { id } = await params`).
   - Middleware is now `proxy.ts`.
   - `next lint` is removed: use `tsc --noEmit` and `next build` as the checks.
   - A `redirect()` during a full-page Server Component render can return HTTP 200 with a meta-refresh, not a 307. When testing with curl this looks like "no redirect"; real browsers follow it.
3. **Keep it simple.** No GPS, maps, WebSockets, wallet, coupons, delivery-partner app, multi-language or native app.
   - Location is chosen **once** (city + area from a seeded list), saved on the user and in a cookie, and shown in the header.
   - Chat polls every 5 s.
4. **Never leave a user stuck — "what do I do next?" everywhere.** This was the biggest real-world bug in the previous project.
   - Every chat with a booking, and every booking page (renter and owner), shows a **step progress bar** plus a **"Next:" card**.
   - The "Next:" card says in one sentence what *this* person must do now, with one primary button for it. Examples:
     - Owner: "New booking request — Accept / Decline / Suggest other dates"
     - Owner: "Confirmed — on pickup day enter the renter's OTP"
     - Renter: "Pay to confirm (hold expires in 5 h)"
     - Renter: "Show your pickup OTP"
     - Renter: "Return due tomorrow"
   - The other side sees "Waiting for X to …".
   - Every status change also posts a SYSTEM message in the chat.
   - The header shows an **action badge**:
     - for owners: new requests, bookings to hand over, returns to confirm
     - for renters: payments due, returns due
   - The badge links straight to the right list.
5. **Make every multi-step money/date change atomic.** Use a Prisma `$transaction` that re-checks the condition inside, for example "dates still free" or "status still X". Two people must never get the same dates, and a booking must never be paid twice.
6. **Authorization on every action and route.**
   - Only the renter or owner of a booking can see or act on it. Only the owner can edit their item. Only the admin can use `/admin`.
   - Check on the server, never only in the UI.
7. **Do not add screens or features** beyond this prompt and the design. When something is unclear, pick the simplest option and record it in `PROGRESS.md` → Decisions.
8. **Resume system (very important):**
   - In Phase 0: run `git init` and copy this whole prompt into `BUILD_PROMPT.md`.
   - Create `PROGRESS.md` with: current phase, a checklist (tick `[x]` as you go), the screen map, Decisions, and the exact **Next step** line.
   - After **every** finished task: update `PROGRESS.md`, then git commit (for example `phase-4: booking request card`).
   - If a new chat says *"Read PROGRESS.md and BUILD_PROMPT.md, then continue exactly where you stopped"*:
     - read both files
     - run `git status` and `git log -5`
     - repair any half-written file
     - continue from "Next step"
     - **never redo finished work**
9. **End of every phase:**
   - Run `npx tsc --noEmit` and `npm run build` and fix all errors.
   - Run the phase's flow end-to-end (see §10 Testing).
   - Check the screens in a browser at 360 px and 1440 px against the PNGs.
   - Write "Phase N done" in `PROGRESS.md`.
10. **Windows dev machine gotchas:**
    - Stop `next dev` before `prisma generate`: the running server locks `query_engine-windows.dll.node`, which causes an EPERM error.
    - Never run `db push --force-reset` or `db:reset` on a database with real data without asking.
    - Adding enum values or columns with `prisma db push` is safe.

====================================================================
## 1. PORTS & ENVIRONMENT (this machine already runs another project)
====================================================================

Another app (Dobara) already uses **port 3000** and a local **PostgreSQL on 5432**. Kirayo must not collide with it.

- **App runs on port 3001:**
  - `"dev": "next dev -p 3001"`
  - `"start": "next start -p 3001"`
  - `APP_URL="http://localhost:3001"`
- **Database.** Choose ONE option and write the choice in the README:
  - **A (recommended, no Docker):** reuse the existing local Postgres. Run `createdb kirayo` (or create it in pgAdmin), then set `DATABASE_URL="postgresql://postgres:postgres@localhost:5432/kirayo?schema=public"`.
  - **B (Docker):** use a separate container on **5433**: `docker run --name kirayo-db -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=kirayo -p 5433:5432 -d postgres:16`, then set `DATABASE_URL=...@localhost:5433/kirayo...`.
- `.env.example` (commented, like below):
  - `DATABASE_URL`, `APP_URL`
  - `SMTP_HOST`, `SMTP_PORT=465`, `SMTP_USER`, `SMTP_PASS`, `MAIL_FROM="Kirayo <no-reply@kirayo.local>"`
  - `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`, `NEXT_PUBLIC_RAZORPAY_KEY_ID` (empty = demo payment mode)
  - `CRON_SECRET` (protects `/api/cron`)
  - `PLATFORM_FEE_PERCENT=0` (commission taken from the owner payout; 0 = none)
  - `DELIVERY_FEE=99` (flat; covers drop-off AND collection)
- **Scripts:**
  - `setup` = `prisma generate && prisma db push && prisma db seed`
  - `db:push`
  - `db:seed`
  - `db:reset` (dev only)
  - `typecheck`
  - `e2e` = `tsx scripts/e2e-flow.ts`
  - `postinstall` = `prisma generate`
- `.gitignore` includes `.env`, `uploads/` and `private-uploads/`.

====================================================================
## 2. TECH STACK (use exactly this)
====================================================================

| Part | Choice |
|---|---|
| Framework | **Next.js 16 App Router + TypeScript**: one app for renter, owner and admin. React 19. Node ≥ 20.9 |
| Database | **PostgreSQL + Prisma 6** (`prisma-client-js`); seed with `tsx` |
| Styling | Design-kit CSS from `public/` + `public/app.css` for additions. Fonts as in the kit |
| Mutations | Server Actions, validated with zod. **Route handlers** for: file uploads (avoids the Server Action body limit), chat polling and booking-request actions, Razorpay order/verify/refund, cron, serving uploads |
| Auth | **Email OTP** login + sign-up (nodemailer).<br>• OTP: 6 digits, hashed in DB, expires in 10 min, max 5 attempts, resend after 30 s.<br>• If SMTP is not set: print the OTP in the terminal and show it on the verify page (dev only).<br>• `@*.test` demo emails always show the OTP on screen in dev, even with SMTP set.<br>• Session = random token in the DB + httpOnly, sameSite=lax cookie, 30 days |
| Payments | **Razorpay TEST mode** when keys exist: Orders API + Checkout + server-side signature check, and the **Refunds API** for deposits.<br>Without keys: a **demo payment** screen (Pay / "Simulate failed payment"), and refunds are just marked REFUNDED |
| Files | `lib/storage.ts` is the only file that touches disk, so S3 can be swapped later. Limits: jpg/png/webp only, ≤ 5 MB each, ≤ 8 item photos, ≤ 6 condition photos.<br>• **Public files** (item photos, condition photos) go in `./uploads`, served by `app/uploads/[...path]/route.ts`.<br>• **Private files** (ID document, selfie) go in `./private-uploads` and are served only to that user and the admin, via `app/api/private/[...path]/route.ts`. Never put ID images in `public/` |
| Email notifications | `lib/mail.ts`, a simple text email for each key event (listed in §6). In dev without SMTP, print to the console |
| Jobs | `lib/jobs.ts` → `runDueJobs()`. It runs at the start of the relevant pages and from `GET /api/cron?secret=CRON_SECRET`:<br>• expire payment holds<br>• mark overdue bookings<br>• 48 h return auto-OK<br>• 48 h claim auto-accept |

Folder layout:
- `app/(site)/` — renter site: home, browse, item, chat, bookings, verify-id, profile, about, contact, terms, privacy
- `app/(auth)/` — login, signup, verify, location
- `app/owner/` — `start/` (become an owner, open to any logged-in user) and `(dash)/`. The `(dash)/` route group's layout requires `idStatus === VERIFIED`. The route group stops the layout from wrapping `start/`, which avoids a redirect loop.
- `app/admin/` — admin panel, `isAdmin` only
- `app/api/` — the route handlers listed above
- `app/actions/` — server actions
- `components/`
- `lib/` — db, auth, otp, mail, storage, payments, bookings (pricing + overlap + state machine), chat, jobs, constants, format
- `prisma/` — `schema.prisma`, `seed.ts`, `demo-data.ts`
- `public/` — design CSS (do not edit), `app.css`, `demo/` (seed photos)
- `scripts/e2e-flow.ts`

====================================================================
## 3. DATA MODEL (Prisma)
====================================================================

- **User**:
  - id, email (unique), name, phone?, city?, area?, address?
  - isAdmin, isBlocked
  - **idStatus** NONE / PENDING / VERIFIED / REJECTED, idDocPath, selfiePath, idRejectReason, idSubmittedAt, idReviewedAt
  - createdAt
- **Session** (token unique, userId, expiresAt)
- **EmailOtp** (email, codeHash, expiresAt, attempts, purpose LOGIN / SIGNUP)
- **City / Area** — seeded list, for example Delhi, Noida, Gurugram, Mumbai, Pune and Bengaluru, with 6–10 areas each
- **Item**:
  - id, ownerId, title, category (enum)
  - description, photos[]
  - pricing: pricePerDay, pricePerWeek?, deposit, minDays (default 1), maxDays (default 30)
  - handover: canPickup, canDeliver, **acceptsCashAtPickup** (default false)
  - city, area
  - status PENDING_REVIEW / ACTIVE / REJECTED / PAUSED, rejectReason
  - views, createdAt
- **BlockedDate** (itemId, date) — unique on (itemId, date)
- **Conversation** (itemId, renterId, ownerId, updatedAt) — unique on (itemId, renterId)
- **Message**:
  - id, conversationId, senderId, type TEXT / BOOKING_REQUEST / SYSTEM
  - text, startDate?, endDate?, requestStatus PENDING / ACCEPTED / DECLINED / COUNTERED / WITHDRAWN
  - readAt, createdAt
- **Booking**:
  - identity: id, code (e.g. KR-2026-483920), itemId, renterId, ownerId, conversationId
  - dates and prices: startDate, endDate, days, **pricePerDay and pricePerWeek snapshot**, rentAmount, deposit, deliveryFee, platformFee, total
  - handover: mode PICKUP / DELIVERY, address, pickupNote
  - payment: **paymentMode** RAZORPAY / DEMO / CASH_AT_PICKUP, razorpayOrderId, paymentId
  - **holdExpiresAt**
  - status — see §5
  - OTPs: pickupOtp, returnOtp (4 digits)
  - timestamps for every status: confirmedAt, pickedUpAt, returnedAt, returnConfirmedAt, refundedAt, cancelledAt
  - cancelReason, cancelledBy
- **ConditionReport** (bookingId, stage PICKUP / RETURN, byUserId, photos[], notes, createdAt)
- **ExtensionRequest** (bookingId, newEndDate, extraDays, extraAmount, status PENDING / ACCEPTED / DECLINED / PAID, paymentId)
- **DamageClaim**:
  - bookingId, amount (≤ deposit), reason, photos[]
  - status OPEN / ACCEPTED / DISPUTED / RESOLVED
  - renterNote, adminDecisionAmount, adminNote, createdAt, decidedAt
- **DepositRefund** (bookingId, amount, status PENDING / REFUNDED, refundId, refundedAt)
- **Payout** (bookingId unique, ownerId, amount, status PENDING / PAID, paidAt, reference)
- **Review**:
  - bookingId, fromUserId, toUserId, itemId?, rating 1–5, tags[], text
  - unique on (bookingId, fromUserId)
- **Complaint** (bookingId, byUserId, reason, text, photos[], status OPEN / RESOLVED, adminNote) — the "Report a problem" form during use
- **ContactMessage** (name, email, message, resolved)

====================================================================
## 4. MONEY & DATE RULES (implement in `lib/bookings.ts`, unit-test them)
====================================================================

- **Days.** The renter picks a start date (pickup day) and an end date (return day).
  - `days = max(1, end − start in calendar days)`.
  - The item is **occupied on every date from start to end, inclusive**.
  - The next booking may start the day after `end`.
- **Rent.**
  - Without a weekly price: `days × pricePerDay`.
  - With a weekly price: `min(days × pricePerDay, floor(days/7) × pricePerWeek + (days % 7) × pricePerDay)`.
  - Days must be within the item's minDays and maxDays.
- **Delivery fee.** Flat `DELIVERY_FEE` if mode is DELIVERY (covers both drop-off and collection), else 0.
- **Total.** `total = rent + deposit + deliveryFee`. The deposit is always shown as **"refundable"** in a separate line.
- **Platform fee.** `platformFee = round(rent × PLATFORM_FEE_PERCENT / 100)`. It is deducted from the owner payout only; the renter never sees it.
- **Availability.** A date range is free if it overlaps none of these:
  - BlockedDate rows
  - bookings in PENDING_PAYMENT whose hold has not expired
  - bookings in CONFIRMED, PICKED_UP or RETURNED states
  - start must be ≥ today, in IST
- **Booking a request.** When the owner accepts a booking request:
  - In one transaction: re-check availability, then create a Booking with status PENDING_PAYMENT and `holdExpiresAt = now + 12 h`. The dates are now held.
  - Every other PENDING request in any chat for that item with overlapping dates → DECLINED. Post a SYSTEM message there: "Those dates were just booked by someone else."
  - On hold expiry: set CANCELLED (reason "payment not completed"), free the dates and post a SYSTEM message.
- **Payment confirmation.** In one transaction: status still PENDING_PAYMENT? Dates still free, ignoring this booking? Then set CONFIRMED.
  - If not: cancel the booking, and if the payment was online, **auto-refund the full amount**.
  - Duplicate verify calls must be idempotent.
- **Cancellation (before pickup).**
  - Renter cancels **24 h or more before the start**: full refund.
  - Renter cancels later: 1 day's rent is kept and paid to the owner, the rest is refunded.
  - Owner cancels: full refund. Post a SYSTEM message and record it on the owner (visible to the admin).
  - Freed dates become available again.
- **No-show.** From the day after `startDate`, the owner can mark "Renter didn't come". Deposit and delivery fee are refunded; 1 day's rent goes to the owner.
- **Late return.**
  - After `endDate`, the booking shows **OVERDUE** (computed, not a status) to both sides.
  - The renter gets a daily reminder email.
  - The owner may claim a late fee = pricePerDay × late days, as part of the damage/late claim (still ≤ deposit).
- **Extension.**
  - While PICKED_UP, the renter requests a new end date.
  - The owner accepts only if the extra dates are free.
  - The renter pays `extraAmount` (online), and then `endDate` and `rentAmount` update.
  - For cash bookings, the extra is paid in cash and the owner just accepts.
- **Payout** (online bookings only), created when the deposit is settled:
  - `rentAmount + extensions − platformFee + approved claim amount`, plus any cancellation or no-show rent kept for the owner.
  - The admin marks it PAID with a reference.
- **CASH_AT_PICKUP** is offered only if `item.acceptsCashAtPickup`. It is the "pay on delivery / pay at pickup" option users expect.
  - The booking is CONFIRMED immediately; the dates are held the same way.
  - At pickup, the owner collects rent and deposit in cash or UPI, and **must tick "I collected ₹X"** before entering the OTP.
  - At return, the owner returns the deposit in cash, minus any claim the renter accepts.
  - Kirayo records this but moves no money: no payout and no refund API.
  - Disputes on cash bookings are recorded for the admin with notes only.
  - The checkout page explains this clearly next to "Pay online now".
- **ID verification gates:**
  - an **owner's** items can go live only when the owner is VERIFIED
  - a **renter** can pay (or confirm cash) only when VERIFIED
  - sending chats and booking requests is allowed before verification

====================================================================
## 5. BOOKING STATE MACHINE (single source of truth in `lib/bookings.ts`)
====================================================================

The main path:
1. PENDING_PAYMENT
2. CONFIRMED — paid online, or cash confirmed
3. PICKED_UP — owner entered the renter's pickup OTP and both sides uploaded pickup condition photos
4. RETURNED — owner entered the renter's return OTP and uploaded return condition photos
5. RETURN_CONFIRMED — "All OK", 48 h auto-OK, or claim settled
6. DEPOSIT_REFUNDED

Side branches:
- **Claim raised:** from RETURNED → DISPUTED (the renter disputes the claim) → admin decides → RETURN_CONFIRMED → DEPOSIT_REFUNDED
- **Cancelled:** PENDING_PAYMENT or CONFIRMED → CANCELLED (renter, owner, admin, hold expiry, no-show)

Rules:
- Put every allowed transition in one map (`from → [to], who may do it`).
- All actions call one `transition()` helper, which:
  - checks the role and the current status inside a transaction
  - sets the timestamp
  - posts a SYSTEM chat message
  - sends the email
- Also export `nextStepFor(booking, viewerRole)`, which returns `{ text, buttonLabel, href }` for the "Next:" card (Golden rule 4), and `progressSteps(booking, role)` for the progress bar.

====================================================================
## 6. THE FLOW (implement every step)
====================================================================

1. **Visit** → Home.
2. **Select location once.**
   - Ask for city + area after the first visit or login, from a searchable list.
   - Save it on the user + cookie, and show it in the header chip. Change it only from that chip.
3. **Browse nearby available items.**
   - Same city, own area first, showing the **area name, not km**.
   - Filters: category, **date range** (shows only items free on those dates), price/day range, max deposit, pickup / delivery.
   - Search, sort (nearest area / price / newest), pagination.
   - Only ACTIVE items from VERIFIED, non-blocked owners. Never show the viewer's own items.
4. **Item page.**
5. **Item details:**
   - photos gallery
   - price/day, price/week, **refundable deposit**, min/max days, pickup/delivery badges
   - **availability calendar** (booked/blocked dates greyed, past dates disabled)
   - owner card (verified badge, rating, completed rentals, member since)
   - item reviews
   - "Chat with owner" and "Request to book" (opens chat with the date picker pre-filled)
6. **Chat with owner.**
   - Conversation list + thread; polls every 5 s and skips silently on a network error.
   - Unread badges and read receipts; quick-reply chips.
   - The item strip on top shows its status.
7. **Booking request in chat.**
   - The renter picks dates in a modal, which shows the live price breakdown and disables unavailable dates.
   - The owner can **Accept**, **Decline** or **Suggest other dates** (counter).
   - The renter can accept the counter or withdraw.
   - Accepting creates the held Booking (§4).
   - The chat then shows a "Dates confirmed — pay within 12 h" card with a countdown, the "Continue to booking" button, and **Cancel** for both sides.
8. **Booking summary / checkout `/book/[bookingId]`:**
   - pickup or delivery (saved address); delivery appears only if `canDeliver`
   - price breakdown: days × rate (weekly discount shown), deposit (refundable), delivery fee, total
   - cancellation policy line and an "I agree to the rental terms" checkbox
9. **Identity verification, once per user (`/verify-id`):**
   - Upload an ID image (Aadhaar / PAN / DL / Passport; tell the user to mask the Aadhaar number) and a selfie. Status becomes PENDING.
   - The admin sets VERIFIED or REJECTED with a reason; the user can resubmit.
   - On checkout, an unverified renter sees a clear blocker: "Verify your ID to pay — usually approved within a few hours".
   - The booking hold is extended by 12 h when the ID is submitted.
10. **Payment `/pay/[bookingId]`.** Two options, clearly separated:
    - **Option 1 — Pay online now** (Razorpay test, or demo with "Simulate failed payment"; failures show a retry message).
    - **Option 2 — Pay at pickup (cash / UPI)**, only if the item allows it.
    - Success goes to `/bookings/[id]/confirmed`, which shows "what happens next" steps and the pickup OTP.
11. **Pickup handover.**
    - The renter's booking page shows the **pickup OTP** (visible from CONFIRMED).
    - On the owner's booking page:
      - upload "condition at pickup" photos and notes (required, at least 2 photos)
      - for cash bookings, tick "I collected ₹X"
      - enter the renter's OTP → PICKED_UP
    - The renter may also add their own pickup photos (optional but encouraged), on their booking page during CONFIRMED / PICKED_UP.
12. **In use.**
    - The renter's page shows the days left and the return date, with OVERDUE highlighted in red.
    - Actions: **Request extension**, **Report a problem** (Complaint to admin).
    - The owner's page shows the same status.
13. **Return handover.**
    - The renter shows the **return OTP** (visible from PICKED_UP).
    - The owner uploads "condition at return" photos (at least 2) and enters the OTP → RETURNED.
14. **Owner confirms return within 48 h.** Two choices:
    - **"All OK"** → RETURN_CONFIRMED.
    - **"Claim damage / late fee"**: amount ≤ deposit, reason, photos.
      - The renter can **Accept** or **Dispute**, with a note, within 48 h; no response = auto-accept.
      - On a dispute, the admin sees both condition reports side by side and decides an amount (0 to the claim).
    - If the owner does nothing for 48 h → auto-OK.
15. **Deposit refund.**
    - Refund = deposit − accepted or decided claim.
    - Online: use the Razorpay Refunds API on the payment (test mode), or mark it refunded in demo mode → DEPOSIT_REFUNDED.
    - Then create the owner Payout.
    - The renter's page shows "₹X refunded to your original payment method" with a refund id.
16. **Reviews.** After RETURN_CONFIRMED:
    - The renter rates the owner (which also counts for the item).
    - The owner rates the renter.
    - One review per side; tags as in the design.

Emails (`lib/mail.ts`), one line each:
- OTP
- new booking request, request accepted / countered / declined
- payment received / booking confirmed
- pickup tomorrow, return due tomorrow, overdue
- claim raised, claim decided
- deposit refunded
- ID approved / rejected
- payout paid

====================================================================
## 7. PANELS
====================================================================

**Owner panel (`/owner`)**
- `/owner/start`: explains the owner flow and sends the user to `/verify-id`. It shows a pending or rejected status message.
- `(dash)` requires VERIFIED. All "List an item / Become an owner" buttons go to `/owner/start` until the user is verified, then to `/owner/new`.
- **Dashboard:** KPI cards plus a **"Needs your action"** list:
  - requests to answer
  - pickups today
  - returns to confirm
  - claims awaiting the renter
  - overdue items
- **List an item:** one form with photos, prices, deposit, min/max days, pickup/delivery, cash-at-pickup toggle, and a blocked-dates calendar.
  - New and edited items go to PENDING_REVIEW.
  - Editing **never** changes existing bookings (prices are snapshotted).
  - An item with upcoming or active bookings cannot be deleted, only PAUSED.
- **My listings:** tabs Active / Pending review / Paused / Rejected (with reason). Pause and resume.
- **Booking requests:** pending requests across all chats, each with Accept / Decline / Counter.
- **Calendar:** per item, showing bookings and blocked dates; click a date to block or unblock it.
- **Bookings:** tabs New / Upcoming / Out now / Returned (to confirm) / Completed / Cancelled. The booking page holds the handover pickup and return screens.
- **Earnings:** pending and paid payouts, totals, and the fee breakdown.
- **Reviews:** reviews received, plus "rate the renter".

**Admin panel (`/admin`, `isAdmin` only; exactly one admin, seeded, no admin sign-up, cannot be blocked)**
- **Dashboard:** counts and action badges in the sidebar for:
  - IDs pending
  - listings pending
  - open disputes
  - complaints
  - payouts to pay
  - refunds pending
- **ID verifications:** Pending / Verified / Rejected tabs. Open both images through the private route, then approve, or reject with a reason.
- **Listing approvals:** approve, or reject with a reason; take down a live item.
- **Users:** search, block or unblock, and a details drawer with their items, bookings, claims and ID status.
- **Bookings:** search by code, filter by status, view the full timeline, cancel with an automatic refund.
- **Disputes:** both condition reports side by side, the claim, and the renter's note → decide the amount → the refund and payout are computed.
- **Complaints & contact messages:** mark resolved, with a note.
- **Payouts:** mark paid with a reference.
- **Deposit refunds:** a list with status; retry failed Razorpay refunds.
- Every admin list has **search + pagination** (never cap at 100 rows).
- Admin actions return to the same tab or page they came from.

====================================================================
## 8. SEED (`npm run setup` gives a full demo; `npm run db:reset` reloads it)
====================================================================

- Cities and areas (§3).
- **Users:**
  - 1 admin `admin@kirayo.test`
  - renter `riya@kirayo.test` (VERIFIED)
  - owner `arjun@kirayo.test` (VERIFIED, 15+ items across all categories and two cities)
  - `neha@kirayo.test` with ID **PENDING** (with sample images)
  - `vikram@kirayo.test` with ID REJECTED (with a reason)
- **2–3 VERIFIED owners in every seeded area**, each with 2–3 ACTIVE items, so every location shows results.
  - Use real-looking **local photos** in `public/demo/`; never hotlink.
  - Give some items weekly prices and some cash-at-pickup.
- **Pending items** for the admin to approve.
- **Bookings, one in each status**, so every screen can be demonstrated:
  - a pending request in a chat
  - PENDING_PAYMENT with a live hold
  - CONFIRMED with pickup tomorrow
  - PICKED_UP (one of them OVERDUE)
  - RETURNED awaiting the owner's confirmation
  - a claim OPEN awaiting the renter
  - DISPUTED awaiting the admin
  - completed (DEPOSIT_REFUNDED) with both reviews
  - CANCELLED
  - one cash-at-pickup booking
- Payouts PENDING and PAID, and one contact message.
- Write `LOGINS.md`: every demo account grouped **by city → area**, with role, email, and what to try.
- Seed must be **idempotent-safe**: `db:reset` wipes and reloads. Also provide `npm run db:add-demo-owners`, which adds the area owners to an existing DB without wiping it.

====================================================================
## 9. PHASES (in order; commit after every task)
====================================================================

- **Phase 0** — Setup:
  - `git init`, Next 16 + TS, Prisma + Postgres on the ports from §1
  - design CSS, icons and fonts
  - layout: header (logo, location chip, search, "List an item", chat icon with unread count, action badge, account menu), footer, mobile tab bar
  - full schema, seed skeleton
  - `BUILD_PROMPT.md`, `PROGRESS.md` with the screen map, `.env.example`, README skeleton
- **Phase 1** — Email OTP login and sign-up, location-once, profile (name, phone, address, ID status, logout), route protection for `/owner/(dash)`, `/admin` and user pages.
- **Phase 2** — Owner start page, item form with uploads, blocked-dates calendar, my listings (pause/resume/delete rules), admin listing approvals.
- **Phase 3** — Discovery: home rails ("Near you", "Recently added", categories), browse with the date-availability filter, item page with calendar and reviews.
- **Phase 4** — Chat (polling, unread, quick replies), booking-request card (request / accept / decline / counter / withdraw), held booking + expiry, cancel deal, auto-decline of overlapping requests, progress bar + "Next:" card, header action badges.
- **Phase 5** — ID verification (private uploads) + admin review + the gates (§4).
- **Phase 6** — Checkout (pickup/delivery, breakdown, terms), payment: Razorpay test, demo, or cash at pickup; failure and retry; atomic confirmation and auto-refund on conflict; cancellation policy.
- **Phase 7** — Pickup handover (OTP + condition photos + cash tick), in use (days left, overdue, extension with payment, report a problem), return handover, owner return confirmation, damage/late claim, renter accept or dispute, jobs (`runDueJobs` + `/api/cron`).
- **Phase 8** — Deposit refund (Razorpay Refunds API / demo), admin disputes, payouts, refunds list, owner earnings.
- **Phase 9** — Reviews; About / Contact / Terms (including the rental, deposit and cancellation policy) / Privacy / 404; loading, empty and error states on every list; mobile polish at 360 px; README; `LOGINS.md`.

====================================================================
## 10. TESTING (do this, don't just assume)
====================================================================

- `scripts/e2e-flow.ts` (`npm run e2e`) drives the **whole** flow through the `lib/` functions against the real DB, prints a PASS / FAIL per step, and **cleans up everything it created**. Cases:
  - request → counter → accept → hold
  - an overlapping request gets auto-declined
  - a second renter cannot pay for the same dates
  - hold expiry frees the dates
  - ID gate blocks payment
  - demo pay → CONFIRMED
  - pickup OTP wrong, then right
  - extension
  - return OTP
  - claim → dispute → admin decision → refund amount correct → payout amount correct
  - reviews
  - the cash-at-pickup path
  - cancellation refunds (more and less than 24 h before start)
  - no-show
- Unit-check the price and overlap functions: weekly pricing, the inclusive end date, the minDays / maxDays limits.
- In the browser, play the flow as **two users side by side** (a normal window and an incognito window: renter + owner) and confirm that at every step **each side can see what to do next**.
- Then do it as admin.
- To test as a specific user without the UI, create a temporary Session row and delete it afterwards.

====================================================================
## 11. README (final)
====================================================================

- What Kirayo is; the tech stack.
- **Windows setup:**
  - Node 20.9+
  - the database (option A or B from §1, with the exact commands)
  - `copy .env.example .env`
  - `npm install`
  - `npm run setup`
  - `npm run dev` → http://localhost:3001
- Optional SMTP (Gmail app password) and Razorpay test keys, with test card / `success@razorpay`.
- Demo logins table (see `LOGINS.md`).
- A table mapping **each of the 16 flow steps → page/route**, plus the owner and admin pages.
- Rules summary:
  - pricing
  - hold
  - cancellation
  - deposit / claim / refund
  - cash at pickup
  - payouts
- Useful commands (`db:reset`, `db:add-demo-owners`, `prisma studio`, `e2e`) and troubleshooting:
  - port 3001 busy
  - Postgres port conflict
  - EPERM on `prisma generate` → stop the dev server first

**Not in scope:** GPS / maps / live tracking, WebSockets, wallet, coupons, delivery-partner app, notifications centre, wishlist, multi-language, native apps, analytics charts, automated KYC APIs (ID check is manual by the admin).

Start now with **Phase 0**: inventory `./design`, create `PROGRESS.md` (checklist + screen map) and `BUILD_PROMPT.md`, then build.
