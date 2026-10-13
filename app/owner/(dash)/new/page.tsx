import PageCss from '@/components/PageCss';
import ItemForm from '@/components/ItemForm';
import { requireUser } from '@/lib/auth';
import { avatarColor, initials, todayIST } from '@/lib/format';
import { itemFormData } from '@/lib/owner';

export const metadata = { title: 'List an item' };

export default async function NewItemPage() {
  const user = await requireUser('/owner/new');
  const d = await itemFormData();
  const loc = user.city && user.area ? `${user.city}|${user.area}` : `${d.cities[0].name}|${d.cities[0].areas[0]}`;
  return (
    <>
      <PageCss id="O02-ListItem" />
      <div><p className="mute" style={{ fontSize: '14px' }}>One form · about 5 minutes</p><h1 className="d" style={{ fontSize: 'clamp(30px,3.4vw,42px)', fontWeight: '700' }}>List an item</h1></div>
      <ItemForm
        {...d}
        today={todayIST()}
        booked={[]}
        owner={{ initials: initials(user.name), color: avatarColor(user.id), name: user.name }}
        initial={{ title: '', category: 'CAMERAS', location: loc, description: '', pricePerDay: '', pricePerWeek: '', deposit: '', minDays: '1', maxDays: '30', canPickup: true, canDeliver: false, acceptsCashAtPickup: false, pickupNote: '', photos: [], blocked: [] }}
      />
    </>
  );
}
