// Dev helper: renders public/demo/*.jpg into one image for review.
import fs from 'node:fs';
import { chromium } from 'playwright-core';
const files = fs.readdirSync('public/demo').filter((f) => f.endsWith('.jpg'));
const html = `<body style="margin:0;display:grid;grid-template-columns:repeat(10,140px);gap:4px;font:11px sans-serif">${files.map((f) => `<div><img src="http://localhost:3001/demo/${f}" style="width:140px;height:105px;object-fit:cover;display:block">${f}</div>`).join('')}</body>`;
const b = await chromium.launch({ channel: 'msedge' });
const p = await b.newPage({ viewport: { width: 1440, height: 900 } });
await p.setContent(html, { waitUntil: 'networkidle' });
await p.screenshot({ path: process.argv[2], fullPage: true });
await b.close();
