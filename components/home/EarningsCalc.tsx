'use client';
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { reducedMotionNow } from './motion';

type Cat = { key: string; label: string; avgPrice: number };

/** Number that glides to its new value (en-IN digits). */
function Glide({ value }: { value: number }) {
  const [n, setN] = useState(value);
  const from = useRef(value);
  useEffect(() => {
    if (reducedMotionNow()) return setN(value);
    const start = from.current;
    const t0 = performance.now();
    let raf = 0;
    const tick = (t: number) => {
      const p = Math.min(1, (t - t0) / 450);
      const v = Math.round(start + (value - start) * (1 - Math.pow(1 - p, 3)));
      setN(v);
      from.current = v;
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [value]);
  return <>{'₹' + n.toLocaleString('en-IN')}</>;
}

/**
 * Owner earnings calculator: price per day × days rented per month, minus the
 * platform fee. Starts from the real average day price of the category in
 * the viewer's city. An estimate, and labelled as one.
 */
export default function EarningsCalc({ categories, city, feePercent, href, cta }: { categories: Cat[]; city: string; feePercent: number; href: string; cta: string }) {
  const usable = categories.filter((c) => c.avgPrice > 0);
  const [cat, setCat] = useState(usable[0]?.key ?? '');
  const avg = usable.find((c) => c.key === cat)?.avgPrice ?? 300;
  const [price, setPrice] = useState(avg);
  const [days, setDays] = useState(8);
  useEffect(() => setPrice(avg), [avg]);
  const month = Math.round(price * days * (1 - feePercent / 100));

  return (
    <div className="kh-calc" data-tilt>
      <div className="kh-calc-form">
        <span className="kh-calc-l" id="calc-cat">What would you lend?</span>
        <div className="kh-calc-cats" role="group" aria-labelledby="calc-cat">
          {usable.map((c) => (
            <button key={c.key} type="button" aria-pressed={c.key === cat} onClick={() => setCat(c.key)}>{c.label}</button>
          ))}
        </div>
        <label className="kh-calc-l" htmlFor="calc-price">Price per day <b>₹{price.toLocaleString('en-IN')}</b> <small>avg in {city}: ₹{avg.toLocaleString('en-IN')}</small></label>
        <input id="calc-price" type="range" min={50} max={Math.max(3000, avg * 2)} step={10} value={price} onChange={(e) => setPrice(Number(e.target.value))} style={{ '--p': `${(price - 50) / (Math.max(3000, avg * 2) - 50) * 100}%` } as React.CSSProperties} />
        <label className="kh-calc-l" htmlFor="calc-days">Days rented out per month <b>{days}</b></label>
        <input id="calc-days" type="range" min={1} max={30} value={days} onChange={(e) => setDays(Number(e.target.value))} style={{ '--p': `${(days - 1) / 29 * 100}%` } as React.CSSProperties} />
      </div>
      <div className="kh-calc-out">
        <span className="k-sr" aria-live="polite">About ₹{month.toLocaleString('en-IN')} a month, ₹{(month * 12).toLocaleString('en-IN')} a year.</span>
        <span className="kh-calc-k" aria-hidden="true">You could earn about</span>
        <b className="kh-calc-v" aria-hidden="true"><Glide value={month} /></b>
        <span className="kh-calc-k" aria-hidden="true">a month · <Glide value={month * 12} /> a year</span>
        <small>{feePercent ? `After Kirayo's ${feePercent}% fee. ` : 'No platform fee right now. '}An estimate. You set your own price, deposit and free days.</small>
        <Link className="kh-btn" href={href}>{cta}<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6" /></svg></Link>
      </div>
    </div>
  );
}
