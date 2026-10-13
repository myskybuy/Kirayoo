import Link from 'next/link';
import PageCss from '@/components/PageCss';

export const metadata = { title: "Rental & deposit policy" };

export default function Page() {
  return (
    <>
      <PageCss id="R26-DepositPolicy" />
      <div className="wrap" style={{ paddingTop: "48px", paddingBottom: "72px", display: "flex", flexDirection: "column", gap: "40px" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            <span style={{ fontSize: "12px", fontWeight: "800", letterSpacing: ".08em", textTransform: "uppercase", color: "#C9491F" }}>Policy</span>
            <h1 className="d" style={{ fontSize: "clamp(36px,4.4vw,56px)", fontWeight: "700", color: "#1F4D3A", lineHeight: "1" }}>Rental &amp; deposit policy</h1>
            <p className="mute" style={{ maxWidth: "640px" }}>The short version: your deposit is held by Kirayo, not the owner. It comes back after a clean return. If something goes wrong, photos decide, and the admin settles disagreements.</p>
          </div>
          <section style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <h2 className="s">Where your deposit goes</h2>
            <ol style={{ listStyle: "none", margin: "0", padding: "0", display: "grid", gap: "12px", gridTemplateColumns: "repeat(auto-fit,minmax(min(220px,100%),1fr))" }}>
              <li style={{ padding: "22px", borderRadius: "24px", background: "#FFFDF8", display: "flex", flexDirection: "column", gap: "6px" }}><b className="d" style={{ fontSize: "30px", color: "#C9491F" }}>1</b><b>You pay</b><span className="mute" style={{ fontSize: "14px" }}>Rent + deposit together at checkout (or in cash at pickup, if the owner allows it).</span></li>
              <li style={{ padding: "22px", borderRadius: "24px", background: "#FFFDF8", display: "flex", flexDirection: "column", gap: "6px" }}><b className="d" style={{ fontSize: "30px", color: "#C9491F" }}>2</b><b>Kirayo holds it</b><span className="mute" style={{ fontSize: "14px" }}>The owner never receives the deposit directly.</span></li>
              <li style={{ padding: "22px", borderRadius: "24px", background: "#FFFDF8", display: "flex", flexDirection: "column", gap: "6px" }}><b className="d" style={{ fontSize: "30px", color: "#C9491F" }}>3</b><b>Owner checks return</b><span className="mute" style={{ fontSize: "14px" }}>48 hours to mark OK or claim. Silence = OK.</span></li>
              <li style={{ padding: "22px", borderRadius: "24px", background: "#1F4D3A", color: "#F6F1E7", display: "flex", flexDirection: "column", gap: "6px" }}><b className="d" style={{ fontSize: "30px", color: "#E8643C" }}>4</b><b>Refund after the check</b><span style={{ fontSize: "14px", color: "#DCE6DA" }}>To the same UPI, card or bank you paid with.</span></li>
            </ol>
          </section>
          <section style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <h2 className="s">What gets deducted</h2>
            <div className="tw"><table>
              <thead><tr><th>Situation</th><th>Deduction</th><th>Evidence needed</th></tr></thead>
              <tbody>
                <tr><td><b>Returned on time, same condition</b></td><td style={{ color: "#1E5A37", fontWeight: "700" }}>Nothing. Full refund</td><td className="mute">Return code entered</td></tr>
                <tr><td><b>Late return</b></td><td>1 day's rent per late day after the return date, up to the deposit</td><td className="mute">Return time recorded by code</td></tr>
                <tr><td><b>Missing part or accessory</b></td><td>Replacement cost, up to the deposit</td><td className="mute">Pickup vs return photos + receipt</td></tr>
                <tr><td><b>Damage</b></td><td>Repair cost, up to the deposit</td><td className="mute">Photos + repair quote or bill</td></tr>
                <tr><td><b>Not returned / lost</b></td><td>Full deposit; admin may pursue the rest</td><td className="mute">Chat history + no return code within 72 h</td></tr>
                <tr><td><b>Normal wear</b></td><td style={{ color: "#1E5A37", fontWeight: "700" }}>Nothing</td><td className="mute">Small scuffs, dust, battery wear</td></tr>
              </tbody>
            </table></div>
          </section>
          <section style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <h2 className="s">Cancellations</h2>
            <div className="tw"><table>
              <thead><tr><th>Who cancels</th><th>When</th><th>Refund</th></tr></thead>
              <tbody>
                <tr><td><b>Renter</b></td><td>24 h or more before pickup</td><td>Full refund</td></tr>
                <tr><td><b>Renter</b></td><td>Less than 24 h before pickup</td><td>All except one day's rent</td></tr>
                <tr><td><b>Owner</b></td><td>Any time</td><td>Full refund to renter; the cancellation is recorded on the owner’s profile</td></tr>
                <tr><td><b>Item not as described</b></td><td>At pickup, before sharing the code</td><td>Full refund. Don't share the code, report it</td></tr>
                <tr><td><b>Renter doesn’t come</b></td><td>From the day after pickup day</td><td>Deposit + delivery fee refunded; 1 day’s rent goes to the owner</td></tr>
                <tr><td><b>Paid in cash at pickup</b></td><td>Any time before pickup</td><td>Nothing was paid online, so nothing to refund</td></tr>
              </tbody>
            </table></div>
          </section>
          <section style={{ padding: "26px", borderRadius: "28px", background: "#FBE3D8", display: "flex", flexWrap: "wrap", gap: "20px", alignItems: "center" }}>
            <div style={{ flex: "1 1 380px" }}><h2 className="d" style={{ fontSize: "26px", fontWeight: "700", color: "#5E2A12" }}>Disagree with a claim?</h2><p style={{ color: "#5E2A12" }}>Tap "Dispute" on the refund screen within 48 hours. The admin reviews both sides' photos and chat, and decides the final refund amount (anywhere from ₹0 to the claim). If you don’t answer a claim within 48 hours, it is accepted. Cash bookings: the owner hands the deposit back in cash, minus any claim you accept; Kirayo records it but holds no money.</p></div>
            <a href="R18-DepositRefund.html" style={{ display: "inline-flex", alignItems: "center", minHeight: "50px", padding: "0 22px", borderRadius: "999px", background: "#A93C18", color: "#fff", fontWeight: "700", textDecoration: "none" }}>See a refund example</a>
          </section>
        </div>
    </>
  );
}
