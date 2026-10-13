import { redirect } from 'next/navigation';
import PageCss from '@/components/PageCss';
import VerifyForm from '@/components/VerifyForm';
import { getPending } from '@/app/actions/auth';
import { prisma } from '@/lib/db';
import { resendWait } from '@/lib/otp';

export const metadata = { title: 'Verify code' };

export default async function VerifyPage() {
  const p = await getPending();
  if (!p) redirect('/login');
  const exists = await prisma.user.findUnique({ where: { email: p.email }, select: { id: true } });
  return (
    <>
      <PageCss id="R06-VerifyOTP" />
      <div style={{ maxWidth: '560px', margin: '0 auto', padding: 'clamp(20px,5vw,56px) clamp(12px,3vw,24px) 72px', boxSizing: 'border-box' }}>
        <VerifyForm email={p.email} needName={!exists && !p.name} devCode={p.devCode} wait={await resendWait(p.email)} />
      </div>
    </>
  );
}
