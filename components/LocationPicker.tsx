'use client';
import { useMemo, useState } from 'react';
import { saveLocationAction } from '@/app/actions/location';

type City = { name: string; areas: string[] };

export default function LocationPicker({ cities, current, next }: { cities: City[]; current: { city: string; area: string } | null; next: string }) {
  const [city, setCity] = useState(current?.city ?? cities[0]?.name ?? '');
  const [area, setArea] = useState(current?.area ?? '');
  const [q, setQ] = useState('');
  const areas = useMemo(() => {
    const list = cities.find((c) => c.name === city)?.areas ?? [];
    const s = q.trim().toLowerCase();
    return s ? list.filter((a) => a.toLowerCase().includes(s)) : list;
  }, [cities, city, q]);
  const areaOk = cities.find((c) => c.name === city)?.areas.includes(area);

  return (
    <form action={saveLocationAction} style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
      <input type="hidden" name="city" value={city} />
      <input type="hidden" name="area" value={areaOk ? area : ''} />
      <input type="hidden" name="next" value={next} />
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <b style={{ fontSize: '13px', color: '#474C52' }}>1 · City</b>
        <div role="radiogroup" aria-label="City" style={{ display: 'grid', gap: '10px', gridTemplateColumns: 'repeat(auto-fill,minmax(150px,1fr))' }}>
          {cities.map((c) => {
            const on = c.name === city;
            return (
              <button key={c.name} className="city" type="button" role="radio" aria-checked={on} onClick={() => { setCity(c.name); setArea(''); setQ(''); }}
                style={on ? { background: '#1F4D3A', color: '#fff', boxShadow: 'none' } : { background: '#F6F1E7', color: '#23262A', boxShadow: 'inset 0 0 0 1px #E3DACA' }}>
                {c.name}<span style={{ fontSize: '12px', fontWeight: '500', opacity: '.8' }}>{c.areas.length} areas</span>
              </button>
            );
          })}
        </div>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <label htmlFor="area-q" style={{ fontSize: '13px', fontWeight: '700', color: '#474C52' }}>2 · Area in {city}</label>
        <div style={{ position: 'relative' }}>
          <svg className="ic" viewBox="0 0 24 24" style={{ position: 'absolute', left: '16px', top: '16px', color: '#60666C' }}><circle cx="11" cy="11" r="6.5"></circle><path d="m20 20-4-4"></path></svg>
          <input className="in" id="area-q" type="text" placeholder="Search areas" value={q} onChange={(e) => setQ(e.target.value)} />
        </div>
        <div role="radiogroup" aria-label="Area" style={{ display: 'grid', gap: '8px', gridTemplateColumns: 'repeat(auto-fill,minmax(200px,1fr))' }}>
          {areas.map((a) => {
            const on = a === area;
            return (
              <button key={a} className="area" type="button" role="radio" aria-checked={on} onClick={() => setArea(a)}
                style={on ? { background: '#EEF3EC', color: '#1F4D3A', boxShadow: 'inset 0 0 0 2px #1F4D3A' } : { background: '#fff', color: '#23262A', boxShadow: 'inset 0 0 0 1px #E3DACA' }}>
                <span style={on ? { width: '20px', height: '20px', borderRadius: '50%', boxShadow: 'inset 0 0 0 5px #DCE6DA', background: '#1F4D3A', flex: 'none' } : { width: '20px', height: '20px', borderRadius: '50%', boxShadow: 'inset 0 0 0 1.5px #BFB4A0', background: '#fff', flex: 'none' }}></span>{a}
              </button>
            );
          })}
          {!areas.length && <p className="mute">No area matches “{q}”.</p>}
        </div>
      </div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '14px', alignItems: 'center', justifyContent: 'space-between', paddingTop: '20px', borderTop: '1px solid #E3DACA' }}>
        <span style={{ fontSize: '14px' }}>{areaOk ? <>Showing items near <b>{area}, {city}</b></> : 'Pick an area to continue'}</span>
        <button className="btn btn-p" type="submit" disabled={!areaOk}>{areaOk ? `Show items in ${area}` : 'Choose an area'}
          <svg className="ic" viewBox="0 0 24 24"><path d="M5 12h14M13 6l6 6-6 6"></path></svg></button>
      </div>
    </form>
  );
}
