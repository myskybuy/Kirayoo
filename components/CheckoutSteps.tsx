/** R08–R12 checkout progress pill: Summary → Verify ID → Payment → Confirmed. */
export default function CheckoutSteps({ at, skipId = false }: { at: 1 | 2 | 3 | 4; skipId?: boolean }) {
  const steps = ['Summary', 'Verify ID', 'Payment', 'Confirmed'];
  return (
    <ol aria-label="Checkout progress" style={{ listStyle: 'none', margin: '0', padding: '12px 16px', borderRadius: '28px', background: 'var(--kb-fffdf8)', display: 'flex', flexWrap: 'wrap', gap: '8px 18px', alignItems: 'center', alignSelf: 'flex-start', boxShadow: 'inset 0 0 0 1px var(--kl-e3daca)' }}>
      {steps.map((s, i) => {
        const n = i + 1;
        const done = n < at || (n === 2 && skipId);
        const now = n === at;
        return (
          <li key={s} style={{ display: 'contents' }}>
            {i > 0 && <span aria-hidden="true" style={{ width: '28px', height: '2px', background: n <= at ? 'var(--kb-1f4d3a)' : 'var(--kb-e3daca)' }}></span>}
            <span className={`k-cs${!done && !now ? ' mute' : ''}`} style={done || now ? { color: 'var(--kf-1f4d3a)' } : undefined} aria-current={now ? 'step' : undefined}>
              <span className="k-n" style={done ? { background: 'var(--kb-dce6da)', color: 'var(--kf-1f4d3a)' } : now ? { background: 'var(--kb-1f4d3a)', color: 'var(--kf-ffffff)' } : { boxShadow: 'inset 0 0 0 2px var(--kl-d9ceb8)' }}>{done ? '✓' : n}</span>
              {s}
            </span>
          </li>
        );
      })}
    </ol>
  );
}
