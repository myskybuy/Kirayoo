import Link from 'next/link';
import { redirect } from 'next/navigation';
import SideNav, { type NavItem } from '@/components/SideNav';
import { requireUser } from '@/lib/auth';
import { currentPath } from '@/lib/path';
import { actionCounts } from '@/lib/header';
import { avatarColor, initials } from '@/lib/format';

// Icons from the kit's KOwnerNav (O01).
const I = {
  home: '<path d="M4 11 12 4l8 7v9H4z"></path><path d="M10 20v-5h4v5"></path>',
  plus: '<circle cx="12" cy="12" r="8.5"></circle><path d="M12 8v8M8 12h8"></path>',
  grid: '<rect x="4" y="4" width="7" height="7" rx="2"></rect><rect x="13" y="4" width="7" height="7" rx="2"></rect><rect x="4" y="13" width="7" height="7" rx="2"></rect><rect x="13" y="13" width="7" height="7" rx="2"></rect>',
  chat: '<path d="M5 18.5V6.5A2.5 2.5 0 0 1 7.5 4h9A2.5 2.5 0 0 1 19 6.5v7a2.5 2.5 0 0 1-2.5 2.5H9z"></path>',
  lock: '<rect x="5" y="10.5" width="14" height="10" rx="2.5"></rect><path d="M8 10.5V8a4 4 0 0 1 8 0v2.5"></path>',
  cal: '<rect x="3.5" y="5" width="17" height="15" rx="3"></rect><path d="M3.5 10h17M8 3v4M16 3v4"></path>',
  rupee: '<path d="M7 5h10M7 9.5h10M7 5h3.5a4.5 4.5 0 0 1 0 9H7l8 6"></path>',
  star: '<path d="m12 3.5 2.6 5.4 5.9.8-4.3 4.1 1 5.8L12 16.8l-5.2 2.8 1-5.8-4.3-4.1 5.9-.8z"></path>',
};

// Owner panel requires a VERIFIED ID. /owner/start lives outside this group,
// so unverified users can always reach it (no redirect loop).
export default async function OwnerDashLayout({ children }: { children: React.ReactNode }) {
  const user = await requireUser(await currentPath());
  if (user.idStatus !== 'VERIFIED') redirect('/owner/start');
  const c = await actionCounts(user);
  const items: NavItem[] = [
    { href: '/owner', label: 'Dashboard', icon: I.home, exact: true },
    { href: '/owner/new', label: 'List an item', icon: I.plus },
    { href: '/owner/listings', label: 'My listings', icon: I.grid },
    { href: '/owner/requests', label: 'Booking requests', icon: I.chat, badge: c.requests },
    { href: '/owner/bookings', label: 'Bookings', icon: I.lock, badge: c.handovers + c.returnsToConfirm },
    { href: '/owner/calendar', label: 'Calendar', icon: I.cal },
    { href: '/owner/earnings', label: 'Earnings & payouts', icon: I.rupee },
    { href: '/owner/reviews', label: 'Reviews', icon: I.star },
  ];
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', minHeight: '100vh' }}>
      <div style={{ flex: '1 1 248px', maxWidth: '100%', background: '#1F4D3A' }}>
        <SideNav
          variant="owner"
          items={items}
          user={{ initials: initials(user.name), name: user.name, sub: `${user.area ?? ''} · ID verified`, color: avatarColor(user.id) }}
          footer={
            <Link href="/" style={{ marginTop: 'auto', display: 'flex', alignItems: 'center', gap: '10px', minHeight: '44px', padding: '0 12px', borderRadius: '14px', color: '#F6F1E7', textDecoration: 'none', fontSize: '14px', fontWeight: '600', boxShadow: 'inset 0 0 0 1px rgba(246,241,231,.24)' }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M19 12H5M11 6l-6 6 6 6"></path></svg>Switch to renting
            </Link>
          }
        />
      </div>
      <main style={{ flex: '999 1 640px', minWidth: '0', padding: '32px clamp(16px,3vw,40px) 64px', boxSizing: 'border-box', display: 'flex', flexDirection: 'column', gap: '22px' }}>
        {children}
      </main>
    </div>
  );
}
