/** GET search box for admin lists (keeps the current tab/filter). */
export default function AdminSearch({ action, q, hidden = {}, placeholder = 'Search' }: { action: string; q: string; hidden?: Record<string, string>; placeholder?: string }) {
  return (
    <form action={action} method="get" role="search" style={{ display: 'flex', gap: '6px', marginLeft: 'auto', flex: '0 1 340px', minWidth: '220px' }}>
      {Object.entries(hidden).map(([k, v]) => <input key={k} type="hidden" name={k} value={v} />)}
      <input name="q" defaultValue={q} placeholder={placeholder} aria-label={placeholder} className="k-in" style={{ minHeight: '40px', borderRadius: '999px' }} />
      <button type="submit" className="k-btn g sm">Search</button>
    </form>
  );
}
