'use client';
import Link from 'next/link';
import { useActionState, useState } from 'react';
import { sendCodeAction, type FormState } from '@/app/actions/auth';

export default function LoginForm({ next, signup = false, email = '' }: { next: string; signup?: boolean; email?: string }) {
  const [state, action, pending] = useActionState<FormState, FormData>(sendCodeAction, undefined);
  const [em, setEm] = useState(email);
  const [nm, setNm] = useState("");
  return (
    <form action={action} style={{ flex: '1 1 400px', padding: 'clamp(24px,5vw,44px)', display: 'flex', flexDirection: 'column', gap: '20px', justifyContent: 'center' }}>
      <input type="hidden" name="next" value={next} />
      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
        <h1 className="d" style={{ fontSize: '32px', fontWeight: '700' }}>{signup ? 'Create your account' : 'Log in or sign up'}</h1>
        <p className="mute">{signup ? 'Your name and email. We send a one-time code — no password.' : 'Enter your email to get a one-time code.'}</p>
      </div>
      {signup && (
        <div>
          <label className="lbl" htmlFor="nm">Full name (as on your government ID)</label>
          <div style={{ position: 'relative' }}>
            <svg className="ic" viewBox="0 0 24 24" style={{ position: 'absolute', left: '16px', top: '17px', color: '#60666C' }}><circle cx="12" cy="8" r="4"></circle><path d="M4.5 20a7.5 7.5 0 0 1 15 0"></path></svg>
            <input className="in" id="nm" name="name" type="text" required autoComplete="name" value={nm} onChange={(e) => setNm(e.target.value)} />
          </div>
        </div>
      )}
      <div>
        <label className="lbl" htmlFor="em">Email address</label>
        <div style={{ position: 'relative' }}>
          <svg className="ic" viewBox="0 0 24 24" style={{ position: 'absolute', left: '16px', top: '17px', color: '#60666C' }}><rect x="3" y="5" width="18" height="14" rx="3"></rect><path d="m4 7 8 6 8-6"></path></svg>
          <input className="in" id="em" name="email" type="email" required value={em} onChange={(e) => setEm(e.target.value)} autoComplete="email" autoFocus={!signup} />
        </div>
      </div>
      {state?.error && <p className="k-alert err" role="alert">{state.error}</p>}
      <button className="btn btn-p" type="submit" disabled={pending} style={{ width: '100%' }}>
        {pending ? 'Sending…' : 'Send code'}
        <svg className="ic" viewBox="0 0 24 24"><path d="M5 12h14M13 6l6 6-6 6"></path></svg>
      </button>
      <p className="mute" style={{ fontSize: '13.5px' }}>
        {signup ? <>Already have an account? <Link href={`/login?next=${encodeURIComponent(next)}`}>Log in</Link></> : <>New to Kirayo? <Link href={`/signup?next=${encodeURIComponent(next)}`}>Create an account</Link></>}
      </p>
      <p className="mute" style={{ fontSize: '12.5px' }}>By continuing you agree to Kirayo&apos;s <Link href="/terms">Terms</Link>, <Link href="/privacy">Privacy policy</Link> and <Link href="/deposit-policy">Rental &amp; deposit policy</Link>.</p>
    </form>
  );
}
