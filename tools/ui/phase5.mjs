import { chromium } from 'playwright-core';
const [S, NEW, ADM, RIYA] = process.argv.slice(2);
const base = 'http://localhost:3001';
const log = (...a) => console.log(...a);
const b = await chromium.launch({ channel: 'msedge' });
async function as(token, w = 1440) {
  const ctx = await b.newContext({ viewport: { width: w, height: 1000 } });
  await ctx.addCookies([{ name: 'kirayo_session', value: token, url: base }]);
  const p = await ctx.newPage(); p.on('pageerror', (e) => log('PAGEERROR', e.message)); p.on('dialog', (d) => d.accept()); return p;
}
const u = await as(NEW);
await u.goto(base + '/owner/new'); log('1 unverified /owner/new ->', u.url());
await u.goto(base + '/verify-id');
await u.getByRole('radio', { name: /PAN card/ }).click();
await u.locator('input[type=file]').nth(0).setInputFiles(`${S}/img0.jpg`);
await u.getByText('Uploaded').first().waitFor();
await u.locator('input[type=file]').last().setInputFiles(`${S}/img1.jpg`);
await u.getByText('Uploaded').nth(1).waitFor();
await u.screenshot({ path: S + '/shots/id-form.png', fullPage: true });
await u.getByRole('button', { name: 'Submit for review' }).click();
await u.waitForURL('**/verify-id?submitted=1');
log('2 status page:', await u.locator('h1').innerText());
const docUrl = await (async () => { const a = await as(ADM); await a.goto(base + '/admin/ids?q=Isha'); const href = await a.locator('a.doc').first().getAttribute('href'); log('3 admin sees doc link:', href?.slice(0, 40)); await a.screenshot({ path: S + '/shots/a-ids.png', fullPage: true });
  // admin can load the private image
  const r = await a.request.get(base + href); log('4 admin GET private:', r.status(), r.headers()['content-type']);
  await a.locator('#rr').selectOption({ index: 0 }); await a.getByRole('button', { name: 'Reject' }).click(); await a.waitForURL(/ok=/); log('5 reject ->', decodeURIComponent(a.url().split('ok=')[1]).replace(/\+/g, ' '));
  await a.goto(base + '/admin/ids'); log('6 pending queue first:', (await a.locator('a.qi').first().innerText()).replace(/\n/g, ' | '));
  return href; })();
const r = await as(RIYA);
const res = await r.request.get(base + docUrl); log('7 another user GET private:', res.status());
const anon = await b.newContext(); const ar = await anon.request.get(base + docUrl); log('8 anonymous GET private:', ar.status());
await u.goto(base + '/verify-id'); log('9 user sees rejected page:', await u.locator('h1').innerText());
await u.screenshot({ path: S + '/shots/id-rejected.png', fullPage: false });
await b.close();
