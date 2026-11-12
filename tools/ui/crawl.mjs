// Crawls same-origin links as one user and reports bad pages:
// HTTP >= 400, uncaught page errors, console errors, horizontal overflow.
//   [THEME=dark] node tools/ui/crawl.mjs <baseUrl> <width> <maxPages> <start> [sessionToken]
import { chromium } from 'playwright-core';

const [BASE, W = '360', MAX = '120', START = '/', TOKEN] = process.argv.slice(2);
const browser = await chromium.launch({ channel: 'msedge' });
const ctx = await browser.newContext({ viewport: { width: Number(W), height: 800 } });
if (TOKEN) await ctx.addCookies([{ name: 'kirayo_session', value: TOKEN, url: BASE }]);
// THEME=dark crawls with the dark theme saved (as if the user toggled it).
if (process.env.THEME) await ctx.addInitScript((t) => localStorage.setItem('kirayo-theme', t), process.env.THEME);
const page = await ctx.newPage();
let errs = [];
page.on('pageerror', (e) => errs.push('pageerror: ' + e.message));
page.on('console', (m) => m.type() === 'error' && errs.push('console: ' + m.text()));
page.on('dialog', (d) => d.dismiss());

// Never follow links that change state or log out.
const skip = (p) => /logout|\/api\/|\/uploads\/|\/demo\/|\.(png|jpe?g|webp|pdf)$/i.test(p);
// Collapse ids so we don't visit 300 near-identical item pages.
const shape = (p) => p.replace(/\/c[a-z0-9]{20,}/g, '/:id').replace(/\?.*$/, (q) => (/[?&](tab|sort|page)=/.test(q) ? q.replace(/[?&](q|page)=[^&]*/g, '') : ''));

const seen = new Set();
const shapes = new Map();
const queue = [START];
let bad = 0;
while (queue.length && seen.size < Number(MAX)) {
  const p = queue.shift();
  if (seen.has(p)) continue;
  seen.add(p);
  errs = [];
  let res;
  try {
    res = await page.goto(BASE + p, { waitUntil: 'networkidle', timeout: 30000 });
  } catch (e) {
    bad++;
    console.log(`FAIL ${p} — ${e.message.split('\n')[0]}`);
    continue;
  }
  const status = res?.status() ?? 0;
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth > innerWidth + 1);
  const problems = [];
  if (status >= 400 && !p.startsWith('/__404')) problems.push(`HTTP ${status}`);
  if (overflow) problems.push('horizontal overflow');
  problems.push(...errs.filter((e) => !/Failed to load resource.*404/.test(e) || status < 400));
  if (problems.length) {
    bad++;
    console.log(`FAIL ${p} — ${problems.join(' | ')}`);
  }
  const links = await page.$$eval('a[href]', (as) => as.map((a) => a.getAttribute('href')));
  for (const h of links) {
    if (!h || !h.startsWith('/') || h.startsWith('//') || skip(h)) continue;
    const clean = h.split('#')[0];
    const s = shape(clean);
    if ((shapes.get(s) ?? 0) >= 2) continue;
    shapes.set(s, (shapes.get(s) ?? 0) + 1);
    if (!seen.has(clean)) queue.push(clean);
  }
}
await browser.close();
console.log(`\nvisited ${seen.size} pages, ${bad} with problems`);
process.exit(bad ? 1 : 0);
