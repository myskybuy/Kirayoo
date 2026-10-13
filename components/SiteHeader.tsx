import Link from 'next/link';
import { getUser } from '@/lib/auth';
import { getLocation } from '@/lib/location';
import { actionBadge, unreadCount } from '@/lib/header';
import { avatarColor, initials } from '@/lib/format';
import { logoutAction } from '@/app/actions/auth';

export function Logo({ size = 34 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 44 44" aria-hidden="true">
      <rect width="44" height="44" rx="14" fill="#1F4D3A"></rect>
      <path d="M14 30V14M14 22l9-8M17.5 19l8.5 11" fill="none" stroke="#F6F1E7" strokeWidth="3.6" strokeLinecap="round" strokeLinejoin="round"></path>
      <circle cx="31" cy="15" r="3.6" fill="#E8643C"></circle>
    </svg>
  );
}

const label: React.CSSProperties = { fontSize: '11px', fontWeight: '800', letterSpacing: '.07em', textTransform: 'uppercase', color: '#1F4D3A' };
const seg: React.CSSProperties = { display: 'flex', flexDirection: 'column', padding: '2px 18px', minWidth: '0', textDecoration: 'none', color: '#23262A' };
const ell: React.CSSProperties = { fontSize: '14px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' };
const divider = <span style={{ width: '1px', height: '30px', background: '#E3DACA', flex: 'none' }}></span>;

export function ownerHref(u: { idStatus: string } | null, verifiedPath = '/owner/new') {
  return u?.idStatus === 'VERIFIED' ? verifiedPath : '/owner/start';
}

/**
 * Site header from the kit (R01 big search pill / R04 compact pill). Additions
 * the brief asks for: the "Where" segment is the location chip, plus chat icon
 * with unread count, the action badge and an account menu.
 */
export default async function SiteHeader({ compact = false, q = '' }: { compact?: boolean; q?: string }) {
  const user = await getUser();
  const loc = await getLocation(user);
  const [unread, badge] = user ? await Promise.all([unreadCount(user.id), actionBadge(user)]) : [0, null];
  const where = loc ? `${loc.area}, ${loc.city}` : 'Choose your area';

  return (
    <header style={{ width: '100%', boxSizing: 'border-box', background: '#FFFDF8', borderBottom: '1px solid #E3DACA', fontFamily: "'Plus Jakarta Sans',system-ui,sans-serif", color: '#23262A', position: 'relative', zIndex: '30' }}>
      <div style={{ maxWidth: '1288px', margin: '0 auto', boxSizing: 'border-box', padding: compact ? '10px 24px' : '14px 24px', display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '10px 20px' }} className="k-hdr">
        <Link href="/" aria-label="Kirayo home" style={{ display: 'flex', alignItems: 'center', gap: '9px', textDecoration: 'none', color: '#1F4D3A', flex: '1 1 0', minWidth: '130px' }}>
          <Logo />
          <span style={{ fontFamily: "'Bricolage Grotesque',Georgia,serif", fontWeight: '800', fontSize: '25px', letterSpacing: '-.035em' }}>kirayo</span>
        </Link>

        {compact ? (
          <form action="/browse" style={{ display: 'flex', alignItems: 'center', gap: '12px', background: '#fff', borderRadius: '999px', boxShadow: '0 1px 2px rgba(35,38,42,.06),0 8px 22px -12px rgba(31,77,58,.3),inset 0 0 0 1px #E3DACA', padding: '5px 5px 5px 20px', color: '#23262A', flex: '0 1 460px', minWidth: '0', fontSize: '14px', fontWeight: '600' }} className="k-search">
            <input name="q" defaultValue={q} placeholder="Search items" aria-label="Search items" className="k-bare" style={{ flex: '1 1 80px', minWidth: '0', fontWeight: 600 }} />
            <span style={{ width: '1px', height: '20px', background: '#E3DACA', flex: 'none' }}></span>
            <Link href="/location" title="Change location" style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', color: '#23262A', textDecoration: 'none', flex: '0 1 auto', maxWidth: '45%' }}>{loc ? loc.area : 'Choose area'}</Link>
            <button type="submit" style={{ width: '36px', height: '36px', borderRadius: '50%', background: '#C9491F', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', flex: 'none', border: 0, cursor: 'pointer' }} aria-label="Search">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" aria-hidden="true"><circle cx="11" cy="11" r="6.5"></circle><path d="m20 20-4-4"></path></svg>
            </button>
          </form>
        ) : (
          <form action="/browse" style={{ display: 'flex', alignItems: 'center', background: '#fff', borderRadius: '999px', boxShadow: '0 1px 2px rgba(35,38,42,.06),0 10px 28px -12px rgba(31,77,58,.32),inset 0 0 0 1px #E3DACA', padding: '6px', color: '#23262A', flex: '0 1 660px', minWidth: '0' }} className="k-search">
            <label style={{ ...seg, padding: '2px 18px 2px 20px', flex: '1.1 1 0' }}>
              <span style={label}>What</span>
              <input name="q" defaultValue={q} placeholder="Camera, drill, tent…" className="k-bare" style={{ ...ell }} />
            </label>
            {divider}
            <Link href="/location" title="Change location" style={{ ...seg, flex: '1.2 1 0' }}>
              <span style={label}>Where</span>
              <span style={{ ...ell, fontWeight: '600' }}>{where}</span>
            </Link>
            {divider}
            <Link href="/browse#dates" style={{ ...seg, flex: '1 1 0' }} className="hide-m-k">
              <span style={label}>When</span>
              <span style={{ ...ell, color: '#60666C' }}>Add dates</span>
            </Link>
            <button type="submit" style={{ width: '46px', height: '46px', borderRadius: '50%', background: '#C9491F', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', flex: 'none', border: 0, cursor: 'pointer' }} aria-label="Search">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden="true"><circle cx="11" cy="11" r="6.5"></circle><path d="m20 20-4-4"></path></svg>
            </button>
          </form>
        )}

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '6px', flex: '1 1 0', minWidth: '200px' }} className="k-hdr-right">
          <Link href={ownerHref(user)} style={{ fontWeight: '700', fontSize: '14.5px', color: '#1F4D3A', textDecoration: 'none', padding: '12px 14px', borderRadius: '999px', whiteSpace: 'nowrap' }} className="k-hide-s">List an item</Link>
          {user ? (
            <>
              {badge && (
                <Link href={badge.href} title={badge.title} aria-label={`Needs your action: ${badge.title}`} className="k-badge-pill">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M12 8v5M12 16.5v.1"></path><circle cx="12" cy="12" r="9"></circle></svg>
                  {badge.count}
                </Link>
              )}
              <Link href="/chat" aria-label={`Messages${unread ? `, ${unread} unread` : ''}`} className="k-icon-btn">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinejoin="round" aria-hidden="true"><path d="M5 18.5V6.5A2.5 2.5 0 0 1 7.5 4h9A2.5 2.5 0 0 1 19 6.5v7a2.5 2.5 0 0 1-2.5 2.5H9z"></path></svg>
                {unread > 0 && <span className="k-count">{unread > 99 ? '99+' : unread}</span>}
              </Link>
              <details className="k-menu">
                <summary aria-label="Account menu" style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '4px 4px 4px 14px', borderRadius: '999px', boxShadow: 'inset 0 0 0 1px #E3DACA', background: '#fff', color: '#23262A', minHeight: '44px', boxSizing: 'border-box', cursor: 'pointer' }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true"><path d="M4 7h16M4 12h16M4 17h16"></path></svg>
                  <span style={{ width: '36px', height: '36px', borderRadius: '50%', background: avatarColor(user.id), color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '800', fontSize: '13px' }}>{initials(user.name)}</span>
                </summary>
                <div className="k-menu-pop">
                  <div style={{ padding: '6px 12px 10px', borderBottom: '1px solid #E3DACA', marginBottom: '6px' }}>
                    <b style={{ display: 'block' }}>{user.name}</b>
                    <span style={{ fontSize: '12.5px', color: '#60666C' }}>{user.email}</span>
                  </div>
                  <Link href="/bookings">My rentals</Link>
                  <Link href="/chat">Messages{unread > 0 ? ` (${unread})` : ''}</Link>
                  <Link href={ownerHref(user, '/owner')}>{user.idStatus === 'VERIFIED' ? 'Owner dashboard' : 'Become an owner'}</Link>
                  <Link href="/profile">Profile</Link>
                  {user.isAdmin && <Link href="/admin">Admin panel</Link>}
                  <form action={logoutAction}>
                    <button type="submit">Log out</button>
                  </form>
                </div>
              </details>
            </>
          ) : (
            <Link href="/login" style={{ display: 'inline-flex', alignItems: 'center', minHeight: '44px', padding: '0 20px', borderRadius: '999px', background: '#1F4D3A', color: '#fff', fontWeight: '700', fontSize: '14.5px', textDecoration: 'none' }}>Log in</Link>
          )}
        </div>
      </div>
    </header>
  );
}
