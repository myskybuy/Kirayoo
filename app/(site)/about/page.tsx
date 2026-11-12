import Link from 'next/link';
import PageCss from '@/components/PageCss';

export const metadata = { title: "About" };

export default function Page() {
  return (
    <>
      <PageCss id="R21-About" />
      <section style={{ padding: "72px 0 56px" }}>
          <div className="wrap" style={{ display: "flex", flexDirection: "column", gap: "22px" }}>
            <span className="eyebrow">About Kirayo</span>
            <h1 className="d" style={{ fontSize: "clamp(44px,6vw,88px)", fontWeight: "700", lineHeight: ".96", color: "var(--kf-1f4d3a)", maxWidth: "1000px" }}>Most things we own sit idle. Your neighbour needs one this weekend.</h1>
            <p style={{ fontSize: "19px", color: "var(--kf-474c52)", maxWidth: "720px" }}>Kirayo (from <i>kiraya</i>, rent) is a peer-to-peer rental marketplace for Indian cities. Anyone can list the camera, drill, tent or console they rarely use, and anyone nearby can rent it for a day or a week, safely.</p>
          </div>
        </section>
        <section style={{ padding: "0 0 64px" }}>
          <div className="wrap" style={{ display: "grid", gap: "18px", gridTemplateColumns: "repeat(auto-fit,minmax(min(300px,100%),1fr))" }}>
            <div style={{ padding: "30px", borderRadius: "28px", background: "var(--kb-1f4d3a)", color: "var(--kf-f6f1e7)", display: "flex", flexDirection: "column", gap: "12px", minHeight: "240px" }}>
              <svg className="ic" viewBox="0 0 24 24" style={{ width: "34px", height: "34px", color: "var(--kf-e8643c)" }}><path d="M12 21s-7-6.2-7-11.5A7 7 0 0 1 19 9.5C19 14.8 12 21 12 21z"></path><circle cx="12" cy="9.5" r="2.5"></circle></svg>
              <b className="d" style={{ fontSize: "26px" }}>Area first</b>
              <p style={{ color: "var(--kf-dce6da)" }}>You pick your area once and see items from people close by. Fewer trips, quicker handovers, no maps or tracking needed.</p>
            </div>
            <div style={{ padding: "30px", borderRadius: "28px", background: "var(--kb-fffdf8)", display: "flex", flexDirection: "column", gap: "12px", minHeight: "240px" }}>
              <svg className="ic" viewBox="0 0 24 24" style={{ width: "34px", height: "34px", color: "var(--kf-1f4d3a)" }}><path d="M12 3 4.5 6v6c0 4.5 3.2 7.8 7.5 9 4.3-1.2 7.5-4.5 7.5-9V6z"></path><path d="m9 12 2.2 2.2L15.5 10"></path></svg>
              <b className="d" style={{ fontSize: "26px" }}>Trust you can see</b>
              <p className="mute">Every member verifies a government ID once. Deposits sit with Kirayo, not the owner. OTP codes and photos record every handover.</p>
            </div>
            <div style={{ padding: "30px", borderRadius: "28px", background: "var(--kb-fbe3d8)", display: "flex", flexDirection: "column", gap: "12px", minHeight: "240px" }}>
              <svg className="ic" viewBox="0 0 24 24" style={{ width: "34px", height: "34px", color: "var(--kf-a93c18)" }}><path d="M20 11a8 8 0 0 0-14.5-4.5L4 8M4 4v4h4M4 13a8 8 0 0 0 14.5 4.5L20 16M20 20v-4h-4"></path></svg>
              <b className="d" style={{ fontSize: "26px" }}>Use more, buy less</b>
              <p style={{ color: "var(--kf-5e2a12)" }}>Renting a projector for one party beats buying one that lives in a box. Owners earn, renters save, cupboards get lighter.</p>
            </div>
          </div>
        </section>
        <section style={{ padding: "56px 0", background: "var(--kb-fffdf8)" }}>
          <div className="wrap" style={{ display: "flex", flexWrap: "wrap", gap: "40px", alignItems: "center" }}>
            <div style={{ flex: "1 1 380px", display: "flex", flexDirection: "column", gap: "14px" }}>
              <h2 className="d" style={{ fontSize: "40px", fontWeight: "700", lineHeight: "1.05" }}>One person keeps it fair</h2>
              <p className="mute">Kirayo has a single admin who approves every ID and every listing, and steps in when a renter and owner can't agree on a deposit. Decisions are based on the pickup and return photos, never on who shouts louder.</p>
            </div>
            <div style={{ flex: "1 1 380px", display: "grid", gap: "10px" }}>
              <div style={{ display: "flex", gap: "14px", alignItems: "center", padding: "16px", borderRadius: "20px", background: "var(--kb-f6f1e7)" }}><b className="d" style={{ fontSize: "22px", color: "var(--kf-c9491f)", width: "36px" }}>01</b>IDs checked by hand before anyone pays</div>
              <div style={{ display: "flex", gap: "14px", alignItems: "center", padding: "16px", borderRadius: "20px", background: "var(--kb-f6f1e7)" }}><b className="d" style={{ fontSize: "22px", color: "var(--kf-c9491f)", width: "36px" }}>02</b>Listings reviewed before they go live</div>
              <div style={{ display: "flex", gap: "14px", alignItems: "center", padding: "16px", borderRadius: "20px", background: "var(--kb-f6f1e7)" }}><b className="d" style={{ fontSize: "22px", color: "var(--kf-c9491f)", width: "36px" }}>03</b>Disputes settled with photo evidence</div>
            </div>
          </div>
        </section>
        <section style={{ padding: "64px 0" }}>
          <div className="wrap" style={{ display: "flex", flexWrap: "wrap", gap: "20px", justifyContent: "space-between", alignItems: "center" }}>
            <h2 className="d" style={{ fontSize: "36px", fontWeight: "700", maxWidth: "560px" }}>Find something near you, or put your idle stuff to work.</h2>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "10px" }}>
              <Link className="btn" href="/browse" style={{ background: "var(--kb-c9491f)", color: "var(--kf-ffffff)" }}>Browse items</Link>
              <Link className="btn" href="/owner/new" style={{ color: "var(--kf-1f4d3a)", boxShadow: "inset 0 0 0 1.5px var(--kl-1f4d3a)" }}>List an item</Link>
            </div>
          </div>
        </section>
    </>
  );
}
