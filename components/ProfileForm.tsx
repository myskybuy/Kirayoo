'use client';
import Link from 'next/link';
import { useActionState } from 'react';
import { updateProfileAction } from '@/app/actions/profile';
import type { FormState } from '@/app/actions/auth';

type Props = { name: string; email: string; phone: string; address: string; location: string };

export default function ProfileForm(p: Props) {
  const [state, action, pending] = useActionState<FormState, FormData>(updateProfileAction, undefined);
  return (
    <form action={action} className="card" style={{ padding: '26px', display: 'flex', flexDirection: 'column', gap: '18px' }}>
      <h2 className="d" style={{ fontSize: '24px', fontWeight: '700' }}>Personal details</h2>
      <div style={{ display: 'grid', gap: '16px', gridTemplateColumns: 'repeat(auto-fit,minmax(min(240px,100%),1fr))' }}>
        <div><label className="lbl" htmlFor="pn">Full name (as on ID)</label><input className="in" id="pn" name="name" type="text" defaultValue={p.name} required /></div>
        <div><label className="lbl" htmlFor="pe">Email</label><input className="in" id="pe" type="email" defaultValue={p.email} readOnly style={{ background: '#F6F1E7' }} /><span style={{ fontSize: '12px', color: '#1E5A37', fontWeight: '700' }}>Verified by OTP</span></div>
        <div><label className="lbl" htmlFor="pp">Phone</label><input className="in" id="pp" name="phone" type="tel" defaultValue={p.phone} placeholder="+91 98450 12345" /></div>
        <div>
          <label className="lbl" htmlFor="pa">Area</label>
          <input className="in" id="pa" type="text" value={p.location} readOnly style={{ background: '#F6F1E7' }} />
          <Link href="/location?next=/profile" style={{ fontSize: '12px', fontWeight: '700' }}>Change city / area</Link>
        </div>
        <div style={{ gridColumn: '1/-1' }}><label className="lbl" htmlFor="pd">Address for deliveries</label><input className="in" id="pd" name="address" type="text" defaultValue={p.address} placeholder="Flat, building, street, area, PIN" /></div>
      </div>
      {state?.error && <p className="k-alert err" role="alert">{state.error}</p>}
      {state?.ok && <p className="k-alert ok">{state.ok}</p>}
      <button className="btn" type="submit" disabled={pending} style={{ background: '#1F4D3A', color: '#fff', alignSelf: 'flex-start' }}>{pending ? 'Saving…' : 'Save changes'}</button>
    </form>
  );
}
