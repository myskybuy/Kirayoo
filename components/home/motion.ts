'use client';
import { useEffect, useState } from 'react';

const QUERY = '(prefers-reduced-motion: reduce)';

/** True when the user asked the OS for less motion (false during SSR). */
export function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const m = window.matchMedia(QUERY);
    setReduced(m.matches);
    const on = () => setReduced(m.matches);
    m.addEventListener('change', on);
    return () => m.removeEventListener('change', on);
  }, []);
  return reduced;
}

export const reducedMotionNow = () => typeof window !== 'undefined' && window.matchMedia(QUERY).matches;

/**
 * Calls `onEnter` once when `el` scrolls into view. Returns false (and never
 * calls back) when the element is already visible on mount, so content above
 * the fold is never hidden and re-shown.
 */
export function onFirstView(el: Element, onEnter: () => void, margin = '0px 0px -10% 0px'): (() => void) | false {
  const r = el.getBoundingClientRect();
  if (r.top < window.innerHeight && r.bottom > 0) return false;
  const io = new IntersectionObserver(
    (entries) => {
      if (entries.some((e) => e.isIntersecting)) {
        io.disconnect();
        onEnter();
      }
    },
    { rootMargin: margin },
  );
  io.observe(el);
  return () => io.disconnect();
}
