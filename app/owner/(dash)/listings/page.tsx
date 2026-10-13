import Link from 'next/link';
import type { ItemStatus } from '@prisma/client';
import PageCss from '@/components/PageCss';
import ItemThumb from '@/components/ItemThumb';
import { requireUser } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { inr, todayIST, toDbDate } from '@/lib/format';
import { CATEGORIES } from '@/lib/constants';
import { deleteItemAction, pauseItemAction, resumeItemAction } from '@/app/actions/items';
import ConfirmButton from '@/components/ConfirmButton';

export const metadata = { title: 'My listings' };

const TABS: { key: string; label: string; status: ItemStatus }[] = [
  { key: 'active', label: 'Active', status: 'ACTIVE' },
  { key: 'pending', label: 'Pending review', status: 'PENDING_REVIEW' },
  { key: 'paused', label: 'Paused', status: 'PAUSED' },
  { key: 'rejected', label: 'Rejected', status: 'REJECTED' },
];
const BADGE: Record<ItemStatus, [string, string, string]> = {
  ACTIVE: ['Live', '#DCEEDF', '#1E5A37'],
  PENDING_REVIEW: ['Pending approval', '#FBEBCF', '#7A4708'],
  PAUSED: ['Paused', '#EDE5D5', '#474C52'],
  REJECTED: ['Needs changes', '#F7DCD7', '#8E2A20'],
};

export default async function MyListingsPage({ searchParams }: { searchParams: Promise<{ tab?: string; saved?: string; error?: string; deleted?: string }> }) {
  const sp = await searchParams;
  const user = await requireUser('/owner/listings');
  const tab = TABS.find((t) => t.key === sp.tab) ?? TABS[0];
  const base = { ownerId: user.id, deletedAt: null };
  const [counts, items] = await Promise.all([
    prisma.item.groupBy({ by: ['status'], where: base, _count: true }),
    prisma.item.findMany({ where: { ...base, status: tab.status }, orderBy: { createdAt: 'desc' } }),
  ]);
  const count = (s: ItemStatus) => counts.find((c) => c.status === s)?._count ?? 0;
  const ids = items.map((i) => i.id);
  const today = toDbDate(todayIST());
  const [ratings, upcoming] = await Promise.all([
    prisma.review.groupBy({ by: ['itemId'], where: { itemId: { in: ids } }, _avg: { rating: true }, _count: true }),
    prisma.booking.groupBy({ by: ['itemId'], where: { itemId: { in: ids }, status: { in: ['PENDING_PAYMENT', 'CONFIRMED', 'PICKED_UP'] }, endDate: { gte: today } }, _count: true }),
  ]);

  return (
    <>
      <PageCss id="O03-MyListings" />
      <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'flex-end', gap: '14px' }}>
        <h1 className="d" style={{ fontSize: 'clamp(30px,3.4vw,42px)', fontWeight: '700' }}>My listings</h1>
        <Link className="btn" href="/owner/new" style={{ background: '#C9491F', color: '#fff' }}><svg className="ic" viewBox="0 0 24 24"><path d="M12 5v14M5 12h14"></path></svg>List an item</Link>
      </div>
      {sp.saved && <p className="k-alert ok">Saved. Your item is waiting for admin review — usually within 24 h.</p>}
      {sp.deleted && <p className="k-alert ok">Item deleted.</p>}
      {sp.error && <p className="k-alert err">{sp.error}</p>}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
        {TABS.map((t) => (
          <Link key={t.key} href={`/owner/listings?tab=${t.key}`} className={`chip${t.key === tab.key ? ' on' : ''}`} style={{ textDecoration: 'none', color: t.key === tab.key ? '#fff' : '#23262A' }}>{t.label} · {count(t.status)}</Link>
        ))}
      </div>
      {items.length === 0 ? (
        <div className="tw" style={{ padding: '32px', textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '10px', alignItems: 'center' }}>
          <b className="d" style={{ fontSize: '20px' }}>Nothing here yet</b>
          <p className="mute">{tab.key === 'active' ? 'Approved items show up here. New items wait in “Pending review” first.' : `No ${tab.label.toLowerCase()} items.`}</p>
          {tab.key === 'active' && <Link className="btn" href="/owner/new" style={{ background: '#1F4D3A', color: '#fff' }}>List an item</Link>}
        </div>
      ) : (
        <div className="tw"><table>
          <thead><tr><th>Item</th><th>Status</th><th>Per day</th><th>Deposit</th><th>Upcoming</th><th>Visible</th><th></th></tr></thead>
          <tbody>
            {items.map((it) => {
              const r = ratings.find((x) => x.itemId === it.id);
              const up = upcoming.find((x) => x.itemId === it.id)?._count ?? 0;
              const [label, bg, fg] = BADGE[it.status];
              const cat = CATEGORIES.find((c) => c.key === it.category);
              return (
                <tr key={it.id}>
                  <td>
                    <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                      <div style={{ width: '56px', height: '44px', borderRadius: '12px', background: '#BFD1BD', flex: 'none', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#2F4E40' }}><ItemThumb photo={it.photos[0]} icon={cat?.icon} size={20} /></div>
                      <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <Link href={it.status === 'ACTIVE' ? `/items/${it.id}` : `/owner/items/${it.id}/edit`} style={{ fontWeight: 700, color: '#23262A', textDecoration: 'none' }}>{it.title}</Link>
                        <span style={{ fontSize: '12.5px', color: it.status === 'REJECTED' ? '#8E2A20' : '#60666C' }}>
                          {it.status === 'REJECTED' ? `Needs changes: ${it.rejectReason ?? ''}` : it.status === 'PENDING_REVIEW' ? 'Admin reviews within 24 h' : r ? `${(r._avg.rating ?? 0).toFixed(1)} · ${r._count} reviews` : `${it.area}, ${it.city}`}
                        </span>
                      </div>
                    </div>
                  </td>
                  <td><span className="badge" style={{ background: bg, color: fg }}>{label}</span></td>
                  <td><b>{inr(it.pricePerDay)}</b>{it.pricePerWeek ? <span className="mute" style={{ fontSize: '12.5px' }}><br />{inr(it.pricePerWeek)}/wk</span> : null}</td>
                  <td>{inr(it.deposit)}</td>
                  <td>{up ? `${up} booking${up > 1 ? 's' : ''}` : '—'}</td>
                  <td>
                    {it.status === 'ACTIVE' || it.status === 'PAUSED' ? (
                      <form action={it.status === 'ACTIVE' ? pauseItemAction : resumeItemAction}>
                        <input type="hidden" name="id" value={it.id} />
                        <button className="sw" type="submit" role="switch" aria-checked={it.status === 'ACTIVE'} aria-label={it.status === 'ACTIVE' ? 'Visible to renters — pause' : 'Paused — resume'} title={it.status === 'ACTIVE' ? 'Pause' : 'Resume'}
                          style={{ background: it.status === 'ACTIVE' ? '#1F4D3A' : '#D9CEB8', justifyContent: it.status === 'ACTIVE' ? 'flex-end' : 'flex-start' }}><span></span></button>
                      </form>
                    ) : (
                      <button className="sw" type="button" role="switch" aria-checked="false" aria-label="Visible to renters" disabled style={{ background: '#D9CEB8', justifyContent: 'flex-start' }}><span></span></button>
                    )}
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                      <Link href={`/owner/items/${it.id}/edit`} style={{ fontWeight: '700', fontSize: '14px' }}>Edit</Link>
                      <form action={deleteItemAction}>
                        <input type="hidden" name="id" value={it.id} />
                        <ConfirmButton message={up ? 'This item has bookings — it can only be paused.' : `Delete “${it.title}”? This can’t be undone.`} style={{ fontWeight: 700, fontSize: '14px', color: '#8E2A20', background: 'none', border: 0, cursor: 'pointer', padding: 0 }}>Delete</ConfirmButton>
                      </form>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table></div>
      )}
    </>
  );
}
