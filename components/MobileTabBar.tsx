'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const TABS = [
  { href: '/', label: 'Explore', match: (p: string) => p === '/', icon: <><path d="M4 11 12 4l8 7v9H4z"></path><path d="M10 20v-5h4v5"></path></> },
  { href: '/browse', label: 'Search', match: (p: string) => p.startsWith('/browse') || p.startsWith('/items'), icon: <><circle cx="11" cy="11" r="6.5"></circle><path d="m20 20-4-4"></path></> },
  { href: '/bookings', label: 'Rentals', match: (p: string) => p.startsWith('/bookings') || p.startsWith('/book') || p.startsWith('/pay'), icon: <><rect x="3.5" y="5" width="17" height="15" rx="3"></rect><path d="M3.5 10h17M8 3v4M16 3v4"></path></> },
  { href: '/chat', label: 'Inbox', match: (p: string) => p.startsWith('/chat'), icon: <path d="M5 18.5V6.5A2.5 2.5 0 0 1 7.5 4h9A2.5 2.5 0 0 1 19 6.5v7a2.5 2.5 0 0 1-2.5 2.5H9z"></path> },
  { href: '/profile', label: 'Profile', match: (p: string) => p.startsWith('/profile') || p.startsWith('/verify-id'), icon: <><circle cx="12" cy="8" r="4"></circle><path d="M4.5 20a7.5 7.5 0 0 1 15 0"></path></> },
];

/** Mobile bottom tab bar from the kit (visible under 720px). */
export default function MobileTabBar({ unread = 0 }: { unread?: number }) {
  const p = usePathname() || '/';
  return (
    <div className="k-mtab">
      <nav aria-label="Main" style={{ width: '100%', boxSizing: 'border-box', height: '72px', background: 'var(--kb-fffdf8)', borderTop: '1px solid var(--kl-e3daca)', display: 'grid', gridTemplateColumns: 'repeat(5,minmax(0,1fr))', alignItems: 'center', padding: '0 6px', fontFamily: "'Plus Jakarta Sans',system-ui,sans-serif", boxShadow: '0 -8px 24px -16px rgba(31,77,58,.25)' }}>
        {TABS.map((t) => {
          const on = t.match(p);
          return (
            <Link key={t.href} href={t.href} aria-current={on ? 'page' : undefined} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '3px', textDecoration: 'none', color: on ? 'var(--kf-1f4d3a)' : 'var(--kf-60666c)', fontSize: '11px', fontWeight: '700', minHeight: '56px', justifyContent: 'center' }}>
              <span style={{ width: '52px', height: '30px', borderRadius: '999px', background: on ? 'var(--kb-dce6da)' : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
                <svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{t.icon}</svg>
                {t.href === '/chat' && unread > 0 && <span style={{ position: 'absolute', top: '2px', right: '10px', width: '8px', height: '8px', borderRadius: '50%', background: 'var(--kb-c9491f)' }}></span>}
              </span>
              {t.label}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
