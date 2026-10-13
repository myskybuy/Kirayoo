import Link from 'next/link';

const ICONS = {
  search: '<circle cx="11" cy="11" r="6.5"></circle><path d="m20 20-4-4M8.5 11h5"></path>',
  calendar: '<rect x="3.5" y="5" width="17" height="15" rx="3"></rect><path d="M3.5 10h17M8 3v4M16 3v4"></path>',
  grid: '<rect x="4" y="4" width="7" height="7" rx="2"></rect><rect x="13" y="4" width="7" height="7" rx="2"></rect><rect x="4" y="13" width="7" height="7" rx="2"></rect><path d="M16.5 13.5v6M13.5 16.5h6"></path>',
  chat: '<path d="M5 18.5V6.5A2.5 2.5 0 0 1 7.5 4h9A2.5 2.5 0 0 1 19 6.5v7a2.5 2.5 0 0 1-2.5 2.5H9z"></path>',
  check: '<path d="m5 12.5 4.5 4.5L19 7.5"></path>',
};

/** S01 empty state block. */
export default function EmptyState({ icon = 'search', title, text, chips = [], action }: { icon?: keyof typeof ICONS; title: string; text?: string; chips?: { href: string; label: string }[]; action?: { href: string; label: string; tone?: 'p' | 'g' } }) {
  return (
    <section className="k-es">
      <span className="k-art"><svg viewBox="0 0 24 24" aria-hidden="true" dangerouslySetInnerHTML={{ __html: ICONS[icon] }} /></span>
      <h2 className="d" style={{ fontSize: '24px', fontWeight: '700' }}>{title}</h2>
      {text && <p className="mute" style={{ fontSize: '14px', maxWidth: '460px' }}>{text}</p>}
      {chips.length > 0 && <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', justifyContent: 'center' }}>{chips.map((c) => <Link key={c.label} className="k-chip" href={c.href}>{c.label}</Link>)}</div>}
      {action && <Link className={`k-btn ${action.tone ?? 'p'}`} href={action.href}>{action.label}</Link>}
    </section>
  );
}
