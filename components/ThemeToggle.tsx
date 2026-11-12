'use client';
import { useEffect, useState } from 'react';
import { THEME_KEY as KEY } from '@/lib/theme';

type Theme = 'light' | 'dark';

/**
 * Light / dark switch. The new theme spreads out in a circle from the button
 * (View Transitions API); without it, or with reduced motion, it just switches.
 */
export default function ThemeToggle({ variant = 'header' }: { variant?: 'header' | 'panel' }) {
  const [theme, setTheme] = useState<Theme | null>(null);
  useEffect(() => setTheme(document.documentElement.dataset.theme === 'dark' ? 'dark' : 'light'), []);

  function apply(next: Theme) {
    document.documentElement.dataset.theme = next;
    try { localStorage.setItem(KEY, next); } catch { /* private mode: session only */ }
    setTheme(next);
  }

  function toggle(e: React.MouseEvent<HTMLButtonElement>) {
    const next: Theme = theme === 'dark' ? 'light' : 'dark';
    const doc = document as Document & { startViewTransition?: (cb: () => void) => unknown };
    if (!doc.startViewTransition || matchMedia('(prefers-reduced-motion: reduce)').matches) return apply(next);
    const r = e.currentTarget.getBoundingClientRect();
    const root = document.documentElement;
    root.style.setProperty('--tx', `${r.left + r.width / 2}px`);
    root.style.setProperty('--ty', `${r.top + r.height / 2}px`);
    root.classList.add('k-theme-switch');
    const vt = doc.startViewTransition(() => apply(next)) as { finished?: Promise<void> };
    vt.finished?.finally(() => root.classList.remove('k-theme-switch'));
  }

  const dark = theme === 'dark';
  return (
    <button type="button" onClick={toggle} className={`k-theme ${variant}`} aria-label={dark ? 'Switch to light mode' : 'Switch to dark mode'} aria-pressed={dark} title={dark ? 'Light mode' : 'Dark mode'}>
      <span className="k-theme-ic" data-dark={dark || undefined} aria-hidden="true">
        <svg className="sun" viewBox="0 0 24 24"><circle cx="12" cy="12" r="4.2" /><path d="M12 2.5v2.2M12 19.3v2.2M4.6 4.6l1.6 1.6M17.8 17.8l1.6 1.6M2.5 12h2.2M19.3 12h2.2M4.6 19.4l1.6-1.6M17.8 6.2l1.6-1.6" /></svg>
        <svg className="moon" viewBox="0 0 24 24"><path d="M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5z" /></svg>
      </span>
      {variant === 'panel' && <span>{dark ? 'Light mode' : 'Dark mode'}</span>}
    </button>
  );
}
