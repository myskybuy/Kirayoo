import PageCss from '@/components/PageCss';
import BookingHead from '@/components/BookingHead';
import BookingStepper from '@/components/BookingStepper';
import PriceSummary from '@/components/PriceSummary';
import CancelBox from '@/components/CancelBox';
import RenterSections from '@/components/RenterSections';
import { NextCard } from '@/components/NextCard';
import { requireUser } from '@/lib/auth';
import { loadBooking } from '@/lib/booking-view';
import { nextStepFor } from '@/lib/bookings';
import { runDueJobs } from '@/lib/jobs';

export const metadata = { title: 'Rental' };

export default async function RentalDetailPage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ ok?: string; error?: string }> }) {
  const { id } = await params;
  const sp = await searchParams;
  const user = await requireUser(`/bookings/${id}`);
  await runDueJobs();
  const b = await loadBooking(id, user, 'RENTER');
  const next = nextStepFor(b, 'RENTER');
  return (
    <>
      <PageCss id="R14-RentalDetail" />
      <div className="wrap" style={{ paddingTop: '28px', paddingBottom: '72px', display: 'flex', flexDirection: 'column', gap: '22px' }}>
        <BookingHead b={b} role="RENTER" back={{ href: '/bookings', label: 'My rentals' }} />
        {sp.ok && <p className="k-alert ok" role="status">{sp.ok}</p>}
        {sp.error && <p className="k-alert err" role="alert">{sp.error}</p>}
        <NextCard step={next} who={b.owner.name.split(' ')[0]} />
        <BookingStepper booking={b} />
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '24px', alignItems: 'flex-start' }}>
          <div style={{ flex: '999 1 520px', minWidth: '0', display: 'flex', flexDirection: 'column', gap: '18px' }}>
            <RenterSections b={b} />
          </div>
          <aside style={{ flex: '1 1 300px', minWidth: '0', display: 'flex', flexDirection: 'column', gap: '18px' }}>
            <section className="card" style={{ padding: '22px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <h2 className="d" style={{ fontSize: '20px', fontWeight: '700' }}>Payment</h2>
              <PriceSummary b={b} />
            </section>
            <CancelBox b={b} role="RENTER" />
          </aside>
        </div>
      </div>
    </>
  );
}
