
<div>
<header style={{ width: "100%", boxSizing: "border-box", background: "#FFFDF8", borderBottom: "1px solid #E3DACA", fontFamily: "'Plus Jakarta Sans',system-ui,sans-serif", color: "#23262A", position: "relative", zIndex: "30" }}>
  <div style={{ maxWidth: "1288px", margin: "0 auto", boxSizing: "border-box", padding: "10px 24px", display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: "10px 20px" }}>
    <a href="R01-Home.html" aria-label="Kirayo home" style={{ display: "flex", alignItems: "center", gap: "9px", textDecoration: "none", color: "#1F4D3A", flex: "1 1 0", minWidth: "130px" }}>
      <svg width="34" height="34" viewBox="0 0 44 44" aria-hidden="true"><rect width="44" height="44" rx="14" fill="#1F4D3A"></rect><path d="M14 30V14M14 22l9-8M17.5 19l8.5 11" fill="none" stroke="#F6F1E7" strokeWidth="3.6" strokeLinecap="round" strokeLinejoin="round"></path><circle cx="31" cy="15" r="3.6" fill="#E8643C"></circle></svg>
      <span style={{ fontFamily: "'Bricolage Grotesque',Georgia,serif", fontWeight: "800", fontSize: "25px", letterSpacing: "-.035em" }}>kirayo</span>
    </a>
      <a href="R03-Search.html" style={{ display: "flex", alignItems: "center", gap: "12px", background: "#fff", borderRadius: "999px", boxShadow: "0 1px 2px rgba(35,38,42,.06),0 8px 22px -12px rgba(31,77,58,.3),inset 0 0 0 1px #E3DACA", padding: "5px 5px 5px 20px", textDecoration: "none", color: "#23262A", flex: "0 1 460px", minWidth: "0", fontSize: "14px", fontWeight: "600" }}>
        <span style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>Cameras</span>
        <span style={{ width: "1px", height: "20px", background: "#E3DACA", flex: "none" }}></span>
        <span style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>Indiranagar</span>
        <span style={{ width: "1px", height: "20px", background: "#E3DACA", flex: "none" }}></span>
        <span style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", color: "#60666C", fontWeight: "500", flex: "1 1 auto" }}>16 – 19 Oct</span>
        <span style={{ width: "36px", height: "36px", borderRadius: "50%", background: "#C9491F", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", flex: "none" }} aria-label="Search">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" aria-hidden="true"><circle cx="11" cy="11" r="6.5"></circle><path d="m20 20-4-4"></path></svg>
        </span>
      </a>
    <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: "6px", flex: "1 1 0", minWidth: "200px" }}>
      <a href="../owner/O02-ListItem.html" style={{ fontWeight: "700", fontSize: "14.5px", color: "#1F4D3A", textDecoration: "none", padding: "12px 14px", borderRadius: "999px", whiteSpace: "nowrap" }}>List your item</a>
        <a href="R05-Login.html" style={{ display: "inline-flex", alignItems: "center", minHeight: "44px", padding: "0 20px", borderRadius: "999px", background: "#1F4D3A", color: "#fff", fontWeight: "700", fontSize: "14.5px", textDecoration: "none" }}>Log in</a>
    </div>
  </div>
</header>
  <main style={{ maxWidth: "560px", margin: "0 auto", padding: "56px 24px 72px", boxSizing: "border-box" }}>
    <form style={{ background: "#FFFDF8", borderRadius: "32px", padding: "40px clamp(20px,5vw,44px)", display: "flex", flexDirection: "column", gap: "22px", boxShadow: "0 2px 6px rgba(35,38,42,.06),0 30px 60px -24px rgba(31,77,58,.35)" }}>
      <a href="R05-Login.html" style={{ alignSelf: "flex-start", display: "inline-flex", alignItems: "center", gap: "6px", fontSize: "14px", fontWeight: "700", textDecoration: "none", minHeight: "44px" }}><svg className="ic" viewBox="0 0 24 24" style={{ width: "18px", height: "18px" }}><path d="M19 12H5M11 6l-6 6 6 6"></path></svg>Back</a>
      <span style={{ width: "60px", height: "60px", borderRadius: "20px", background: "#DCE6DA", color: "#1F4D3A", display: "flex", alignItems: "center", justifyContent: "center" }}><svg className="ic" viewBox="0 0 24 24" style={{ width: "28px", height: "28px" }}><rect x="3" y="5" width="18" height="14" rx="3"></rect><path d="m4 7 8 6 8-6"></path></svg></span>
      <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
        <h1 className="d" style={{ fontSize: "32px", fontWeight: "700" }}>Check your inbox</h1>
        <p className="mute">We sent a 6-digit code to <b style={{ color: "#23262A" }}>ananya.sharma@gmail.com</b>. <a href="R05-Login.html">Change</a></p>
      </div>
      <fieldset style={{ border: "0", margin: "0", padding: "0" }}>
        <legend className="lbl">Enter code</legend>
        <div className="otp">
          <input aria-label="Digit 1" defaultValue="3" inputMode="numeric" />
          <input aria-label="Digit 2" defaultValue="9" inputMode="numeric" />
          <input aria-label="Digit 3" defaultValue="1" inputMode="numeric" />
          <input aria-label="Digit 4" defaultValue="7" inputMode="numeric" />
          <input className="f" aria-label="Digit 5" defaultValue="" inputMode="numeric" />
          <input aria-label="Digit 6" defaultValue="" inputMode="numeric" />
        </div>
      </fieldset>
      <div style={{ padding: "16px", borderRadius: "18px", background: "#EEF3EC", display: "flex", flexDirection: "column", gap: "6px" }}>
        <label className="lbl" htmlFor="nm" style={{ margin: "0" }}>New here? Your full name</label>
        <input className="in" id="nm" type="text" defaultValue="Ananya Sharma" autoComplete="name" />
        <span className="mute" style={{ fontSize: "12.5px" }}>Use the name on your government ID. You'll verify it before your first payment.</span>
      </div>
      <a className="btn btn-p" href="R07-Chat.html" style={{ width: "100%" }}>Verify &amp; continue</a>
      <p className="mute" style={{ fontSize: "13.5px", textAlign: "center" }}>Didn't get it? Check spam, or <b style={{ color: "#23262A" }}>resend in 0:24</b></p>
    </form>
  </main>
</div>
