'use client';
import { useRef, useState } from 'react';

/** O06 four-box code entry → hidden input `otp`. */
export default function OtpInput({ name = 'otp' }: { name?: string }) {
  const [d, setD] = useState(['', '', '', '']);
  const refs = useRef<(HTMLInputElement | null)[]>([]);
  function put(i: number, v: string) {
    const c = v.replace(/\D/g, '');
    if (c.length > 1) {
      const all = c.slice(0, 4).split('');
      setD((x) => x.map((_, k) => all[k] ?? ''));
      refs.current[Math.min(all.length, 3)]?.focus();
      return;
    }
    setD((x) => x.map((y, k) => (k === i ? c : y)));
    if (c && i < 3) refs.current[i + 1]?.focus();
  }
  return (
    <>
      <div className="k-otp">
        {d.map((v, i) => (
          <input key={i} ref={(el) => { refs.current[i] = el; }} aria-label={`Digit ${i + 1}`} value={v} inputMode="numeric" autoComplete="off" maxLength={i === 0 ? 4 : 1}
            onChange={(e) => put(i, e.target.value)} onKeyDown={(e) => { if (e.key === 'Backspace' && !v && i > 0) refs.current[i - 1]?.focus(); }} />
        ))}
      </div>
      <input type="hidden" name={name} value={d.join('')} />
    </>
  );
}
