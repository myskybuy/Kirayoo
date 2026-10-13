'use client';
import Link from 'next/link';
import { useActionState, useState } from 'react';
import { submitIdAction } from '@/app/actions/idverify';
import type { FormState } from '@/app/actions/auth';
import SingleUpload from './SingleUpload';

const TYPES = [
  { key: 'Aadhaar', hint: 'Masked preferred' },
  { key: 'PAN', hint: 'Front only' },
  { key: 'Driving licence', hint: 'Front side' },
  { key: 'Passport', hint: 'Photo page' },
];

export default function IdForm({ next }: { next: string }) {
  const [state, action, pending] = useActionState<FormState, FormData>(submitIdAction, undefined);
  const [type, setType] = useState('Aadhaar');
  const [consent, setConsent] = useState(true);
  return (
    <form action={action} className="card" style={{ padding: 'clamp(18px,3vw,26px)', display: 'flex', flexDirection: 'column', gap: '28px' }}>
      <input type="hidden" name="docType" value={type} />
      <input type="hidden" name="next" value={next} />
      <div className="step">
        <span className="n">1</span>
        <div style={{ flex: '1', minWidth: 0, display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <b style={{ fontSize: '17px' }}>Choose a government ID</b>
          <div role="radiogroup" aria-label="ID type" style={{ display: 'grid', gap: '10px', gridTemplateColumns: 'repeat(auto-fill,minmax(140px,1fr))' }}>
            {TYPES.map((t) => (
              <button key={t.key} className="idt" type="button" role="radio" aria-checked={type === t.key} onClick={() => setType(t.key)}
                style={type === t.key ? { background: '#1F4D3A', color: '#fff', boxShadow: 'none' } : { background: '#fff', color: '#23262A', boxShadow: 'inset 0 0 0 1px #E3DACA' }}>
                {t.key === 'PAN' ? 'PAN card' : t.key}<span style={{ fontSize: '12px', fontWeight: '500', opacity: '.85' }}>{t.hint}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
      <div className="step">
        <span className="n">2</span>
        <div style={{ flex: '1', minWidth: 0, display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <b style={{ fontSize: '17px' }}>Upload a clear photo of your {type === 'PAN' ? 'PAN card' : type}</b>
          <SingleUpload name="doc" title={`${type} photo`} hint="JPG, PNG or WebP, up to 5 MB" icon={<svg className="ic" viewBox="0 0 24 24"><path d="M12 16V4M7 9l5-5 5 5M4 16v2.5A1.5 1.5 0 0 0 5.5 20h13a1.5 1.5 0 0 0 1.5-1.5V16"></path></svg>} />
          <p style={{ fontSize: '13px', color: '#7A4708', background: '#FBEBCF', padding: '10px 14px', borderRadius: '14px' }}>{type === 'Aadhaar' ? 'Please mask your Aadhaar number (hide the first 8 digits) — use a masked Aadhaar from the UIDAI site. ' : ''}All four corners visible, no glare.</p>
        </div>
      </div>
      <div className="step">
        <span className="n">3</span>
        <div style={{ flex: '1', minWidth: 0, display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <b style={{ fontSize: '17px' }}>Take a selfie</b>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '18px', alignItems: 'center' }}>
            <ul style={{ margin: '0', paddingLeft: '18px', fontSize: '14px', color: '#474C52', flex: '1 1 200px' }}>
              <li>Face fully visible, eyes open</li>
              <li>Good light, no cap or sunglasses</li>
              <li>Match the photo on your ID</li>
            </ul>
            <div style={{ flex: '1 1 260px' }}>
              <SingleUpload name="selfie" title="Selfie" hint="On a phone this opens the front camera" capture="user" icon={<svg className="ic" viewBox="0 0 24 24"><rect x="3" y="7" width="18" height="13" rx="3"></rect><path d="M8.5 7 10 4.5h4L15.5 7"></path><circle cx="12" cy="13.5" r="3.5"></circle></svg>} />
            </div>
          </div>
        </div>
      </div>
      <label style={{ display: 'flex', gap: '10px', alignItems: 'flex-start', fontSize: '14px', cursor: 'pointer', paddingTop: '8px', borderTop: '1px solid #E3DACA' }}>
        <input type="checkbox" name="consent" checked={consent} onChange={(e) => setConsent(e.target.checked)} style={{ width: '20px', height: '20px', accentColor: '#1F4D3A', margin: '14px 0 0', flex: 'none' }} />
        <span style={{ paddingTop: '12px' }}>I agree Kirayo may store these images to verify my identity, as described in the <Link href="/privacy">Privacy policy</Link>.</span>
      </label>
      {state?.error && <p className="k-alert err" role="alert">{state.error}</p>}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', justifyContent: 'space-between', alignItems: 'center' }}>
        <Link href={next || '/profile'} style={{ fontWeight: '700', textDecoration: 'none', minHeight: '44px', display: 'flex', alignItems: 'center' }}>← Back</Link>
        <button className="btn btn-p" type="submit" disabled={pending}>{pending ? 'Submitting…' : 'Submit for review'}</button>
      </div>
    </form>
  );
}
