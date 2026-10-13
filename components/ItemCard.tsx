import Link from 'next/link';
import { inr } from '@/lib/format';

export type CardData = {
  href: string;
  title: string;
  photo?: string | null;
  categoryLabel: string;
  pricePerDay: number;
  place: string;
  rating?: number | null;
  reviews?: number;
  availability: string;
  availabilityTone?: 'ok' | 'warn';
  deposit: number;
  ownerInitials: string;
  ownerColor: string;
  ownerName: string;
  tint?: string;
};

/** Item card from the kit (R01/R03 grid, 4:3 photo). */
export default function ItemCard(c: CardData) {
  const tone = c.availabilityTone === 'warn' ? { bg: '#FBEBCF', fg: '#7A4708' } : { bg: '#DCEEDF', fg: '#1E5A37' };
  const box: React.CSSProperties = { display: 'flex', flexDirection: 'column', gap: '14px', textDecoration: 'none', color: '#23262A', width: '100%', fontFamily: "'Plus Jakarta Sans',system-ui,sans-serif" };
  const inner = (
    <>
      <div style={{ position: 'relative', aspectRatio: '4/3', borderRadius: '22px', background: c.tint ?? '#DCE6DA', boxShadow: '0 1px 2px rgba(35,38,42,.05)' }}>
        <div style={{ position: 'absolute', inset: '0', borderRadius: '22px', overflow: 'hidden', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '6px', color: '#2F4E40' }}>
          {c.photo ? (
            <img src={c.photo} alt={c.title} className="k-photo" loading="lazy" />
          ) : (
            <>
              <div aria-hidden="true" style={{ position: 'absolute', width: '70%', aspectRatio: '1', borderRadius: '50%', background: 'rgba(255,253,248,.35)', top: '-18%', right: '-14%' }}></div>
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" style={{ position: 'relative' }}><rect x="3" y="4" width="18" height="16" rx="3"></rect><circle cx="9" cy="10" r="2"></circle><path d="m4 18 5-5 4 4 3-3 4 4"></path></svg>
              <span style={{ position: 'relative', fontSize: '12px', fontWeight: '600' }}>Photo · {c.categoryLabel}</span>
            </>
          )}
        </div>
        <span style={{ position: 'absolute', left: '12px', top: '12px', display: 'inline-flex', alignItems: 'baseline', gap: '2px', padding: '7px 12px', borderRadius: '999px', background: '#FFFDF8', color: '#1F4D3A', boxShadow: '0 4px 12px -4px rgba(35,38,42,.3)', fontWeight: '800', fontSize: '15px' }}>{inr(c.pricePerDay)}<span style={{ fontSize: '12px', fontWeight: '600', color: '#474C52' }}>/day</span></span>
        <span style={{ position: 'absolute', right: '14px', bottom: '-20px', width: '44px', height: '44px', borderRadius: '50%', background: c.ownerColor, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '800', fontSize: '14px', boxShadow: '0 0 0 3px #F6F1E7' }} aria-label={`Owner ${c.ownerName}, ID verified`}>{c.ownerInitials}</span>
        <span style={{ position: 'absolute', right: '8px', bottom: '-22px', width: '20px', height: '20px', borderRadius: '50%', background: '#1F4D3A', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 0 2px #F6F1E7' }} aria-hidden="true">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3.4" strokeLinecap="round" strokeLinejoin="round"><path d="m5 12.5 4.5 4.5L19 7.5"></path></svg>
        </span>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', padding: '0 4px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: '10px', paddingRight: '44px' }}>
          <span style={{ fontWeight: '700', fontSize: '16px', lineHeight: '1.3' }}>{c.title}</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '13.5px', color: '#60666C' }}>
          <span>{c.place}</span>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '3px', color: '#23262A', fontWeight: '600', marginLeft: 'auto' }}>
            <svg width="14" height="14" viewBox="0 0 24 24" aria-hidden="true"><path d="m12 3.5 2.6 5.4 5.9.8-4.3 4.1 1 5.8L12 16.8l-5.2 2.8 1-5.8-4.3-4.1 5.9-.8z" fill="#C9491F"></path></svg>
            {c.rating ? c.rating.toFixed(1) : 'New'} <span style={{ color: '#60666C', fontWeight: '500' }}>({c.reviews ?? 0})</span>
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px', marginTop: '4px', flexWrap: 'wrap' }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '5px 10px', borderRadius: '10px', background: tone.bg, color: tone.fg, fontSize: '12.5px', fontWeight: '700' }}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" aria-hidden="true"><rect x="3.5" y="5" width="17" height="15" rx="3"></rect><path d="M3.5 10h17M8 3v4M16 3v4"></path></svg>{c.availability}</span>
          <span style={{ fontSize: '12.5px', color: '#474C52' }}>Deposit <b style={{ color: '#23262A' }}>{inr(c.deposit)}</b></span>
        </div>
      </div>
    </>
  );
  return c.href ? <Link href={c.href} style={box}>{inner}</Link> : <div style={box}>{inner}</div>;
}
