import { notFound } from 'next/navigation';
import PageCss from '@/components/PageCss';
import ItemForm from '@/components/ItemForm';
import { requireUser } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { avatarColor, dayOf, initials, todayIST, toDbDate } from '@/lib/format';
import { itemFormData } from '@/lib/owner';
import { occupiedDays } from '@/lib/bookings';

export const metadata = { title: 'Edit item' };

export default async function EditItemPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await requireUser(`/owner/items/${id}/edit`);
  const item = await prisma.item.findUnique({ where: { id } });
  if (!item || item.ownerId !== user.id || item.deletedAt) notFound();
  const today = todayIST();
  const [d, occ, blocked] = await Promise.all([
    itemFormData(),
    occupiedDays(item.id, today),
    prisma.blockedDate.findMany({ where: { itemId: item.id, date: { gte: toDbDate(today) } }, orderBy: { date: 'asc' } }),
  ]);
  return (
    <>
      <PageCss id="O02-ListItem" />
      <div>
        <p className="mute" style={{ fontSize: '14px' }}>Changes go back to admin review · existing bookings keep their prices</p>
        <h1 className="d" style={{ fontSize: 'clamp(30px,3.4vw,42px)', fontWeight: '700' }}>Edit item</h1>
      </div>
      {item.status === 'REJECTED' && item.rejectReason && <p className="k-alert err">Rejected: {item.rejectReason}. Fix it and submit again.</p>}
      <ItemForm
        {...d}
        today={today}
        booked={occ.booked}
        owner={{ initials: initials(user.name), color: avatarColor(user.id), name: user.name }}
        initial={{
          id: item.id,
          title: item.title,
          category: item.category,
          location: `${item.city}|${item.area}`,
          description: item.description,
          pricePerDay: String(item.pricePerDay),
          pricePerWeek: item.pricePerWeek ? String(item.pricePerWeek) : '',
          deposit: String(item.deposit),
          minDays: String(item.minDays),
          maxDays: String(item.maxDays),
          canPickup: item.canPickup,
          canDeliver: item.canDeliver,
          acceptsCashAtPickup: item.acceptsCashAtPickup,
          pickupNote: item.pickupNote ?? '',
          photos: item.photos,
          blocked: blocked.map((b) => dayOf(b.date)),
        }}
      />
    </>
  );
}
