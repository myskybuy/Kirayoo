/** Item photo, or the kit's tinted placeholder with the category icon. */
export default function ItemThumb({ photo, icon, size = 28, alt = '' }: { photo?: string | null; icon?: string; size?: number; alt?: string }) {
  if (photo) return <img src={photo} alt={alt} className="k-photo" loading="lazy" />;
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"
      dangerouslySetInnerHTML={{ __html: icon ?? '<rect x="3" y="4" width="18" height="16" rx="3"></rect><circle cx="9" cy="10" r="2"></circle><path d="m4 18 5-5 4 4 3-3 4 4"></path>' }} />
  );
}
