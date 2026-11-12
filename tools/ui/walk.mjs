// Full browser walk through the real UI (no injected sessions):
//   new user signup → location → owner application → admin approves →
//   ID upload → admin approves ID → owner panel opens ·
//   Arjun lists an item · admin approves · Arjun edits → back to review ·
//   Riya browses → chat request · Arjun counters · Riya accepts → checkout →
//   demo payment · pickup OTP · return OTP · All OK · reviews · earnings ·
//   admin payout.
//
//   node tools/ui/walk.mjs <baseUrl> <serverLogFile> <shotDir>
// OTP codes are read from the server log (`[otp] email -> code`), which is
// printed whenever SMTP is not configured.
import fs from 'node:fs';
import path from 'node:path';
import { chromium } from 'playwright-core';

const [BASE = 'http://localhost:3011', LOG, SHOTS = '.'] = process.argv.slice(2);
const JPGS = fs.readdirSync('public/demo').filter((f) => /\.jpe?g$/i.test(f)).map((f) => path.resolve('public/demo', f));
const [PHOTO, PHOTO2] = JPGS;
const stamp = Date.now().toString(36);
const TITLE = `Walk test drill ${stamp}`;
let failed = 0;
const ok = (m) => console.log('PASS ', m);
const bad = (m) => { failed++; console.log('FAIL ', m); };
const day = (n) => { const d = new Date(Date.now() + 5.5 * 3600000); d.setUTCDate(d.getUTCDate() + n); return d.toISOString().slice(0, 10); };

const browser = await chromium.launch({ channel: 'msedge' });
async function newPage(w = 1280) {
  const ctx = await browser.newContext({ viewport: { width: w, height: 900 } });
  const p = await ctx.newPage();
  p.on('pageerror', (e) => bad(`page error on ${p.url()}: ${e.message}`));
  p.on('dialog', (d) => d.accept());
  // Wait for hydration after every navigation, or file inputs/buttons race React.
  const goto = p.goto.bind(p);
  p.goto = async (...args) => { const res = await goto(...args); await p.waitForLoadState('networkidle'); return res; };
  return p;
}
async function step(name, page, fn) {
  try {
    await fn();
    ok(name);
  } catch (e) {
    bad(`${name} — ${String(e.message).split('\n')[0]}`);
    await page.screenshot({ path: path.join(SHOTS, `fail-${name.replace(/\W+/g, '_')}.png`), fullPage: true }).catch(() => {});
    throw e;
  }
}

async function otpFromLog(email, from) {
  for (let i = 0; i < 40; i++) {
    const lines = fs.readFileSync(LOG).subarray(from).toString('utf8').split('\n').filter((l) => l.includes(`[otp] ${email} -> `));
    if (lines.length) return lines.at(-1).trim().split(' -> ')[1];
    await new Promise((r) => setTimeout(r, 250));
  }
  throw new Error(`no OTP in log for ${email}`);
}

async function login(p, email, name) {
  // Only look at log lines written after this request.
  const from = fs.statSync(LOG).size;
  await p.goto(`${BASE}/login`);
  await p.locator('#em').fill(email);
  await p.getByRole('button', { name: 'Send code' }).click();
  // The app allows one code per email every 30 s; a quick rerun hits that.
  const wait = p.getByRole('alert').filter({ hasText: /Please wait \d+ s/ });
  await Promise.race([p.waitForURL('**/verify'), wait.waitFor()]);
  if (!p.url().includes('/verify')) {
    const s = Number((await wait.innerText()).match(/(\d+) s/)[1]);
    await p.waitForTimeout((s + 1) * 1000);
    await p.getByRole('button', { name: 'Send code' }).click();
    await p.waitForURL('**/verify');
  }
  await p.waitForLoadState('networkidle');
  const code = await otpFromLog(email, from);
  await p.getByLabel('Digit 1').fill(code);
  if (name) await p.locator('#nm').fill(name);
  await p.getByRole('button', { name: 'Verify & continue' }).click();
  await p.waitForURL((u) => !u.pathname.startsWith('/verify'));
}

async function otpDigits(p, title) {
  const label = await p.locator('section#otp [aria-label]').first().getAttribute('aria-label');
  return label.replace(title, '').replace(/\D/g, '');
}

try {
  // 1. Brand-new user: signup by OTP → asked for location once.
  const n = await newPage(360);
  await step('new user: OTP signup → location page', n, async () => {
    await login(n, `walk-${stamp}@kirayo.test`, 'Walk Tester');
    if (!n.url().includes('/location')) throw new Error(`landed on ${n.url()}`);
  });
  await step('new user: pick city + area → home', n, async () => {
    await n.getByRole('radio', { name: /Bengaluru/ }).click();
    await n.getByRole('radio', { name: /Indiranagar/ }).click();
    await n.getByRole('button', { name: /Show items in Indiranagar/ }).click();
    await n.waitForURL((u) => !u.pathname.startsWith('/location'));
    const chip = await n.locator('header').innerText();
    if (!chip.includes('Indiranagar')) throw new Error('header has no location chip');
  });
  await step('360px: home has no horizontal overflow', n, async () => {
    await n.goto(BASE + '/');
    if (await n.evaluate(() => document.documentElement.scrollWidth > innerWidth)) throw new Error('overflow');
  });

  // 1b. The new user applies to become an owner (on a phone).
  const NEW = `walk-${stamp}@kirayo.test`;
  await step('new user: owner panel redirects to /owner/apply', n, async () => {
    await n.goto(BASE + '/owner/new');
    if (!n.url().includes('/owner/apply')) throw new Error(`landed on ${n.url()}`);
  });
  await step('new user: send owner application → under review', n, async () => {
    await n.locator('#oa-phone').fill('+91 98450 00000');
    await n.locator('label.k-pill', { hasText: 'Tools' }).click();
    await n.locator('#oa-plans').fill('A Bosch drill and an aluminium ladder for weekend jobs.');
    await n.locator('input[name=terms]').check();
    await n.getByRole('button', { name: 'Send application' }).click();
    await n.getByText('Application sent.').waitFor();
    await n.getByRole('heading', { name: 'Thanks — we’re reviewing it' }).waitFor();
  });
  const a = await newPage();
  await step('admin: OTP login', a, () => login(a, 'admin@kirayo.test'));
  await step('admin: sidebar badge + approve the owner application', a, async () => {
    await a.goto(`${BASE}/admin`);
    const badge = await a.getByRole('link', { name: /Owner approvals/ }).first().innerText();
    if (!/\d/.test(badge)) throw new Error(`no pending badge: "${badge}"`);
    await a.goto(`${BASE}/admin/owners?q=${encodeURIComponent(NEW)}`);
    await a.getByText('A Bosch drill and an aluminium ladder').waitFor();
    await a.getByRole('button', { name: 'Approve owner' }).click();
    await a.getByText(/Approved Walk Tester as an owner/).waitFor();
  });
  await step('new user: approved → uploads ID + selfie', n, async () => {
    await n.goto(BASE + '/owner/apply');
    await n.getByRole('heading', { name: 'Approved! One last step: your ID' }).waitFor();
    await n.getByRole('link', { name: 'Verify my ID' }).click();
    await n.waitForURL('**/verify-id**');
    await n.waitForLoadState('networkidle');
    const files = n.locator('input[type=file]');
    await files.nth(0).setInputFiles(path.resolve('prisma/seed-assets/sample-id.jpg'));
    await n.getByRole('button', { name: /^Remove / }).first().waitFor();
    await n.locator('input[type=file]').last().setInputFiles(path.resolve('prisma/seed-assets/sample-selfie.jpg'));
    await n.getByRole('button', { name: /^Remove / }).nth(1).waitFor();
    await n.locator('input[name=consent]').check();
    await n.getByRole('button', { name: 'Submit for review' }).click();
    await n.waitForURL((u) => !u.search.includes('next=') || u.pathname !== '/verify-id', { timeout: 15000 }).catch(() => {});
    await n.waitForLoadState('networkidle');
    await n.goto(BASE + '/owner/new');
    if (!n.url().includes('/owner/apply')) throw new Error('panel opened before the ID was approved');
  });
  await step('admin: approve the ID → new owner can open “List an item”', a, async () => {
    await a.goto(`${BASE}/admin/ids?q=${encodeURIComponent(NEW)}`);
    await a.getByRole('button', { name: 'Approve ID' }).click();
    await a.locator('.k-alert.ok').first().waitFor();
    await n.goto(BASE + '/owner/new');
    if (!n.url().includes('/owner/new')) throw new Error(`still gated: ${n.url()}`);
    await n.getByRole('heading', { name: 'List an item' }).waitFor();
  });

  // 2. Arjun lists an item.
  const o = await newPage();
  await step('Arjun: OTP login', o, () => login(o, 'arjun@kirayo.test'));
  await step('Arjun: list a new item → pending review', o, async () => {
    await o.goto(BASE + '/owner/new');
    await o.locator('input[type=file]').first().setInputFiles([PHOTO, PHOTO2]);
    await o.getByText('2/8').waitFor();
    await o.locator('#t').fill(TITLE);
    await o.locator('#c').selectOption('TOOLS');
    await o.locator('#a').selectOption('Bengaluru|Indiranagar');
    await o.locator('#ds').fill('Cordless drill with two batteries, charger and a 20-piece bit set in the case.');
    await o.locator('#pd').fill('300');
    await o.locator('#dp').fill('2000');
    await o.getByRole('button', { name: 'Submit for approval' }).click();
    await o.waitForURL('**/owner/listings**');
    await o.getByText(TITLE).first().waitFor();
  });

  // 3. Admin approves it; an edit sends it back to review.
  async function approveListing() {
    await a.goto(`${BASE}/admin/listings?q=${encodeURIComponent(TITLE)}`);
    const card = a.locator('article').filter({ hasText: TITLE }).last();
    await card.getByRole('button', { name: 'Approve' }).click();
    await a.locator('.k-alert.ok').first().waitFor();
    await a.goto(`${BASE}/admin/listings?tab=live&q=${encodeURIComponent(TITLE)}`);
    await a.getByText(TITLE).first().waitFor();
  }
  await step('admin: approve the new listing', a, approveListing);
  await step('Arjun: edit the live item → back to pending review', o, async () => {
    await o.goto(`${BASE}/owner/listings?tab=active`);
    const href = await o.evaluate((t) => {
      for (const l of document.querySelectorAll('a[href$="/edit"]')) {
        let box = l.parentElement;
        while (box && !box.textContent.includes(t)) box = box.parentElement;
        if (box && box.querySelectorAll('a[href$="/edit"]').length === 1) return l.getAttribute('href');
      }
      return null;
    }, TITLE);
    if (!href) throw new Error('no edit link');
    await o.goto(BASE + href);
    await o.locator('#pd').fill('320');
    await o.getByRole('button', { name: 'Submit for approval' }).click();
    await o.waitForURL('**/owner/listings?tab=pending**');
    await o.getByText(TITLE).first().waitFor();
  });
  await step('admin: re-approve the edited listing', a, approveListing);

  // 4. Riya finds it and sends a request.
  const r = await newPage();
  await step('Riya: OTP login', r, () => login(r, 'riya@kirayo.test'));
  let itemUrl = '';
  await step('Riya: browse search finds the item', r, async () => {
    await r.goto(`${BASE}/browse?q=${encodeURIComponent(stamp)}`);
    await r.getByText(TITLE).first().click();
    await r.waitForURL('**/items/**');
    itemUrl = r.url().split('?')[0];
  });
  await step('360px: item gallery swipes (dots + counter)', n, async () => {
    await n.goto(itemUrl);
    const strip = n.locator('.k-swipe');
    await strip.waitFor();
    await strip.evaluate((el) => el.scrollTo({ left: el.clientWidth }));
    await n.getByText('2 / 2').waitFor();
    await n.getByRole('tab', { name: 'Photo 1' }).click();
    await n.getByText('1 / 2').waitFor();
  });
  await step('browse: sort by price (low → high) holds across pages', r, async () => {
    await r.goto(`${BASE}/browse?sort=price`);
    const p1 = await r.locator('a.k-card[data-price]').evaluateAll((as) => as.map((x) => Number(x.dataset.price)));
    if (p1.length < 2 || p1.some((v, i) => i && v < p1[i - 1])) throw new Error(`page 1 not sorted: ${p1}`);
    await r.getByRole('navigation', { name: 'Pages' }).getByRole('link', { name: '2', exact: true }).click();
    await r.waitForURL(/page=2/);
    const p2 = await r.locator('a.k-card[data-price]').evaluateAll((as) => as.map((x) => Number(x.dataset.price)));
    if (!p2.length || p2[0] < p1.at(-1) || !r.url().includes('sort=price')) throw new Error(`page 2 broke the order: ${p2.slice(0, 3)} after ${p1.at(-1)}`);
    await r.goto(`${BASE}/browse?sort=price_desc`);
    const pd = await r.locator('a.k-card[data-price]').evaluateAll((as) => as.map((x) => Number(x.dataset.price)));
    if (pd.some((v, i) => i && v > pd[i - 1])) throw new Error(`desc not sorted: ${pd}`);
  });
  await step('Riya: request to book from item page → chat', r, async () => {
    await r.goto(`${itemUrl}?start=${day(0)}&end=${day(2)}`);
    await r.getByRole('link', { name: 'Request to book' }).click();
    await r.waitForURL('**/chat/**');
    await r.getByRole('button', { name: 'Send booking request' }).click();
    await r.getByText('Booking request · from you').first().waitFor();
    await r.locator('#msg').fill('Hi Arjun, can I pick it up this evening?');
    await r.getByRole('button', { name: 'Send' }).click();
    await r.getByText('can I pick it up this evening?').last().waitFor();
  });
  const chatUrl = r.url().split('?')[0].split('#')[0];

  // 5. Arjun counters, Riya accepts (counter arrives by polling).
  await step('Arjun: sees message + counters with other dates', o, async () => {
    await o.goto(chatUrl);
    await o.getByText('can I pick it up this evening?').last().waitFor();
    await o.getByRole('button', { name: 'Suggest other dates' }).click();
    const dlg = o.getByRole('dialog');
    const days = dlg.locator('button.day:not([disabled])');
    await days.nth(0).click();
    await days.nth(3).click();
    await dlg.getByRole('button', { name: 'Send suggested dates' }).click();
    await o.getByText('Dates you suggested').first().waitFor();
  });
  await step('Riya: her message shows “Read ✓✓” after Arjun opened the chat', r, async () => {
    await r.getByText(/Read ✓✓/).first().waitFor({ timeout: 15000 });
  });
  await step('Riya: counter arrives via polling, accepts', r, async () => {
    await r.getByText(/Counter offer from Arjun/).first().waitFor({ timeout: 15000 });
    await r.getByRole('button', { name: 'Accept dates' }).click();
    await r.getByText('Dates confirmed — pay within 12 h').first().waitFor();
    await r.getByRole('status', { name: 'Deal pakki — agreed by both' }).getByRole('link', { name: 'Pay to confirm' }).waitFor();
  });
  await step('Arjun: “Deal pakki ✓✓” card arrives by polling', o, async () => {
    await o.getByRole('status', { name: 'Deal pakki — agreed by both' }).waitFor({ timeout: 15000 });
  });

  // 6. Checkout + demo payment.
  let bookingId = '';
  await step('Riya: checkout → demo payment → confirmed', r, async () => {
    await r.getByRole('link', { name: 'Continue to booking' }).click();
    await r.waitForURL('**/book/**');
    bookingId = r.url().split('/book/')[1].split(/[?#]/)[0];
    await r.getByRole('status', { name: 'Deal confirmed by both' }).waitFor();
    const ph = r.locator('#ph');
    if (!(await ph.inputValue())) await ph.fill('+91 98450 12345');
    await r.locator('input[name=terms]').check();
    await r.getByRole('button', { name: 'Continue to payment' }).click();
    await r.waitForURL('**/pay/**');
    await r.locator('button.btn-p').first().click();
    await r.waitForURL('**/confirmed');
  });

  // 7. Pickup handover.
  let pickup = '';
  await step('Riya: pickup OTP visible on booking page', r, async () => {
    await r.goto(`${BASE}/bookings/${bookingId}`);
    pickup = await otpDigits(r, 'Your pickup code');
    if (pickup.length !== 4) throw new Error(`code "${pickup}"`);
  });
  async function photos(page) {
    await page.locator('#handover input[type=file]').first().setInputFiles([PHOTO, PHOTO]);
    await page.getByText(/^2\/\d+ ·/).first().waitFor();
    await page.getByRole('button', { name: /Save photos|Update photos/ }).first().click();
    await page.waitForLoadState('networkidle');
    await page.getByText('2 saved').first().waitFor();
  }
  await step('Arjun: pickup photos + Riya’s OTP → picked up', o, async () => {
    await o.goto(`${BASE}/owner/bookings/${bookingId}`);
    await photos(o);
    await o.getByLabel('Digit 1').fill(pickup);
    await o.getByRole('button', { name: 'Confirm handover' }).click();
    await o.getByText(/Out on rent|day.? left/).first().waitFor();
  });

  // 8. Return handover.
  let ret = '';
  await step('Riya: return OTP visible', r, async () => {
    await r.goto(`${BASE}/bookings/${bookingId}`);
    ret = await otpDigits(r, 'Your return code');
    if (ret.length !== 4) throw new Error(`code "${ret}"`);
  });
  await step('Arjun: return photos + OTP → returned → All OK', o, async () => {
    await o.goto(`${BASE}/owner/bookings/${bookingId}`);
    await photos(o);
    await o.getByLabel('Digit 1').fill(ret);
    await o.getByRole('button', { name: 'Confirm return' }).click();
    await o.getByRole('button', { name: /All OK/ }).click();
    await o.getByText('Settlement').first().waitFor();
  });

  // 9. Reviews.
  await step('Riya: reviews owner + item', r, async () => {
    await r.goto(`${BASE}/bookings/${bookingId}/review`);
    await r.getByRole('button', { name: '5 stars' }).first().click();
    await r.getByRole('button', { name: 'Submit review' }).first().click();
    await r.waitForLoadState('networkidle');
    await r.goto(`${BASE}/bookings/${bookingId}`);
    if (await r.getByRole('link', { name: /Rate|review/i }).count()) throw new Error('still asks for a review');
  });
  await step('Arjun: reviews renter', o, async () => {
    await o.goto(`${BASE}/owner/bookings/${bookingId}/review`);
    await o.getByRole('button', { name: '4 stars' }).first().click();
    await o.getByRole('button', { name: 'Submit review' }).first().click();
    await o.waitForLoadState('networkidle');
  });

  // 10. Earnings + admin payout.
  let code = '';
  await step('Arjun: earnings lists the new payout', o, async () => {
    code = (await o.goto(`${BASE}/owner/bookings/${bookingId}`), (await o.locator('body').innerText()).match(/KR-[A-Z0-9-]+|K[A-Z0-9]{5,}/)?.[0] ?? '');
    await o.goto(`${BASE}/owner/earnings`);
    await o.getByText(TITLE).first().waitFor();
  });
  await step('admin: mark the payout paid', a, async () => {
    await a.goto(`${BASE}/admin/payouts?q=${encodeURIComponent(code)}`);
    const row = a.locator('tr, article, .card').filter({ hasText: TITLE }).last();
    await row.locator('input[name=reference]').fill(`UTR${stamp}`);
    await row.getByRole('button', { name: 'Mark paid' }).click();
    await a.getByText(/^Marked .* as paid\.$/).waitFor();
    await a.goto(`${BASE}/admin/payouts?tab=paid&q=${encodeURIComponent(`UTR${stamp}`)}`);
    await a.getByText(`UTR${stamp}`).first().waitFor();
  });
  await step('admin: dashboard + every admin page loads', a, async () => {
    for (const p of ['', '/ids', '/listings', '/users', '/bookings', '/disputes', '/complaints', '/payouts', '/refunds']) {
      const res = await a.goto(`${BASE}/admin${p}`);
      if (!res || res.status() >= 400) throw new Error(`/admin${p} → ${res?.status()}`);
    }
  });
} catch {
  /* already reported */
}
await browser.close();
console.log(`\n${failed ? 'FAILED' : 'ALL PASSED'} (${failed} failure${failed === 1 ? '' : 's'})`);
process.exit(failed ? 1 : 0);
