import PageCss from '@/components/PageCss';
import LocationPicker from '@/components/LocationPicker';
import { prisma } from '@/lib/db';
import { getUser } from '@/lib/auth';
import { getLocation } from '@/lib/location';

export const metadata = { title: 'Select location' };

export default async function LocationPage({ searchParams }: { searchParams: Promise<{ next?: string; error?: string }> }) {
  const { next = '/browse', error } = await searchParams;
  const user = await getUser();
  const current = await getLocation(user);
  const cities = await prisma.city.findMany({ orderBy: { sortOrder: 'asc' }, include: { areas: { orderBy: { name: 'asc' } } } });
  return (
    <>
      <PageCss id="R02-Location" />
      <div className="wrap" style={{ paddingTop: 'clamp(20px,5vw,48px)', paddingBottom: '72px' }}>
        <div style={{ maxWidth: '880px', margin: '0 auto', background: 'var(--kb-fffdf8)', borderRadius: '32px', boxShadow: '0 2px 6px rgba(35,38,42,.06),0 30px 60px -24px rgba(31,77,58,.35)', padding: 'clamp(24px,4vw,44px)', display: 'flex', flexDirection: 'column', gap: '30px' }}>
          <div style={{ display: 'flex', gap: '18px', alignItems: 'flex-start' }}>
            <span style={{ width: '56px', height: '56px', borderRadius: '18px', background: 'var(--kb-dce6da)', color: 'var(--kf-1f4d3a)', display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 'none' }}><svg className="ic" viewBox="0 0 24 24" style={{ width: '28px', height: '28px' }}><path d="M12 21s-7-6.2-7-11.5A7 7 0 0 1 19 9.5C19 14.8 12 21 12 21z"></path><circle cx="12" cy="9.5" r="2.5"></circle></svg></span>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <span className="eyebrow">{current ? 'Change location' : 'One-time setup'}</span>
              <h1 className="d" style={{ fontSize: 'clamp(30px,3.4vw,42px)', fontWeight: '700', lineHeight: '1.05' }}>Where should we look for items?</h1>
              <p className="mute">Pick your city, then your area. We show items from owners in and around it. You can change this anytime from the header.</p>
            </div>
          </div>
          {error && <p className="k-alert err">Please pick a city and an area from the list.</p>}
          <LocationPicker cities={cities.map((c) => ({ name: c.name, areas: c.areas.map((a) => a.name) }))} current={current} next={next} />
        </div>
      </div>
    </>
  );
}
