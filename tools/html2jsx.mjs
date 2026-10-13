// Dev helper: converts a design-kit HTML file (or the <body> of it) into JSX text,
// so screens can be ported faithfully. Usage:
//   node tools/html2jsx.mjs design/renter/R01-Home.html > out.jsx
import fs from 'node:fs';

const src = fs.readFileSync(process.argv[2], 'utf8');
let html = src;
const b = html.indexOf('<body>');
if (b >= 0) html = html.slice(b + 6, html.lastIndexOf('</body>'));

const ATTR = {
  class: 'className', for: 'htmlFor', tabindex: 'tabIndex', colspan: 'colSpan', rowspan: 'rowSpan',
  readonly: 'readOnly', maxlength: 'maxLength', minlength: 'minLength', autocomplete: 'autoComplete',
  inputmode: 'inputMode', autofocus: 'autoFocus', enctype: 'encType', 'stroke-width': 'strokeWidth',
  'stroke-linecap': 'strokeLinecap', 'stroke-linejoin': 'strokeLinejoin', 'stroke-dasharray': 'strokeDasharray',
  'fill-rule': 'fillRule', 'clip-rule': 'clipRule', 'stop-color': 'stopColor', 'stroke-miterlimit': 'strokeMiterlimit',
  'font-size': 'fontSize', 'font-weight': 'fontWeight', 'text-anchor': 'textAnchor', 'xlink:href': 'xlinkHref',
  'xml:space': 'xmlSpace', checked: 'defaultChecked', srcset: 'srcSet', datetime: 'dateTime', 'accept-charset': 'acceptCharset',
};
const VOID = new Set(['area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input', 'link', 'meta', 'source', 'track', 'wbr']);

function styleObj(s) {
  const parts = [];
  for (const decl of s.split(/;(?![^(]*\))/)) {
    const i = decl.indexOf(':');
    if (i < 0) continue;
    const k = decl.slice(0, i).trim();
    const v = decl.slice(i + 1).trim().replace(/&quot;/g, '"');
    if (!k) continue;
    const key = k.startsWith('--') ? `'${k}'` : k.replace(/-([a-z])/g, (_, c) => c.toUpperCase());
    parts.push(`${key}: ${JSON.stringify(v)}`);
  }
  return `{{ ${parts.join(', ')} }}`;
}

function convertTag(tag) {
  // tag like <div a="b" c>
  const m = tag.match(/^<([a-zA-Z][\w:-]*)([\s\S]*?)(\/?)>$/);
  if (!m) return tag;
  const [, name, rest] = m;
  const attrs = [];
  const re = /([^\s=]+)(?:\s*=\s*("[^"]*"|'[^']*'|[^\s>]+))?/g;
  let a;
  while ((a = re.exec(rest))) {
    let [, k, v] = a;
    if (k === '/') continue;
    if (v && (v[0] === '"' || v[0] === "'")) v = v.slice(1, -1);
    if (/^on[a-z]+$/.test(k)) continue;
    if (k === 'style') { attrs.push(`style=${styleObj(v || '')}`); continue; }
    if (k === 'value' && (name === 'input' || name === 'textarea')) k = 'defaultValue';
    if (k === 'selected') { attrs.push('data-selected'); continue; }
    const nk = ATTR[k] || k;
    if (v === undefined) attrs.push(nk);
    else attrs.push(`${nk}=${JSON.stringify(v.replace(/&quot;/g, '"'))}`);
  }
  const close = VOID.has(name.toLowerCase()) ? ' />' : '>';
  return `<${name}${attrs.length ? ' ' + attrs.join(' ') : ''}${close}`;
}

let out = html
  .replace(/<!--([\s\S]*?)-->/g, (_, c) => `{/*${c.replace(/\*\//g, '* /')}*/}`)
  .replace(/<\/(br|img|input|hr|meta|link|source)>/gi, '');

// escape braces in text nodes, then convert tags
out = out.split(/(<[^>]+>)/g).map((chunk) => {
  if (chunk.startsWith('<') && !chunk.startsWith('</') && !chunk.startsWith('{/*')) return convertTag(chunk);
  if (chunk.startsWith('<')) return chunk;
  if (chunk.includes('{/*')) return chunk;
  return chunk.replace(/[{}]/g, (c) => `{'${c}'}`);
}).join('');

out = out.replace(/\n\s*\n+/g, '\n');
process.stdout.write(out);
