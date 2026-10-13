# Kirayo — build progress

**Current phase:** 6 — Checkout + payment (Phase 5 done)

**Next step:** Phase 6 — `/book/[id]` checkout (R08: pickup/delivery + saved address, breakdown, policy, terms, ID blocker), `/pay/[id]` (R11 online Razorpay/demo + cash option, S06 failure/retry), Razorpay order/verify route handlers, `/bookings/[id]/confirmed` (R12); extend e2e with payment/cancellation cases.

---

## Checklist

### Phase 0 — Setup
- [x] Unpack + inventory design kit into `./design`; copy CSS/fonts/icons to `public/design/` (unchanged)
- [x] `git init`, `BUILD_PROMPT.md`
- [x] Next 16 + TS + Prisma 6 installed; Postgres container `kirayo-db` on port 5437
- [x] `.env.example`, `.gitignore`, `next.config.ts`, `tsconfig.json`
- [x] Full Prisma schema + `db push`
- [x] Seed skeleton (cities/areas, admin)
- [x] Root layout: header (logo, location chip, search, List an item, chat w/ unread, action badge, account menu), footer, mobile tab bar
- [x] README skeleton
- [x] typecheck + build pass → **Phase 0 done**

### Phase 1 — Auth, location, profile
- [x] Email OTP (request / verify / resend, hashed, 10 min, 5 attempts, 30 s resend)
- [x] Sessions (DB token + cookie, 30 d), logout
- [x] Sign-up (name + email)
- [x] Location once (city + area searchable) → user + cookie, header chip
- [x] Profile (name, phone, address, ID status, logout)
- [x] Route protection: user pages, `/owner/(dash)`, `/admin`

- [x] **Phase 1 done** (browser flow: tools/ui/phase1.mjs)

### Phase 2 — Owner listings
- [x] `/owner/start`
- [x] Item form + uploads (`lib/storage.ts`, `/uploads/[...path]`)
- [x] Blocked-dates calendar (form + `/owner/calendar`)
- [x] My listings tabs, pause/resume/delete rules
- [x] Admin listing approvals

- [x] **Phase 2 done** (browser flow: tools/ui/phase2.mjs)

### Phase 3 — Discovery
- [x] Home rails, categories
- [x] Browse: filters (category, dates, price, deposit, pickup/delivery), search, sort, pagination
- [x] Item page: gallery, prices, calendar, owner card, reviews, CTA (+ S04 unavailable)
- [x] Demo photos (Wikimedia Commons, local copies, `public/demo/CREDITS.md`) + full user/item seed
- [x] Unit checks for pricing/overlap: `npm run test:unit`

- [x] **Phase 3 done**

### Phase 4 — Chat + booking requests
- [x] Chat list + thread, 5 s polling, unread, read receipts, quick replies
- [x] Request card: request / accept / decline / counter / withdraw (chat + O04 owner requests page)
- [x] Held booking (12 h), expiry, cancel, auto-decline overlaps (advisory lock per item)
- [x] Progress bar + Next card; header action badges
- [x] Whole state machine in `lib/bookings.ts` (incl. payment confirm, cancel/no-show money, handover, claims, settlement, extensions) + `lib/jobs.ts` + `/api/cron`
- [x] First versions of `/bookings`, `/bookings/[id]`, `/owner/bookings`, `/owner/bookings/[id]` (stepper + Next card + summary + cancel)
- [x] `npm run e2e` started (Phase 4 cases, 18 checks) — extended in later phases

- [x] **Phase 4 done** (browser: tools/ui/phase4.mjs, two users side by side)

### Phase 5 — ID verification
- [x] `/verify-id` private uploads (R09), status (R10), rejected (S05), resubmit; hold +12 h on submit
- [x] Admin ID review (A02) with Pending/Verified/Rejected tabs, search, pagination; private images 403/401 for others
- [x] Gates: owner panel + listing approval need VERIFIED owner; browse shows only VERIFIED owners; payment gate enforced in Phase 6 before an order is created

- [x] **Phase 5 done** (browser: tools/ui/phase5.mjs)

### Phase 6 — Checkout + payment
- [ ] `/book/[id]` checkout
- [ ] `/pay/[id]` Razorpay / demo / cash; failure + retry
- [ ] Atomic confirm + auto-refund on conflict; cancellation policy

### Phase 7 — Handover + in use + return + claims + jobs
- [ ] Pickup handover (photos, cash tick, OTP)
- [ ] In use (days left, overdue, extension, report problem)
- [ ] Return handover; owner confirm / claim; renter accept / dispute
- [ ] `runDueJobs` + `/api/cron`

### Phase 8 — Money settlement
- [ ] Deposit refund; payouts; admin disputes, payouts, refunds; owner earnings

### Phase 9 — Polish
- [ ] Reviews; static pages; 404; loading/empty/error; 360 px polish; README; LOGINS.md; e2e

---

## Screen map (design file → route → flow step)

The kit as delivered uses `design/renter|owner|admin/*.html` + `css/` + `png/` and shared `design/assets/` (not `user/ html/ screens/ styles/` as the brief guessed). Copied unchanged to `public/design/...`.

| Design file | Route | Flow step / purpose |
|---|---|---|
| R01-Home | `/` | 1 Visit |
| R02-Location | `/location` | 2 Select location once |
| R03-Search | `/browse` | 3 Browse nearby |
| R04-Item | `/items/[id]` | 4–5 Item page + details |
| R05-Login | `/login` (+ `/signup` variant) | auth |
| R06-VerifyOTP | `/verify` | auth |
| R07-Chat | `/chat`, `/chat/[conversationId]` | 6–7 Chat + booking request |
| R08-BookingSummary | `/book/[bookingId]` | 8 Checkout |
| R09-IDVerify | `/verify-id` | 9 ID verification (upload) |
| R10-IDStatus | `/verify-id` (status PENDING/VERIFIED) | 9 |
| S05-IDRejected | `/verify-id` (status REJECTED) | 9 |
| R11-Payment | `/pay/[bookingId]` | 10 Payment |
| S06-PaymentFailed | `/pay/[bookingId]?failed=1` | 10 failure + retry |
| R12-Confirmed | `/bookings/[id]/confirmed` | 10 success |
| R13-MyRentals | `/bookings` | renter list |
| R14-RentalDetail | `/bookings/[id]` (PENDING_PAYMENT/CONFIRMED) | booking page |
| R15-PickupHandover | `/bookings/[id]` (CONFIRMED, pickup day) | 11 Pickup (renter side, OTP) |
| R16-ActiveRental | `/bookings/[id]` (PICKED_UP) | 12 In use |
| S07-LateReturn | `/bookings/[id]` (PICKED_UP + overdue) | 12 overdue |
| R17-ReturnHandover | `/bookings/[id]` (PICKED_UP, return day) | 13 Return (renter OTP) |
| S08-DamageClaim | `/bookings/[id]` (RETURNED + claim OPEN / DISPUTED) | 14 claim accept/dispute |
| R18-DepositRefund | `/bookings/[id]` (RETURN_CONFIRMED / DEPOSIT_REFUNDED) | 15 Refund |
| R19-Review | `/bookings/[id]/review` | 16 Reviews |
| R20-Profile | `/profile` | profile |
| R21-About | `/about` | static |
| R22-HowItWorks | `/how-it-works` | static (linked from home) |
| R23-Contact | `/contact` | static + ContactMessage |
| R24-Terms | `/terms` | static |
| R25-Privacy | `/privacy` | static |
| R26-DepositPolicy | `/deposit-policy` | static (rental, deposit, cancellation policy) |
| R27-404 | `not-found.tsx` | 404 |
| S01-Empty | empty states in lists | — |
| S02-Loading | `loading.tsx` | — |
| S03-Error | `error.tsx` | — |
| S04-Unavailable | `/items/[id]?start&end` when dates are taken | 5 |
| O01-Dashboard | `/owner` | owner dashboard |
| O02-ListItem | `/owner/new`, `/owner/items/[id]/edit` | list an item |
| O03-MyListings | `/owner/listings` | my listings |
| O04-Requests | `/owner/requests` | booking requests |
| O05-Calendar | `/owner/calendar` | calendar |
| O06-Handover | `/owner/bookings/[id]` (CONFIRMED) | 11 Pickup (owner side) |
| O07-ReturnCheck | `/owner/bookings/[id]` (PICKED_UP → RETURNED) | 13–14 Return + confirm |
| O08-Earnings | `/owner/earnings` | earnings |
| O09-Reviews | `/owner/reviews` | reviews |
| A01-Dashboard | `/admin` | admin dashboard |
| A02-IDVerifications | `/admin/ids` | ID review |
| A03-ListingApprovals | `/admin/listings` | listing approvals |
| A04-Users | `/admin/users` | users |
| A05-Bookings | `/admin/bookings` | bookings |
| A06-Disputes | `/admin/disputes` | disputes |
| A07-Payouts | `/admin/payouts` | payouts |

### Screens without a design (built from existing components/classes)
- `/signup` — R05 layout with a name field.
- `/owner/start` — become-an-owner explainer (O-panel styles + R10 status card).
- `/owner/bookings` (tabs) — O03 tabs + list rows.
- Extension request, Report a problem — modal/cards in R16 style.
- Owner claim form — O07 card styles.
- `/admin/complaints` (complaints + contact messages), `/admin/refunds` — A05/A07 table styles.
- Booking "Next:" card + progress bar — R14 stepper styles.

---

## Decisions
- **Request handover mode:** booking requests carry dates only; pickup vs delivery is chosen at checkout (`/book/[id]`), so the held booking starts as PICKUP (or DELIVERY if the item can't be picked up).
- **Counter-offers:** only the owner counters; the renter accepts the counter (which creates the hold) or withdraws. A new request from the renter withdraws their older pending one.
- **Concurrency:** every date-changing transaction takes `pg_advisory_xact_lock(hashtext(itemId))` and re-checks availability inside; status changes use `updateMany where status = current` so double clicks can't apply twice.
- **No-show money:** everything paid is refunded except 1 day's rent, which goes to the owner (brief: "deposit and delivery refunded; 1 day's rent to owner"; the remaining rent is also refunded as the simplest fair reading).
- **Refund records:** `DepositRefund` has a `kind` (DEPOSIT / CANCELLATION / CONFLICT) and a FAILED status so the admin refunds list covers every refund and can retry.
- **Booking pages** use the R14 six-step stepper; chat uses a compact progress bar (`.k-steps`) above the thread.
- **Demo photos** were downloaded once from Wikimedia Commons (`tools/fetch-demo-photos.mjs`) and are served from `public/demo/` — never hotlinked. Credits/licences in `public/demo/CREDITS.md`.
- **Seed safety:** `prisma/seed.ts` wipes only when every user is a `.test` demo account; with real users it only tops up cities/admin/area owners.
- **Nearest area** = difference of the seeded area order within the city (no GPS); browse shows area names, never km.
- **Browse:** filters are a GET form (works without JS). The design's Grid/List toggle and price-slider decoration were left out; numbered pagination instead of "Show more".
- **Item page:** the design's "Weekend" rate and "Kirayo service fee" line are not in the brief, so not shown (renter never sees the platform fee). Pricing math lives in `lib/pricing.ts` (pure, shared by server and client).
- **Item form:** no "Save draft" (no draft status in the brief) and no per-item delivery fee (brief: flat `DELIVERY_FEE`); added the cash-at-pickup toggle. Photos max 8 (brief) instead of the kit text "10".
- **Delete item** = soft delete (`deletedAt`) so past bookings keep their item; blocked when any upcoming/active booking exists. Open requests on a deleted/taken-down item are declined with a SYSTEM message.
- **Resume** of a PAUSED item goes straight back to ACTIVE (it was already approved). Admin "take down" sets REJECTED with reason "Taken down: …".
- **Owner calendar** = the O05 all-items timeline; tapping an empty future day toggles a block.
- **Dev gotcha:** Turbopack sometimes misses a rewritten `layout.tsx` or newly added exports in an existing `'use server'` file (forms then render with no action and submit as GET); restart `npm run dev`.
- **ID upload:** one ID photo (front) + one selfie, as the brief says (the design's optional "back side" slot is not used). ID types follow the brief: Aadhaar / PAN / Driving licence / Passport. The selfie input uses `capture="user"` so phones open the front camera.
- **Login vs sign-up:** `/login` (R05) accepts any email; unknown emails get a SIGNUP code and the verify page (R06) asks for the name, exactly as the design shows. `/signup` is the same R05 card with a name field.
- **First visit:** Home redirects to `/location` until a location is chosen (cookie for guests, saved on the user after login). After first login without a location, the user is sent to `/location`.
- **Profile area** is read-only with a "Change city / area" link (location changes only via the header chip / location page).
- **Browser checks** use `tools/shot.mjs` and `tools/ui/*.mjs` (playwright-core + installed Edge).
- **DB:** port 5432 is Dobara's Postgres (Docker) and 5433 is already used by another local project, so Kirayo uses its own Docker container `kirayo-db` on **5437** (option B, port changed). `DATABASE_URL=postgresql://postgres:postgres@localhost:5437/kirayo?schema=public`.
- **Design CSS loading:** `kirayo.css` + `app.css` are global; each screen's own CSS (`public/design/<sec>/css/<ID>.css`) is linked by that page only (plain `<link>`, removed on navigation) because class names (`.btn`, `.card`…) differ slightly between screens.
- **Header:** the design header has no location chip / chat / badge; the "Where" segment of the design search pill is the location chip (links to `/location`), and a chat icon + action badge are added in the right-hand group using kit styles.
- **Owner nav:** design items "Pickup handover" and "Return check" are booking-page states, so the side nav has "Bookings" (`/owner/bookings`) instead of those two.
