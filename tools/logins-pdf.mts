// Builds Kirayo-Logins.pdf (URLs + every demo login) from the live DB,
// printed by Edge.   npm run logins:pdf   (re-run after db:reset)
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { PrismaClient } from '@prisma/client';
import { chromium } from 'playwright-core';

const [OUT_PDF = 'Kirayo-Logins.pdf', TMP_DIR = os.tmpdir()] = process.argv.slice(2);
const BASE = 'http://localhost:3001';
const p = new PrismaClient();
const esc = (s: string) => s.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]!);

const users = await p.user.findMany({
  where: { email: { endsWith: '@kirayo.test' } },
  include: { _count: { select: { items: { where: { status: 'ACTIVE', deletedAt: null } } } } },
  orderBy: [{ city: 'asc' }, { area: 'asc' }, { email: 'asc' }],
});
const cities = await p.city.findMany({ orderBy: { sortOrder: 'asc' }, include: { areas: { orderBy: { sortOrder: 'asc' } } } });
await p.$disconnect();

const KEY: [string, string, string, string][] = [
  ['admin@kirayo.test', 'Admin', '/admin', 'Approve owner applications, IDs and listings; decide disputes; pay payouts; resolve complaints.'],
  ['arjun@kirayo.test', 'Seller (main demo)', '/owner', '16 live items in Bengaluru + Mumbai. Answer requests, hand over with OTP, check returns, earnings.'],
  ['riya@kirayo.test', 'Renter (main demo)', '/bookings', 'A booking in every state: pay, pickup OTP, in use, overdue, claim, reviews.'],
  ['kabir@kirayo.test', 'Seller application pending', '/owner/apply', 'ID verified. Admin approves the application at /admin/owners, then they can list.'],
  ['neha@kirayo.test', 'Application + ID pending', '/owner/apply', 'Chat works; paying and listing are blocked until the admin approves both.'],
  ['vikram@kirayo.test', 'Application + ID rejected', '/owner/apply', 'Both rejected with a reason: re-upload the ID and resend the application.'],
];

const URLS: [string, string, string][] = [
  ['Everyone', '/login', 'Log in / sign up (email + one-time code)'],
  ['Everyone', '/', 'Home'],
  ['Everyone', '/browse', 'Browse items (search, filters, sort)'],
  ['Renter', '/chat', 'Chat inbox (talk to the seller, request dates)'],
  ['Renter', '/bookings', 'My rentals'],
  ['Renter', '/verify-id', 'One-time ID verification'],
  ['Renter', '/profile', 'Profile'],
  ['Seller', '/owner/apply', 'Become a seller (application + status)'],
  ['Seller', '/owner', 'Seller dashboard'],
  ['Seller', '/owner/new', 'List a new item'],
  ['Seller', '/owner/listings', 'My listings'],
  ['Seller', '/owner/requests', 'Booking requests'],
  ['Seller', '/owner/bookings', 'Bookings (pickup / return handover)'],
  ['Seller', '/owner/calendar', 'Calendar'],
  ['Seller', '/owner/earnings', 'Earnings & payouts'],
  ['Seller', '/owner/reviews', 'Reviews'],
  ['Admin', '/admin', 'Admin dashboard (KPIs + today’s queue)'],
  ['Admin', '/admin/owners', 'Seller (owner) approvals'],
  ['Admin', '/admin/ids', 'ID verifications'],
  ['Admin', '/admin/listings', 'Listings moderation'],
  ['Admin', '/admin/users', 'Users'],
  ['Admin', '/admin/bookings', 'Bookings'],
  ['Admin', '/admin/disputes', 'Deposit disputes'],
  ['Admin', '/admin/complaints', 'Complaints & contact messages'],
  ['Admin', '/admin/payouts', 'Payouts'],
  ['Admin', '/admin/refunds', 'Deposit refunds'],
];

const sellers = users.filter((u) => u.ownerStatus === 'APPROVED');
const role = (u: (typeof users)[number]) =>
  u.isAdmin ? 'Admin' : u.ownerStatus === 'APPROVED' ? 'Seller' : u.ownerStatus === 'PENDING' ? 'Seller (pending)' : u.ownerStatus === 'REJECTED' ? 'Seller (rejected)' : 'Renter';

let sellerRows = '';
for (const c of cities) {
  const here = sellers.filter((u) => u.city === c.name);
  if (!here.length) continue;
  sellerRows += `<tr class="city"><td colspan="4">${esc(c.name)} · ${here.length} sellers</td></tr>`;
  for (const a of c.areas) {
    for (const u of here.filter((x) => x.area === a.name)) {
      sellerRows += `<tr><td class="mono">${esc(u.email)}</td><td>${esc(u.name)}</td><td>${esc(a.name)}</td><td class="num">${u._count.items}</td></tr>`;
    }
  }
}

const today = new Intl.DateTimeFormat('en-IN', { dateStyle: 'long', timeZone: 'Asia/Kolkata' }).format(new Date());
const font = (f: string) => 'file:///' + path.resolve('public/design/assets/fonts', f).replace(/\\/g, '/');

const html = `<!doctype html><html><head><meta charset="utf-8"><title>Kirayo — URLs & demo logins</title>
<style>
@font-face { font-family: 'Bricolage Grotesque'; src: url('${font('BricolageGrotesque-Variable.woff')}') format('woff'); font-weight: 200 800; font-stretch: 75% 100%; }
@font-face { font-family: 'Plus Jakarta Sans'; src: url('${font('PlusJakartaSans-Variable.woff')}') format('woff'); font-weight: 200 800; }
@page { size: A4; margin: 16mm 14mm 16mm; }
* { box-sizing: border-box; }
body { font: 400 10.5px/1.5 'Plus Jakarta Sans', sans-serif; color: #23262A; margin: 0; }
h1, h2 { font-family: 'Bricolage Grotesque', sans-serif; font-stretch: 78%; margin: 0; }
.cover { background: linear-gradient(140deg, #0B1D14, #163A2B 50%, #1F4D3A); color: #F6F1E7; border-radius: 18px; padding: 26px 28px; margin-bottom: 18px; }
.brand { display: flex; align-items: center; gap: 10px; font: 800 22px 'Bricolage Grotesque'; }
.mark { width: 34px; height: 34px; border-radius: 11px; background: #F6F1E7; color: #1F4D3A; display: flex; align-items: center; justify-content: center; font-weight: 800; }
.cover h1 { font-size: 34px; line-height: 1; margin: 16px 0 8px; }
.cover h1 em { font-style: normal; color: #E3B25C; }
.cover p { margin: 0; color: #DCE6DA; font-size: 11.5px; }
.pill { display: inline-block; margin-top: 12px; padding: 4px 10px; border-radius: 999px; border: 1px solid rgba(227,178,92,.6); color: #F3E3BD; font-size: 10px; font-weight: 700; letter-spacing: .05em; text-transform: uppercase; }
h2 { font-size: 19px; color: #12301F; margin: 18px 0 8px; display: flex; align-items: center; gap: 8px; }
h2::before { content: ''; width: 16px; height: 3px; border-radius: 3px; background: #C9491F; }
.steps { display: grid; grid-template-columns: repeat(4, 1fr); gap: 8px; }
.step { border-radius: 12px; background: #F6F1E7; padding: 10px 12px; }
.step b { display: block; font: 800 18px 'Bricolage Grotesque'; color: #C9491F; }
.note { border-radius: 12px; padding: 9px 12px; background: #FBEBCF; color: #7A4708; margin-top: 8px; font-size: 10px; }
table { width: 100%; border-collapse: collapse; }
th { text-align: left; font-size: 9px; letter-spacing: .06em; text-transform: uppercase; color: #60666C; padding: 6px 8px; border-bottom: 1.5px solid #1F4D3A; }
td { padding: 5px 8px; border-bottom: 1px solid #EDE5D5; vertical-align: top; }
tr { break-inside: avoid; }
.mono { font-family: Consolas, 'Courier New', monospace; font-size: 10px; color: #12301F; font-weight: 600; }
.num { text-align: right; }
.tag { display: inline-block; padding: 1px 8px; border-radius: 999px; font-size: 9px; font-weight: 700; }
.t-Everyone { background: #EDE5D5; } .t-Renter { background: #DCE6DA; color: #1F4D3A; } .t-Seller { background: #FBE3D8; color: #A93C18; } .t-Admin { background: #23262A; color: #fff; }
tr.city td { background: #1F4D3A; color: #F6F1E7; font-weight: 800; font-size: 11px; padding: 6px 8px; break-after: avoid; }
.key td:first-child { white-space: nowrap; }
.page-break { break-before: page; }
.foot { margin-top: 14px; font-size: 9.5px; color: #60666C; }
</style></head><body>
<div class="cover">
  <div class="brand"><span class="mark">K</span>kirayo</div>
  <h1>URLs &amp; <em>demo logins</em></h1>
  <p>Base URL: <b>${BASE}</b> · Generated ${esc(today)} from the demo database · ${users.length} accounts, ${sellers.length} approved sellers</p>
  <span class="pill">Demo / development only</span>
</div>

<h2>How to log in</h2>
<div class="steps">
  <div class="step"><b>1</b>Open <span class="mono">${BASE}/login</span></div>
  <div class="step"><b>2</b>Type an email from this list and click <b style="display:inline;font:inherit;color:inherit;font-weight:700">Send code</b></div>
  <div class="step"><b>3</b>The 6-digit code is shown on the page (“Dev mode — your code is …”)</div>
  <div class="step"><b>4</b>Enter it → <b style="display:inline;font:inherit;color:inherit;font-weight:700">Verify &amp; continue</b></div>
</div>
<div class="note"><b>No passwords</b> — login is email + one-time code. One code per email every 30 seconds. One user per browser at a time: open a second user in an Incognito window. There is <b>one login page for everyone</b>; the account decides whether you see the renter, seller or admin side.</div>

<h2>Main accounts</h2>
<table class="key"><thead><tr><th>Email</th><th>Who</th><th>Opens at</th><th>What to try</th></tr></thead><tbody>
${KEY.map(([e, w, u, t]) => `<tr><td class="mono">${e}</td><td><b>${esc(w)}</b></td><td class="mono">${BASE}${u}</td><td>${esc(t)}</td></tr>`).join('')}
</tbody></table>

<h2>All URLs</h2>
<table><thead><tr><th>For</th><th>URL</th><th>Page</th></tr></thead><tbody>
${URLS.map(([f, u, t]) => `<tr><td><span class="tag t-${f}">${f}</span></td><td class="mono">${BASE}${u}</td><td>${esc(t)}</td></tr>`).join('')}
</tbody></table>
<div class="note">Seller pages open only for an <b>approved</b> seller with a <b>verified ID</b> (others are sent to /owner/apply). Admin pages open only for the admin account.</div>

<div class="page-break"></div>
<h2>All approved sellers (${sellers.length})</h2>
<p style="margin:0 0 8px;color:#474C52">Every seller below is ID-verified with live items. Log in, then open <span class="mono">${BASE}/owner</span>. Any of them can also rent from others.</p>
<table><thead><tr><th>Email</th><th>Name</th><th>Area</th><th class="num">Live items</th></tr></thead><tbody>${sellerRows}</tbody></table>

<h2>Other accounts</h2>
<table><thead><tr><th>Email</th><th>Name</th><th>City · Area</th><th>Role</th></tr></thead><tbody>
${users.filter((u) => u.ownerStatus !== 'APPROVED').map((u) => `<tr><td class="mono">${esc(u.email)}</td><td>${esc(u.name)}</td><td>${esc(u.city ?? '—')} · ${esc(u.area ?? '—')}</td><td>${role(u)}</td></tr>`).join('')}
</tbody></table>

<p class="foot">These are demo accounts from <span class="mono">npm run setup</span> / <span class="mono">npm run db:reset</span>; reseeding recreates the same emails. In production, codes are sent by email and never shown on screen. Full list also in LOGINS.md.</p>
</body></html>`;

const htmlPath = path.join(TMP_DIR, 'kirayo-logins.html');
fs.writeFileSync(htmlPath, html);
const b = await chromium.launch({ channel: 'msedge' });
const page = await b.newPage();
await page.goto('file:///' + htmlPath.replace(/\\/g, '/'), { waitUntil: 'load' });
await page.evaluate(() => document.fonts.ready);
await page.pdf({
  path: OUT_PDF,
  format: 'A4',
  printBackground: true,
  displayHeaderFooter: true,
  headerTemplate: '<span></span>',
  footerTemplate: '<div style="width:100%;font:8px sans-serif;color:#60666C;padding:0 14mm;display:flex;justify-content:space-between"><span>Kirayo · URLs &amp; demo logins</span><span>Page <span class="pageNumber"></span> / <span class="totalPages"></span></span></div>',
  margin: { top: '14mm', bottom: '16mm', left: '0', right: '0' },
});
await b.close();
console.log('PDF:', OUT_PDF);
