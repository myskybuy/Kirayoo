'use client';
import { useEffect, useRef } from 'react';
import { onFirstView, reducedMotionNow } from './motion';

/**
 * Staggered fade/slide-in of its direct children when scrolled into view.
 * Server HTML is fully visible; JS only hides content that is still below the
 * fold, so no-JS, above-the-fold and reduced-motion users never wait.
 */
export default function Reveal({ children, className = '', style, as: Tag = 'div', ...rest }: { children: React.ReactNode; className?: string; style?: React.CSSProperties; as?: 'div' | 'ol' | 'ul' | 'section' } & React.AriaAttributes) {
  const ref = useRef<HTMLElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el || reducedMotionNow()) return;
    Array.from(el.children).forEach((c, i) => (c as HTMLElement).style.setProperty('--i', String(Math.min(i, 8))));
    const stop = onFirstView(el, () => { el.dataset.reveal = 'in'; });
    if (stop) el.dataset.reveal = 'wait';
    return stop || undefined;
  }, []);
  return <Tag ref={ref as never} className={`k-reveal ${className}`} style={style} {...rest}>{children}</Tag>;
}
