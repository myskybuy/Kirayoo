import Link from 'next/link';
import PageCss from '@/components/PageCss';

export const metadata = { title: "How it works" };

export default function Page() {
  return (
    <>
      <PageCss id="R22-HowItWorks" />
      <section style={{ padding: "64px 0 32px" }}>
          <div className="wrap" style={{ display: "flex", flexDirection: "column", gap: "20px", alignItems: "flex-start" }}>
            <span style={{ fontSize: "12px", fontWeight: "800", letterSpacing: ".08em", textTransform: "uppercase", color: "#C9491F" }}>How it works</span>
            <h1 className="d" style={{ fontSize: "clamp(40px,5.4vw,76px)", fontWeight: "700", lineHeight: ".98", color: "#1F4D3A", maxWidth: "900px" }}>Rent it. Use it. Return it.</h1>
            <div role="tablist" aria-label="Choose a side" style={{ display: "flex", gap: "6px", padding: "6px", borderRadius: "999px", background: "#FFFDF8", boxShadow: "inset 0 0 0 1px #E3DACA" }}>
              <button className="tab" role="tab" type="button" aria-selected="true" style={{ background: "#1F4D3A", color: "#fff" }}>I want to rent</button>
              <button className="tab" role="tab" type="button" aria-selected="false" style={{ background: "transparent", color: "#474C52" }}>I want to lend</button>
            </div>
          </div>
        </section>
        <section style={{ padding: "8px 0 56px" }}>
          <ol className="wrap" style={{ listStyle: "none", margin: "0 auto", display: "grid", gap: "16px", gridTemplateColumns: "repeat(auto-fill,minmax(min(260px,100%),1fr))" }}>
              <li style={{ padding: "24px", borderRadius: "26px", background: "#FFFDF8", color: "#23262A", display: "flex", flexDirection: "column", gap: "10px", minHeight: "190px" }}>
                <span className="d" style={{ fontSize: "40px", fontWeight: "800", lineHeight: "1", color: "#1F4D3A" }}>01</span>
                <b style={{ fontSize: "17px" }}>Pick your area</b>
                <p style={{ fontSize: "14px", opacity: ".85" }}>Choose your city and area once. We show what’s available near you.</p>
              </li>
              <li style={{ padding: "24px", borderRadius: "26px", background: "#FFFDF8", color: "#23262A", display: "flex", flexDirection: "column", gap: "10px", minHeight: "190px" }}>
                <span className="d" style={{ fontSize: "40px", fontWeight: "800", lineHeight: "1", color: "#1F4D3A" }}>02</span>
                <b style={{ fontSize: "17px" }}>Find the item</b>
                <p style={{ fontSize: "14px", opacity: ".85" }}>Filter by category, dates, daily price and deposit.</p>
              </li>
              <li style={{ padding: "24px", borderRadius: "26px", background: "#FFFDF8", color: "#23262A", display: "flex", flexDirection: "column", gap: "10px", minHeight: "190px" }}>
                <span className="d" style={{ fontSize: "40px", fontWeight: "800", lineHeight: "1", color: "#1F4D3A" }}>03</span>
                <b style={{ fontSize: "17px" }}>Chat &amp; request dates</b>
                <p style={{ fontSize: "14px", opacity: ".85" }}>Send a booking request in chat. The owner accepts or suggests other dates.</p>
              </li>
              <li style={{ padding: "24px", borderRadius: "26px", background: "#FFFDF8", color: "#23262A", display: "flex", flexDirection: "column", gap: "10px", minHeight: "190px" }}>
                <span className="d" style={{ fontSize: "40px", fontWeight: "800", lineHeight: "1", color: "#1F4D3A" }}>04</span>
                <b style={{ fontSize: "17px" }}>Confirm the summary</b>
                <p style={{ fontSize: "14px", opacity: ".85" }}>See days, rent, delivery fee, deposit and total before anything is charged.</p>
              </li>
              <li style={{ padding: "24px", borderRadius: "26px", background: "#FFFDF8", color: "#23262A", display: "flex", flexDirection: "column", gap: "10px", minHeight: "190px" }}>
                <span className="d" style={{ fontSize: "40px", fontWeight: "800", lineHeight: "1", color: "#1F4D3A" }}>05</span>
                <b style={{ fontSize: "17px" }}>Verify your ID once</b>
                <p style={{ fontSize: "14px", opacity: ".85" }}>Government ID photo + selfie. Admin approves, usually within hours.</p>
              </li>
              <li style={{ padding: "24px", borderRadius: "26px", background: "#FFFDF8", color: "#23262A", display: "flex", flexDirection: "column", gap: "10px", minHeight: "190px" }}>
                <span className="d" style={{ fontSize: "40px", fontWeight: "800", lineHeight: "1", color: "#1F4D3A" }}>06</span>
                <b style={{ fontSize: "17px" }}>Pay rent + deposit</b>
                <p style={{ fontSize: "14px", opacity: ".85" }}>UPI, card or netbanking. Deposit is held by Kirayo.</p>
              </li>
              <li style={{ padding: "24px", borderRadius: "26px", background: "#FFFDF8", color: "#23262A", display: "flex", flexDirection: "column", gap: "10px", minHeight: "190px" }}>
                <span className="d" style={{ fontSize: "40px", fontWeight: "800", lineHeight: "1", color: "#1F4D3A" }}>07</span>
                <b style={{ fontSize: "17px" }}>Pickup with a code</b>
                <p style={{ fontSize: "14px", opacity: ".85" }}>Check the item, take photos together, share your 4-digit code.</p>
              </li>
              <li style={{ padding: "24px", borderRadius: "26px", background: "#1F4D3A", color: "#F6F1E7", display: "flex", flexDirection: "column", gap: "10px", minHeight: "190px" }}>
                <span className="d" style={{ fontSize: "40px", fontWeight: "800", lineHeight: "1", color: "#E8643C" }}>08</span>
                <b style={{ fontSize: "17px" }}>Return &amp; get refunded</b>
                <p style={{ fontSize: "14px", opacity: ".85" }}>Return code + photos. Deposit comes back after the owner confirms. Then review each other.</p>
              </li>
          </ol>
        </section>
        <section style={{ padding: "56px 0", background: "#EDE5D5" }}>
          <div className="wrap" style={{ display: "flex", flexWrap: "wrap", gap: "40px" }}>
            <div style={{ flex: "1 1 300px", display: "flex", flexDirection: "column", gap: "14px" }}>
              <h2 className="d" style={{ fontSize: "40px", fontWeight: "700", lineHeight: "1.05" }}>Questions people ask</h2>
              <p className="mute">Still unsure? <Link href="/contact">Write to us</Link>.</p>
            </div>
            <div style={{ flex: "2 1 480px", display: "flex", flexDirection: "column", gap: "10px" }}>
              <details open><summary>How is the deposit amount decided?</summary><p>The owner sets it when listing, usually close to the cost of repair or replacement. Admin checks it's reasonable before the listing goes live.</p></details>
              <details><summary>When do I get my deposit back?</summary><p>Within 48 hours of the owner confirming the return. If the owner doesn't respond within 24 hours, the return is confirmed automatically.</p></details>
              <details><summary>What if the item is damaged?</summary><p>The owner can claim an amount with photos. You can accept or dispute it. The admin compares pickup and return photos and decides the final refund.</p></details>
              <details><summary>Why do I need to verify my ID?</summary><p>Owners are handing over things worth thousands. A one-time ID + selfie check keeps everyone accountable. Only the admin sees your document.</p></details>
              <details><summary>Can I pay the owner in cash?</summary><p>No. Payments outside Kirayo aren't covered by deposit protection or dispute help.</p></details>
            </div>
          </div>
        </section>
    </>
  );
}
