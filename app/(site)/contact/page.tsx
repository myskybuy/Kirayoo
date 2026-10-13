import Link from 'next/link';
import PageCss from '@/components/PageCss';
import ContactForm from '@/components/ContactForm';
import { getUser } from '@/lib/auth';

export const metadata = { title: "Contact" };

export default async function Page() {
  const user = await getUser();
  return (
    <>
      <PageCss id="R23-Contact" />
      <main className="wrap" style={{ paddingTop: "56px", paddingBottom: "72px", display: "flex", flexWrap: "wrap", gap: "40px", alignItems: "flex-start" }}>
          <div style={{ flex: "1 1 320px", display: "flex", flexDirection: "column", gap: "18px" }}>
            <span style={{ fontSize: "12px", fontWeight: "800", letterSpacing: ".08em", textTransform: "uppercase", color: "#C9491F" }}>Contact</span>
            <h1 className="d" style={{ fontSize: "clamp(38px,4.6vw,60px)", fontWeight: "700", lineHeight: "1", color: "#1F4D3A" }}>Talk to a real person</h1>
            <p className="mute">Questions about a booking, your deposit or your ID check? Send us a note. Include your booking ID if you have one.</p>
            <div style={{ display: "flex", flexDirection: "column", gap: "10px", paddingTop: "8px" }}>
              <div style={{ display: "flex", gap: "14px", alignItems: "center", padding: "16px", borderRadius: "20px", background: "#FFFDF8" }}><span style={{ width: "44px", height: "44px", borderRadius: "14px", background: "#DCE6DA", color: "#1F4D3A", display: "flex", alignItems: "center", justifyContent: "center" }}><svg className="ic" viewBox="0 0 24 24"><rect x="3" y="5" width="18" height="14" rx="3"></rect><path d="m4 7 8 6 8-6"></path></svg></span><span><b>support@kirayo.in</b><br /><span className="mute" style={{ fontSize: "13px" }}>Replies within one working day</span></span></div>
              <div style={{ display: "flex", gap: "14px", alignItems: "center", padding: "16px", borderRadius: "20px", background: "#FFFDF8" }}><span style={{ width: "44px", height: "44px", borderRadius: "14px", background: "#DCE6DA", color: "#1F4D3A", display: "flex", alignItems: "center", justifyContent: "center" }}><svg className="ic" viewBox="0 0 24 24"><circle cx="12" cy="12" r="8.5"></circle><path d="M12 7.5V12l3 2"></path></svg></span><span><b>Mon–Sat, 9 am – 8 pm IST</b><br /><span className="mute" style={{ fontSize: "13px" }}>Handover issues get priority</span></span></div>
              <div style={{ display: "flex", gap: "14px", alignItems: "center", padding: "16px", borderRadius: "20px", background: "#FBE3D8" }}><span style={{ width: "44px", height: "44px", borderRadius: "14px", background: "#FFFDF8", color: "#A93C18", display: "flex", alignItems: "center", justifyContent: "center" }}><svg className="ic" viewBox="0 0 24 24"><path d="M12 3 4.5 6v6c0 4.5 3.2 7.8 7.5 9 4.3-1.2 7.5-4.5 7.5-9V6z"></path><path d="M12 9v4M12 16v.1"></path></svg></span><span style={{ fontSize: "14px", color: "#5E2A12" }}><b>Deposit dispute?</b> Raise it from the refund screen so the admin sees both sides' photos.</span></div>
            </div>
          </div>
          <ContactForm name={user?.name ?? ''} email={user?.email ?? ''} />
        </main>
    </>
  );
}
