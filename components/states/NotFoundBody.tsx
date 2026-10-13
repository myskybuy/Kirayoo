import Link from 'next/link';

/** R27 404 content. */
export default function NotFoundBody() {
  return (
    <div style={{ maxWidth: '880px', margin: '0 auto', padding: 'clamp(40px,8vw,72px) 16px', boxSizing: 'border-box', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: '22px' }}>
      <div aria-hidden="true" style={{ position: 'relative', width: 'min(300px,90vw)', height: '180px' }}>
        <span className="d" style={{ position: 'absolute', inset: '0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 'clamp(110px,30vw,160px)', fontWeight: '800', color: '#DCE6DA', lineHeight: '1' }}>404</span>
        <span style={{ position: 'absolute', left: '50%', top: '50%', transform: 'translate(-50%,-50%) rotate(-8deg)', padding: '10px 18px', borderRadius: '999px', background: '#FFFDF8', color: '#1F4D3A', fontWeight: '800', fontSize: '18px', boxShadow: '0 10px 24px -10px rgba(31,77,58,.4)', whiteSpace: 'nowrap' }}>Out on rent</span>
      </div>
      <h1 className="d" style={{ fontSize: 'clamp(32px,4vw,48px)', fontWeight: '700', color: '#1F4D3A', lineHeight: '1.05' }}>This page has been borrowed and not returned</h1>
      <p className="mute" style={{ maxWidth: '480px' }}>The link may be old, or the listing was removed by its owner. Let&apos;s get you back to things you can actually rent.</p>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', justifyContent: 'center' }}>
        <Link className="k-btn p" href="/">Go home</Link>
        <Link className="k-btn o" href="/browse">Browse nearby items</Link>
      </div>
    </div>
  );
}
