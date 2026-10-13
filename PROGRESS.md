# Kirayo — build progress

**Current phase:** 3 — Discovery (Phase 2 done)

**Next step:** Phase 3 — demo photos in `public/demo/` + fuller seed (owners/items per area), then home rails (R01), browse (R03), item page (R04 + S04).

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
- [ ] Home rails, categories
- [ ] Browse: filters (category, dates, price, deposit, pickup/delivery), search, sort, pagination
- [ ] Item page: gallery, prices, calendar, owner card, reviews, CTA

### Phase 4 — Chat + booking requests
- [ ] Chat list + thread, 5 s polling, unread, read receipts, quick replies
- [ ] Request card: request / accept / decline / counter / withdraw
- [ ] Held booking (12 h), expiry, cancel, auto-decline overlaps
- [ ] Progress bar + Next card; header action badges

### Phase 5 — ID verification
- [ ] `/verify-id` private uploads, status page, resubmit
- [ ] Admin ID review; gates

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
- **Item form:** no "Save draft" (no draft status in the brief) and no per-item delivery fee (brief: flat `DELIVERY_FEE`); added the cash-at-pickup toggle. Photos max 8 (brief) instead of the kit text "10".
- **Delete item** = soft delete (`deletedAt`) so past bookings keep their item; blocked when any upcoming/active booking exists. Open requests on a deleted/taken-down item are declined with a SYSTEM message.
- **Resume** of a PAUSED item goes straight back to ACTIVE (it was already approved). Admin "take down" sets REJECTED with reason "Taken down: …".
- **Owner calendar** = the O05 all-items timeline; tapping an empty future day toggles a block.
- **Dev gotcha:** Turbopack sometimes misses a rewritten `layout.tsx`; restart `npm run dev` if a layout change does not show.
- **Login vs sign-up:** `/login` (R05) accepts any email; unknown emails get a SIGNUP code and the verify page (R06) asks for the name, exactly as the design shows. `/signup` is the same R05 card with a name field.
- **First visit:** Home redirects to `/location` until a location is chosen (cookie for guests, saved on the user after login). After first login without a location, the user is sent to `/location`.
- **Profile area** is read-only with a "Change city / area" link (location changes only via the header chip / location page).
- **Browser checks** use `tools/shot.mjs` and `tools/ui/*.mjs` (playwright-core + installed Edge).
- **DB:** port 5432 is Dobara's Postgres (Docker) and 5433 is already used by another local project, so Kirayo uses its own Docker container `kirayo-db` on **5437** (option B, port changed). `DATABASE_URL=postgresql://postgres:postgres@localhost:5437/kirayo?schema=public`.
- **Design CSS loading:** `kirayo.css` + `app.css` are global; each screen's own CSS (`public/design/<sec>/css/<ID>.css`) is linked by that page only (plain `<link>`, removed on navigation) because class names (`.btn`, `.card`…) differ slightly between screens.
- **Header:** the design header has no location chip / chat / badge; the "Where" segment of the design search pill is the location chip (links to `/location`), and a chat icon + action badge are added in the right-hand group using kit styles.
- **Owner nav:** design items "Pickup handover" and "Return check" are booking-page states, so the side nav has "Bookings" (`/owner/bookings`) instead of those two.
