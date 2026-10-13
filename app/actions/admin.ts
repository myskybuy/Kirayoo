'use server';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/db';
import { getUser } from '@/lib/auth';
import { backTo } from '@/lib/admin';
import { postSystem } from '@/lib/chat';

async function admin() {
  const u = await getUser();
  if (!u?.isAdmin) throw new Error('Admins only.');
  return u;
}

function withMsg(url: string, key: 'ok' | 'error', msg: string) {
  const u = new URL(url, 'http://x');
  u.searchParams.set(key, msg);
  return u.pathname + u.search;
}

// ---------------- Listings ----------------

export async function approveListingAction(fd: FormData) {
  await admin();
  const back = backTo(fd.get('back'), '/admin/listings');
  const item = await prisma.item.findUnique({ where: { id: String(fd.get('id')) }, include: { owner: true } });
  if (!item || item.deletedAt) redirect(withMsg(back, 'error', 'Item not found.'));
  // An owner's items can go live only when the owner is VERIFIED.
  if (item.owner.idStatus !== 'VERIFIED' || item.owner.isBlocked) redirect(withMsg(back, 'error', `${item.owner.name} is not a verified, active owner — the item can’t go live yet.`));
  await prisma.item.updateMany({ where: { id: item.id, status: 'PENDING_REVIEW' }, data: { status: 'ACTIVE', rejectReason: null } });
  revalidatePath('/admin', 'layout');
  redirect(withMsg(back, 'ok', `Approved “${item.title}”.`));
}

export async function rejectListingAction(fd: FormData) {
  await admin();
  const back = backTo(fd.get('back'), '/admin/listings');
  const reason = String(fd.get('reason') || '').trim();
  if (reason.length < 3) redirect(withMsg(back, 'error', 'Write a short reason so the owner knows what to change.'));
  const item = await prisma.item.findUnique({ where: { id: String(fd.get('id')) } });
  if (!item) redirect(withMsg(back, 'error', 'Item not found.'));
  const takeDown = item.status === 'ACTIVE' || item.status === 'PAUSED';
  await prisma.item.update({ where: { id: item.id }, data: { status: 'REJECTED', rejectReason: takeDown ? `Taken down: ${reason}` : reason } });
  if (takeDown) {
    // Close open requests on a taken-down item so nobody waits on it.
    const pending = await prisma.message.findMany({ where: { type: 'BOOKING_REQUEST', requestStatus: 'PENDING', conversation: { itemId: item.id } }, select: { id: true, conversationId: true } });
    for (const m of pending) {
      await prisma.message.update({ where: { id: m.id }, data: { requestStatus: 'DECLINED' } });
      await postSystem(prisma, m.conversationId, 'This item was taken down by Kirayo, so the request was closed.');
    }
  }
  revalidatePath('/admin', 'layout');
  redirect(withMsg(back, 'ok', takeDown ? `Took down “${item.title}”.` : `Sent “${item.title}” back for changes.`));
}
