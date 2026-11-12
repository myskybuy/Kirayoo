import { prisma } from '@/lib/db';
import { inr } from '@/lib/format';
import { categoryLabel, CATEGORIES } from '@/lib/constants';
import ItemThumb from './ItemThumb';

/** Left green panel of R05: shows the item the user came from, if any. */
export default async function AuthPanel({ next, title }: { next: string; title?: string }) {
  const m = next.match(/^\/items\/([^/?#]+)/);
  const item = m ? await prisma.item.findUnique({ where: { id: m[1] }, include: { owner: { select: { name: true } } } }) : null;
  const heading = title ?? (item ? `Log in to chat with ${item.owner.name.split(' ')[0]} and request your dates` : 'Log in to rent from verified people near you');
  const cat = item ? CATEGORIES.find((c) => c.key === item.category) : undefined;
  return (
    <div style={{ flex: '1 1 380px', background: 'var(--kb-1f4d3a)', color: 'var(--kf-f6f1e7)', padding: 'clamp(24px,5vw,44px)', display: 'flex', flexDirection: 'column', gap: '22px', position: 'relative', overflow: 'hidden' }}>
      <div aria-hidden="true" style={{ position: 'absolute', left: '-90px', bottom: '-110px', width: '300px', height: '300px', borderRadius: '50%', border: '46px solid rgba(246,241,231,.06)' }}></div>
      <span style={{ fontSize: '12px', fontWeight: '800', letterSpacing: '.08em', textTransform: 'uppercase', color: 'var(--kf-e8643c)' }}>Almost there</span>
      <h2 className="d" style={{ fontSize: '36px', fontWeight: '700', lineHeight: '1.05' }}>{heading}</h2>
      {item && (
        <div style={{ display: 'flex', gap: '14px', alignItems: 'center', padding: '14px', borderRadius: '20px', background: 'rgba(246,241,231,.08)', position: 'relative' }}>
          <div style={{ width: '84px', height: '64px', borderRadius: '14px', background: 'var(--kb-bfd1bd)', color: 'var(--kf-2f4e40)', display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 'none', overflow: 'hidden' }}>
            <ItemThumb photo={item.photos[0]} icon={cat?.icon} />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', fontSize: '14px' }}><b>{item.title}</b><span style={{ color: 'var(--kf-dce6da)' }}>{categoryLabel(item.category)} · {inr(item.pricePerDay)}/day</span></div>
        </div>
      )}
      <ul style={{ margin: '0', padding: '0', listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '14px', color: 'var(--kf-dce6da)', position: 'relative' }}>
        <li style={{ display: 'flex', gap: '10px' }}><svg className="ic" viewBox="0 0 24 24" style={{ color: 'var(--kf-e8643c)' }}><path d="m5 12.5 4.5 4.5L19 7.5"></path></svg>No password. We email you a 6-digit code.</li>
        <li style={{ display: 'flex', gap: '10px' }}><svg className="ic" viewBox="0 0 24 24" style={{ color: 'var(--kf-e8643c)' }}><path d="m5 12.5 4.5 4.5L19 7.5"></path></svg>One account to rent and to list your own items.</li>
      </ul>
    </div>
  );
}
