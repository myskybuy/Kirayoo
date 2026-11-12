'use client';
import { useState } from 'react';
import { monthDays } from './BlockCalendar';

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

export type Range = { start: string; end: string };

type Props = {
  today: string;
  unavailable: string[];
  value: Partial<Range>;
  onChange?: (r: Partial<Range>) => void;
  months?: number;
  small?: boolean;
  readOnly?: boolean;
  onBlocked?: (msg: string) => void;
};

function addDay(d: string, n: number) {
  const x = new Date(d + 'T00:00:00Z');
  x.setUTCDate(x.getUTCDate() + n);
  return x.toISOString().slice(0, 10);
}

/**
 * R04 availability calendar: past days disabled, booked/blocked days greyed
 * and struck through, tap a pickup day then a return day.
 */
export default function RangeCalendar({ today, unavailable, value, onChange, months = 1, small, readOnly, onBlocked }: Props) {
  const busy = new Set(unavailable);
  const [ym, setYm] = useState(() => {
    const base = value.start ?? today;
    return { y: Number(base.slice(0, 4)), m: Number(base.slice(5, 7)) - 1 };
  });
  const canPrev = `${ym.y}-${String(ym.m + 1).padStart(2, '0')}` > today.slice(0, 7);
  const step = (k: number) => setYm(({ y, m }) => ({ y: m + k > 11 ? y + 1 : m + k < 0 ? y - 1 : y, m: (m + k + 12) % 12 }));

  function pick(d: string) {
    if (readOnly || !onChange) return;
    const { start, end } = value;
    if (!start || (start && end) || d < start) return onChange({ start: d, end: undefined });
    // Range must not cross an unavailable day (end day inclusive).
    for (let x = start; x <= d; x = addDay(x, 1)) {
      if (busy.has(x)) {
        onBlocked?.('Those dates include a day that is already booked. Pick a shorter range.');
        return onChange({ start: d, end: undefined });
      }
    }
    onChange({ start, end: d });
  }

  const sz = small ? { height: '36px', fontSize: '13px' } : {};
  const list = Array.from({ length: months }, (_, i) => {
    const m = (ym.m + i) % 12;
    const y = ym.y + Math.floor((ym.m + i) / 12);
    return { y, m };
  });

  return (
    <div>
      <div style={{ display: 'grid', gap: '28px', gridTemplateColumns: 'repeat(auto-fit,minmax(min(260px,100%),1fr))' }}>
        {list.map(({ y, m }, idx) => (
          <div key={`${y}-${m}`}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: small ? '6px' : '10px', gap: '6px' }}>
              {idx === 0 ? (
                <button type="button" onClick={() => step(-1)} disabled={!canPrev} aria-label="Previous month" style={{ border: 0, background: 'none', cursor: canPrev ? 'pointer' : 'default', opacity: canPrev ? 1 : 0.3, fontSize: '20px', color: 'var(--kf-1f4d3a)', width: '28px' }}>‹</button>
              ) : <span style={{ width: '28px' }}></span>}
              <b className="d" style={{ fontSize: small ? '15px' : '17px' }}>{MONTHS[m]} {y}</b>
              {idx === list.length - 1 ? (
                <button type="button" onClick={() => step(1)} aria-label="Next month" style={{ border: 0, background: 'none', cursor: 'pointer', fontSize: '20px', color: 'var(--kf-1f4d3a)', width: '28px' }}>›</button>
              ) : <span style={{ width: '28px' }}></span>}
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,minmax(0,1fr))', textAlign: 'center', fontSize: small ? '11px' : '12px', fontWeight: '700', color: 'var(--kf-60666c)', marginBottom: '4px' }}>
              {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((d, i) => <span key={i}>{d}</span>)}
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,minmax(0,1fr))', rowGap: small ? '3px' : '4px' }}>
              {monthDays(y, m).map((d, i) => {
                if (!d) return <button key={i} className="day" type="button" disabled aria-hidden="true" style={{ ...sz, background: 'transparent', borderRadius: '0' }}></button>;
                const n = Number(d.slice(8));
                const label = `${MONTHS[m]} ${n}`;
                const s = value.start, e = value.end;
                if (d < today) return <button key={d} className="day" type="button" disabled aria-label={`${label}, past`} style={{ ...sz, background: 'transparent', color: 'var(--kf-a3a6a1)', borderRadius: '12px', fontWeight: '500' }}>{n}</button>;
                if (busy.has(d)) return <button key={d} className="day" type="button" disabled aria-label={`${label}, unavailable`} style={{ ...sz, background: 'var(--kb-ede5d5)', color: 'var(--kf-7c7466)', borderRadius: '12px', textDecoration: 'line-through', fontWeight: '600' }}>{n}</button>;
                const isS = d === s, isE = d === e, inR = !!(s && e && d > s && d < e);
                const style: React.CSSProperties =
                  isS || isE
                    ? { background: 'var(--kb-1f4d3a)', color: 'var(--kf-ffffff)', borderRadius: s && e && s !== e ? (isS ? '12px 0 0 12px' : '0 12px 12px 0') : '12px', fontWeight: '800' }
                    : inR
                      ? { background: 'var(--kb-dce6da)', color: 'var(--kf-1f4d3a)', borderRadius: '0', fontWeight: '600' }
                      : { background: 'transparent', color: 'var(--kf-23262a)', borderRadius: '12px', fontWeight: '600', boxShadow: d === today ? 'inset 0 0 0 1.5px #C9491F' : 'none' };
                return <button key={d} className="day" type="button" aria-label={label} aria-pressed={isS || isE || inR} onClick={() => pick(d)} disabled={readOnly} style={{ ...sz, ...style, cursor: readOnly ? 'default' : 'pointer' }}>{n}</button>;
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
