// Home page checks in a real browser: scroll reveal, CountUp, carousel
// (autoplay, pause on hover, hidden tab, arrows/keys, swipe), reduced motion,
// no overflow at 360 px.   node tools/ui/home-check.mjs <baseUrl> <shotDir> <sessionToken>
import path from 'node:path';
import { chromium } from 'playwright-core';

const [BASE = 'http://localhost:3011', SHOTS = '.', TOKEN] = process.argv.slice(2);
let failed = 0;
const check = (name, ok, extra = '') => { if (!ok) failed++; console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${!ok && extra ? ` — ${extra}` : ''}`); };
const browser = await chromium.launch({ channel: 'msedge' });

async function page(width, opts = {}) {
  const ctx = await browser.newContext({ viewport: { width, height: 860 }, ...opts });
  if (TOKEN) await ctx.addCookies([{ name: 'kirayo_session', value: TOKEN, url: BASE }]);
  const p = await ctx.newPage();
  const errors = [];
  p.on('pageerror', (e) => errors.push(e.message));
  p.on('console', (m) => m.type() === 'error' && errors.push(m.text()));
  await p.goto(BASE + '/', { waitUntil: 'networkidle' });
  return { p, errors };
}
const active = (p) => p.locator('.kh-slide[data-on]').getAttribute('aria-label');
async function scrollThrough(p) {
  const h = await p.evaluate(() => document.body.scrollHeight);
  for (let y = 0; y < h; y += 500) { await p.evaluate((v) => scrollTo(0, v), y); await p.waitForTimeout(120); }
  await p.waitForTimeout(1600);
  await p.evaluate(() => scrollTo(0, 0));
}

for (const w of [1280, 360]) {
  const { p, errors } = await page(w);
  const below = p.locator('.kh-cats > li').first();
  check(`${w}px: below-fold content waits for scroll`, (await p.locator('.kh-cats').getAttribute('data-reveal')) === 'wait');
  await scrollThrough(p);
  check(`${w}px: revealed after scrolling`, (await p.locator('.k-reveal[data-reveal="wait"]').count()) === 0 && Number(await below.evaluate((e) => getComputedStyle(e).opacity)) === 1);
  const stat = await p.locator('.kh-stats b').first().innerText();
  const label = await p.locator('.kh-stats b > span').first().getAttribute('aria-label');
  check(`${w}px: CountUp ends on the real number`, stat === label, `${stat} vs ${label}`);
  check(`${w}px: no horizontal overflow`, !(await p.evaluate(() => document.documentElement.scrollWidth > innerWidth)));
  await p.screenshot({ path: path.join(SHOTS, `home-${w}.png`), fullPage: true });
  check(`${w}px: no console errors`, errors.length === 0, errors.join(' | '));
}

{
  const { p } = await page(1280);
  const first = await active(p);
  await p.mouse.move(5, 500); // away from the carousel
  await p.waitForTimeout(6600);
  const second = await active(p);
  check('autoplay advances after 6 s', first !== second, `${first} → ${second}`);
  await p.locator('.kh-hero').hover();
  await p.waitForTimeout(6600);
  check('pauses while hovered', (await active(p)) === second);
  await p.getByRole('button', { name: 'Next slide' }).click();
  check('next arrow', (await active(p)) !== second);
  await p.keyboard.press('ArrowLeft');
  check('← key goes back', (await active(p)) === second);
  await p.getByRole('button', { name: /Show slide 4/ }).click();
  check('dot jumps to slide 4', (await active(p)).startsWith('4 of 4'));
  await p.keyboard.press('ArrowRight');
  check('wraps around 4 → 1', (await active(p)).startsWith('1 of 4'));
  check('inactive slides are inert', (await p.locator('.kh-slide[inert]').count()) === 3);
  // Hidden tab: no advance.
  await p.mouse.move(5, 500);
  await p.evaluate(() => { Object.defineProperty(document, 'visibilityState', { value: 'hidden', configurable: true }); document.dispatchEvent(new Event('visibilitychange')); });
  const before = await active(p);
  await p.waitForTimeout(6600);
  check('pauses while the tab is hidden', (await active(p)) === before);
  await p.evaluate(() => { Object.defineProperty(document, 'visibilityState', { value: 'visible', configurable: true }); document.dispatchEvent(new Event('visibilitychange')); });
  await p.getByRole('button', { name: 'Pause slideshow' }).click();
  await p.mouse.move(5, 500);
  await p.waitForTimeout(6600);
  check('pause button stops autoplay', (await active(p)) === before);
}

{
  const { p } = await page(360, { hasTouch: true, isMobile: true });
  const a = await active(p);
  const box = await p.locator('.kh-track').boundingBox();
  const y = box.y + box.height / 2;
  await p.locator('.kh-track').dispatchEvent('pointerdown', { pointerType: 'touch', clientX: box.x + 300, clientY: y });
  await p.locator('.kh-track').dispatchEvent('pointerup', { pointerType: 'touch', clientX: box.x + 60, clientY: y });
  check('swipe left → next slide', (await active(p)) !== a);
}

{
  const { p, errors } = await page(1280, { reducedMotion: 'reduce' });
  check('reduced motion: nothing hidden for reveal', (await p.locator('.k-reveal[data-reveal]').count()) === 0);
  check('reduced motion: no pause button (no autoplay)', (await p.getByRole('button', { name: 'Pause slideshow' }).count()) === 0);
  const a = await active(p);
  await p.mouse.move(5, 500);
  await p.waitForTimeout(6600);
  check('reduced motion: slides do not auto-advance', (await active(p)) === a);
  const anim = await p.locator('.kh-float').first().evaluate((e) => getComputedStyle(e).animationName);
  check('reduced motion: illustrations are still', anim === 'none', anim);
  await p.screenshot({ path: path.join(SHOTS, 'home-reduced.png'), fullPage: true });
  check('reduced motion: no console errors', errors.length === 0, errors.join(' | '));
}

// Dark / light mode, premium interactions and the new home sections.
{
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 860 }, colorScheme: 'light' });
  if (TOKEN) await ctx.addCookies([{ name: 'kirayo_session', value: TOKEN, url: BASE }]);
  const p = await ctx.newPage();
  const errors = [];
  p.on('pageerror', (e) => errors.push(e.message));
  p.on('console', (m) => m.type() === 'error' && errors.push(m.text()));
  await p.goto(BASE + '/', { waitUntil: 'networkidle' });
  const theme = () => p.evaluate(() => document.documentElement.dataset.theme);
  check('theme: follows the OS (light) on first visit', (await theme()) === 'light');
  const bgLight = await p.evaluate(() => getComputedStyle(document.body).backgroundColor);
  await p.getByRole('button', { name: 'Switch to dark mode' }).first().click();
  await p.waitForTimeout(900);
  const bgDark = await p.evaluate(() => getComputedStyle(document.body).backgroundColor);
  check('theme: toggle switches to dark and the page really changes colour', (await theme()) === 'dark' && bgLight !== bgDark, `${bgLight} → ${bgDark}`);
  // Saved choice is applied before first paint (no flash): check the attribute as the HTML is parsed.
  const firstPaint = await p.evaluate(async (url) => {
    const html = await (await fetch(url)).text();
    // Inside <head>, before any body content: it runs before the first paint.
    const at = html.indexOf('kirayo-theme');
    return at > 0 && at < html.indexOf('</head>');
  }, BASE + '/');
  check('theme: boot script runs in <head>, before first paint (no flash)', firstPaint);
  await p.reload({ waitUntil: 'networkidle' });
  check('theme: dark choice survives a reload', (await theme()) === 'dark');
  await p.goto(BASE + '/browse', { waitUntil: 'networkidle' });
  check('theme: dark on other pages too', (await theme()) === 'dark');
  await p.getByRole('button', { name: 'Switch to light mode' }).first().click();
  await p.waitForTimeout(900);
  check('theme: back to light', (await theme()) === 'light');

  await p.goto(BASE + '/', { waitUntil: 'networkidle' });
  await p.evaluate(() => scrollTo(0, 400));
  await p.waitForTimeout(400);
  check('header turns to glass after scrolling', (await p.evaluate(() => document.documentElement.dataset.scrolled)) === '1' && (await p.locator('.k-site-hdr').evaluate((h) => getComputedStyle(h).position)) === 'sticky');
  const mq1 = await p.locator('.kh-marquee-track').evaluate((e) => new DOMMatrix(getComputedStyle(e).transform).m41);
  await p.waitForTimeout(700);
  const mq2 = await p.locator('.kh-marquee-track').evaluate((e) => new DOMMatrix(getComputedStyle(e).transform).m41);
  check('marquee is moving', mq1 !== mq2);
  const occ = p.locator('.kh-occ-c').first();
  await occ.scrollIntoViewIfNeeded();
  await p.waitForTimeout(900);
  const box = await occ.boundingBox();
  await p.mouse.move(box.x + box.width * 0.8, box.y + box.height * 0.2);
  await p.mouse.move(box.x + box.width * 0.85, box.y + box.height * 0.25);
  await p.waitForTimeout(200);
  check('occasion card tilts under the mouse', (await occ.getAttribute('data-tilting')) === '1' && (await occ.evaluate((e) => getComputedStyle(e).transform)) !== 'none');
  check('occasions show real prices', /from ₹[\d,]+\/day/.test(await p.locator('.kh-occ').innerText()));
  await p.locator('.kh-calc').scrollIntoViewIfNeeded();
  await p.waitForTimeout(900);
  const before = await p.locator('.kh-calc .k-sr').innerText();
  await p.locator('#calc-days').fill('20');
  await p.waitForTimeout(700);
  const after = await p.locator('.kh-calc .k-sr').innerText();
  check('earnings calculator updates', before !== after && /₹[\d,]+ a month/.test(after), `${before} → ${after}`);
  const faq = p.locator('.kh-faq details').first();
  await faq.locator('summary').scrollIntoViewIfNeeded();
  await p.waitForTimeout(900);
  await faq.locator('summary').click();
  check('FAQ opens', await faq.evaluate((d) => d.open));
  check('trending rail is ranked', (await p.locator('.kh-rank').count()) > 2);
  check('new sections: no console errors', errors.length === 0, errors.join(' | ').slice(0, 300));
  await ctx.close();
}

// Site-wide motion (components/SiteMotion.tsx): blocks animate in on every page.
const peak = (p) => p.evaluate(() => new Promise((ok) => {
  let max = 0;
  const t0 = performance.now();
  (function f() { max = Math.max(max, document.getAnimations().filter((a) => a.effect?.target?.closest?.('main')).length); performance.now() - t0 < 1500 ? requestAnimationFrame(f) : ok(max); })();
}));
for (const path of ['/browse', '/bookings', '/how-it-works']) {
  for (const reduce of [false, true]) {
    const ctx = await browser.newContext({ viewport: { width: 1280, height: 860 }, reducedMotion: reduce ? 'reduce' : 'no-preference' });
    if (TOKEN) await ctx.addCookies([{ name: 'kirayo_session', value: TOKEN, url: BASE }]);
    const p = await ctx.newPage();
    const errors = [];
    p.on('pageerror', (e) => errors.push(e.message));
    p.on('console', (m) => m.type() === 'error' && errors.push(m.text()));
    await p.goto(BASE + path, { waitUntil: 'load' });
    const n = await peak(p);
    check(`${path}: ${reduce ? 'reduced motion → no animations' : 'content animates in'}`, reduce ? n === 0 : n > 0, `${n} animations`);
    if (!reduce) {
      await p.evaluate(() => scrollTo(0, document.body.scrollHeight));
      await p.waitForTimeout(1200);
      const hidden = await p.evaluate(() => [...document.querySelectorAll('main *')].filter((e) => e.getBoundingClientRect().top < innerHeight && e.getBoundingClientRect().bottom > 0 && getComputedStyle(e).opacity === '0').length);
      check(`${path}: nothing left invisible after scrolling`, hidden === 0, `${hidden} hidden`);
    }
    check(`${path}: no console errors (${reduce ? 'reduced' : 'normal'})`, errors.length === 0, errors.join(' | ').slice(0, 300));
    await ctx.close();
  }
}

await browser.close();
console.log(`\n${failed ? 'FAILED' : 'ALL PASSED'} (${failed} failure${failed === 1 ? '' : 's'})`);
process.exit(failed ? 1 : 0);
