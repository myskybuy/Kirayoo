import { redirect } from 'next/navigation';
import PageCss from '@/components/PageCss';
import AuthPanel from '@/components/AuthPanel';
import LoginForm from '@/components/LoginForm';
import { getUser } from '@/lib/auth';

export const metadata = { title: 'Log in' };

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  const { next: n } = await searchParams;
  const next = n && n.startsWith('/') && !n.startsWith('//') ? n : '/';
  if (await getUser()) redirect(next);
  return (
    <>
      <PageCss id="R05-Login" />
      <div style={{ maxWidth: '1080px', margin: '0 auto', padding: 'clamp(20px,5vw,48px) clamp(12px,3vw,24px) 72px', boxSizing: 'border-box' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', borderRadius: '32px', overflow: 'hidden', background: '#FFFDF8', boxShadow: '0 2px 6px rgba(35,38,42,.06),0 30px 60px -24px rgba(31,77,58,.35)' }}>
          <AuthPanel next={next} />
          <LoginForm next={next} />
        </div>
      </div>
    </>
  );
}
