import PageCss from '@/components/PageCss';

export default function HomePage() {
  return (
    <>
      <PageCss id="R01-Home" />
      <section style={{ padding: '56px 0 40px' }}>
        <div className="wrap">
          <span className="eyebrow">Rentals from people near you</span>
          <h1 className="d" style={{ fontSize: 'clamp(42px,5.4vw,76px)', lineHeight: '.98', fontWeight: '700', color: '#1F4D3A' }}>Why buy it when your neighbour has one?</h1>
        </div>
      </section>
    </>
  );
}
