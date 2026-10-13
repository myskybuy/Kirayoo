import Link from 'next/link';
import PageCss from '@/components/PageCss';

export const metadata = { title: "Privacy policy" };

export default function Page() {
  return (
    <>
      <PageCss id="R25-Privacy" />
      <div className="wrap" style={{ paddingTop: "48px", paddingBottom: "72px", display: "flex", flexDirection: "column", gap: "28px" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            <span style={{ fontSize: "12px", fontWeight: "800", letterSpacing: ".08em", textTransform: "uppercase", color: "#C9491F" }}>Legal</span>
            <h1 className="d" style={{ fontSize: "clamp(36px,4.4vw,56px)", fontWeight: "700", color: "#1F4D3A", lineHeight: "1" }}>Privacy policy</h1>
            <p className="mute">Last updated 13 Oct 2026</p>
          </div>
          <div style={{ padding: "20px 24px", borderRadius: "24px", background: "#1F4D3A", color: "#F6F1E7", display: "grid", gap: "16px", gridTemplateColumns: "repeat(auto-fit,minmax(min(220px,100%),1fr))" }}>
            <div><b>Your ID stays private</b><p style={{ fontSize: "14px", color: "#DCE6DA" }}>Only the admin sees ID photos and selfies. Owners and renters see a tick, not the document.</p></div>
            <div><b>No location tracking</b><p style={{ fontSize: "14px", color: "#DCE6DA" }}>We use the city and area you pick from a list. No GPS.</p></div>
            <div><b>Contact shared only after payment</b><p style={{ fontSize: "14px", color: "#DCE6DA" }}>Phone and address go to the other person once a booking is paid.</p></div>
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "40px", alignItems: "flex-start" }}>
            <nav className="toc" aria-label="On this page" style={{ flex: "1 1 220px", maxWidth: "260px", position: "sticky", top: "20px", background: "#FFFDF8", borderRadius: "22px", padding: "10px" }}>
              <a href="#p1">1. What we collect</a><a href="#p2">2. Why we use it</a><a href="#p3">3. Who sees what</a><a href="#p4">4. How long we keep it</a><a href="#p5">5. Your rights</a><a href="#p6">6. Contact</a>
            </nav>
            <article className="doc" style={{ flex: "999 1 520px", minWidth: "0" }}>
              <section id="p1" style={{ paddingTop: "0" }}><h2>1. What we collect</h2><ul><li>Account: name, email, phone, delivery address, selected city and area.</li><li>Identity: government ID photos and a selfie, collected once.</li><li>Rentals: listings, chats, booking requests, handover codes, condition photos, reviews.</li><li>Payments: transaction references from our payment partner. We never store full card numbers.</li></ul></section>
              <section id="p2"><h2>2. Why we use it</h2><p>To run bookings, verify identities, hold and refund deposits, settle disputes, prevent fraud and send you updates about your rentals.</p></section>
              <section id="p3"><h2>3. Who sees what</h2><ul><li>Other members: your first name, initials, area, ratings and reviews, and the verified tick.</li><li>Your booking counterpart, after payment: phone number and handover address.</li><li>The Kirayo admin: everything above, plus ID documents, to approve and resolve disputes.</li><li>Payment partner: what's needed to process payments and refunds.</li></ul></section>
              <section id="p4"><h2>4. How long we keep it</h2><p>ID documents: 6 months after approval, then deleted, keeping only the verification result. Condition photos and chats: 12 months after the rental ends, longer if a dispute is open.</p></section>
              <section id="p5"><h2>5. Your rights</h2><p>You can view and correct your profile, download your data, or ask us to delete your account once no rental or dispute is active, in line with India's Digital Personal Data Protection Act, 2023.</p></section>
              <section id="p6" style={{ border: "0" }}><h2>6. Contact</h2><p>Grievance officer: Kirayo support, support@kirayo.local. Or use the <Link href="/contact">contact form</Link>.</p></section>
            </article>
          </div>
        </div>
    </>
  );
}
