import Link from 'next/link';
import PageCss from '@/components/PageCss';
import IdForm from '@/components/IdForm';
import CheckoutSteps from '@/components/CheckoutSteps';
import { requireUser } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { fmtTime, hoursLeft } from '@/lib/format';

export const metadata = { title: 'Verify your ID' };

export default async function VerifyIdPage({ searchParams }: { searchParams: Promise<{ next?: string; retry?: string; submitted?: string }> }) {
  const sp = await searchParams;
  const user = await requireUser('/verify-id');
  const next = sp.next && sp.next.startsWith('/') && !sp.next.startsWith('//') ? sp.next : '';
  const inCheckout = next.startsWith('/book/') || next.startsWith('/pay/');
  const hold = await prisma.booking.findFirst({ where: { renterId: user.id, status: 'PENDING_PAYMENT', holdExpiresAt: { gt: new Date() } }, include: { owner: { select: { name: true } } }, orderBy: { holdExpiresAt: 'asc' } });

  // S05 — rejected
  if (user.idStatus === 'REJECTED' && !sp.retry) {
    return (
      <>
        <PageCss id="S05-IDRejected" />
        <div style={{ maxWidth: '860px', margin: '0 auto', padding: 'clamp(20px,5vw,44px) 16px 72px', boxSizing: 'border-box', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <section style={{ background: '#FFFDF8', borderRadius: '32px', overflow: 'hidden', boxShadow: '0 2px 6px rgba(35,38,42,.06),0 30px 60px -24px rgba(31,77,58,.3)' }}>
            <div style={{ padding: 'clamp(20px,4vw,32px)', background: '#F7DCD7', display: 'flex', flexWrap: 'wrap', gap: '20px', alignItems: 'center' }}>
              <span style={{ width: '72px', height: '72px', borderRadius: '50%', background: '#B3372B', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 'none' }}><svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6 6 18"></path></svg></span>
              <div style={{ flex: '1 1 300px' }}><span style={{ fontSize: '12px', fontWeight: '800', letterSpacing: '.08em', textTransform: 'uppercase', color: '#8E2A20' }}>ID verification · Rejected</span><h1 className="d" style={{ fontSize: 'clamp(28px,3.2vw,38px)', fontWeight: '700', lineHeight: '1.1' }}>We couldn&apos;t verify your {user.idDocType ?? 'ID'}</h1></div>
            </div>
            <div style={{ padding: 'clamp(20px,4vw,28px) clamp(20px,4vw,32px)', display: 'flex', flexDirection: 'column', gap: '18px' }}>
              <div style={{ padding: '16px 18px', borderRadius: '18px', background: '#F6F1E7' }}><b>Admin&apos;s note</b><p style={{ color: '#474C52' }}>{user.idRejectReason ?? 'No reason given.'}</p></div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '14px' }}>
                <div className="ex" style={{ color: '#1E5A37' }}><div style={{ background: '#DCEEDF', boxShadow: 'inset 0 0 0 2px #1F4D3A' }}><svg width="56" height="40" viewBox="0 0 56 40" aria-hidden="true"><rect x="2" y="2" width="52" height="36" rx="6" fill="#FFFDF8" stroke="#1F4D3A" strokeWidth="2"></rect><circle cx="16" cy="18" r="6" fill="#BFD1BD"></circle><rect x="28" y="12" width="20" height="4" rx="2" fill="#1F4D3A"></rect><rect x="28" y="20" width="14" height="4" rx="2" fill="#1F4D3A"></rect></svg></div>✓ Sharp, all corners</div>
                <div className="ex" style={{ color: '#8E2A20' }}><div style={{ background: '#F7DCD7' }}><svg width="56" height="40" viewBox="0 0 56 40" aria-hidden="true" style={{ filter: 'blur(2px)' }}><rect x="2" y="2" width="52" height="36" rx="6" fill="#FFFDF8" stroke="#8E2A20" strokeWidth="2"></rect><circle cx="16" cy="18" r="6" fill="#E3B5AD"></circle><rect x="28" y="12" width="20" height="4" rx="2" fill="#8E2A20"></rect></svg></div>✕ Blurry</div>
                <div className="ex" style={{ color: '#8E2A20' }}><div style={{ background: '#F7DCD7', overflow: 'hidden' }}><svg width="56" height="40" viewBox="0 0 56 40" aria-hidden="true" style={{ transform: 'translate(18px,8px)' }}><rect x="2" y="2" width="52" height="36" rx="6" fill="#FFFDF8" stroke="#8E2A20" strokeWidth="2"></rect><circle cx="16" cy="18" r="6" fill="#E3B5AD"></circle></svg></div>✕ Cut off</div>
                <div className="ex" style={{ color: '#8E2A20' }}><div style={{ background: '#F7DCD7' }}><svg width="56" height="40" viewBox="0 0 56 40" aria-hidden="true"><rect x="2" y="2" width="52" height="36" rx="6" fill="#FFFDF8" stroke="#8E2A20" strokeWidth="2"></rect><ellipse cx="34" cy="16" rx="14" ry="9" fill="#fff" opacity=".95"></ellipse></svg></div>✕ Glare</div>
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', alignItems: 'center', justifyContent: 'space-between', paddingTop: '6px', borderTop: '1px solid #E3DACA' }}>
                <span className="mute" style={{ fontSize: '13.5px' }}>{hold ? `Your booking with ${hold.owner.name.split(' ')[0]} is held for ${hoursLeft(hold.holdExpiresAt!)} more hours — re-uploading extends it by 12 h.` : 'You can upload again right away.'}</span>
                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}><Link className="btn" href="/contact" style={{ color: '#1F4D3A', boxShadow: 'inset 0 0 0 1.5px #1F4D3A' }}>Get help</Link><Link className="btn" href={`/verify-id?retry=1${next ? `&next=${encodeURIComponent(next)}` : ''}`} style={{ background: '#C9491F', color: '#fff' }}>Re-upload ID</Link></div>
              </div>
            </div>
          </section>
        </div>
      </>
    );
  }

  // R10 — pending or verified
  if (user.idStatus === 'PENDING' || user.idStatus === 'VERIFIED') {
    const ok = user.idStatus === 'VERIFIED';
    return (
      <>
        <PageCss id="R10-IDStatus" />
        <div style={{ maxWidth: '640px', margin: '0 auto', padding: 'clamp(20px,5vw,40px) 16px 72px', boxSizing: 'border-box', display: 'flex', flexDirection: 'column', gap: '18px' }}>
          {inCheckout && <CheckoutSteps at={ok ? 3 : 2} />}
          <div style={{ background: '#FFFDF8', borderRadius: '32px', overflow: 'hidden', boxShadow: '0 2px 6px rgba(35,38,42,.06),0 30px 60px -24px rgba(31,77,58,.35)' }}>
            <div style={{ padding: '36px 32px 28px', background: ok ? '#DCEEDF' : '#FBEBCF', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: '14px' }}>
              <span style={{ width: '84px', height: '84px', borderRadius: '50%', background: ok ? '#1F4D3A' : '#B26B12', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 0 10px rgba(255,255,255,.55)' }}>
                {ok ? <svg className="ic" viewBox="0 0 24 24" style={{ width: '40px', height: '40px', strokeWidth: '2.4' }}><path d="m5 12.5 4.5 4.5L19 7.5"></path></svg> : <svg className="ic" viewBox="0 0 24 24" style={{ width: '40px', height: '40px' }}><circle cx="12" cy="12" r="8.5"></circle><path d="M12 7.5V12l3 2"></path></svg>}
              </span>
              <span style={{ fontSize: '12px', fontWeight: '800', letterSpacing: '.08em', textTransform: 'uppercase', color: ok ? '#1E5A37' : '#7A4708' }}>ID status · {ok ? 'Verified' : 'Pending'}</span>
              <h1 className="d" style={{ fontSize: '34px', fontWeight: '700', lineHeight: '1.08' }}>{ok ? `You’re verified, ${user.name.split(' ')[0]}` : 'We’re checking your ID'}</h1>
              <p style={{ color: '#474C52', maxWidth: '440px' }}>{ok ? 'Owners now see a green “ID verified” tick next to your name. You won’t need to do this again.' : `Usually approved within a few hours. We’ll email you${hold ? `, and your booking hold was extended by 12 h` : ''}.`}</p>
            </div>
            <div style={{ padding: '20px 32px 30px', display: 'flex', flexDirection: 'column', gap: '18px' }}>
              {sp.submitted && <p className="k-alert ok">Submitted — thanks!</p>}
              <div>
                <div className="row"><span className="mute">Document</span><b>{user.idDocType ?? 'ID'}{user.idDocType === 'Aadhaar' ? ' (masked)' : ''}</b></div>
                <div className="row"><span className="mute">Selfie</span><b>Submitted</b></div>
                <div className="row"><span className="mute">Submitted</span><b>{user.idSubmittedAt ? fmtTime(user.idSubmittedAt) : '—'}</b></div>
                {ok && user.idReviewedAt && <div className="row"><span className="mute">Approved</span><b>{fmtTime(user.idReviewedAt)}</b></div>}
                {!ok && hold && <div className="row"><span className="mute">Booking held until</span><b>{fmtTime(hold.holdExpiresAt!)}</b></div>}
              </div>
              {ok && next ? <Link className="btn btn-p" href={next} style={{ width: '100%' }}>Continue to payment</Link>
                : ok && hold ? <Link className="btn btn-p" href={`/book/${hold.id}`} style={{ width: '100%' }}>Continue to your booking</Link>
                : ok ? <Link className="btn btn-o" href="/browse" style={{ width: '100%' }}>Browse items</Link>
                : <Link className="btn btn-o" href={next || '/bookings'} style={{ width: '100%' }}>{next ? 'Back to booking' : 'My rentals'}</Link>}
            </div>
          </div>
        </div>
      </>
    );
  }

  // R09 — upload form (first time or retry)
  return (
    <>
      <PageCss id="R09-IDVerify" />
      <div className="wrap" style={{ paddingTop: '28px', paddingBottom: '72px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
        {inCheckout && <CheckoutSteps at={2} />}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '28px', alignItems: 'flex-start' }}>
          <main style={{ flex: '999 1 560px', minWidth: '0', display: 'flex', flexDirection: 'column', gap: '18px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <h1 className="d" style={{ fontSize: 'clamp(30px,3.4vw,44px)', fontWeight: '700', lineHeight: '1.05' }}>Verify your identity once</h1>
              <p className="mute" style={{ maxWidth: '600px' }}>Owners hand over expensive things. A quick ID check keeps everyone honest. You only do this one time, for renting and listing.</p>
            </div>
            {user.idStatus === 'REJECTED' && <p className="k-alert warn">Last time: {user.idRejectReason}</p>}
            <IdForm next={next} />
          </main>
          <aside style={{ flex: '1 1 300px', minWidth: '0', display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div style={{ padding: '22px', borderRadius: '24px', background: '#1F4D3A', color: '#F6F1E7', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <svg className="ic" viewBox="0 0 24 24" style={{ width: '30px', height: '30px', color: '#E8643C' }}><path d="M12 3 4.5 6v6c0 4.5 3.2 7.8 7.5 9 4.3-1.2 7.5-4.5 7.5-9V6z"></path><path d="m9 12 2.2 2.2L15.5 10"></path></svg>
              <b className="d" style={{ fontSize: '20px' }}>Who sees your ID?</b>
              <p style={{ fontSize: '14px', color: '#DCE6DA' }}>Only the Kirayo admin, to approve it. Owners never see your document. They only see a green &quot;ID verified&quot; tick next to your name.</p>
            </div>
            <div className="card" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <b style={{ fontSize: '14px' }}>What happens next</b>
              <ol style={{ margin: '0', paddingLeft: '18px', fontSize: '13.5px', color: '#474C52', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <li>Status shows <b>Pending</b> while admin checks (usually within a few hours).</li>
                <li>Once <b>Verified</b>, you can pay and list items.</li>
                <li>If <b>Rejected</b>, we tell you why and you can re-upload.</li>
                {hold && <li>Your held booking gets <b>12 extra hours</b> when you submit.</li>}
              </ol>
            </div>
          </aside>
        </div>
      </div>
    </>
  );
}
