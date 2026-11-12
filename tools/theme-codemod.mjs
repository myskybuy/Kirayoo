// Theme codemod: turns hard-coded hex colours into role-based CSS variables so
// the whole site can switch to dark mode, then (re)generates public/theme.css.
//
//   node tools/theme-codemod.mjs           apply + regenerate theme.css
//   node tools/theme-codemod.mjs --dry     report only
//
// Every colour gets a variable per ROLE, because the same hex plays different
// parts: #F6F1E7 is the page background *and* the text on green buttons.
//   --kb-xxxxxx  background / fill of a surface
//   --kf-xxxxxx  text, icon (color, fill, stroke)
//   --kl-xxxxxx  lines (border, box-shadow, outline)
// :root keeps the original colour; [data-theme="dark"] gets a computed one.
// Idempotent: it only rewrites raw hex, and theme.css is rebuilt from every
// var(--k?-xxxxxx) found, so it can be re-run after new code is added.
import fs from 'node:fs';
import path from 'node:path';

const DRY = process.argv.includes('--dry');
const ROOT = process.cwd();
const SKIP_FILES = [/components[\\/]home[\\/]BannerArt\.tsx$/]; // illustrations keep their palette
const HEX = /#(?:[0-9a-fA-F]{6}|[0-9a-fA-F]{3})(?![0-9a-zA-Z])/g;

function walk(dir, ext, out = []) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) walk(p, ext, out);
    else if (ext.some((x) => e.name.endsWith(x))) out.push(p);
  }
  return out;
}

const norm = (h) => {
  h = h.slice(1).toLowerCase();
  return h.length === 3 ? h.split('').map((c) => c + c).join('') : h;
};

function role(prop) {
  const p = prop.replace(/^-webkit-/, '').replace(/-([a-z])/g, (_, c) => c.toUpperCase()).toLowerCase();
  if (/^(color|fg|fill|stroke|caretcolor|accentcolor|textdecorationcolor|textdecoration|ink|text)$/.test(p)) return 'f';
  if (/^(border|bordercolor|border(top|bottom|left|right)(color)?|boxshadow|outline|outlinecolor|textstroke|columnrule|shadow|line)/.test(p)) return 'l';
  if (/^(background|backgroundcolor|bg|tint|surface)/.test(p)) return 'b';
  return null;
}

const unknown = new Map();
let changed = 0;
let replaced = 0;
const note = (k, f) => { const s = unknown.get(k) ?? new Set(); s.add(path.relative(ROOT, f)); unknown.set(k, s); };
const sub = (value, r) => value.replace(HEX, (h) => { replaced++; return `var(--k${r}-${norm(h)})`; });

// --- TSX: style objects and tone maps:  key: '... #hex ...'
for (const f of walk(path.join(ROOT, 'app'), ['.tsx']).concat(walk(path.join(ROOT, 'components'), ['.tsx']))) {
  if (SKIP_FILES.some((r) => r.test(f))) continue;
  const src = fs.readFileSync(f, 'utf8');
  let out = src.replace(/(\b[a-zA-Z]+)(\s*:\s*)(['"`])([^'"`\n]*?#[0-9a-fA-F]{3,6}\b[^'"`\n]*?)\3/g, (m, key, colon, q, val) => {
    const r = role(key);
    if (!r) { note(key, f); return m; }
    return key + colon + q + sub(val, r) + q;
  });
  // Expressions:  key: on ? '#1F4D3A' : 'transparent'   (hex string literals take the key's role)
  out = out.replace(/(\b[a-zA-Z]+)(\s*[:=]\s*)([^,{};\n]*?['"]#[0-9a-fA-F]{3,6}['"][^,{};\n]*)/g, (m, key, op, expr) => {
    const r = role(key);
    if (!r) { note(key, f); return m; }
    return key + op + expr.replace(/(['"])(#[0-9a-fA-F]{3,6})\1/g, (_, q, h) => { replaced++; return `${q}var(--k${r}-${norm(h)})${q}`; });
  });
  // Plain lists of tints (photo placeholders):  const TINTS = ['#…', …]  (before tone tables)
  out = out.replace(/(TINTS\s*=\s*\[)([^\]]*)\]/g, (m, head, list) => head + list.replace(/'(#[0-9a-fA-F]{3,6})'/g, (_, h) => { replaced++; return `'var(--kb-${norm(h)})'`; }) + ']');
  // Tone tables:  ['#bg', '#fg', ...]  or  ['Label', '#bg', '#fg', ...]
  out = out.replace(/\[((?:\s*'[^'#]*',)?)\s*'(#[0-9a-fA-F]{3,6})',\s*'(#[0-9a-fA-F]{3,6})'/g, (m, label, bg, fg) => {
    replaced += 2;
    return `[${label ? label + ' ' : ''}'var(--kb-${norm(bg)})', 'var(--kf-${norm(fg)})'`;
  });
  if (out !== src) { changed++; if (!DRY) fs.writeFileSync(f, out); }
}

// --- CSS: declarations  prop: ... #hex ...;
const cssFiles = walk(path.join(ROOT, 'public', 'design'), ['.css']).concat([path.join(ROOT, 'public', 'app.css')]);
for (const f of cssFiles) {
  const src = fs.readFileSync(f, 'utf8');
  const out = src.replace(/([a-zA-Z-]+)(\s*:\s*)([^;{}]*?#[0-9a-fA-F]{3,6}\b[^;{}]*)/g, (m, prop, colon, val) => {
    if (prop.startsWith('--')) return m; // custom property definitions stay
    const r = role(prop);
    if (!r) { note(prop, f); return m; }
    return prop + colon + sub(val, r);
  });
  if (out !== src) { changed++; if (!DRY) fs.writeFileSync(f, out); }
}

// --- Build theme.css from every variable now in use.
const used = new Map();
for (const f of walk(path.join(ROOT, 'app'), ['.tsx']).concat(walk(path.join(ROOT, 'components'), ['.tsx']), cssFiles)) {
  for (const m of fs.readFileSync(f, 'utf8').matchAll(/var\(--k([bfl])-([0-9a-f]{6})\)/g)) used.set(`${m[1]}-${m[2]}`, [m[1], m[2]]);
}

function hsl(hex) {
  const [r, g, b] = [0, 2, 4].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255);
  const max = Math.max(r, g, b), min = Math.min(r, g, b), l = (max + min) / 2;
  if (max === min) return [0, 0, l];
  const d = max - min;
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
  const h = max === r ? (g - b) / d + (g < b ? 6 : 0) : max === g ? (b - r) / d + 2 : (r - g) / d + 4;
  return [h * 60, s, l];
}
function hex([h, s, l]) {
  const k = (n) => (n + h / 30) % 12;
  const a = s * Math.min(l, 1 - l);
  const f = (n) => Math.round(255 * (l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)))));
  return '#' + [f(0), f(8), f(4)].map((v) => v.toString(16).padStart(2, '0')).join('');
}
// Dark values by role. Light surfaces become dark surfaces of the same hue;
// dark text becomes light; saturated brand fills (buttons, bands) stay.
function dark(r, h6) {
  const [h, s, l] = hsl(h6);
  if (r === 'b') {
    // Keep elevation order: lighter surfaces (cards) stay lighter than the page.
    if (l >= 0.8) return hex([h, Math.min(s, 0.5) * 0.3, 0.07 + (l - 0.8) * 0.38]);
    if (l >= 0.6) return hex([h, s * 0.35, 0.24]);
    if (l < 0.2 && s < 0.2) return hex([h, s * 0.5, 0.17]); // near-black panels lift a little
    return '#' + h6;
  }
  if (r === 'f') {
    if (l <= 0.55) return hex([h, Math.min(s, 0.55), Math.min(0.9, 0.95 - l * 0.6)]);
    return '#' + h6;
  }
  if (l >= 0.72) return hex([h, s * 0.35, 0.22]);
  return '#' + h6;
}

// The kit's own tokens (kirayo.css :root) by role; brand fills keep their colour.
const KIT = {
  paper: ['b', 'fffdf8'], cream: ['b', 'f6f1e7'], sand: ['b', 'ede5d5'], line: ['l', 'e3daca'],
  ink: ['f', '23262a'], 'ink-2': ['f', '474c52'], mute: ['f', '60666c'],
  'sage-100': ['b', 'eef3ec'], 'sage-200': ['b', 'dce6da'], 'sage-300': ['b', 'bfd1bd'], 'coral-100': ['b', 'fbe3d8'],
  'ok-bg': ['b', 'dceedf'], 'ok-fg': ['f', '1e5a37'], 'warn-bg': ['b', 'fbebcf'], 'warn-fg': ['f', '7a4708'], 'err-bg': ['b', 'f7dcd7'], 'err-fg': ['f', '8e2a20'],
  'forest-text': ['f', '1f4d3a'], 'tangerine-text': ['f', 'a93c18'],
};
const keys = [...used.values()].sort((a, b) => (a[0] + a[1]).localeCompare(b[0] + b[1]));
const css = `/* GENERATED by tools/theme-codemod.mjs — do not edit by hand.
   Role-based colour variables: --kb (backgrounds), --kf (text/icons), --kl (lines).
   Light = the original design colour; dark = computed, see dark() in the script.
   Tweak dark values in public/app.css (section "Dark mode") after this file. */
:root {
  --k-forest-text: #1f4d3a;
  --k-tangerine-text: #a93c18;
${keys.map(([r, h]) => `  --k${r}-${h}: #${h};`).join('\n')}
}
[data-theme="dark"] {
  color-scheme: dark;
${Object.entries(KIT).map(([k, [r, h]]) => `  --k-${k}: ${dark(r, h)};`).join('\n')}
${keys.map(([r, h]) => `  --k${r}-${h}: ${dark(r, h)};`).join('\n')}
}
`;
if (!DRY) fs.writeFileSync(path.join(ROOT, 'public', 'theme.css'), css);

console.log(`${DRY ? '[dry] ' : ''}files changed: ${changed}, colours replaced: ${replaced}, variables: ${keys.length}`);
if (unknown.size) {
  console.log('Unclassified keys (left as raw hex):');
  for (const [k, files] of unknown) console.log(`  ${k}: ${[...files].slice(0, 4).join(', ')}${files.size > 4 ? ` +${files.size - 4}` : ''}`);
}
