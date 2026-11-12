'use client';
import Link from 'next/link';

/** S03 full-page error with retry. */
export default function ErrorBody({ reset, digest }: { reset: () => void; digest?: string }) {
  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto', padding: 'clamp(24px,5vw,56px) 16px 72px', boxSizing: 'border-box' }}>
      <section role="alert" style={{ background: 'var(--kb-fffdf8)', borderRadius: '32px', padding: 'clamp(32px,6vw,56px) 24px', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: '16px' }}>
        <span style={{ width: '120px', height: '120px', borderRadius: '50%', background: 'var(--kb-fbe3d8)', color: 'var(--kf-a93c18)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><svg width="54" height="54" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M12 3.5 2.5 20h19z"></path><path d="M12 10v4.5M12 17.3v.2"></path></svg></span>
        <span style={{ fontSize: '12px', fontWeight: '800', letterSpacing: '.08em', textTransform: 'uppercase', color: 'var(--kf-c9491f)' }}>Something went wrong</span>
        <h1 className="d" style={{ fontSize: 'clamp(30px,3.6vw,44px)', fontWeight: '700', color: 'var(--kf-1f4d3a)' }}>We couldn&apos;t load this page</h1>
        <p className="mute" style={{ maxWidth: '460px' }}>Something went wrong on our side. Your bookings and payments are safe. Try again in a moment.</p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', justifyContent: 'center' }}>
          <button className="k-btn p" type="button" onClick={() => reset()}>Try again</button>
          <Link className="k-btn o" href="/">Go home</Link>
        </div>
        {digest && <span className="mute" style={{ fontSize: '12px' }}>Error reference: {digest}</span>}
      </section>
    </div>
  );
}
