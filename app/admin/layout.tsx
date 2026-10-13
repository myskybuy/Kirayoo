import SideNav, { type NavItem } from '@/components/SideNav';
import { requireAdmin } from '@/lib/auth';
import { adminCounts } from '@/lib/admin';
import { initials } from '@/lib/format';

const I = {
  home: '<path d="M4 11 12 4l8 7v9H4z"></path><path d="M10 20v-5h4v5"></path>',
  id: '<rect x="3" y="5" width="18" height="14" rx="3"></rect><circle cx="9" cy="11" r="2.2"></circle><path d="M5.8 16.5a3.4 3.4 0 0 1 6.4 0M14.5 10h4M14.5 13.5h3"></path>',
  list: '<rect x="4" y="4" width="7" height="7" rx="2"></rect><rect x="13" y="4" width="7" height="7" rx="2"></rect><rect x="4" y="13" width="7" height="7" rx="2"></rect><path d="m14 16.5 2 2 3.5-4"></path>',
  users: '<circle cx="9" cy="8.5" r="3.5"></circle><path d="M3 19.5a6 6 0 0 1 12 0M16 5.2a3.5 3.5 0 0 1 0 6.6M18 14.2a6 6 0 0 1 3 5.3"></path>',
  cal: '<rect x="3.5" y="5" width="17" height="15" rx="3"></rect><path d="M3.5 10h17M8 3v4M16 3v4"></path>',
  shield: '<path d="M12 3 4.5 6v6c0 4.5 3.2 7.8 7.5 9 4.3-1.2 7.5-4.5 7.5-9V6z"></path><path d="M12 9v4M12 16v.1"></path>',
  rupee: '<path d="M7 5h10M7 9.5h10M7 5h3.5a4.5 4.5 0 0 1 0 9H7l8 6"></path>',
  refund: '<path d="M20 11a8 8 0 0 0-14.5-4.5L4 8M4 4v4h4"></path><path d="M12 9v6M10 13l2 2 2-2"></path>',
  chat: '<path d="M5 18.5V6.5A2.5 2.5 0 0 1 7.5 4h9A2.5 2.5 0 0 1 19 6.5v7a2.5 2.5 0 0 1-2.5 2.5H9z"></path><path d="M12 8v3M12 13.5v.1"></path>',
};

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const admin = await requireAdmin();
  const c = await adminCounts();
  const items: NavItem[] = [
    { href: '/admin', label: 'Dashboard', icon: I.home, exact: true },
    { href: '/admin/ids', label: 'ID verifications', icon: I.id, badge: c.ids },
    { href: '/admin/listings', label: 'Listing approvals', icon: I.list, badge: c.listings },
    { href: '/admin/users', label: 'Users', icon: I.users },
    { href: '/admin/bookings', label: 'Bookings', icon: I.cal },
    { href: '/admin/disputes', label: 'Deposit disputes', icon: I.shield, badge: c.disputes },
    { href: '/admin/complaints', label: 'Complaints & contact', icon: I.chat, badge: c.complaints },
    { href: '/admin/payouts', label: 'Payouts', icon: I.rupee, badge: c.payouts },
    { href: '/admin/refunds', label: 'Deposit refunds', icon: I.refund, badge: c.refunds },
  ];
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', minHeight: '100vh', background: '#F3EFE6' }}>
      <div style={{ flex: '1 1 248px', maxWidth: '100%', background: '#23262A' }}>
        <SideNav variant="admin" items={items} user={{ initials: initials(admin.name), name: admin.name, sub: admin.email, color: '#1F4D3A' }} />
      </div>
      <main style={{ flex: '999 1 640px', minWidth: '0', padding: '32px clamp(16px,3vw,40px) 64px', boxSizing: 'border-box', display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {children}
      </main>
    </div>
  );
}
