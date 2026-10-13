import { redirect } from 'next/navigation';
import { requireUser } from '@/lib/auth';
import { currentPath } from '@/lib/path';

// Owner panel requires a VERIFIED ID. /owner/start lives outside this group,
// so unverified users can always reach it (no redirect loop).
export default async function OwnerDashLayout({ children }: { children: React.ReactNode }) {
  const user = await requireUser(await currentPath());
  if (user.idStatus !== 'VERIFIED') redirect('/owner/start');
  return <>{children}</>;
}
