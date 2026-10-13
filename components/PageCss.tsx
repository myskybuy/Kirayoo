/**
 * Links one design-kit screen stylesheet (public/design/<sec>/css/<id>.css).
 * Rendered as a plain <link> (no `precedence`) so it is removed when the page
 * unmounts — kit screens define the same class names slightly differently.
 */
export default function PageCss({ id }: { id: string }) {
  const [sec, name] = id.includes('/') ? id.split('/') : [id[0] === 'O' ? 'owner' : id[0] === 'A' ? 'admin' : 'renter', id];
  return <link rel="stylesheet" href={`/design/${sec}/css/${name}.css`} />;
}
