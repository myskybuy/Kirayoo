/** R08–R12 checkout progress pill: Summary → Verify ID → Payment → Confirmed. */
export default function CheckoutSteps({ at, skipId = false }: { at: 1 | 2 | 3 | 4; skipId?: boolean }) {
  const steps = ['Summary', 'Verify ID', 'Payment', 'Confirmed'];
  return (
    <ol aria-label="Checkout progress" style={{ listStyle: 'none', margin: '0', padding: '12px 16px', borderRadius: '28px', background: '#FFFDF8', display: 'flex', flexWrap: 'wrap', gap: '8px 18px', alignItems: 'center', alignSelf: 'flex-start', boxShadow: 'inset 0 0 0 1px #E3DACA' }}>
      {steps.map((s, i) => {
        const n = i + 1;
        const done = n < at || (n === 2 && skipId);
        const now = n === at;
        return (
          <li key={s} style={{ display: 'contents' }}>
            {i > 0 && <span aria-hidden="true" style={{ width: '28px', height: '2px', background: n <= at ? '#1F4D3A' : '#E3DACA' }}></span>}
            <span className={`cs${!done && !now ? ' mute' : ''}`} style={done || now ? { color: '#1F4D3A' } : undefined} aria-current={now ? 'step' : undefined}>
              <span className="n" style={done ? { background: '#DCE6DA', color: '#1F4D3A' } : now ? { background: '#1F4D3A', color: '#fff' } : { boxShadow: 'inset 0 0 0 2px #D9CEB8' }}>{done ? '✓' : n}</span>
              {s}
            </span>
          </li>
        );
      })}
    </ol>
  );
}
