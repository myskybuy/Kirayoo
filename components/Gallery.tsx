'use client';
import { useEffect, useState } from 'react';

const RADII = ['28px 8px 8px 28px', '8px', '8px 28px 8px 8px', '8px', '8px 8px 28px 8px'];
const TINTS = ['#BFD1BD', '#DCE6DA', '#EDE5D5', '#E9E1CF', '#E4E9DF'];

/** R04 photo mosaic (1 large + 4 small) with an "All photos" viewer. */
export default function Gallery({ photos, title, icon }: { photos: string[]; title: string; icon?: string }) {
  const [open, setOpen] = useState<number | null>(null);
  useEffect(() => {
    if (open === null) return;
    const k = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(null);
      if (e.key === 'ArrowRight') setOpen((i) => (i === null ? i : (i + 1) % photos.length));
      if (e.key === 'ArrowLeft') setOpen((i) => (i === null ? i : (i - 1 + photos.length) % photos.length));
    };
    window.addEventListener('keydown', k);
    return () => window.removeEventListener('keydown', k);
  }, [open, photos.length]);

  return (
    <>
      <div style={{ display: 'grid', gap: '10px', gridTemplateColumns: 'repeat(4,minmax(0,1fr))', gridTemplateRows: '220px 220px', position: 'relative' }} className="mosaic k-mosaic">
        {Array.from({ length: 5 }, (_, i) => {
          const p = photos[i];
          const style: React.CSSProperties = { ...(i === 0 ? { gridColumn: 'span 2', gridRow: 'span 2' } : {}), background: TINTS[i], borderRadius: RADII[i], overflow: 'hidden', position: 'relative', border: 0, padding: 0, cursor: p ? 'zoom-in' : 'default' };
          return p ? (
            <button key={i} type="button" onClick={() => setOpen(i)} aria-label={`Open photo ${i + 1}`} style={style} className={i > 0 ? 'k-mosaic-s' : undefined}>
              <img src={p} alt={`${title} — photo ${i + 1}`} className="k-photo" />
            </button>
          ) : (
            <div key={i} className={`ph${i > 0 ? ' k-mosaic-s' : ''}`} style={style}>
              {i === 0 && <svg width="54" height="54" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" dangerouslySetInnerHTML={{ __html: icon ?? '' }} />}
            </div>
          );
        })}
        {photos.length > 0 && (
          <button type="button" onClick={() => setOpen(0)} style={{ position: 'absolute', right: '16px', bottom: '16px', display: 'flex', alignItems: 'center', gap: '8px', minHeight: '44px', padding: '0 16px', borderRadius: '999px', border: '0', background: '#FFFDF8', font: "700 14px 'Plus Jakarta Sans',sans-serif", boxShadow: '0 6px 18px -6px rgba(35,38,42,.35)', cursor: 'pointer' }}>
            <svg className="ic" viewBox="0 0 24 24" style={{ width: '18px', height: '18px' }}><rect x="4" y="4" width="7" height="7" rx="2"></rect><rect x="13" y="4" width="7" height="7" rx="2"></rect><rect x="4" y="13" width="7" height="7" rx="2"></rect><rect x="13" y="13" width="7" height="7" rx="2"></rect></svg>
            All {photos.length} photo{photos.length > 1 ? 's' : ''}
          </button>
        )}
      </div>
      {open !== null && (
        <div className="k-modal" role="dialog" aria-modal="true" aria-label="Photos" onClick={() => setOpen(null)} style={{ background: 'rgba(20,22,24,.88)' }}>
          <div onClick={(e) => e.stopPropagation()} style={{ background: 'transparent', boxShadow: 'none', width: 'min(1000px,100%)', padding: 0, alignItems: 'center' }}>
            <img src={photos[open]} alt={`${title} — photo ${open + 1}`} style={{ maxWidth: '100%', maxHeight: '78vh', borderRadius: '20px', objectFit: 'contain' }} />
            <div style={{ display: 'flex', gap: '10px', alignItems: 'center', color: '#fff' }}>
              <button type="button" className="k-btn o sm" style={{ color: '#fff', boxShadow: 'inset 0 0 0 1.5px #fff' }} onClick={() => setOpen((open - 1 + photos.length) % photos.length)}>‹ Prev</button>
              <span style={{ fontWeight: 700 }}>{open + 1} / {photos.length}</span>
              <button type="button" className="k-btn o sm" style={{ color: '#fff', boxShadow: 'inset 0 0 0 1.5px #fff' }} onClick={() => setOpen((open + 1) % photos.length)}>Next ›</button>
              <button type="button" className="k-btn p sm" onClick={() => setOpen(null)}>Close</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
