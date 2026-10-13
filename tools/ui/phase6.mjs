import { chromium } from 'playwright-core';
const [S, RIYA, ARJUN] = process.argv.slice(2);
const base = 'http://localhost:3001';
const log = (...a) => console.log(...a);
const b = await chromium.launch({ channel: 'msedge' });
async function as(token, w = 1440) {
  const ctx = await b.newContext({ viewport: { width: w, height: 1000 } });
  await ctx.addCookies([{ name: 'kirayo_session', value: token, url: base }]);
  const p = await ctx.newPage(); p.on('pageerror', (e) => log('PAGEERROR', e.message)); p.on('dialog', (d) => d.accept()); return p;
}
const r = await as(RIYA);
await r.goto(base + '/bookings?tab=action');
await r.getByRole('link', { name: 'Continue to booking' }).first().click();
await r.waitForURL('**/book/**'); const bookUrl = r.url(); const id = bookUrl.split('/book/')[1];
log('1 checkout', id);
const del = r.getByText(/Owner delivers and collects/);
if (await del.count()) { await del.click(); await r.getByLabel('Delivery address').fill('Flat 4B, Lakshmi Residency, HAL 2nd Stage, Indiranagar 560008'); }
log('  total shown:', await r.locator('.kv', { hasText: 'Total to pay' }).innerText());
await r.screenshot({ path: S + '/shots/checkout.png', fullPage: true });
await r.getByRole('checkbox').check();
await r.getByRole('button', { name: 'Continue to payment' }).click();
await r.waitForURL('**/pay/**'); log('2 pay page');
await r.screenshot({ path: S + '/shots/pay.png', fullPage: true });
await r.getByRole('button', { name: 'Simulate failed payment' }).click();
await r.waitForURL('**failed=1**'); log('3 failed page:', await r.locator('h1').innerText());
await r.screenshot({ path: S + '/shots/pay-failed.png', fullPage: false });
await r.getByRole('link', { name: 'Try again' }).click();
await r.waitForURL(`**/pay/${id}`);
await r.getByRole('button', { name: /^Pay ₹/ }).click();
await r.waitForURL('**/confirmed'); log('4 confirmed:', await r.locator('h1').innerText(), '| code digits:', await r.locator('.dg').count());
await r.screenshot({ path: S + '/shots/confirmed.png', fullPage: true });
await r.goto(base + `/bookings/${id}`); log('5 rental next:', (await r.locator('.k-next').innerText()).replace(/\n/g, ' | '));
await r.screenshot({ path: S + '/shots/rental.png', fullPage: true });
const o = await as(ARJUN);
await o.goto(base + `/owner/bookings/${id}`); log('6 owner next:', (await o.locator('.k-next').innerText()).replace(/\n/g, ' | '));
await o.screenshot({ path: S + '/shots/owner-booking.png', fullPage: true });
await b.close();
