// Dev helper: turns a kit screen's main content into a static page component.
//   node tools/make-static.mjs R21-About app/(site)/about/page.tsx "About"
import fs from 'node:fs';
import path from 'node:path';
import { relink } from './relink.mjs';
const [id, out, title] = process.argv.slice(2);
const src = fs.readFileSync(`tools/jsx/${id}.jsx`, 'utf8');
let body = src.slice(src.indexOf('</header>') + 9);
const f = body.indexOf('<footer');
if (f >= 0) body = body.slice(0, f);
const m = body.indexOf('<div className="mtab">');
if (m >= 0) body = body.slice(0, m);
body = relink(body.trim());
// drop the trailing wrapper close if unbalanced
const opens = (body.match(/<div\b/g) || []).length, closes = (body.match(/<\/div>/g) || []).length;
for (let i = 0; i < closes - opens; i++) body = body.replace(/<\/div>\s*$/, '');
fs.mkdirSync(path.dirname(out), { recursive: true });
fs.writeFileSync(out, `import Link from 'next/link';
import PageCss from '@/components/PageCss';

export const metadata = { title: ${JSON.stringify(title)} };

export default function Page() {
  return (
    <>
      <PageCss id="${id}" />
${body.split('\n').map((l) => '      ' + l).join('\n')}
    </>
  );
}
`);
