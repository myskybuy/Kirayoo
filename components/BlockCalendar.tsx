'use client';
import { useMemo, useState } from 'react';

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

function pad(n: number) {
  return String(n).padStart(2, '0');
}
export function monthDays(y: number, m: number) {
  // Monday-first grid of 'YYYY-MM-DD' | null
  const first = new Date(Date.UTC(y, m, 1));
  const lead = (first.getUTCDay() + 6) % 7;
  const n = new Date(Date.UTC(y, m + 1, 0)).getUTCDate();
  const cells: (string | null)[] = Array(lead).fill(null);
  for (let d = 1; d <= n; d++) cells.push(`${y}-${pad(m + 1)}-${pad(d)}`);
  while (cells.length % 7) cells.push(null);
  return cells;
}

type Props = {
  today: string;
  booked: string[];
  initialBlocked: string[];
  name?: string;
  /** If set, each toggle is sent immediately (owner calendar page). */
  onToggle?: (day: string, blocked: boolean) => Promise<boolean>;
};

/** O02 "Availability" month grid: tap days you're NOT lending. Booked days are locked. */
export default function BlockCalendar({ today, booked, initialBlocked, name = 'blocked', onToggle }: Props) {
  const [blocked, setBlocked] = useState<Set<string>>(new Set(initialBlocked));
  const [ym, setYm] = useState(() => ({ y: Number(today.slice(0, 4)), m: Number(today.slice(5, 7)) - 1 }));
  const [busy, setBusy] = useState('');
  const bookedSet = useMemo(() => new Set(booked), [booked]);
  const cells = monthDays(ym.y, ym.m);
  const monthKey = `${ym.y}-${pad(ym.m + 1)}`;
  const blockedThisMonth = [...blocked].filter((d) => d.startsWith(monthKey)).length;
  const canPrev = monthKey > today.slice(0, 7);

  async function toggle(d: string) {
    const on = !blocked.has(d);
    if (onToggle) {
      setBusy(d);
      const ok = await onToggle(d, on);
      setBusy('');
      if (!ok) return;
    }
    setBlocked((s) => {
      const n = new Set(s);
      if (on) n.add(d);
      else n.delete(d);
      return n;
    });
  }

  const step = (k: number) => setYm(({ y, m }) => ({ y: m + k > 11 ? y + 1 : m + k < 0 ? y - 1 : y, m: (m + k + 12) % 12 }));

  return (
    <div style={{ maxWidth: '440px' }}>
      {!onToggle && <input type="hidden" name={name} value={JSON.stringify([...blocked].filter((d) => d >= today).sort())} />}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px', gap: '8px' }}>
        <button type="button" onClick={() => step(-1)} disabled={!canPrev} aria-label="Previous month" className="k-btn o sm" style={{ minWidth: '38px', padding: 0 }}>‹</button>
        <b className="d" style={{ fontSize: '17px' }}>{MONTHS[ym.m]} {ym.y}</b>
        <span className="mute" style={{ fontSize: '13px', marginLeft: 'auto' }}>{blockedThisMonth} day{blockedThisMonth === 1 ? '' : 's'} blocked</span>
        <button type="button" onClick={() => step(1)} aria-label="Next month" className="k-btn o sm" style={{ minWidth: '38px', padding: 0 }}>›</button>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,minmax(0,1fr))', textAlign: 'center', fontSize: '12px', fontWeight: '700', color: '#60666C', marginBottom: '4px' }}>
        {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((d, i) => <span key={i}>{d}</span>)}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,minmax(0,1fr))', gap: '4px' }}>
        {cells.map((d, i) => {
          if (!d) return <button key={i} className="day" type="button" disabled aria-hidden="true" style={{ background: 'transparent' }}></button>;
          const n = Number(d.slice(8));
          const label = `${MONTHS[ym.m]} ${n}`;
          if (d < today) return <button key={d} className="day" type="button" disabled aria-label={`${label}, past`} style={{ background: 'transparent', color: '#B5B1A8' }}>{n}</button>;
          if (bookedSet.has(d)) return <button key={d} className="day" type="button" disabled aria-label={`${label}, booked`} style={{ background: '#EDE5D5', color: '#7C7466', textDecoration: 'line-through' }}>{n}</button>;
          const on = blocked.has(d);
          return (
            <button key={d} className="day" type="button" aria-pressed={on} aria-label={on ? `${label}, blocked` : label} onClick={() => toggle(d)} disabled={busy === d}
              style={on ? { background: '#474C52', color: '#fff' } : { background: '#EEF3EC', color: '#1F4D3A' }}>{n}</button>
          );
        })}
      </div>
      <div style={{ display: 'flex', gap: '14px', marginTop: '10px', fontSize: '12px', color: '#474C52', flexWrap: 'wrap' }}>
        <span style={{ display: 'inline-flex', gap: '6px', alignItems: 'center' }}><span style={{ width: '14px', height: '14px', borderRadius: '5px', background: '#EEF3EC', boxShadow: 'inset 0 0 0 1px #BFD1BD' }}></span>Available</span>
        <span style={{ display: 'inline-flex', gap: '6px', alignItems: 'center' }}><span style={{ width: '14px', height: '14px', borderRadius: '5px', background: '#474C52' }}></span>Blocked by you</span>
        <span style={{ display: 'inline-flex', gap: '6px', alignItems: 'center' }}><span style={{ width: '14px', height: '14px', borderRadius: '5px', background: '#EDE5D5' }}></span>Booked</span>
      </div>
    </div>
  );
}
