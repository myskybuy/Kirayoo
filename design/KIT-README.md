# Kirayo: design kit

Static export of the Kirayo canvas (Renter website, Owner panel, Admin).
Open `design/index.html` in a browser to see every screen as a gallery.

## Folder structure

```
design/
  index.html              gallery of all screens (thumbnails link to the HTML)
  screens.json            list of screens: id, section, title
  assets/
    css/kirayo.css        fonts (@font-face) + design tokens as CSS variables
    fonts/                Bricolage Grotesque + Plus Jakarta Sans (variable, SIL OFL; licences included)
    icons/                52 SVG icons (24px grid, 1.8 stroke, currentColor) + logo-mark.svg / logo-mark-light.svg
  renter/                 R01–R27 pages + S01–S08 states (empty, loading, error, unavailable, ID rejected, payment failed, late return, damage claim)
    R01-Home.html …       static HTML, one file per screen
    css/R01-Home.css …    that screen's own styles
    png/R01-Home.png …    full-page screenshot at 1440px width
  owner/                  O01–O09 (same layout: *.html, css/, png/)
  admin/                  A01–A07 (same layout: *.html, css/, png/)
```

Every HTML file loads `../assets/css/kirayo.css` first, then its own `css/<ID>.css`.
Links between screens work inside the kit (e.g. Item → Login → Chat → Booking summary).

## Notes for the developer

- **Static snapshots.** Each HTML shows one default state. The interactive parts in the canvas prototype (date picking with live price, accept counter-offer, OTP success/error, tabs, admin approve/reject) are frozen at their first state. The important alternate states have their own screens (S01–S08); the rest can be clicked through on the canvas.
- **Inline styles.** Layout values are inline on elements, exactly as designed; repeated components (buttons, chips, badges, cards) use the small class sets in each page CSS. When building, turn these into your components (header, footer, item card, list row, owner/admin side nav, mobile tab bar).
- **Responsive.** Pages are fluid: flex-wrap + `auto-fill` grids, max-width containers, side menus stack on phones, wide tables scroll inside their box. The mobile bottom tab bar appears under 720px.
- **Photos are placeholders** (tinted blocks with a label). Swap in real images with the same aspect ratios (item card 4:3, item page mosaic 1 large + 4 small).
- **Fonts are self-hosted** (`.woff` variable fonts), so no Google Fonts request is needed.
- **Sample data** is Indian (INR, Indiranagar / Koramangala / Sector 62 Noida / Andheri). Legal pages contain blanks like `[COMPANY LEGAL NAME]` and `[X]%` to fill in.
- **Links to screens outside this kit** (mobile frames, design system page) point to `#`.

## Design tokens (also in kirayo.css)

| Token | Value | Use |
|---|---|---|
| Forest 700 | `#1F4D3A` | primary, headings, selected |
| Forest 800 | `#163A2B` | hover / pressed |
| Sage 300 / 200 / 100 | `#BFD1BD` `#DCE6DA` `#EEF3EC` | borders on green, icon circles, quiet fills |
| Tangerine 600 / 700 | `#C9491F` `#A93C18` | CTA fill (white text) / hover |
| Coral 400 | `#E8643C` | decoration only |
| Cream / Sand / Paper | `#F6F1E7` `#EDE5D5` `#FFFDF8` | page / footer, booked days / cards |
| Line | `#E3DACA` | dividers |
| Charcoal / Ink 2 / Mute | `#23262A` `#474C52` `#60666C` | text |
| Success | `#DCEEDF` / `#1E5A37` | tint / text |
| Warning | `#FBEBCF` / `#7A4708` | tint / text |
| Danger | `#F7DCD7` / `#8E2A20`, fill `#B3372B` | tint / text |
| Radius | 14 inputs · 20 images · 24 cards · 32 panels · pill | |
| Type | Bricolage Grotesque (headings) · Plus Jakarta Sans (body) | |

## Screen list

**Renter (35):** R01 Home · R02 Select location · R03 Browse/search · R04 Item detail · R05 Login · R06 Verify OTP · R07 Chat + booking request · R08 Booking summary · R09 ID verification · R10 ID status · R11 Payment · R12 Booking confirmed · R13 My rentals · R14 Rental detail · R15 Pickup handover · R16 Active rental · R17 Return handover · R18 Deposit refund · R19 Review · R20 Profile · R21 About · R22 How it works · R23 Contact · R24 Terms · R25 Privacy · R26 Rental & deposit policy · R27 404 · S01 Empty · S02 Loading · S03 Error · S04 Unavailable for dates · S05 ID rejected · S06 Payment failed · S07 Late return · S08 Damage claim

**Owner (9):** O01 Dashboard · O02 List an item · O03 My listings · O04 Booking requests · O05 Calendar · O06 Pickup handover · O07 Return check · O08 Earnings & payouts · O09 Reviews

**Admin (7):** A01 Dashboard · A02 ID verifications · A03 Listing approvals · A04 Users · A05 Bookings · A06 Deposit disputes · A07 Payouts
