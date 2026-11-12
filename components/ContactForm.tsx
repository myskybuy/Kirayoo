'use client';
import { useActionState, useState } from 'react';
import { contactAction } from '@/app/actions/contact';
import type { FormState } from '@/app/actions/auth';

const TOPICS = ['Booking or handover', 'Deposit & refunds', 'ID verification', 'Listing an item', 'Something else'];

/** R23 contact form → ContactMessage for the admin. */
export default function ContactForm({ name, email }: { name: string; email: string }) {
  const [state, action, pending] = useActionState<FormState, FormData>(contactAction, undefined);
  const [f, setF] = useState({ name, email, topic: TOPICS[0], booking: '', message: '' });
  const set = (k: keyof typeof f) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => setF((s) => ({ ...s, [k]: e.target.value }));
  if (state?.ok) {
    return (
      <div style={{ flex: '1.3 1 420px', background: 'var(--kb-fffdf8)', borderRadius: '28px', padding: 'clamp(20px,4vw,34px)', display: 'flex', flexDirection: 'column', gap: '12px', boxShadow: '0 2px 6px rgba(35,38,42,.06),0 30px 60px -24px rgba(31,77,58,.3)' }}>
        <b className="d" style={{ fontSize: '24px' }}>Message sent</b>
        <p className="mute">{state.ok}</p>
      </div>
    );
  }
  return (
    <form action={action} style={{ flex: '1.3 1 420px', background: 'var(--kb-fffdf8)', borderRadius: '28px', padding: 'clamp(20px,4vw,34px)', display: 'flex', flexDirection: 'column', gap: '16px', boxShadow: '0 2px 6px rgba(35,38,42,.06),0 30px 60px -24px rgba(31,77,58,.3)' }}>
      <div style={{ display: 'grid', gap: '16px', gridTemplateColumns: 'repeat(auto-fit,minmax(min(200px,100%),1fr))' }}>
        <div><label className="lbl" htmlFor="cn">Your name</label><input className="in" id="cn" name="name" type="text" value={f.name} onChange={set('name')} required maxLength={80} /></div>
        <div><label className="lbl" htmlFor="ce">Email</label><input className="in" id="ce" name="email" type="email" value={f.email} onChange={set('email')} required /></div>
        <div><label className="lbl" htmlFor="ct">Topic</label><select className="in" id="ct" name="topic" value={f.topic} onChange={set('topic')}>{TOPICS.map((t) => <option key={t}>{t}</option>)}</select></div>
        <div><label className="lbl" htmlFor="cb">Booking ID (optional)</label><input className="in" id="cb" name="booking" type="text" placeholder="KR-2026-123456" value={f.booking} onChange={set('booking')} maxLength={20} /></div>
      </div>
      <div><label className="lbl" htmlFor="cm">Message</label><textarea className="in" id="cm" name="message" placeholder="Tell us what happened" value={f.message} onChange={set('message')} required minLength={10} maxLength={2000}></textarea></div>
      {state?.error && <p className="k-alert err" role="alert">{state.error}</p>}
      <button className="btn" type="submit" disabled={pending} style={{ background: 'var(--kb-c9491f)', color: 'var(--kf-ffffff)', alignSelf: 'flex-start' }}>{pending ? 'Sending…' : 'Send message'}</button>
    </form>
  );
}
