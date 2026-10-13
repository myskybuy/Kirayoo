// One-off: downloads up to 2 openly-licensed photos per catalog entry from
// Wikimedia Commons into public/demo/<slug>-<n>.jpg and writes
// public/demo/CREDITS.md. The app only serves these local copies (no hotlinking).
//   npx tsx tools/fetch-demo-photos.mjs          (skips slugs already present)
//   npx tsx tools/fetch-demo-photos.mjs --fresh  (re-downloads everything)
import fs from 'node:fs/promises';
import path from 'node:path';
import { CATALOG } from '../prisma/catalog.ts';

// Off-topic search hits found on review (index in the filtered result list).
const SKIP = { chairs: [1], cricket: [0], guitar: [0], lights: [0], toolkit: [1], roadbike: [1], campchairs: [1], piano: [1] };

const OUT = path.join(process.cwd(), 'public', 'demo');
const CREDITS = path.join(OUT, 'credits.json');
const fresh = process.argv.includes('--fresh');
if (fresh) await fs.rm(OUT, { recursive: true, force: true });
await fs.mkdir(OUT, { recursive: true });
const credits = JSON.parse(await fs.readFile(CREDITS, 'utf8').catch(() => '{}'));
const UA = 'KirayoDemoSeed/1.0 (local development; contact: dev@kirayo.local)';
const strip = (s = '') => s.replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim().slice(0, 80);

for (const c of CATALOG) {
  if (credits[`${c.photo}-1.jpg`]) continue;
  const url = new URL('https://commons.wikimedia.org/w/api.php');
  Object.entries({ action: 'query', format: 'json', generator: 'search', gsrsearch: `${c.query} filetype:bitmap`, gsrnamespace: '6', gsrlimit: '20', prop: 'imageinfo', iiprop: 'url|mime|size|extmetadata', iiurlwidth: '900' }).forEach(([k, v]) => url.searchParams.set(k, v));
  const j = await (await fetch(url, { headers: { 'User-Agent': UA } })).json();
  const pages = Object.values(j.query?.pages ?? {}).sort((a, b) => a.index - b.index);
  const ok = pages.filter((p) => p.imageinfo?.[0]?.mime === 'image/jpeg' && p.imageinfo[0].width >= 700 && p.imageinfo[0].width >= p.imageinfo[0].height * 0.9);
  const picks = ok.filter((_, i) => !(SKIP[c.photo] ?? []).includes(i)).slice(0, 2);
  let n = 0;
  for (const p of picks) {
    const ii = p.imageinfo[0];
    const img = await fetch(ii.thumburl, { headers: { 'User-Agent': UA } });
    if (!img.ok) continue;
    n++;
    const file = `${c.photo}-${n}.jpg`;
    await fs.writeFile(path.join(OUT, file), Buffer.from(await img.arrayBuffer()));
    const m = ii.extmetadata ?? {};
    credits[file] = { title: strip(p.title), url: ii.descriptionurl, author: strip(m.Artist?.value) || 'unknown', license: strip(m.LicenseShortName?.value) || 'see source' };
  }
  console.log(c.photo, n);
  await new Promise((r) => setTimeout(r, 300));
}
await fs.writeFile(CREDITS, JSON.stringify(credits, null, 1));
const rows = Object.entries(credits).sort().map(([f, c]) => `| ${f} | [${c.title}](${c.url}) | ${c.author} | ${c.license} |`);
await fs.writeFile(path.join(OUT, 'CREDITS.md'), ['# Demo photo credits', '', 'Photos from Wikimedia Commons, downloaded once and stored locally for the demo seed. Each file keeps its original licence.', '', '| File | Source | Author | Licence |', '|---|---|---|---|', ...rows, ''].join('\n'));
