'use client';
import { Fragment, useEffect, useRef } from 'react';
import { onFirstView, reducedMotionNow } from './motion';

/**
 * Heading whose words rise in one after another when scrolled into view.
 * Server HTML shows the full text; only headings still below the fold wait.
 */
export default function SplitWords({ text, as: Tag = 'h2', className = '', id }: { text: string; as?: 'h2' | 'h3'; className?: string; id?: string }) {
  const ref = useRef<HTMLHeadingElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el || reducedMotionNow()) return;
    const stop = onFirstView(el, () => { el.dataset.split = 'in'; });
    if (stop) el.dataset.split = 'wait';
    return stop || undefined;
  }, []);
  return (
    <Tag ref={ref} id={id} className={`kh-split ${className}`} aria-label={text}>
      {text.split(' ').map((w, i) => (
        // The space sits between the inline-block wrappers; inside one it would collapse.
        <Fragment key={i}>{i > 0 && ' '}<span aria-hidden="true" style={{ '--w': i } as React.CSSProperties}><span>{w}</span></span></Fragment>
      ))}
    </Tag>
  );
}
