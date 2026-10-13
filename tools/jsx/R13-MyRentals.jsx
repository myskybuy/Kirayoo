
<div>
<header style={{ width: "100%", boxSizing: "border-box", background: "#FFFDF8", borderBottom: "1px solid #E3DACA", fontFamily: "'Plus Jakarta Sans',system-ui,sans-serif", color: "#23262A", position: "relative", zIndex: "30" }}>
  <div style={{ maxWidth: "1288px", margin: "0 auto", boxSizing: "border-box", padding: "14px 24px", display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: "10px 20px" }}>
    <a href="R01-Home.html" aria-label="Kirayo home" style={{ display: "flex", alignItems: "center", gap: "9px", textDecoration: "none", color: "#1F4D3A", flex: "1 1 0", minWidth: "130px" }}>
      <svg width="34" height="34" viewBox="0 0 44 44" aria-hidden="true"><rect width="44" height="44" rx="14" fill="#1F4D3A"></rect><path d="M14 30V14M14 22l9-8M17.5 19l8.5 11" fill="none" stroke="#F6F1E7" strokeWidth="3.6" strokeLinecap="round" strokeLinejoin="round"></path><circle cx="31" cy="15" r="3.6" fill="#E8643C"></circle></svg>
      <span style={{ fontFamily: "'Bricolage Grotesque',Georgia,serif", fontWeight: "800", fontSize: "25px", letterSpacing: "-.035em" }}>kirayo</span>
    </a>
      <a href="R03-Search.html" style={{ display: "flex", alignItems: "center", background: "#fff", borderRadius: "999px", boxShadow: "0 1px 2px rgba(35,38,42,.06),0 10px 28px -12px rgba(31,77,58,.32),inset 0 0 0 1px #E3DACA", padding: "6px", textDecoration: "none", color: "#23262A", flex: "0 1 660px", minWidth: "0" }}>
        <span style={{ display: "flex", flexDirection: "column", padding: "2px 18px 2px 20px", flex: "1.1 1 0", minWidth: "0" }}>
          <span style={{ fontSize: "11px", fontWeight: "800", letterSpacing: ".07em", textTransform: "uppercase", color: "#1F4D3A" }}>What</span>
          <span style={{ fontSize: "14px", color: "#60666C", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>Camera, drill, tent…</span>
        </span>
        <span style={{ width: "1px", height: "30px", background: "#E3DACA", flex: "none" }}></span>
        <span style={{ display: "flex", flexDirection: "column", padding: "2px 18px", flex: "1.2 1 0", minWidth: "0" }}>
          <span style={{ fontSize: "11px", fontWeight: "800", letterSpacing: ".07em", textTransform: "uppercase", color: "#1F4D3A" }}>Where</span>
          <span style={{ fontSize: "14px", fontWeight: "600", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>Indiranagar, Bengaluru</span>
        </span>
        <span style={{ width: "1px", height: "30px", background: "#E3DACA", flex: "none" }}></span>
        <span style={{ display: "flex", flexDirection: "column", padding: "2px 18px", flex: "1 1 0", minWidth: "0" }}>
          <span style={{ fontSize: "11px", fontWeight: "800", letterSpacing: ".07em", textTransform: "uppercase", color: "#1F4D3A" }}>When</span>
          <span style={{ fontSize: "14px", color: "#60666C", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>Add dates</span>
        </span>
        <span style={{ width: "46px", height: "46px", borderRadius: "50%", background: "#C9491F", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", flex: "none" }} aria-label="Search">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden="true"><circle cx="11" cy="11" r="6.5"></circle><path d="m20 20-4-4"></path></svg>
        </span>
      </a>
    <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: "6px", flex: "1 1 0", minWidth: "200px" }}>
      <a href="../owner/O02-ListItem.html" style={{ fontWeight: "700", fontSize: "14.5px", color: "#1F4D3A", textDecoration: "none", padding: "12px 14px", borderRadius: "999px", whiteSpace: "nowrap" }}>List your item</a>
        <a href="R20-Profile.html" aria-label="Account menu" style={{ display: "flex", alignItems: "center", gap: "10px", padding: "4px 4px 4px 14px", borderRadius: "999px", boxShadow: "inset 0 0 0 1px #E3DACA", background: "#fff", color: "#23262A", textDecoration: "none", minHeight: "44px", boxSizing: "border-box" }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true"><path d="M4 7h16M4 12h16M4 17h16"></path></svg>
          <span style={{ width: "36px", height: "36px", borderRadius: "50%", background: "#E8643C", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "800", fontSize: "13px" }}>AS</span>
        </a>
    </div>
  </div>
</header>
  <main className="wrap" style={{ paddingTop: "36px", paddingBottom: "72px", display: "flex", flexDirection: "column", gap: "24px" }}>
    <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "flex-end", gap: "16px" }}>
      <h1 className="d" style={{ fontSize: "clamp(32px,3.6vw,48px)", fontWeight: "700" }}>My rentals</h1>
      <a href="../owner/O01-Dashboard.html" style={{ fontWeight: "700", fontSize: "14px" }}>Items you lend out → Owner panel</a>
    </div>
    <div role="tablist" aria-label="Rental status" style={{ display: "flex", gap: "6px", padding: "5px", borderRadius: "999px", background: "#FFFDF8", boxShadow: "inset 0 0 0 1px #E3DACA", alignSelf: "flex-start", flexWrap: "wrap" }}>
        <button className="tab" type="button" role="tab" aria-selected="true" style={{ background: "#1F4D3A", color: "#fff" }}>Upcoming<span style={{ minWidth: "22px", height: "22px", padding: "0 6px", boxSizing: "border-box", borderRadius: "999px", background: "rgba(255,255,255,.2)", fontSize: "12px", display: "flex", alignItems: "center", justifyContent: "center" }}>2</span></button>
        <button className="tab" type="button" role="tab" aria-selected="false" style={{ background: "transparent", color: "#474C52" }}>Active<span style={{ minWidth: "22px", height: "22px", padding: "0 6px", boxSizing: "border-box", borderRadius: "999px", background: "#EDE5D5", fontSize: "12px", display: "flex", alignItems: "center", justifyContent: "center" }}>2</span></button>
        <button className="tab" type="button" role="tab" aria-selected="false" style={{ background: "transparent", color: "#474C52" }}>Past<span style={{ minWidth: "22px", height: "22px", padding: "0 6px", boxSizing: "border-box", borderRadius: "999px", background: "#EDE5D5", fontSize: "12px", display: "flex", alignItems: "center", justifyContent: "center" }}>2</span></button>
    </div>
    <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
        <article style={{ display: "flex", flexWrap: "wrap", gap: "18px", alignItems: "center", padding: "14px", borderRadius: "26px", background: "#FFFDF8", boxShadow: "0 1px 2px rgba(35,38,42,.06),0 8px 24px -12px rgba(31,77,58,.22)" }}>
          <div style={{ width: "150px", height: "112px", borderRadius: "18px", background: "#BFD1BD", color: "#2F4E40", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "12px", fontWeight: "600", flex: "none" }}>Photo · Camera</div>
          <div style={{ flex: "1 1 260px", minWidth: "0", display: "flex", flexDirection: "column", gap: "6px" }}>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", alignItems: "center" }}><span className="badge" style={{ background: "#1F4D3A", color: "#fff" }}>Booked</span><span className="mute" style={{ fontSize: "12.5px" }}>KR-24817</span></div>
            <b style={{ fontSize: "17px" }}>Sony A7 III + 28–70mm kit</b>
            <span className="mute" style={{ fontSize: "13.5px" }}>Fri 16 – Mon 19 Oct · from Rohan Mehta</span>
            <span style={{ fontSize: "13.5px", fontWeight: "600", color: "#1F4D3A" }}>Pickup code 4826 · delivery Fri 6 pm</span>
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", paddingRight: "6px" }}>
            <a className="btn" href="R14-RentalDetail.html" style={{ color: "#1F4D3A", boxShadow: "inset 0 0 0 1.5px #1F4D3A" }}>Details</a>
            <a className="btn" href="R15-PickupHandover.html" style={{ background: "#C9491F", color: "#fff" }}>Start pickup</a>
          </div>
        </article>
        <article style={{ display: "flex", flexWrap: "wrap", gap: "18px", alignItems: "center", padding: "14px", borderRadius: "26px", background: "#FFFDF8", boxShadow: "0 1px 2px rgba(35,38,42,.06),0 8px 24px -12px rgba(31,77,58,.22)" }}>
          <div style={{ width: "150px", height: "112px", borderRadius: "18px", background: "#DDE5E0", color: "#2F4E40", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "12px", fontWeight: "600", flex: "none" }}>Photo · Party</div>
          <div style={{ flex: "1 1 260px", minWidth: "0", display: "flex", flexDirection: "column", gap: "6px" }}>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", alignItems: "center" }}><span className="badge" style={{ background: "#FBEBCF", color: "#7A4708" }}>Awaiting owner</span><span className="mute" style={{ fontSize: "12.5px" }}>KR-24902</span></div>
            <b style={{ fontSize: "17px" }}>Party speaker 160W + 2 mics</b>
            <span className="mute" style={{ fontSize: "13.5px" }}>Sat 24 Oct · 1 day · from Farah Khan</span>
            <span style={{ fontSize: "13.5px", fontWeight: "600", color: "#1F4D3A" }}>Farah usually replies within a few hours</span>
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", paddingRight: "6px" }}>
            <a className="btn" href="R04-Item.html" style={{ color: "#1F4D3A", boxShadow: "inset 0 0 0 1.5px #1F4D3A" }}>View item</a>
            <a className="btn" href="R07-Chat.html" style={{ background: "#C9491F", color: "#fff" }}>Open chat</a>
          </div>
        </article>
    </div>
  </main>
<footer style={{ width: "100%", boxSizing: "border-box", padding: "24px 16px 0", fontFamily: "'Plus Jakarta Sans',system-ui,sans-serif", color: "#23262A", background: "#F6F1E7" }}>
  <div style={{ maxWidth: "1288px", margin: "0 auto", boxSizing: "border-box", background: "#EDE5D5", borderRadius: "32px 32px 0 0", padding: "56px 40px 28px", display: "flex", flexDirection: "column", gap: "40px" }}>
    <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "flex-end", gap: "24px" }}>
      <p style={{ margin: "0", fontFamily: "'Bricolage Grotesque',Georgia,serif", fontWeight: "700", fontSize: "clamp(38px,5vw,64px)", lineHeight: "1", letterSpacing: "-.035em", color: "#1F4D3A", maxWidth: "640px" }}>Rent it. Use it. <span style={{ color: "#C9491F" }}>Return it.</span></p>
      <a href="../owner/O02-ListItem.html" style={{ display: "inline-flex", alignItems: "center", gap: "10px", minHeight: "52px", padding: "0 26px", borderRadius: "999px", background: "#1F4D3A", color: "#fff", textDecoration: "none", fontWeight: "700", fontSize: "15px" }}>Earn from things you own
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"></path></svg></a>
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
        <a href="R03-Search.html" style={{ color: "#23262A", textDecoration: "none" }}>Browse items</a>
        <a href="R22-HowItWorks.html" style={{ color: "#23262A", textDecoration: "none" }}>How it works</a>
        <a href="R13-MyRentals.html" style={{ color: "#23262A", textDecoration: "none" }}>My rentals</a>
      </nav>
      <nav aria-label="Lend" style={{ display: "flex", flexDirection: "column", gap: "8px", fontSize: "14px", minWidth: "130px" }}>
        <b style={{ fontSize: "13px", color: "#474C52" }}>Lend</b>
        <a href="../owner/O02-ListItem.html" style={{ color: "#23262A", textDecoration: "none" }}>List an item</a>
        <a href="../owner/O01-Dashboard.html" style={{ color: "#23262A", textDecoration: "none" }}>Owner dashboard</a>
        <a href="R26-DepositPolicy.html" style={{ color: "#23262A", textDecoration: "none" }}>Deposit policy</a>
      </nav>
      <nav aria-label="Kirayo" style={{ display: "flex", flexDirection: "column", gap: "8px", fontSize: "14px", minWidth: "130px" }}>
        <b style={{ fontSize: "13px", color: "#474C52" }}>Kirayo</b>
        <a href="R21-About.html" style={{ color: "#23262A", textDecoration: "none" }}>About</a>
        <a href="R23-Contact.html" style={{ color: "#23262A", textDecoration: "none" }}>Contact</a>
        <a href="R24-Terms.html" style={{ color: "#23262A", textDecoration: "none" }}>Terms</a>
        <a href="R25-Privacy.html" style={{ color: "#23262A", textDecoration: "none" }}>Privacy</a>
      </nav>
      <div style={{ display: "flex", flexDirection: "column", gap: "12px", flex: "1 1 320px" }}>
        <b style={{ fontSize: "13px", color: "#474C52" }}>Kirayo is live in</b>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
          <a href="R02-Location.html" style={{ padding: "7px 14px", borderRadius: "999px", background: "#FFFDF8", color: "#1F4D3A", fontSize: "13px", fontWeight: "600", textDecoration: "none" }}>Bengaluru</a>
          <a href="R02-Location.html" style={{ padding: "7px 14px", borderRadius: "999px", background: "#FFFDF8", color: "#1F4D3A", fontSize: "13px", fontWeight: "600", textDecoration: "none" }}>Mumbai</a>
          <a href="R02-Location.html" style={{ padding: "7px 14px", borderRadius: "999px", background: "#FFFDF8", color: "#1F4D3A", fontSize: "13px", fontWeight: "600", textDecoration: "none" }}>Delhi NCR</a>
          <a href="R02-Location.html" style={{ padding: "7px 14px", borderRadius: "999px", background: "#FFFDF8", color: "#1F4D3A", fontSize: "13px", fontWeight: "600", textDecoration: "none" }}>Pune</a>
          <a href="R02-Location.html" style={{ padding: "7px 14px", borderRadius: "999px", background: "#FFFDF8", color: "#1F4D3A", fontSize: "13px", fontWeight: "600", textDecoration: "none" }}>Hyderabad</a>
          <a href="R02-Location.html" style={{ padding: "7px 14px", borderRadius: "999px", background: "#FFFDF8", color: "#1F4D3A", fontSize: "13px", fontWeight: "600", textDecoration: "none" }}>Chennai</a>
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
  <div className="mtab">
<nav aria-label="Main" style={{ width: "100%", boxSizing: "border-box", height: "72px", background: "#FFFDF8", borderTop: "1px solid #E3DACA", display: "grid", gridTemplateColumns: "repeat(5,minmax(0,1fr))", alignItems: "center", padding: "0 6px", fontFamily: "'Plus Jakarta Sans',system-ui,sans-serif", boxShadow: "0 -8px 24px -16px rgba(31,77,58,.25)" }}>
  <a href="R01-Home.html" style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "3px", textDecoration: "none", color: "#60666C", fontSize: "11px", fontWeight: "700", minHeight: "56px", justifyContent: "center" }}>
    <span style={{ width: "52px", height: "30px", borderRadius: "999px", background: "transparent", display: "flex", alignItems: "center", justifyContent: "center" }}><svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M4 11 12 4l8 7v9H4z"></path><path d="M10 20v-5h4v5"></path></svg></span>Explore</a>
  <a href="R03-Search.html" style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "3px", textDecoration: "none", color: "#60666C", fontSize: "11px", fontWeight: "700", minHeight: "56px", justifyContent: "center" }}>
    <span style={{ width: "52px", height: "30px", borderRadius: "999px", background: "transparent", display: "flex", alignItems: "center", justifyContent: "center" }}><svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" aria-hidden="true"><circle cx="11" cy="11" r="6.5"></circle><path d="m20 20-4-4"></path></svg></span>Search</a>
  <a href="R13-MyRentals.html" style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "3px", textDecoration: "none", color: "#1F4D3A", fontSize: "11px", fontWeight: "700", minHeight: "56px", justifyContent: "center" }}>
    <span style={{ width: "52px", height: "30px", borderRadius: "999px", background: "#DCE6DA", display: "flex", alignItems: "center", justifyContent: "center" }}><svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><rect x="3.5" y="5" width="17" height="15" rx="3"></rect><path d="M3.5 10h17M8 3v4M16 3v4"></path></svg></span>Rentals</a>
  <a href="R07-Chat.html" style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "3px", textDecoration: "none", color: "#60666C", fontSize: "11px", fontWeight: "700", minHeight: "56px", justifyContent: "center", position: "relative" }}>
    <span style={{ width: "52px", height: "30px", borderRadius: "999px", background: "transparent", display: "flex", alignItems: "center", justifyContent: "center", position: "relative" }}><svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinejoin="round" aria-hidden="true"><path d="M5 18.5V6.5A2.5 2.5 0 0 1 7.5 4h9A2.5 2.5 0 0 1 19 6.5v7a2.5 2.5 0 0 1-2.5 2.5H9z"></path></svg><span style={{ position: "absolute", top: "2px", right: "10px", width: "8px", height: "8px", borderRadius: "50%", background: "#C9491F" }}></span></span>Inbox</a>
  <a href="R20-Profile.html" style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "3px", textDecoration: "none", color: "#60666C", fontSize: "11px", fontWeight: "700", minHeight: "56px", justifyContent: "center" }}>
    <span style={{ width: "52px", height: "30px", borderRadius: "999px", background: "transparent", display: "flex", alignItems: "center", justifyContent: "center" }}><svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" aria-hidden="true"><circle cx="12" cy="8" r="4"></circle><path d="M4.5 20a7.5 7.5 0 0 1 15 0"></path></svg></span>Profile</a>
</nav>
</div>
</div>
