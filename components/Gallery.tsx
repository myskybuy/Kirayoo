'use client';
import { useEffect, useRef, useState } from 'react';

const RADII = ['28px 8px 8px 28px', '8px', '8px 28px 8px 8px', '8px', '8px 8px 28px 8px'];
const TINTS = ['var(--kb-bfd1bd)', 'var(--kb-dce6da)', 'var(--kb-ede5d5)', 'var(--kb-e9e1cf)', 'var(--kb-e4e9df)'];

/** Left/right swipe on touch screens: returns handlers that call `go(-1 | 1)`. */
function useSwipe(go: (dir: -1 | 1) => void) {
  const x = useRef<number | null>(null);
  return {
    onTouchStart: (e: React.TouchEvent) => { x.current = e.touches[0].clientX; },
    onTouchEnd: (e: React.TouchEvent) => {
      if (x.current === null) return;
      const dx = e.changedTouches[0].clientX - x.current;
      x.current = null;
      if (Math.abs(dx) > 40) go(dx < 0 ? 1 : -1);
    },
  };
}

/**
 * R04 photo mosaic (1 large + 4 small) with an "All photos" viewer. On phones
 * the mosaic becomes a swipeable strip (scroll-snap) with dots; the viewer
 * also swipes.
 */
export default function Gallery({ photos, title, icon }: { photos: string[]; title: string; icon?: string }) {
  const [open, setOpen] = useState<number | null>(null);
  const [slide, setSlide] = useState(0);
  const strip = useRef<HTMLDivElement>(null);
  const step = (dir: -1 | 1) => setOpen((i) => (i === null ? i : (i + dir + photos.length) % photos.length));
  const swipe = useSwipe(step);
  useEffect(() => {
    if (open === null) return;
    const k = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(null);
      if (e.key === 'ArrowRight') step(1);
      if (e.key === 'ArrowLeft') step(-1);
    };
    window.addEventListener('keydown', k);
    return () => window.removeEventListener('keydown', k);
  }, [open, photos.length]);

  return (
    <>
      {photos.length > 0 && (
        <div className="k-swipe-wrap">
          <div ref={strip} className="k-swipe" aria-label={`${title} photos, swipe to see more`} onScroll={(e) => { const el = e.currentTarget; setSlide(Math.round(el.scrollLeft / el.clientWidth)); }}>
            {photos.map((p, i) => (
              <button key={p + i} type="button" onClick={() => setOpen(i)} aria-label={`Open photo ${i + 1} of ${photos.length}`}>
                <img src={p} alt={`${title} — photo ${i + 1}`} className="k-photo" loading={i ? 'lazy' : undefined} />
              </button>
            ))}
          </div>
          {photos.length > 1 && (
            <>
              <span className="k-swipe-count">{slide + 1} / {photos.length}</span>
              <div className="k-dots" role="tablist" aria-label="Choose photo">
                {photos.map((_, i) => <button key={i} type="button" role="tab" aria-selected={i === slide} aria-label={`Photo ${i + 1}`} onClick={() => strip.current?.scrollTo({ left: i * strip.current.clientWidth, behavior: 'smooth' })} />)}
              </div>
            </>
          )}
        </div>
      )}
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
          <button type="button" onClick={() => setOpen(0)} style={{ position: 'absolute', right: '16px', bottom: '16px', display: 'flex', alignItems: 'center', gap: '8px', minHeight: '44px', padding: '0 16px', borderRadius: '999px', border: '0', background: 'var(--kb-fffdf8)', font: "700 14px 'Plus Jakarta Sans',sans-serif", boxShadow: '0 6px 18px -6px rgba(35,38,42,.35)', cursor: 'pointer' }}>
            <svg className="ic" viewBox="0 0 24 24" style={{ width: '18px', height: '18px' }}><rect x="4" y="4" width="7" height="7" rx="2"></rect><rect x="13" y="4" width="7" height="7" rx="2"></rect><rect x="4" y="13" width="7" height="7" rx="2"></rect><rect x="13" y="13" width="7" height="7" rx="2"></rect></svg>
            All {photos.length} photo{photos.length > 1 ? 's' : ''}
          </button>
        )}
      </div>
      {open !== null && (
        <div className="k-modal" role="dialog" aria-modal="true" aria-label="Photos" onClick={() => setOpen(null)} style={{ background: 'rgba(20,22,24,.88)' }}>
          <div onClick={(e) => e.stopPropagation()} {...swipe} style={{ background: 'transparent', boxShadow: 'none', width: 'min(1000px,100%)', padding: 0, alignItems: 'center', touchAction: 'pan-y' }}>
            <img src={photos[open]} alt={`${title} — photo ${open + 1}`} style={{ maxWidth: '100%', maxHeight: '78vh', borderRadius: '20px', objectFit: 'contain' }} />
            <div style={{ display: 'flex', gap: '10px', alignItems: 'center', color: 'var(--kf-ffffff)' }}>
              <button type="button" className="k-btn o sm" style={{ color: 'var(--kf-ffffff)', boxShadow: 'inset 0 0 0 1.5px var(--kl-ffffff)' }} onClick={() => step(-1)}>‹ Prev</button>
              <span style={{ fontWeight: 700 }}>{open + 1} / {photos.length}</span>
              <button type="button" className="k-btn o sm" style={{ color: 'var(--kf-ffffff)', boxShadow: 'inset 0 0 0 1.5px var(--kl-ffffff)' }} onClick={() => step(1)}>Next ›</button>
              <button type="button" className="k-btn p sm" onClick={() => setOpen(null)}>Close</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
