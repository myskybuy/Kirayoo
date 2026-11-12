import Link from 'next/link';
import PageCss from '@/components/PageCss';
import SiteHeader from '@/components/SiteHeader';
import SiteFooter from '@/components/SiteFooter';
import OwnerApplyForm from '@/components/OwnerApplyForm';
import { requireUser } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { CATEGORIES, categoryLabel } from '@/lib/constants';
import { fmtTime } from '@/lib/format';

export const metadata = { title: 'Become an owner' };

const STEPS = [
  ['Apply as an owner', 'Your name, phone and what you will rent. The admin reviews it, usually within a day.'],
  ['Verify your ID once', 'Government ID + selfie. The admin approves it, usually within a few hours.'],
  ['List your item', 'Photos, price per day (and per week), a refundable deposit. Each listing is reviewed before it goes live.'],
  ['Hand over with an OTP', 'Take condition photos, then enter the renter’s 4-digit pickup code.'],
  ['Check the return, get paid', 'Confirm “All OK” or claim from the deposit. Online bookings are paid out after the deposit is settled.'],
];

const TONE = {
  ok: { bg: 'var(--kb-dceedf)', fg: 'var(--kf-1e5a37)' },
  wait: { bg: 'var(--kb-fbebcf)', fg: 'var(--kf-7a4708)' },
  bad: { bg: 'var(--kb-f7dcd7)', fg: 'var(--kf-8e2a20)' },
  new: { bg: 'var(--kb-eef3ec)', fg: 'var(--kf-1f4d3a)' },
};

// Outside the (dash) group on purpose: the panel layout redirects here until
// the application is APPROVED and the ID is VERIFIED.
export default async function OwnerApplyPage({ searchParams }: { searchParams: Promise<{ sent?: string }> }) {
  const sp = await searchParams;
  const user = await requireUser('/owner/apply');
  const app = await prisma.ownerApplication.findUnique({ where: { userId: user.id } });
  const s = user.ownerStatus;
  const id = user.idStatus;
  const ready = s === 'APPROVED' && id === 'VERIFIED';

  const head =
    s === 'APPROVED'
      ? ready
        ? { tone: TONE.ok, kicker: 'Owner approved', title: 'You’re all set — start listing', text: 'Every new or edited listing is reviewed by the admin before it goes live.' }
        : { tone: TONE.ok, kicker: 'Owner approved', title: 'Approved! One last step: your ID', text: id === 'PENDING' ? 'Your ID is under review. You can list items as soon as it is approved.' : id === 'REJECTED' ? `Your ID needs another try: ${user.idRejectReason ?? 'see the reason on the ID page'}.` : 'Owners on Kirayo are ID-verified, so renters trust them. Verify once and list as many items as you like.' }
      : s === 'PENDING'
        ? { tone: TONE.wait, kicker: 'Application under review', title: 'Thanks — we’re reviewing it', text: `Sent ${app ? fmtTime(app.submittedAt) : ''}. You’ll get an email when the admin decides, usually within a day.` }
        : s === 'REJECTED'
          ? { tone: TONE.bad, kicker: 'Application not approved', title: 'Your application needs changes', text: `Reason: ${user.ownerRejectReason ?? 'not given'}. Update the details below and send it again.` }
          : { tone: TONE.new, kicker: 'Become an owner', title: 'Lend your things, earn from them', text: 'Tell us a little about you and what you’ll rent. Approved owners verify their ID once, then list as many items as they like.' };

  const showForm = s === 'NONE' || s === 'REJECTED';
  // Steps 1 and 2 are the two gates; the first one not done is highlighted.
  const done = [s === 'APPROVED', id === 'VERIFIED', ready, ready, ready];
  const current = done.findIndex((d) => !d);

  return (
    <div className="k-shell">
      <SiteHeader />
      <main>
        <PageCss id="R10-IDStatus" />
        <div style={{ maxWidth: '760px', margin: '0 auto', padding: '40px 16px 72px', boxSizing: 'border-box', display: 'flex', flexDirection: 'column', gap: '18px' }}>
          <div style={{ background: 'var(--kb-fffdf8)', borderRadius: '32px', overflow: 'hidden', boxShadow: '0 2px 6px rgba(35,38,42,.06),0 30px 60px -24px rgba(31,77,58,.35)' }}>
            <div style={{ padding: '36px clamp(20px,5vw,32px) 28px', background: head.tone.bg, display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: '14px' }}>
              <span style={{ width: '84px', height: '84px', borderRadius: '50%', background: 'var(--kb-1f4d3a)', color: 'var(--kf-ffffff)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 0 10px rgba(255,255,255,.55)' }}>
                <svg className="ic" viewBox="0 0 24 24" style={{ width: '40px', height: '40px' }}><rect x="4" y="4" width="7" height="7" rx="2"></rect><rect x="13" y="4" width="7" height="7" rx="2"></rect><rect x="4" y="13" width="7" height="7" rx="2"></rect><path d="M16.5 13.5v6M13.5 16.5h6"></path></svg>
              </span>
              <span style={{ fontSize: '12px', fontWeight: '800', letterSpacing: '.08em', textTransform: 'uppercase', color: head.tone.fg }}>{head.kicker}</span>
              <h1 className="d" style={{ fontSize: 'clamp(28px,6vw,34px)', fontWeight: '700', lineHeight: '1.08' }}>{head.title}</h1>
              <p style={{ color: 'var(--kf-474c52)', maxWidth: '520px' }}>{head.text}</p>
              {sp.sent && s === 'PENDING' && <p className="k-alert ok" role="status">Application sent.</p>}
            </div>
            <div style={{ padding: '22px clamp(20px,5vw,32px) 30px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <ol style={{ margin: 0, padding: 0, listStyle: 'none' }}>
                {STEPS.map(([h, t], i) => {
                  const ok = done[i] && i < 2;
                  return (
                    <li key={h} className="row" style={{ justifyContent: 'flex-start', alignItems: 'flex-start' }}>
                      <span style={{ width: '28px', height: '28px', borderRadius: '10px', background: ok ? 'var(--kb-1f4d3a)' : i === current ? 'var(--kb-c9491f)' : 'var(--kb-bfb4a0)', color: 'var(--kf-ffffff)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '13px', flex: 'none' }}>{ok ? '✓' : i + 1}</span>
                      <span><b>{h}</b>{i === 0 && s === 'PENDING' ? <span className="badge b-wa" style={{ marginLeft: '8px' }}>In review</span> : null}<br /><span className="mute">{t}</span></span>
                    </li>
                  );
                })}
              </ol>

              {showForm && (
                <section style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <h2 className="d" style={{ fontSize: '22px', fontWeight: '700' }}>Owner application</h2>
                  <OwnerApplyForm
                    categories={CATEGORIES.map((c) => ({ key: c.key, label: c.label }))}
                    initial={{ name: app?.name ?? user.name, phone: app?.phone ?? user.phone ?? '', categories: app?.categories ?? [], plans: app?.plans ?? '' }}
                  />
                </section>
              )}

              {s === 'PENDING' && app && (
                <section className="card" style={{ padding: '18px', display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '14px' }}>
                  <b>What you sent</b>
                  <span>{app.name} · {app.phone}</span>
                  <span className="mute">{app.categories.map(categoryLabel).join(', ')}</span>
                  <span className="mute">{app.plans}</span>
                </section>
              )}

              {s === 'PENDING' && id !== 'VERIFIED' && id !== 'PENDING' && (
                <Link className="btn btn-o" href="/verify-id?next=/owner/apply" style={{ width: '100%' }}>Save time: verify your ID now</Link>
              )}
              {s === 'APPROVED' && !ready && (
                id === 'PENDING'
                  ? <Link className="btn btn-o" href="/verify-id" style={{ width: '100%' }}>View ID status</Link>
                  : <Link className="btn btn-p" href="/verify-id?next=/owner/apply" style={{ width: '100%' }}>{id === 'REJECTED' ? 'Upload ID again' : 'Verify my ID'}</Link>
              )}
              {ready && (
                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                  <Link className="btn btn-p" href="/owner/new" style={{ flex: '1 1 200px' }}>List an item</Link>
                  <Link className="btn btn-o" href="/owner" style={{ flex: '1 1 200px' }}>Owner dashboard</Link>
                </div>
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
