import { requireUser } from '@/lib/auth';

export default async function OwnerStart() {
  await requireUser('/owner/start');
  return <main style={{ padding: 32 }}>Become an owner</main>;
}
