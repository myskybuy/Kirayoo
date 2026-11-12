'use client';
import { useEffect, useRef, useState } from 'react';
import { onFirstView, reducedMotionNow } from './motion';

/**
 * Counts from 0 to `value` (en-IN digits) when scrolled into view. The server
 * renders the final number, so it is correct without JS or with reduced motion.
 */
export default function CountUp({ value, prefix = '', suffix = '', ms = 1400 }: { value: number; prefix?: string; suffix?: string; ms?: number }) {
  const [n, setN] = useState(value);
  const ref = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el || reducedMotionNow() || value <= 0) return;
    let raf = 0;
    const run = () => {
      const t0 = performance.now();
      const tick = (t: number) => {
        const p = Math.min(1, (t - t0) / ms);
        setN(Math.round(value * (1 - Math.pow(1 - p, 3))));
        if (p < 1) raf = requestAnimationFrame(tick);
      };
      raf = requestAnimationFrame(tick);
    };
    const stop = onFirstView(el, run, '0px');
    if (stop) setN(0);
    return () => {
      if (stop) stop();
      cancelAnimationFrame(raf);
    };
  }, [value, ms]);
  return (
    <span ref={ref} aria-label={`${prefix}${value.toLocaleString('en-IN')}${suffix}`}>
      <span aria-hidden="true">{prefix}{n.toLocaleString('en-IN')}{suffix}</span>
    </span>
  );
}
