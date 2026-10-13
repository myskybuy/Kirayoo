// Dev helper: screenshots pages of the running app at 360 and 1440 px.
// Usage: node tools/shot.mjs <outDir> <path>[@token] ...
//   token (optional) = a Session.token to log in as that user.
import { chromium } from 'playwright-core';
const [outDir, ...paths] = process.argv.slice(2);
const base = process.env.APP_URL || 'http://localhost:3001';
const browser = await chromium.launch({ channel: 'msedge' });
for (const raw of paths) {
  const [p, token] = raw.split('@');
  for (const w of (process.env.WIDTHS || '1440,360').split(',').map(Number)) {
    const ctx = await browser.newContext({ viewport: { width: w, height: 900 } });
    if (token) await ctx.addCookies([{ name: 'kirayo_session', value: token, url: base }]);
    const page = await ctx.newPage();
    const errors = [];
    page.on('pageerror', (e) => errors.push(e.message));
    page.on('console', (m) => m.type() === 'error' && errors.push(m.text()));
    const res = await page.goto(base + p, { waitUntil: 'networkidle' });
    const name = `${outDir}/${p.replace(/[^a-z0-9]+/gi, '_') || 'home'}_${w}.png`;
    await page.screenshot({ path: name, fullPage: process.env.FULL !== '0' });
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth);
    console.log(`${res?.status()} ${p} @${w} -> ${name}${overflow ? '  [HORIZONTAL OVERFLOW]' : ''}${errors.length ? '  ERR: ' + errors.slice(0, 3).join(' | ') : ''}`);
    await ctx.close();
  }
}
await browser.close();
