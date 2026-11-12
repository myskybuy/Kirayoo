'use client';
import { usePathname } from 'next/navigation';
import { useEffect } from 'react';

// Blocks that animate in on every page: headings, cards, list rows, tables,
// forms, alerts, "Next" cards. Nested matches are skipped (the outer block
// carries its children), so nothing animates twice.
const TARGETS = [
  'main h1', 'main h2', 'main .card', 'main .k-card', 'main article', 'main .q', 'main .tw', 'main .k-next', 'main .k-alert',
  'main form', 'main .k-steps', 'main .row', 'main .conv', 'main .qi', 'main section[class*="card"]', 'main ol > li', 'main [data-anim]',
].join(',');
const SKIP = '.kh-hero, .k-reveal, .kh-split, .k-modal, .k-drawer, .k-sr, header, nav, [data-no-anim]';
const EASE = 'cubic-bezier(.2,.7,.2,1)';
const FROM = { opacity: 0, transform: 'translateY(16px) scale(.985)' };
const TO = { opacity: 1, transform: 'none' };

// Tracked here, not in DOM attributes: this can run before React hydrates the
// page, and touching attributes would cause hydration mismatches.
const done = new WeakSet<Element>();

function blocks(): HTMLElement[] {
  const all = Array.from(document.querySelectorAll<HTMLElement>(TARGETS));
  const set = new Set(all);
  return all.filter((el) => {
    if (el.closest(SKIP) || done.has(el)) return false;
    for (let p = el.parentElement; p; p = p.parentElement) if (set.has(p as HTMLElement)) return false;
    return true;
  });
}

/**
 * Site-wide entrance + scroll-reveal animations (Web Animations API, no
 * library). Runs on first load and after every client navigation. Content is
 * never hidden before JS runs (below-the-fold blocks are held invisible by a
 * paused animation, not by styles); prefers-reduced-motion turns it off.
 */
export default function SiteMotion() {
  const path = usePathname();

  // Once per app: header glass after scrolling, and 3D tilt + spotlight on [data-tilt].
  useEffect(() => {
    const root = document.documentElement;
    const onScroll = () => {
      const s = window.scrollY > 8;
      if (s !== (root.dataset.scrolled === '1')) {
        if (s) root.dataset.scrolled = '1';
        else delete root.dataset.scrolled;
      }
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return () => window.removeEventListener('scroll', onScroll);

    let cur: HTMLElement | null = null;
    const release = (el: HTMLElement) => {
      delete el.dataset.tilting;
      el.style.removeProperty('--rx');
      el.style.removeProperty('--ry');
    };
    const move = (e: PointerEvent) => {
      if (e.pointerType !== 'mouse') return;
      const el = (e.target as Element | null)?.closest?.<HTMLElement>('[data-tilt]') ?? null;
      if (cur && cur !== el) release(cur);
      cur = el;
      if (!el) return;
      const r = el.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width;
      const y = (e.clientY - r.top) / r.height;
      el.style.setProperty('--rx', `${((0.5 - y) * 7).toFixed(2)}deg`);
      el.style.setProperty('--ry', `${((x - 0.5) * 9).toFixed(2)}deg`);
      el.style.setProperty('--mx', `${(x * 100).toFixed(1)}%`);
      el.style.setProperty('--my', `${(y * 100).toFixed(1)}%`);
      el.dataset.tilting = '1';
    };
    const leave = () => { if (cur) release(cur); cur = null; };
    document.addEventListener('pointermove', move, { passive: true });
    document.addEventListener('pointerleave', leave);
    return () => {
      window.removeEventListener('scroll', onScroll);
      document.removeEventListener('pointermove', move);
      document.removeEventListener('pointerleave', leave);
    };
  }, []);

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    let io: IntersectionObserver | null = null;
    const holds = new Map<Element, Animation>();
    // Wait a frame so the new page is in the DOM.
    const raf = requestAnimationFrame(() => {
      const els = blocks();
      const vh = window.innerHeight;
      let k = 0;
      const later: HTMLElement[] = [];
      for (const el of els) {
        done.add(el);
        const r = el.getBoundingClientRect();
        if (r.top < vh && r.bottom > 0) {
          el.animate([FROM, TO], { duration: 520, delay: Math.min(k++, 10) * 55, easing: EASE, fill: 'backwards' });
        } else {
          holds.set(el, el.animate([{ opacity: 0 }], { fill: 'forwards' }));
          later.push(el);
        }
      }
      if (!later.length) return;
      let batch = 0;
      let batchTimer = 0;
      io = new IntersectionObserver(
        (entries) => {
          for (const e of entries) {
            if (!e.isIntersecting) continue;
            const el = e.target as HTMLElement;
            io!.unobserve(el);
            holds.get(el)?.cancel();
            holds.delete(el);
            // Elements arriving together are staggered.
            el.animate([FROM, TO], { duration: 560, delay: Math.min(batch++, 6) * 70, easing: EASE, fill: 'backwards' });
            clearTimeout(batchTimer);
            batchTimer = window.setTimeout(() => (batch = 0), 120);
          }
        },
        { rootMargin: '0px 0px -8% 0px' },
      );
      later.forEach((el) => io!.observe(el));
    });
    return () => {
      cancelAnimationFrame(raf);
      io?.disconnect();
      // Never leave anything invisible when leaving a page early.
      holds.forEach((a) => a.cancel());
    };
  }, [path]);
  return null;
}
