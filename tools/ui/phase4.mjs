import { chromium } from 'playwright-core';
const [S, RIYA, ARJUN, ITEM] = process.argv.slice(2);
const base = 'http://localhost:3001';
const log = (...a) => console.log(...a);
const b = await chromium.launch({ channel: 'msedge' });
async function as(token, w = 1440) {
  const ctx = await b.newContext({ viewport: { width: w, height: 1000 } });
  await ctx.addCookies([{ name: 'kirayo_session', value: token, url: base }]);
  const p = await ctx.newPage(); p.on('pageerror', (e) => log('PAGEERROR', e.message)); p.on('dialog', (d) => d.accept()); return p;
}
const add = (n) => { const d = new Date(Date.now() + 5.5 * 3600000); d.setUTCDate(d.getUTCDate() + n); return d.toISOString().slice(0, 10); };
const r = await as(RIYA);
const o = await as(ARJUN);
// Riya: item page → pick dates → Request to book → chat with modal pre-filled
await r.goto(`${base}/items/${ITEM}?start=${add(5)}&end=${add(8)}`);
await r.getByRole('link', { name: 'Request to book' }).click();
await r.waitForURL('**/chat/**');
log('1 riya in chat, modal open:', await r.getByRole('dialog').count());
await r.getByRole('button', { name: 'Send booking request' }).click();
await r.getByText('Booking request · from you').waitFor();
log('2 request card shown; next card:', (await r.locator('.k-next').first().innerText()).replace(/\n/g, ' | '));
await r.locator('#msg').fill('Hi! Can I pick it up in the evening?');
await r.getByRole('button', { name: 'Send' }).click();
await r.getByText('Can I pick it up in the evening?').waitFor();
const convUrl = r.url().split('?')[0];
// Arjun: header badge + chat
await o.goto(base + '/');
log('3 arjun header badge:', await o.locator('.k-badge-pill').innerText().catch(() => 'none'), '| unread:', await o.locator('.k-count').innerText().catch(() => '0'));
await o.goto(convUrl);
log('4 arjun next card:', (await o.locator('.k-next').first().innerText()).replace(/\n/g, ' | '));
await o.screenshot({ path: S + '/shots/chat-owner.png', fullPage: true });
await o.getByRole('button', { name: 'Suggest other dates' }).click();
const dlg = o.getByRole('dialog');
const days = dlg.locator('button.day:not([disabled])');
await days.nth(6).click(); await days.nth(9).click();
await dlg.getByRole('button', { name: 'Send suggested dates' }).click();
await o.getByText('Dates you suggested').waitFor();
log('5 owner countered');
// Riya sees it within the 5 s poll + read receipt
await r.getByText(/Counter offer from Arjun/).waitFor({ timeout: 12000 });
log('6 riya got counter by polling; receipt on her text:', await r.getByText(/· Read/).count() > 0);
await r.getByRole('button', { name: 'Accept dates' }).click();
await r.getByText('Dates confirmed — pay within 12 h').waitFor();
log('7 riya next:', (await r.locator('.k-next').first().innerText()).replace(/\n/g, ' | '));
await r.screenshot({ path: S + '/shots/chat-renter.png', fullPage: true });
await o.getByText(/Waiting for Riya to pay/).waitFor({ timeout: 12000 });
log('8 owner sees waiting card');
await r.goto(base + '/bookings');
log('9 riya rentals tab:', await r.locator('[aria-selected=true]').innerText(), '| row:', (await r.locator('article').first().innerText()).replace(/\n/g, ' | ').slice(0, 160));
await r.goto(base + '/');
log('10 riya badge:', await r.locator('.k-badge-pill').getAttribute('title'));
const m = await as(RIYA, 360);
await m.goto(convUrl);
await m.screenshot({ path: S + '/shots/chat-360.png', fullPage: false });
const ov = await m.evaluate(() => document.documentElement.scrollWidth > innerWidth);
log('11 mobile overflow:', ov);
await b.close();
