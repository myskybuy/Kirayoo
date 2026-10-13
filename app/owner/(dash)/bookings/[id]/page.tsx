import PageCss from '@/components/PageCss';
import BookingHead from '@/components/BookingHead';
import BookingStepper from '@/components/BookingStepper';
import PriceSummary from '@/components/PriceSummary';
import CancelBox from '@/components/CancelBox';
import OwnerSections from '@/components/OwnerSections';
import { NextCard } from '@/components/NextCard';
import { requireUser } from '@/lib/auth';
import { loadBooking } from '@/lib/booking-view';
import { nextStepFor } from '@/lib/bookings';
import { runDueJobs } from '@/lib/jobs';

export const metadata = { title: 'Booking' };

export default async function OwnerBookingPage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ ok?: string; error?: string }> }) {
  const { id } = await params;
  const sp = await searchParams;
  const user = await requireUser(`/owner/bookings/${id}`);
  await runDueJobs();
  const b = await loadBooking(id, user, 'OWNER');
  const next = nextStepFor(b, 'OWNER');
  return (
    <>
      <PageCss id="R14-RentalDetail" />
      <BookingHead b={b} role="OWNER" back={{ href: '/owner/bookings', label: 'Bookings' }} />
      {sp.ok && <p className="k-alert ok" role="status">{sp.ok}</p>}
      {sp.error && <p className="k-alert err" role="alert">{sp.error}</p>}
      <NextCard step={next} who={b.renter.name.split(' ')[0]} />
      <BookingStepper booking={b} />
      <OwnerSections b={b} />
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '18px', alignItems: 'flex-start' }}>
          <div style={{ flex: '1 1 360px', minWidth: '0', display: 'flex', flexDirection: 'column', gap: '18px' }}>
          <section className="card" style={{ padding: '22px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <h2 className="d" style={{ fontSize: '20px', fontWeight: '700' }}>Money</h2>
            <PriceSummary b={b} owner />
          </section>
          <CancelBox b={b} role="OWNER" />
        </div>
        </div>
    </>
  );
}
