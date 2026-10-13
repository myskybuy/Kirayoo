import Link from 'next/link';
import PageCss from '@/components/PageCss';
import { PLATFORM_FEE_PERCENT } from '@/lib/constants';

export const metadata = { title: "Terms of use" };

export default function Page() {
  return (
    <>
      <PageCss id="R24-Terms" />
      <div className="wrap" style={{ paddingTop: "48px", paddingBottom: "72px", display: "flex", flexDirection: "column", gap: "28px" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            <span style={{ fontSize: "12px", fontWeight: "800", letterSpacing: ".08em", textTransform: "uppercase", color: "#C9491F" }}>Legal</span>
            <h1 className="d" style={{ fontSize: "clamp(36px,4.4vw,56px)", fontWeight: "700", color: "#1F4D3A", lineHeight: "1" }}>Terms of use</h1>
            <p className="mute">Last updated 13 Oct 2026</p>
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "40px", alignItems: "flex-start" }}>
            <nav className="toc" aria-label="On this page" style={{ flex: "1 1 220px", maxWidth: "260px", position: "sticky", top: "20px", background: "#FFFDF8", borderRadius: "22px", padding: "10px" }}>
              <a href="#t1">1. Who we are</a><a href="#t2">2. Your account</a><a href="#t3">3. Listing items</a><a href="#t4">4. Renting items</a><a href="#t5">5. Payments &amp; fees</a><a href="#t6">6. Deposits &amp; disputes</a><a href="#t7">7. Prohibited items</a><a href="#t8">8. Liability</a><a href="#t9">9. Contact</a>
            </nav>
            <article className="doc" style={{ flex: "999 1 520px", minWidth: "0" }}>
              <section id="t1" style={{ paddingTop: "0" }}><h2>1. Who we are</h2><p>Kirayo is a marketplace that connects people who want to rent out their belongings ("Owners") with people who want to borrow them ("Renters"). Kirayo is operated by the Kirayo team (company details are added before public launch). Kirayo is not the owner of any listed item.</p></section>
              <section id="t2"><h2>2. Your account</h2><ul><li>You must be 18 or older and sign in with an email you control.</li><li>You must complete one-time identity verification before paying for a rental or receiving a booking.</li><li>One person, one account. The same account can rent and list.</li></ul></section>
              <section id="t3"><h2>3. Listing items</h2><p>Owners must describe items honestly, use their own photos, set a daily price and refundable deposit, and keep the availability calendar up to date. Listings go live only after admin approval. Kirayo may remove a listing at any time.</p></section>
              <section id="t4"><h2>4. Renting items</h2><p>A booking is confirmed only after the Owner accepts the dates in chat, the Renter's ID is verified, and payment succeeds (or the Renter chooses pay-at-pickup where the Owner allows it). Accepted dates are held for 12 hours while the Renter pays. Renters may cancel free of charge 24 hours or more before pickup; later, one day's rent is kept for the Owner. If an Owner cancels, the Renter gets a full refund. Renters must use items with reasonable care, follow the Owner's instructions and return items on time.</p></section>
              <section id="t5"><h2>5. Payments &amp; fees</h2><p>Renters pay rent, any flat delivery fee and the refundable deposit through Kirayo; Renters pay no service fee. Owners receive rent minus the Kirayo commission (set per platform, currently {PLATFORM_FEE_PERCENT}%) plus any approved claim, after the deposit is settled. With pay-at-pickup, the Owner collects rent and deposit directly and Kirayo only records the booking. Payments made outside Kirayo are not protected.</p></section>
              <section id="t6"><h2>6. Deposits &amp; disputes</h2><p>Deposits are held by Kirayo and refunded according to the <Link href="/deposit-policy">Rental &amp; deposit policy</Link>. Where Owner and Renter disagree, the Kirayo admin decides the refund amount based on pickup and return photos, chat history and any reports filed during the rental. The admin's decision is final within the platform.</p></section>
              <section id="t7"><h2>7. Prohibited items</h2><ul><li>Weapons, drugs, alcohol or anything illegal to own or lend in India</li><li>Vehicles requiring registration and insurance transfer</li><li>Medical devices, baby car seats and safety-critical gear</li><li>Anything you don't own or aren't allowed to lend</li></ul></section>
              <section id="t8"><h2>8. Liability</h2><p>Kirayo provides the platform, identity checks and deposit handling. Owners and Renters are responsible for the items and their use. To the extent permitted by law, Kirayo's liability is limited to the fees it received for the booking concerned.</p></section>
              <section id="t9" style={{ border: "0" }}><h2>9. Contact</h2><p>Questions about these terms: <Link href="/contact">contact us</Link> or write to support@kirayo.local.</p></section>
            </article>
          </div>
        </div>
    </>
  );
}
