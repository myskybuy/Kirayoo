'use client';
import Link from 'next/link';
import { useCallback, useEffect, useRef, useState } from 'react';
import { usePrefersReducedMotion } from './motion';

export type Banner = {
  key: string;
  eyebrow: string;
  title: string;
  /** Part of the title shown in the gold gradient. */
  accent?: string;
  text: string;
  cta: { href: string; label: string };
  alt?: { href: string; label: string };
  theme: 'forest' | 'cream' | 'clay' | 'festive';
  art: React.ReactNode;
};

const SLIDE_MS = 6000;

function accented(title: string, accent?: string) {
  const at = accent ? title.indexOf(accent) : -1;
  if (at < 0) return title;
  return <>{title.slice(0, at)}<em>{accent}</em>{title.slice(at + accent!.length)}</>;
}

/**
 * Home hero carousel. Auto-advances every 6 s; pauses on hover, keyboard
 * focus, when the tab is hidden, or with the pause button. Swipe, ←/→ keys,
 * arrows and dots. Reduced motion: no autoplay, no slide animation.
 */
export default function HeroCarousel({ banners }: { banners: Banner[] }) {
  const [i, setI] = useState(0);
  const [hover, setHover] = useState(false);
  const [focus, setFocus] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [userPaused, setUserPaused] = useState(false);
  const reduced = usePrefersReducedMotion();
  const startX = useRef<number | null>(null);
  const n = banners.length;
  const go = useCallback((to: number) => setI(((to % n) + n) % n), [n]);
  const playing = !reduced && !userPaused && !hover && !focus && !hidden && n > 1;

  useEffect(() => {
    const v = () => setHidden(document.visibilityState === 'hidden');
    v();
    document.addEventListener('visibilitychange', v);
    return () => document.removeEventListener('visibilitychange', v);
  }, []);

  // A fresh timer per slide, so a manual change always gets the full 6 s.
  useEffect(() => {
    if (!playing) return;
    const t = setTimeout(() => go(i + 1), SLIDE_MS);
    return () => clearTimeout(t);
  }, [i, playing, go]);

  return (
    <section
      className="kh-hero"
      data-tone={banners[i]?.theme === 'cream' ? 'light' : 'dark'}
      aria-roledescription="carousel"
      aria-label="Kirayo highlights"
      onMouseEnter={() => setHover(true)}
      onMouseLeave={(e) => { setHover(false); e.currentTarget.style.setProperty('--px', '0'); e.currentTarget.style.setProperty('--py', '0'); }}
      onPointerMove={(e) => {
        // Parallax: the illustration drifts a little with the mouse (CSS vars, no re-render).
        if (e.pointerType !== 'mouse' || reduced) return;
        const r = e.currentTarget.getBoundingClientRect();
        e.currentTarget.style.setProperty('--px', (((e.clientX - r.left) / r.width) * 2 - 1).toFixed(3));
        e.currentTarget.style.setProperty('--py', (((e.clientY - r.top) / r.height) * 2 - 1).toFixed(3));
      }}
      onFocus={() => setFocus(true)}
      onBlur={(e) => { if (!e.currentTarget.contains(e.relatedTarget as Node)) setFocus(false); }}
      onKeyDown={(e) => {
        if (e.key === 'ArrowRight') { e.preventDefault(); go(i + 1); }
        if (e.key === 'ArrowLeft') { e.preventDefault(); go(i - 1); }
      }}
    >
      <div
        className="kh-track"
        aria-live={playing ? 'off' : 'polite'}
        onPointerDown={(e) => { if (e.pointerType !== 'mouse') startX.current = e.clientX; }}
        onPointerUp={(e) => {
          if (startX.current === null) return;
          const dx = e.clientX - startX.current;
          startX.current = null;
          if (Math.abs(dx) > 50) go(dx < 0 ? i + 1 : i - 1);
        }}
        onPointerCancel={() => { startX.current = null; }}
      >
        {banners.map((b, k) => {
          const on = k === i;
          return (
            <div key={b.key} className={`kh-slide kh-${b.theme}`} data-on={on || undefined} role="group" aria-roledescription="slide" aria-label={`${k + 1} of ${n}: ${b.title}`} aria-hidden={!on} inert={!on}>
              <div className="kh-copy">
                <span className="kh-eyebrow">{b.eyebrow}</span>
                <h2 className="kh-title">{accented(b.title, b.accent)}</h2>
                <p className="kh-text">{b.text}</p>
                <div className="kh-ctas">
                  <Link className="kh-btn" href={b.cta.href}>{b.cta.label}<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6" /></svg></Link>
                  {b.alt && <Link className="kh-btn ghost" href={b.alt.href}>{b.alt.label}</Link>}
                </div>
              </div>
              <div className="kh-art" aria-hidden="true">{b.art}</div>
            </div>
          );
        })}
      </div>
      {n > 1 && (
        <div className="kh-controls">
          <button type="button" className="kh-arrow" aria-label="Previous slide" onClick={() => go(i - 1)}><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M15 6l-6 6 6 6" /></svg></button>
          <div className="kh-dots">
            {banners.map((b, k) => (
              <button key={b.key} type="button" aria-label={`Show slide ${k + 1}: ${b.title}`} aria-current={k === i || undefined} onClick={() => go(k)}>
                {/* The active dot fills over the 6 s; it freezes while paused. */}
                <span style={{ animationPlayState: playing ? 'running' : 'paused' }} key={`${k}-${k === i ? i : 'x'}`} />
              </button>
            ))}
          </div>
          <button type="button" className="kh-arrow" aria-label="Next slide" onClick={() => go(i + 1)}><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 6l6 6-6 6" /></svg></button>
          {!reduced && (
            <button type="button" className="kh-arrow" aria-label={userPaused ? 'Play slideshow' : 'Pause slideshow'} aria-pressed={userPaused} onClick={() => setUserPaused((p) => !p)}>
              {userPaused ? <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 5v14l11-7z" /></svg> : <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 5v14M16 5v14" /></svg>}
            </button>
          )}
        </div>
      )}
    </section>
  );
}
