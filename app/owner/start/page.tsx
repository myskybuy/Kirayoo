import Link from 'next/link';
import PageCss from '@/components/PageCss';
import SiteHeader from '@/components/SiteHeader';
import SiteFooter from '@/components/SiteFooter';
import { requireUser } from '@/lib/auth';
import { fmtTime } from '@/lib/format';

export const metadata = { title: 'Become an owner' };

const STEPS = [
  ['Verify your ID once', 'Government ID + selfie. The admin approves it, usually within a few hours.'],
  ['List your item', 'Photos, price per day (and per week), a refundable deposit, and the days you are not lending.'],
  ['Answer booking requests', 'Renters send dates in chat. Accept, decline or suggest other dates.'],
  ['Hand over with an OTP', 'Take condition photos, then enter the renter’s 4-digit pickup code.'],
  ['Check the return', 'Enter the return code, take photos, then confirm “All OK” or claim from the deposit.'],
  ['Get paid', 'Online bookings are paid out after the deposit is settled. Cash bookings you collect yourself.'],
];

export default async function OwnerStartPage() {
  const user = await requireUser('/owner/start');
  const s = user.idStatus;
  const tone = s === 'VERIFIED' ? { bg: '#DCEEDF', fg: '#1E5A37' } : s === 'REJECTED' ? { bg: '#F7DCD7', fg: '#8E2A20' } : { bg: '#FBEBCF', fg: '#7A4708' };
  const title = s === 'VERIFIED' ? 'You’re verified — start listing' : s === 'PENDING' ? 'Your ID is under review' : s === 'REJECTED' ? 'Your ID needs another try' : 'Lend your things, earn from them';
  const text =
    s === 'VERIFIED'
      ? 'Your items go live after a quick admin review.'
      : s === 'PENDING'
        ? `Submitted ${user.idSubmittedAt ? fmtTime(user.idSubmittedAt) : ''}. You can list items as soon as it is approved — usually within a few hours.`
        : s === 'REJECTED'
          ? `Reason: ${user.idRejectReason ?? 'not given'}. Upload a clearer photo to continue.`
          : 'Owners on Kirayo are ID-verified, so renters trust them. Verify once, then list as many items as you like.';
  return (
    <div className="k-shell">
      <SiteHeader />
      <main>
        <PageCss id="R10-IDStatus" />
        <div style={{ maxWidth: '720px', margin: '0 auto', padding: '40px 16px 72px', boxSizing: 'border-box', display: 'flex', flexDirection: 'column', gap: '18px' }}>
          <div style={{ background: '#FFFDF8', borderRadius: '32px', overflow: 'hidden', boxShadow: '0 2px 6px rgba(35,38,42,.06),0 30px 60px -24px rgba(31,77,58,.35)' }}>
            <div style={{ padding: '36px 32px 28px', background: tone.bg, display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: '14px' }}>
              <span style={{ width: '84px', height: '84px', borderRadius: '50%', background: '#1F4D3A', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 0 10px rgba(255,255,255,.55)' }}>
                <svg className="ic" viewBox="0 0 24 24" style={{ width: '40px', height: '40px' }}><rect x="4" y="4" width="7" height="7" rx="2"></rect><rect x="13" y="4" width="7" height="7" rx="2"></rect><rect x="4" y="13" width="7" height="7" rx="2"></rect><path d="M16.5 13.5v6M13.5 16.5h6"></path></svg>
              </span>
              <span style={{ fontSize: '12px', fontWeight: '800', letterSpacing: '.08em', textTransform: 'uppercase', color: tone.fg }}>Become an owner{s !== 'NONE' ? ` · ID ${s.toLowerCase()}` : ''}</span>
              <h1 className="d" style={{ fontSize: '34px', fontWeight: '700', lineHeight: '1.08' }}>{title}</h1>
              <p style={{ color: '#474C52', maxWidth: '480px' }}>{text}</p>
            </div>
            <div style={{ padding: '20px 32px 30px', display: 'flex', flexDirection: 'column', gap: '18px' }}>
              <ol style={{ margin: 0, padding: 0, listStyle: 'none' }}>
                {STEPS.map(([h, t], i) => (
                  <li key={h} className="row" style={{ justifyContent: 'flex-start', alignItems: 'flex-start' }}>
                    <span style={{ width: '28px', height: '28px', borderRadius: '10px', background: i === 0 && s !== 'VERIFIED' ? '#C9491F' : '#1F4D3A', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '13px', flex: 'none' }}>{i === 0 && s === 'VERIFIED' ? '✓' : i + 1}</span>
                    <span><b>{h}</b><br /><span className="mute">{t}</span></span>
                  </li>
                ))}
              </ol>
              {s === 'VERIFIED' ? (
                <Link className="btn btn-p" href="/owner/new" style={{ width: '100%' }}>List an item</Link>
              ) : s === 'PENDING' ? (
                <Link className="btn btn-o" href="/verify-id" style={{ width: '100%' }}>View ID status</Link>
              ) : (
                <Link className="btn btn-p" href="/verify-id?next=/owner/start" style={{ width: '100%' }}>{s === 'REJECTED' ? 'Upload again' : 'Verify my ID'}</Link>
              )}
              <p className="mute" style={{ fontSize: '13px', textAlign: 'center' }}>Read the <Link href="/deposit-policy">rental &amp; deposit policy</Link> before you list.</p>
            </div>
          </div>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
