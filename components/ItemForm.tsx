'use client';
import { useActionState, useState } from 'react';
import { saveItemAction } from '@/app/actions/items';
import type { FormState } from '@/app/actions/auth';
import PhotoUploader from './PhotoUploader';
import BlockCalendar from './BlockCalendar';
import ItemCard from './ItemCard';

type Initial = {
  id?: string;
  title: string;
  category: string;
  location: string;
  description: string;
  pricePerDay: string;
  pricePerWeek: string;
  deposit: string;
  minDays: string;
  maxDays: string;
  canPickup: boolean;
  canDeliver: boolean;
  acceptsCashAtPickup: boolean;
  pickupNote: string;
  photos: string[];
  blocked: string[];
};

type Props = {
  initial: Initial;
  categories: { key: string; label: string }[];
  cities: { name: string; areas: string[] }[];
  booked: string[];
  today: string;
  deliveryFee: number;
  owner: { initials: string; color: string; name: string };
};

const inr = (v: string) => '₹' + (Number(v) || 0).toLocaleString('en-IN');

export default function ItemForm({ initial, categories, cities, booked, today, deliveryFee, owner }: Props) {
  const [state, action, pending] = useActionState<FormState, FormData>(saveItemAction, undefined);
  const [f, setF] = useState(initial);
  const set = <K extends keyof Initial>(k: K, v: Initial[K]) => setF((s) => ({ ...s, [k]: v }));
  const on = { background: '#EEF3EC', boxShadow: 'inset 0 0 0 2px #1F4D3A' };
  const off = { background: '#fff', boxShadow: 'inset 0 0 0 1px #E3DACA' };
  const [city, area] = f.location.split('|');
  const catLabel = categories.find((c) => c.key === f.category)?.label ?? '';

  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '24px', alignItems: 'flex-start' }}>
      <form action={action} style={{ flex: '999 1 520px', minWidth: '0', display: 'flex', flexDirection: 'column', gap: '18px' }}>
        {f.id && <input type="hidden" name="id" value={f.id} />}
        <section className="card sec">
          <h2><i>1</i>Photos</h2>
          <p className="mute" style={{ fontSize: '13.5px', marginTop: '-8px' }}>Up to 8. First photo is the cover. Show every accessory in the bag.</p>
          <PhotoUploader kind="item" name="photos" max={8} initial={f.photos} cover onChange={(p) => set('photos', p)} />
        </section>
        <section className="card sec">
          <h2><i>2</i>About the item</h2>
          <div><label className="lbl" htmlFor="t">Title</label><input className="in" id="t" name="title" type="text" value={f.title} onChange={(e) => set('title', e.target.value)} required maxLength={80} /></div>
          <div className="g2">
            <div>
              <label className="lbl" htmlFor="c">Category</label>
              <select className="in" id="c" name="category" value={f.category} onChange={(e) => set('category', e.target.value)}>
                {categories.map((c) => <option key={c.key} value={c.key}>{c.label}</option>)}
              </select>
            </div>
            <div>
              <label className="lbl" htmlFor="a">Area</label>
              <select className="in" id="a" name="location" value={f.location} onChange={(e) => set('location', e.target.value)}>
                {cities.map((c) => (
                  <optgroup key={c.name} label={c.name}>
                    {c.areas.map((a) => <option key={a} value={`${c.name}|${a}`}>{a}, {c.name}</option>)}
                  </optgroup>
                ))}
              </select>
            </div>
          </div>
          <div><label className="lbl" htmlFor="ds">Description &amp; what&apos;s included</label><textarea className="in" id="ds" name="description" value={f.description} onChange={(e) => set('description', e.target.value)} required maxLength={2000}></textarea></div>
        </section>
        <section className="card sec">
          <h2><i>3</i>Price &amp; deposit</h2>
          <div className="g2">
            <div><label className="lbl" htmlFor="pd">Per day</label><div className="pre"><span>₹</span><input className="in" id="pd" name="pricePerDay" inputMode="numeric" value={f.pricePerDay} onChange={(e) => set('pricePerDay', e.target.value.replace(/\D/g, ''))} required /></div></div>
            <div><label className="lbl" htmlFor="pw">Per week (7 days) · optional</label><div className="pre"><span>₹</span><input className="in" id="pw" name="pricePerWeek" inputMode="numeric" value={f.pricePerWeek} onChange={(e) => set('pricePerWeek', e.target.value.replace(/\D/g, ''))} /></div></div>
            <div><label className="lbl" htmlFor="dp">Refundable deposit</label><div className="pre"><span>₹</span><input className="in" id="dp" name="deposit" inputMode="numeric" value={f.deposit} onChange={(e) => set('deposit', e.target.value.replace(/\D/g, ''))} required /></div></div>
          </div>
          <div className="g2">
            <div><label className="lbl" htmlFor="mn">Minimum days</label><input className="in" id="mn" name="minDays" type="number" min="1" max="90" value={f.minDays} onChange={(e) => set('minDays', e.target.value)} /></div>
            <div><label className="lbl" htmlFor="mx">Maximum days</label><input className="in" id="mx" name="maxDays" type="number" min="1" max="90" value={f.maxDays} onChange={(e) => set('maxDays', e.target.value)} /></div>
          </div>
          <p style={{ fontSize: '13px', color: '#1E5A37', background: '#DCEEDF', padding: '10px 14px', borderRadius: '14px' }}>Tip: a deposit near the cost of replacing the item gets approved fastest.</p>
        </section>
        <section className="card sec">
          <h2><i>4</i>Availability</h2>
          <p className="mute" style={{ fontSize: '13.5px', marginTop: '-8px' }}>Tap days you&apos;re <b>not</b> lending. Bookings block days automatically.</p>
          <BlockCalendar today={today} booked={booked} initialBlocked={f.blocked} name="blocked" />
        </section>
        <section className="card sec">
          <h2><i>5</i>Pickup &amp; delivery</h2>
          <label className="opt" style={f.canPickup ? on : off}>
            <input type="checkbox" name="canPickup" checked={f.canPickup} onChange={(e) => set('canPickup', e.target.checked)} />
            <span style={{ flex: '1' }}><b>Renter picks up</b><br /><span className="mute" style={{ fontSize: '13px' }}>Landmark shown before payment; exact address after.</span>
              <input className="in" type="text" name="pickupNote" aria-label="Pickup landmark" placeholder="e.g. Near 100 Feet Road metro" value={f.pickupNote} onChange={(e) => set('pickupNote', e.target.value)} style={{ marginTop: '8px' }} maxLength={160} /></span>
          </label>
          <label className="opt" style={f.canDeliver ? on : off}>
            <input type="checkbox" name="canDeliver" checked={f.canDeliver} onChange={(e) => set('canDeliver', e.target.checked)} />
            <span style={{ flex: '1' }}><b>I deliver &amp; collect</b><br /><span className="mute" style={{ fontSize: '13px' }}>Within your area and neighbouring areas. The renter pays a flat ₹{deliveryFee} delivery fee that covers drop-off and collection.</span></span>
          </label>
          <label className="opt" style={f.acceptsCashAtPickup ? on : off}>
            <input type="checkbox" name="acceptsCashAtPickup" checked={f.acceptsCashAtPickup} onChange={(e) => set('acceptsCashAtPickup', e.target.checked)} />
            <span style={{ flex: '1' }}><b>Accept cash / UPI at pickup</b><br /><span className="mute" style={{ fontSize: '13px' }}>Renters may pay you rent + deposit in person. You tick “I collected ₹X” before entering their code, and return the deposit in cash. Kirayo records it but moves no money.</span></span>
          </label>
        </section>
        {state?.error && <p className="k-alert err" role="alert">{state.error}</p>}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', justifyContent: 'flex-end', alignItems: 'center' }}>
          <span className="mute" style={{ fontSize: '13px' }}>{f.id ? 'Saving sends the item back for a quick review.' : 'Admin reviews new items within 24 h.'}</span>
          <button className="btn" type="submit" disabled={pending} style={{ background: '#C9491F', color: '#fff' }}>{pending ? 'Saving…' : 'Submit for approval'}</button>
        </div>
      </form>
      <aside style={{ flex: '1 1 300px', minWidth: '0', position: 'sticky', top: '20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
        <b style={{ fontSize: '13px', color: '#474C52', letterSpacing: '.06em', textTransform: 'uppercase' }}>Preview</b>
        <ItemCard href="" title={f.title || 'Your item title'} photo={f.photos[0]} categoryLabel={catLabel} pricePerDay={Number(f.pricePerDay) || 0} place={`${area}, ${city}`}
          availability="Available from approval" deposit={Number(f.deposit) || 0} ownerInitials={owner.initials} ownerColor={owner.color} ownerName={owner.name} />
        <div className="card" style={{ padding: '18px', display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '13.5px', marginTop: '18px' }}>
          <b>Before it goes live</b>
          <span style={{ color: '#1E5A37' }}>✓ Your ID is verified</span>
          <span style={{ color: f.photos.length ? '#1E5A37' : '#60666C' }}>{f.photos.length ? `✓ ${f.photos.length} photo${f.photos.length > 1 ? 's' : ''} added` : '○ Add at least 1 photo'}</span>
          {f.pricePerWeek && <span className="mute">Weekly: {inr(f.pricePerWeek)} for 7 days</span>}
          <span className="mute">○ Admin reviews within 24 h</span>
        </div>
      </aside>
    </div>
  );
}
