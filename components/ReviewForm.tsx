'use client';
import { useState } from 'react';
import { reviewAction } from '@/app/actions/reviews';

const WORDS = ['', 'Poor', 'Okay', 'Good', 'Great', 'Excellent'];
const STAR = 'm12 3.5 2.6 5.4 5.9.8-4.3 4.1 1 5.8L12 16.8l-5.2 2.8 1-5.8-4.3-4.1 5.9-.8z';

/** R19 / O09 rating form: stars, tags, a few words. */
export default function ReviewForm({ bookingId, legend, tags, textLabel, back, compact }: { bookingId: string; legend: string; tags: string[]; textLabel: string; back: string; compact?: boolean }) {
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [picked, setPicked] = useState<string[]>([]);
  const size = compact ? 34 : 36;
  return (
    <form action={reviewAction} style={{ display: 'flex', flexDirection: 'column', gap: compact ? '16px' : '28px' }}>
      <input type="hidden" name="bookingId" value={bookingId} />
      <input type="hidden" name="rating" value={rating} />
      <input type="hidden" name="tags" value={JSON.stringify(picked)} />
      <input type="hidden" name="back" value={back} />
      <fieldset style={{ border: '0', margin: '0', padding: '0', display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <legend style={{ fontWeight: '800', fontSize: '17px', marginBottom: '6px' }}>{legend}</legend>
        <div style={{ display: 'flex', alignItems: 'center', gap: '2px', flexWrap: 'wrap' }} onMouseLeave={() => setHover(0)}>
          {[1, 2, 3, 4, 5].map((n) => {
            const on = n <= (hover || rating);
            return (
              <button key={n} className="star" type="button" aria-label={`${n} star${n > 1 ? 's' : ''}`} aria-pressed={n <= rating} onClick={() => setRating(n)} onMouseEnter={() => setHover(n)} style={{ width: `${size + 12}px`, height: `${size + 12}px`, border: 0, background: 'transparent', padding: 0, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true"><path d={STAR} fill={on ? '#C9491F' : 'none'} stroke={on ? '#C9491F' : '#BFB4A0'} strokeWidth="1.4" strokeLinejoin="round"></path></svg>
              </button>
            );
          })}
          <b style={{ marginLeft: '10px', color: '#1F4D3A' }}>{WORDS[hover || rating]}</b>
        </div>
      </fieldset>
      <fieldset style={{ border: '0', margin: '0', padding: '0', display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <legend style={{ fontWeight: '800', fontSize: compact ? '14px' : '17px', marginBottom: '6px' }}>What stood out?</legend>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
          {tags.map((t) => {
            const on = picked.includes(t);
            return <button key={t} className="k-pill" type="button" aria-pressed={on} onClick={() => setPicked((p) => (on ? p.filter((x) => x !== t) : [...p, t]))} style={on ? { background: '#1F4D3A', color: '#fff' } : { background: '#fff', color: '#23262A', boxShadow: 'inset 0 0 0 1px #E3DACA' }}>{t}</button>;
          })}
        </div>
      </fieldset>
      <div>
        <label htmlFor={`rv-${bookingId}`} style={{ display: 'block', fontWeight: '800', fontSize: compact ? '14px' : '17px', marginBottom: '10px' }}>{textLabel}</label>
        <textarea className="k-in" id={`rv-${bookingId}`} name="text" maxLength={1000} style={{ minHeight: '110px' }}></textarea>
      </div>
      <button className="k-btn p" type="submit" disabled={!rating}>{rating ? 'Submit review' : 'Pick 1–5 stars'}</button>
    </form>
  );
}
