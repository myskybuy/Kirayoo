'use client';
import Link from 'next/link';
import ThemeToggle from './ThemeToggle';
import { usePathname } from 'next/navigation';

export type NavItem = { href: string; label: string; icon: string; badge?: number; exact?: boolean };

const ICON_PROPS = { width: 20, height: 20, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 1.8, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const, 'aria-hidden': true };

/** Owner (forest) / admin (ink) side navigation from O01 / A01. */
export default function SideNav({ variant, items, user, footer }: { variant: 'owner' | 'admin'; items: NavItem[]; user: { initials: string; name: string; sub: string; color: string }; footer?: React.ReactNode }) {
  const p = usePathname() || '/';
  const owner = variant === 'owner';
  const bg = owner ? 'var(--kb-1f4d3a)' : 'var(--kb-23262a)';
  return (
    <div style={{ width: '100%', boxSizing: 'border-box', background: bg, color: 'var(--kf-f6f1e7)', padding: '22px 14px', display: 'flex', flexDirection: 'column', gap: '22px', fontFamily: "'Plus Jakarta Sans',system-ui,sans-serif", minHeight: '100%' }}>
      <Link href={owner ? '/owner' : '/admin'} aria-label="Kirayo home" style={{ display: 'flex', alignItems: 'center', gap: '9px', textDecoration: 'none', color: 'var(--kf-f6f1e7)', padding: '0 8px' }}>
        <svg width="32" height="32" viewBox="0 0 44 44" aria-hidden="true"><rect width="44" height="44" rx="14" fill="#F6F1E7"></rect><path d="M14 30V14M14 22l9-8M17.5 19l8.5 11" fill="none" stroke="#1F4D3A" strokeWidth="3.6" strokeLinecap="round" strokeLinejoin="round"></path><circle cx="31" cy="15" r="3.6" fill="#E8643C"></circle></svg>
        <span style={{ fontFamily: "'Bricolage Grotesque',Georgia,serif", fontWeight: '800', fontSize: '23px', letterSpacing: '-.035em' }}>kirayo</span>
        <span style={owner ? { marginLeft: 'auto', fontSize: '11px', fontWeight: '700', padding: '3px 8px', borderRadius: '999px', background: 'rgba(246,241,231,.14)', letterSpacing: '.05em' } : { marginLeft: 'auto', fontSize: '11px', fontWeight: '700', padding: '3px 8px', borderRadius: '999px', background: 'var(--kb-e8643c)', color: 'var(--kf-23262a)', letterSpacing: '.05em' }}>{owner ? 'OWNER' : 'ADMIN'}</span>
      </Link>
      {owner && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '12px', borderRadius: '18px', background: 'rgba(246,241,231,.08)' }}>
          <span style={{ width: '40px', height: '40px', borderRadius: '50%', background: user.color, color: 'var(--kf-ffffff)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '800', fontSize: '14px', flex: 'none' }}>{user.initials}</span>
          <span style={{ display: 'flex', flexDirection: 'column', minWidth: '0' }}><b style={{ fontSize: '14px' }}>{user.name}</b><span style={{ fontSize: '12px', color: 'var(--kf-bfd1bd)' }}>{user.sub}</span></span>
        </div>
      )}
      <nav aria-label={owner ? 'Owner panel' : 'Admin'} style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
        {items.map((it) => {
          const on = it.exact ? p === it.href : p === it.href || p.startsWith(it.href + '/') || (p.startsWith(it.href) && it.href !== (owner ? '/owner' : '/admin'));
          return (
            <Link key={it.href} href={it.href} aria-current={on ? 'page' : undefined}
              style={{ display: 'flex', alignItems: 'center', gap: '12px', minHeight: '44px', padding: '0 12px', borderRadius: '14px', textDecoration: 'none', fontSize: '14.5px', fontWeight: '600', color: on ? (owner ? 'var(--kf-1f4d3a)' : 'var(--kf-23262a)') : owner ? 'var(--kf-dce6da)' : 'var(--kf-d9dcd6)', background: on ? 'var(--kb-f6f1e7)' : 'transparent' }}>
              <svg {...ICON_PROPS} dangerouslySetInnerHTML={{ __html: it.icon }} />
              {it.label}
              {!!it.badge && <span style={{ marginLeft: 'auto', minWidth: '22px', height: '22px', padding: '0 6px', borderRadius: '999px', background: 'var(--kb-e8643c)', color: 'var(--kf-23262a)', fontSize: '12px', fontWeight: '800', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{it.badge}</span>}
            </Link>
          );
        })}
      </nav>
      <ThemeToggle variant="panel" />
      {footer ?? (
        <div style={{ marginTop: 'auto', display: 'flex', alignItems: 'center', gap: '10px', padding: '12px', borderRadius: '16px', background: 'rgba(246,241,231,.07)' }}>
          <span style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'var(--kb-1f4d3a)', color: 'var(--kf-ffffff)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '800', fontSize: '13px' }}>{user.initials}</span>
          <span style={{ display: 'flex', flexDirection: 'column' }}><b style={{ fontSize: '13.5px' }}>{user.name}</b><span style={{ fontSize: '12px', color: 'var(--kf-b9bdb8)' }}>{user.sub}</span></span>
        </div>
      )}
    </div>
  );
}
