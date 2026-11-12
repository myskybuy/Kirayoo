'use client';
import Link from 'next/link';
import { useActionState, useEffect, useRef, useState } from 'react';
import { resendCodeAction, verifyCodeAction, type FormState } from '@/app/actions/auth';

export default function VerifyForm({ email, needName, devCode, wait }: { email: string; needName: boolean; devCode?: string; wait: number }) {
  const [state, action, pending] = useActionState<FormState, FormData>(verifyCodeAction, undefined);
  const [resendState, resend, resending] = useActionState<FormState, FormData>(resendCodeAction, undefined);
  const [digits, setDigits] = useState<string[]>(Array(6).fill(''));
  const [left, setLeft] = useState(wait);
  const [name, setName] = useState("");
  const refs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (resendState?.ok) setLeft(30);
  }, [resendState]);
  useEffect(() => {
    if (left <= 0) return;
    const t = setTimeout(() => setLeft((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [left]);

  function put(i: number, v: string) {
    const clean = v.replace(/\D/g, '');
    if (clean.length > 1) {
      // paste of the whole code
      const all = clean.slice(0, 6).split('');
      setDigits((d) => d.map((_, k) => all[k] ?? ''));
      refs.current[Math.min(all.length, 5)]?.focus();
      return;
    }
    setDigits((d) => d.map((x, k) => (k === i ? clean : x)));
    if (clean && i < 5) refs.current[i + 1]?.focus();
  }

  const firstEmpty = digits.findIndex((d) => !d);

  return (
    <form action={action} style={{ background: 'var(--kb-fffdf8)', borderRadius: '32px', padding: '40px clamp(20px,5vw,44px)', display: 'flex', flexDirection: 'column', gap: '22px', boxShadow: '0 2px 6px rgba(35,38,42,.06),0 30px 60px -24px rgba(31,77,58,.35)' }}>
      <Link href="/login" style={{ alignSelf: 'flex-start', display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '14px', fontWeight: '700', textDecoration: 'none', minHeight: '44px' }}><svg className="ic" viewBox="0 0 24 24" style={{ width: '18px', height: '18px' }}><path d="M19 12H5M11 6l-6 6 6 6"></path></svg>Back</Link>
      <span style={{ width: '60px', height: '60px', borderRadius: '20px', background: 'var(--kb-dce6da)', color: 'var(--kf-1f4d3a)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><svg className="ic" viewBox="0 0 24 24" style={{ width: '28px', height: '28px' }}><rect x="3" y="5" width="18" height="14" rx="3"></rect><path d="m4 7 8 6 8-6"></path></svg></span>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
        <h1 className="d" style={{ fontSize: '32px', fontWeight: '700' }}>Check your inbox</h1>
        <p className="mute">We sent a 6-digit code to <b style={{ color: 'var(--kf-23262a)' }}>{email}</b>. <Link href="/login">Change</Link></p>
      </div>
      {devCode && (
        <p className="k-alert info" style={{ textAlign: 'center' }}>Demo account — your code is <b style={{ letterSpacing: '.2em', fontSize: '17px' }}>{devCode}</b></p>
      )}
      <fieldset style={{ border: '0', margin: '0', padding: '0' }}>
        <legend className="lbl">Enter code</legend>
        <div className="otp">
          {digits.map((d, i) => (
            <input
              key={i}
              ref={(el) => { refs.current[i] = el; }}
              aria-label={`Digit ${i + 1}`}
              className={i === (firstEmpty === -1 ? 5 : firstEmpty) ? 'f' : undefined}
              value={d}
              inputMode="numeric"
              autoComplete={i === 0 ? 'one-time-code' : 'off'}
              autoFocus={i === 0}
              maxLength={i === 0 ? 6 : 1}
              onChange={(e) => put(i, e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Backspace' && !d && i > 0) refs.current[i - 1]?.focus();
              }}
            />
          ))}
        </div>
        <input type="hidden" name="code" value={digits.join('')} />
      </fieldset>
      {needName && (
        <div style={{ padding: '16px', borderRadius: '18px', background: 'var(--kb-eef3ec)', display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <label className="lbl" htmlFor="nm" style={{ margin: '0' }}>New here? Your full name</label>
          <input className="in" id="nm" name="name" type="text" autoComplete="name" required value={name} onChange={(e) => setName(e.target.value)} />
          <span className="mute" style={{ fontSize: '12.5px' }}>Use the name on your government ID. You&apos;ll verify it before your first payment.</span>
        </div>
      )}
      {state?.error && <p className="k-alert err" role="alert">{state.error}</p>}
      {resendState?.error && <p className="k-alert err" role="alert">{resendState.error}</p>}
      {resendState?.ok && <p className="k-alert ok">{resendState.ok}</p>}
      <button className="btn btn-p" type="submit" disabled={pending || digits.join('').length !== 6} style={{ width: '100%' }}>{pending ? 'Checking…' : 'Verify & continue'}</button>
      <p className="mute" style={{ fontSize: '13.5px', textAlign: 'center' }}>
        Didn&apos;t get it? Check spam, or{' '}
        {left > 0 ? (
          <b style={{ color: 'var(--kf-23262a)' }}>resend in 0:{String(left).padStart(2, '0')}</b>
        ) : (
          <button type="submit" formAction={resend} disabled={resending} style={{ background: 'none', border: 0, padding: 0, font: 'inherit', fontWeight: 700, color: 'var(--kf-1f4d3a)', textDecoration: 'underline', cursor: 'pointer' }}>{resending ? 'sending…' : 'resend the code'}</button>
        )}
      </p>
    </form>
  );
}
