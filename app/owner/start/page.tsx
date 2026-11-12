import { redirect } from 'next/navigation';

// The old "become an owner" page; the owner application now lives at /owner/apply.
export default function OwnerStartPage() {
  redirect('/owner/apply');
}
