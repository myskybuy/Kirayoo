import type { ConditionReport } from '@prisma/client';

/** Pickup vs return photos side by side (O07 / R17 / S08 / admin disputes). */
export default function ConditionPairs({ reports, ownerId, renterId }: { reports: ConditionReport[]; ownerId: string; renterId: string }) {
  const pick = (stage: 'PICKUP' | 'RETURN') => reports.filter((r) => r.stage === stage).flatMap((r) => r.photos.map((p) => ({ p, by: r.byUserId === ownerId ? 'owner' : r.byUserId === renterId ? 'renter' : 'admin' })));
  const a = pick('PICKUP');
  const b = pick('RETURN');
  const n = Math.max(a.length, b.length);
  const notes = reports.filter((r) => r.notes);
  if (!n) return <p className="mute" style={{ fontSize: '14px' }}>No condition photos yet.</p>;
  return (
    <>
      <div style={{ display: 'grid', gap: '12px', gridTemplateColumns: 'repeat(auto-fill,minmax(240px,1fr))' }}>
        {Array.from({ length: n }, (_, i) => (
          <div key={i} className="k-pair">
            {[a[i] ? { ...a[i], label: 'pickup' } : null, b[i] ? { ...b[i], label: 'return' } : null].map((x, j) =>
              x ? (
                <a key={j} href={x.p} target="_blank" rel="noreferrer"><img src={x.p} alt={`${x.label} photo by ${x.by}`} /><span>{x.label === 'pickup' ? 'Pickup' : 'Return'} · {x.by}</span></a>
              ) : (
                <div key={j} style={{ background: 'var(--kb-ede5d5)' }}><span>{j === 0 ? 'No pickup photo' : 'No return photo'}</span></div>
              ),
            )}
          </div>
        ))}
      </div>
      {notes.map((r) => <p key={r.id} className="mute" style={{ fontSize: '13px' }}><b>{r.stage === 'PICKUP' ? 'Pickup' : 'Return'} note ({r.byUserId === ownerId ? 'owner' : 'renter'}):</b> {r.notes}</p>)}
    </>
  );
}
