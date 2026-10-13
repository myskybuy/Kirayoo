import Link from 'next/link';

/** Simple numbered pagination; `href(p)` builds the link for page p. */
export default function Pager({ page, total, size, href }: { page: number; total: number; size: number; href: (p: number) => string }) {
  const pages = Math.max(1, Math.ceil(total / size));
  if (pages <= 1) return null;
  const nums = [...new Set([1, page - 1, page, page + 1, pages].filter((n) => n >= 1 && n <= pages))].sort((a, b) => a - b);
  return (
    <nav className="k-pager" aria-label="Pages">
      {page > 1 && <Link href={href(page - 1)} aria-label="Previous page">‹</Link>}
      {nums.map((n, i) => (
        <span key={n} style={{ display: 'contents' }}>
          {i > 0 && n - nums[i - 1] > 1 && <span aria-hidden="true">…</span>}
          {n === page ? <span className="on" aria-current="page">{n}</span> : <Link href={href(n)}>{n}</Link>}
        </span>
      ))}
      {page < pages && <Link href={href(page + 1)} aria-label="Next page">›</Link>}
    </nav>
  );
}
