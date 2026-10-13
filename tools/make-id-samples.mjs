// Dev helper: renders obviously-fake sample ID + selfie images for the seed.
import { chromium } from 'playwright-core';
const b = await chromium.launch({ channel: 'msedge' });
const p = await b.newPage({ viewport: { width: 900, height: 560 } });
await p.setContent(`<body style="margin:0;background:#e9e4d8;display:flex;align-items:center;justify-content:center;height:100vh;font-family:sans-serif">
<div style="width:820px;height:500px;border-radius:28px;background:linear-gradient(135deg,#fdf6e3,#e6efe6);box-shadow:0 10px 30px rgba(0,0,0,.2);position:relative;overflow:hidden;padding:36px;box-sizing:border-box">
<div style="font:800 30px sans-serif;color:#1F4D3A">GOVERNMENT ID — SAMPLE</div>
<div style="display:flex;gap:30px;margin-top:30px"><div style="width:180px;height:220px;border-radius:16px;background:#BFD1BD"></div>
<div style="font:600 22px/2 sans-serif;color:#23262A">Name: Demo Person<br>DOB: 01/01/1995<br>ID No: XXXX XXXX 1234<br>Issued: Kirayo demo seed</div></div>
<div style="position:absolute;right:-40px;top:200px;transform:rotate(-25deg);font:900 90px sans-serif;color:rgba(201,73,31,.35)">SAMPLE</div></div></body>`);
await p.screenshot({ path: 'prisma/seed-assets/sample-id.jpg', type: 'jpeg', quality: 80 });
await p.setViewportSize({ width: 600, height: 600 });
await p.setContent(`<body style="margin:0;background:#DCE6DA;display:flex;align-items:center;justify-content:center;height:100vh;font-family:sans-serif;position:relative">
<div style="width:260px;height:260px;border-radius:50%;background:#E8643C;position:absolute;top:120px"></div><div style="width:420px;height:300px;border-radius:200px 200px 0 0;background:#1F4D3A;position:absolute;bottom:0"></div>
<div style="position:absolute;top:30px;font:800 34px sans-serif;color:#1F4D3A">SELFIE — SAMPLE</div></body>`);
await p.screenshot({ path: 'prisma/seed-assets/sample-selfie.jpg', type: 'jpeg', quality: 80 });
await b.close();
