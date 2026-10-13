import Link from "next/link";
import { prisma } from "@/lib/db";
import { getUser } from "@/lib/auth";
import { ownerHref } from "./SiteHeader";

export default async function SiteFooter() {
  const user = await getUser();
  const ownerNew = ownerHref(user);
  const ownerDash = ownerHref(user, "/owner");
  const cities = (await prisma.city.findMany({ orderBy: { sortOrder: "asc" }, select: { name: true } })).map((c) => c.name);
  return (
<footer style={{ width: "100%", boxSizing: "border-box", padding: "24px 16px 0", fontFamily: "'Plus Jakarta Sans',system-ui,sans-serif", color: "#23262A", background: "#F6F1E7" }}>
  <div style={{ maxWidth: "1288px", margin: "0 auto", boxSizing: "border-box", background: "#EDE5D5", borderRadius: "32px 32px 0 0", padding: "56px 40px 28px", display: "flex", flexDirection: "column", gap: "40px" }}>
    <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "flex-end", gap: "24px" }}>
      <p style={{ margin: "0", fontFamily: "'Bricolage Grotesque',Georgia,serif", fontWeight: "700", fontSize: "clamp(38px,5vw,64px)", lineHeight: "1", letterSpacing: "-.035em", color: "#1F4D3A", maxWidth: "640px" }}>Rent it. Use it. <span style={{ color: "#C9491F" }}>Return it.</span></p>
      <Link href={ownerNew} style={{ display: "inline-flex", alignItems: "center", gap: "10px", minHeight: "52px", padding: "0 26px", borderRadius: "999px", background: "#1F4D3A", color: "#fff", textDecoration: "none", fontWeight: "700", fontSize: "15px" }}>Earn from things you own
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"></path></svg></Link>
    </div>
    <div>
      <p style={{ margin: "0 0 14px", fontSize: "12px", fontWeight: "800", letterSpacing: ".08em", textTransform: "uppercase", color: "#474C52" }}>How Kirayo keeps you safe</p>
      <div style={{ display: "grid", gap: "12px", gridTemplateColumns: "repeat(auto-fit,minmax(min(240px,100%),1fr))" }}>
        <div style={{ display: "flex", gap: "14px", alignItems: "center", background: "#FFFDF8", borderRadius: "20px", padding: "16px 18px" }}>
          <span style={{ width: "46px", height: "46px", borderRadius: "15px", background: "#1F4D3A", color: "#F6F1E7", display: "flex", alignItems: "center", justifyContent: "center", flex: "none" }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><rect x="3" y="5" width="18" height="14" rx="3"></rect><circle cx="9" cy="11" r="2.2"></circle><path d="M5.8 16.5a3.4 3.4 0 0 1 6.4 0M14.5 10h4M14.5 13.5h3"></path></svg></span>
          <span style={{ display: "flex", flexDirection: "column" }}><b style={{ fontSize: "15px" }}>ID verified</b><span style={{ fontSize: "13px", color: "#60666C" }}>Every renter and owner checks in once with govt ID + selfie</span></span>
        </div>
        <div style={{ display: "flex", gap: "14px", alignItems: "center", background: "#FFFDF8", borderRadius: "20px", padding: "16px 18px" }}>
          <span style={{ width: "46px", height: "46px", borderRadius: "15px", background: "#1F4D3A", color: "#F6F1E7", display: "flex", alignItems: "center", justifyContent: "center", flex: "none" }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M12 3 4.5 6v6c0 4.5 3.2 7.8 7.5 9 4.3-1.2 7.5-4.5 7.5-9V6z"></path><path d="m9 12 2.2 2.2L15.5 10"></path></svg></span>
          <span style={{ display: "flex", flexDirection: "column" }}><b style={{ fontSize: "15px" }}>Deposit protected</b><span style={{ fontSize: "13px", color: "#60666C" }}>Held by Kirayo, refunded after return. Admin settles disputes</span></span>
        </div>
        <div style={{ display: "flex", gap: "14px", alignItems: "center", background: "#FFFDF8", borderRadius: "20px", padding: "16px 18px" }}>
          <span style={{ width: "46px", height: "46px", borderRadius: "15px", background: "#1F4D3A", color: "#F6F1E7", display: "flex", alignItems: "center", justifyContent: "center", flex: "none" }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><rect x="5" y="10.5" width="14" height="10" rx="2.5"></rect><path d="M8 10.5V8a4 4 0 0 1 8 0v2.5M12 14.5v2"></path></svg></span>
          <span style={{ display: "flex", flexDirection: "column" }}><b style={{ fontSize: "15px" }}>OTP handover</b><span style={{ fontSize: "13px", color: "#60666C" }}>4-digit code + condition photos at pickup and return</span></span>
        </div>
      </div>
    </div>
    <div style={{ display: "flex", flexWrap: "wrap", gap: "32px 56px" }}>
      <nav aria-label="Rent" style={{ display: "flex", flexDirection: "column", gap: "8px", fontSize: "14px", minWidth: "130px" }}>
        <b style={{ fontSize: "13px", color: "#474C52" }}>Rent</b>
        <Link href="/browse" style={{ color: "#23262A", textDecoration: "none" }}>Browse items</Link>
        <Link href="/how-it-works" style={{ color: "#23262A", textDecoration: "none" }}>How it works</Link>
        <Link href="/bookings" style={{ color: "#23262A", textDecoration: "none" }}>My rentals</Link>
      </nav>
      <nav aria-label="Lend" style={{ display: "flex", flexDirection: "column", gap: "8px", fontSize: "14px", minWidth: "130px" }}>
        <b style={{ fontSize: "13px", color: "#474C52" }}>Lend</b>
        <Link href={ownerNew} style={{ color: "#23262A", textDecoration: "none" }}>List an item</Link>
        <Link href={ownerDash} style={{ color: "#23262A", textDecoration: "none" }}>Owner dashboard</Link>
        <Link href="/deposit-policy" style={{ color: "#23262A", textDecoration: "none" }}>Deposit policy</Link>
      </nav>
      <nav aria-label="Kirayo" style={{ display: "flex", flexDirection: "column", gap: "8px", fontSize: "14px", minWidth: "130px" }}>
        <b style={{ fontSize: "13px", color: "#474C52" }}>Kirayo</b>
        <Link href="/about" style={{ color: "#23262A", textDecoration: "none" }}>About</Link>
        <Link href="/contact" style={{ color: "#23262A", textDecoration: "none" }}>Contact</Link>
        <Link href="/terms" style={{ color: "#23262A", textDecoration: "none" }}>Terms</Link>
        <Link href="/privacy" style={{ color: "#23262A", textDecoration: "none" }}>Privacy</Link>
      </nav>
      <div style={{ display: "flex", flexDirection: "column", gap: "12px", flex: "1 1 320px" }}>
        <b style={{ fontSize: "13px", color: "#474C52" }}>Kirayo is live in</b>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
          {cities.map((c) => <Link key={c} href="/location" style={{ padding: "7px 14px", borderRadius: "999px", background: "#FFFDF8", color: "#1F4D3A", fontSize: "13px", fontWeight: "600", textDecoration: "none" }}>{c}</Link>)}
        </div>
      </div>
    </div>
    <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "center", gap: "16px", paddingTop: "20px", borderTop: "1px solid #D9CEB8", fontSize: "13px", color: "#474C52" }}>
      <span>© 2026 Kirayo · Made for neighbours in India · Prices in ₹ INR</span>
      <div style={{ display: "flex", gap: "8px" }}>
        <a href="#" aria-label="Instagram" style={{ width: "44px", height: "44px", borderRadius: "50%", background: "#FFFDF8", color: "#1F4D3A", display: "flex", alignItems: "center", justifyContent: "center" }}><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true"><rect x="4" y="4" width="16" height="16" rx="5"></rect><circle cx="12" cy="12" r="3.6"></circle><circle cx="17" cy="7" r=".6" fill="currentColor"></circle></svg></a>
        <a href="#" aria-label="YouTube" style={{ width: "44px", height: "44px", borderRadius: "50%", background: "#FFFDF8", color: "#1F4D3A", display: "flex", alignItems: "center", justifyContent: "center" }}><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" aria-hidden="true"><rect x="3" y="6" width="18" height="12" rx="4"></rect><path d="m10.5 9.5 4 2.5-4 2.5z" fill="currentColor"></path></svg></a>
        <a href="#" aria-label="LinkedIn" style={{ width: "44px", height: "44px", borderRadius: "50%", background: "#FFFDF8", color: "#1F4D3A", display: "flex", alignItems: "center", justifyContent: "center" }}><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true"><rect x="4" y="4" width="16" height="16" rx="3"></rect><path d="M8.5 10.5v5M8.5 8v.1M12 15.5v-5M12 13c0-1.5 1-2.5 2.2-2.5s1.8.9 1.8 2.3v2.7"></path></svg></a>
        <a href="#" aria-label="WhatsApp" style={{ width: "44px", height: "44px", borderRadius: "50%", background: "#FFFDF8", color: "#1F4D3A", display: "flex", alignItems: "center", justifyContent: "center" }}><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" aria-hidden="true"><path d="M4.5 19.5 5.6 16A8 8 0 1 1 8 18.4z"></path></svg></a>
      </div>
    </div>
  </div>
</footer>
  );
}
