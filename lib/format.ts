// Formatting + IST calendar-date helpers. A "day" is a 'YYYY-MM-DD' string
// meaning a date in Asia/Kolkata; the DB stores it as UTC midnight (@db.Date).

export const TZ = 'Asia/Kolkata';

export function inr(n: number): string {
  return '₹' + Math.round(n).toLocaleString('en-IN');
}

export function todayIST(now: Date = new Date()): string {
  return new Intl.DateTimeFormat('en-CA', { timeZone: TZ, year: 'numeric', month: '2-digit', day: '2-digit' }).format(now);
}

export function toDbDate(day: string): Date {
  return new Date(day + 'T00:00:00.000Z');
}

export function dayOf(d: Date): string {
  return d.toISOString().slice(0, 10);
}

export function addDays(day: string, n: number): string {
  const d = toDbDate(day);
  d.setUTCDate(d.getUTCDate() + n);
  return dayOf(d);
}

/** b − a in calendar days. */
export function diffDays(a: string, b: string): number {
  return Math.round((toDbDate(b).getTime() - toDbDate(a).getTime()) / 86400000);
}

export function isDay(s: unknown): s is string {
  return typeof s === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(s) && !Number.isNaN(toDbDate(s).getTime());
}

/** Every day from a to b inclusive. */
export function eachDay(a: string, b: string): string[] {
  const out: string[] = [];
  for (let d = a; d <= b; d = addDays(d, 1)) out.push(d);
  return out;
}

/** The instant an IST calendar day starts. */
export function istStart(day: string): Date {
  return new Date(day + 'T00:00:00.000+05:30');
}

const fmt = (opts: Intl.DateTimeFormatOptions) => new Intl.DateTimeFormat('en-IN', { timeZone: 'UTC', ...opts });

/** "Fri 16 Oct" */
export function fmtDay(day: string | Date): string {
  const d = typeof day === 'string' ? toDbDate(day) : day;
  return fmt({ weekday: 'short', day: 'numeric', month: 'short' }).format(d);
}

/** "16 Oct 2026" */
export function fmtDayLong(day: string | Date): string {
  const d = typeof day === 'string' ? toDbDate(day) : day;
  return fmt({ day: 'numeric', month: 'short', year: 'numeric' }).format(d);
}

/** "Fri 16 – Mon 19 Oct" */
export function fmtRange(a: string | Date, b: string | Date): string {
  const s = typeof a === 'string' ? a : dayOf(a);
  const e = typeof b === 'string' ? b : dayOf(b);
  const sm = s.slice(5, 7) === e.slice(5, 7);
  const left = sm ? fmt({ weekday: 'short', day: 'numeric' }).format(toDbDate(s)) : fmtDay(s);
  return `${left} – ${fmtDay(e)}`;
}

/** Instant in IST: "16 Oct, 7:10 pm" */
export function fmtTime(d: Date): string {
  return new Intl.DateTimeFormat('en-IN', { timeZone: TZ, day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit', hour12: true }).format(d).replace(/\s?(am|pm)/i, (m) => ' ' + m.trim().toLowerCase());
}

export function fmtClock(d: Date): string {
  return new Intl.DateTimeFormat('en-IN', { timeZone: TZ, hour: 'numeric', minute: '2-digit', hour12: true }).format(d).replace(/\s?(am|pm)/i, (m) => ' ' + m.trim().toLowerCase());
}

export function monthYear(d: Date): string {
  return new Intl.DateTimeFormat('en-IN', { timeZone: TZ, month: 'long', year: 'numeric' }).format(d);
}

export function initials(name: string): string {
  const p = name.trim().split(/\s+/);
  return ((p[0]?.[0] ?? '') + (p.length > 1 ? p[p.length - 1][0] : '')).toUpperCase() || 'K';
}

/** "Riya Sharma" → "Riya S." */
export function shortName(name: string): string {
  const p = name.trim().split(/\s+/);
  return p.length > 1 ? `${p[0]} ${p[p.length - 1][0]}.` : p[0];
}

export function hoursLeft(until: Date, now = new Date()): number {
  return Math.max(0, Math.ceil((until.getTime() - now.getTime()) / 3600000));
}

const AVATAR = ['#1F4D3A', '#A93C18', '#E8643C', '#474C52', '#2F6B52', '#7A4708'];
export function avatarColor(seed: string): string {
  let h = 0;
  for (const c of seed) h = (h * 31 + c.charCodeAt(0)) >>> 0;
  return AVATAR[h % AVATAR.length];
}
