'use server';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/db';
import { getUser } from '@/lib/auth';
import { setLocationCookie } from '@/lib/location';

export async function saveLocationAction(fd: FormData) {
  const city = String(fd.get('city') || '');
  const area = String(fd.get('area') || '');
  const n = String(fd.get('next') || '');
  const valid = await prisma.area.findFirst({ where: { name: area, city: { name: city } } });
  if (!valid) redirect('/location?error=1');
  await setLocationCookie({ city, area });
  const user = await getUser();
  if (user) await prisma.user.update({ where: { id: user.id }, data: { city, area } });
  redirect(n.startsWith('/') && !n.startsWith('//') && !n.startsWith('/location') ? n : '/browse');
}
