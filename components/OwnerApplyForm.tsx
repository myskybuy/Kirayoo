'use client';
import Link from 'next/link';
import { useActionState, useState } from 'react';
import { applyOwnerAction } from '@/app/actions/owner';
import type { FormState } from '@/app/actions/auth';

type Props = {
  initial: { name: string; phone: string; categories: string[]; plans: string };
  categories: { key: string; label: string }[];
};

/** /owner/apply form: name, phone, what they will rent, owner terms. */
export default function OwnerApplyForm({ initial, categories }: Props) {
  const [state, action, pending] = useActionState<FormState, FormData>(applyOwnerAction, undefined);
  const [f, setF] = useState(initial);
  const [terms, setTerms] = useState(false);
  const toggle = (k: string) => setF((s) => ({ ...s, categories: s.categories.includes(k) ? s.categories.filter((x) => x !== k) : [...s.categories, k] }));
  return (
    <form action={action} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <div style={{ display: 'grid', gap: '16px', gridTemplateColumns: 'repeat(auto-fit,minmax(min(220px,100%),1fr))' }}>
        <div><label className="lbl" htmlFor="oa-name">Full name (as on your ID)</label><input className="in" id="oa-name" name="name" type="text" required maxLength={80} autoComplete="name" value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} /></div>
        <div><label className="lbl" htmlFor="oa-phone">Mobile number</label><input className="in" id="oa-phone" name="phone" type="tel" required maxLength={20} autoComplete="tel" placeholder="+91 98450 12345" value={f.phone} onChange={(e) => setF({ ...f, phone: e.target.value })} /></div>
      </div>
      <fieldset style={{ border: 0, margin: 0, padding: 0 }}>
        <legend className="lbl">What will you rent out?</legend>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
          {categories.map((c) => {
            const on = f.categories.includes(c.key);
            return (
              <label key={c.key} className="k-pill" style={{ cursor: 'pointer', minHeight: '40px', ...(on ? { background: 'var(--kb-1f4d3a)', color: 'var(--kf-ffffff)' } : { background: 'var(--kb-ffffff)', color: 'var(--kf-23262a)', boxShadow: 'inset 0 0 0 1px var(--kl-e3daca)' }) }}>
                <input type="checkbox" name="categories" value={c.key} checked={on} onChange={() => toggle(c.key)} className="k-sr" />
                {on ? '✓ ' : ''}{c.label}
              </label>
            );
          })}
        </div>
      </fieldset>
      <div>
        <label className="lbl" htmlFor="oa-plans">Tell us about the items</label>
        <textarea className="in" id="oa-plans" name="plans" required minLength={10} maxLength={600} placeholder="e.g. A Canon 200D with two lenses, a 4-person tent and a Bosch drill." value={f.plans} onChange={(e) => setF({ ...f, plans: e.target.value })}></textarea>
      </div>
      <label style={{ display: 'flex', gap: '10px', alignItems: 'flex-start', padding: '12px 14px', borderRadius: '16px', background: 'var(--kb-f6f1e7)', fontSize: '14px', cursor: 'pointer' }}>
        <input type="checkbox" name="terms" checked={terms} onChange={(e) => setTerms(e.target.checked)} style={{ width: '20px', height: '20px', accentColor: 'var(--kf-1f4d3a)', margin: '1px 0 0', flex: 'none' }} />
        <span>I own these items, I&apos;ll describe them honestly, hand them over with the renter&apos;s OTP and follow the <Link href="/terms">Terms</Link> and <Link href="/deposit-policy">rental &amp; deposit policy</Link>.</span>
      </label>
      {state?.error && <p className="k-alert err" role="alert">{state.error}</p>}
      <button className="btn btn-p" type="submit" disabled={pending || !terms} style={{ width: '100%' }}>{pending ? 'Sending…' : 'Send application'}</button>
    </form>
  );
}
