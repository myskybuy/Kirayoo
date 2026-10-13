/** S02 loading skeleton (title, chips, cards). */
export default function LoadingGrid({ cards = 8 }: { cards?: number }) {
  return (
    <div style={{ maxWidth: '1288px', margin: '0 auto', padding: '28px clamp(16px,3vw,24px) 72px', boxSizing: 'border-box', display: 'flex', flexDirection: 'column', gap: '20px', width: '100%' }} aria-busy="true" aria-label="Loading">
      <div className="k-sk" style={{ width: '380px', maxWidth: '100%', height: '40px' }}></div>
      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>{[90, 110, 80, 120].map((w) => <div key={w} className="k-sk" style={{ width: `${w}px`, height: '40px', borderRadius: '999px' }}></div>)}</div>
      <div style={{ display: 'grid', gap: '36px 24px', gridTemplateColumns: 'repeat(auto-fill,minmax(min(260px,100%),1fr))' }}>
        {Array.from({ length: cards }, (_, i) => (
          <div key={i} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div className="k-sk" style={{ aspectRatio: '4/3', borderRadius: '22px' }}></div>
            <div className="k-sk" style={{ height: '18px', width: '80%' }}></div>
            <div className="k-sk" style={{ height: '14px', width: '55%' }}></div>
          </div>
        ))}
      </div>
    </div>
  );
}
