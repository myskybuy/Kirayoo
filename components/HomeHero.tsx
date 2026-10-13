import Link from "next/link";

/** R01 hero + category row. */
export default function HomeHero({ area }: { area: string }) {
  return (
    <>
  <section style={{ padding: "56px 0 40px" }}>
    <div className="wrap" style={{ display: "flex", flexWrap: "wrap", gap: "48px", alignItems: "center" }}>
      <div style={{ flex: "1 1 460px", minWidth: "0", display: "flex", flexDirection: "column", gap: "22px" }}>
        <span className="eyebrow">Rentals from people near you</span>
        <h1 className="d" style={{ fontSize: "clamp(42px,5.4vw,76px)", lineHeight: ".98", fontWeight: "700", color: "#1F4D3A" }}>Why buy it when your neighbour has one?</h1>
        <p style={{ fontSize: "18px", maxWidth: "520px", color: "#474C52" }}>Rent cameras, tools, party gear, tents, consoles and more from verified owners in {area} and nearby areas. Pay a refundable deposit, collect with an OTP, return and get it back.</p>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "12px" }}>
          <Link className="btn btn-p" href="/browse">Browse nearby items
            <svg className="ic" viewBox="0 0 24 24"><path d="M5 12h14M13 6l6 6-6 6"></path></svg></Link>
          <Link className="btn btn-o" href="/how-it-works">How it works</Link>
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "18px", fontSize: "13.5px", fontWeight: "600", color: "#1F4D3A", paddingTop: "6px" }}>
          <span style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}><svg className="ic" viewBox="0 0 24 24" style={{ width: "18px", height: "18px" }}><rect x="3" y="5" width="18" height="14" rx="3"></rect><circle cx="9" cy="11" r="2.2"></circle><path d="M5.8 16.5a3.4 3.4 0 0 1 6.4 0M14.5 10h4"></path></svg>ID-verified owners</span>
          <span style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}><svg className="ic" viewBox="0 0 24 24" style={{ width: "18px", height: "18px" }}><path d="M12 3 4.5 6v6c0 4.5 3.2 7.8 7.5 9 4.3-1.2 7.5-4.5 7.5-9V6z"></path><path d="m9 12 2.2 2.2L15.5 10"></path></svg>Deposit held safely</span>
          <span style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}><svg className="ic" viewBox="0 0 24 24" style={{ width: "18px", height: "18px" }}><rect x="5" y="10.5" width="14" height="10" rx="2.5"></rect><path d="M8 10.5V8a4 4 0 0 1 8 0v2.5"></path></svg>OTP handover</span>
        </div>
      </div>
      <div className="hide-m" style={{ flex: "1 1 440px", minWidth: "0", position: "relative", height: "460px" }}>
        <div className="ph" style={{ position: "absolute", left: "0", top: "30px", width: "58%", height: "300px", borderRadius: "28px", background: "#BFD1BD" , overflow: "hidden"}}>
          <img src="/demo/mirrorless-1.jpg" alt="Camera on a tripod" className="k-photo" style={{ position: "absolute", inset: 0 }} />
          <span style={{ position: "absolute", left: "14px", top: "14px", padding: "7px 12px", borderRadius: "999px", background: "#FFFDF8", color: "#1F4D3A", fontWeight: "800", fontSize: "15px" }}>₹1,200<span style={{ fontSize: "12px", color: "#474C52", fontWeight: "600" }}>/day</span></span>
        </div>
        <div className="ph" style={{ position: "absolute", right: "0", top: "0", width: "38%", height: "210px", borderRadius: "28px", background: "#EDE5D5" , overflow: "hidden"}}>
          <img src="/demo/tent-1.jpg" alt="Tent" className="k-photo" style={{ position: "absolute", inset: 0 }} />
        </div>
        <div className="ph" style={{ position: "absolute", right: "4%", top: "232px", width: "34%", height: "200px", borderRadius: "28px", background: "#F1D9CB" , overflow: "hidden"}}>
          <img src="/demo/speaker-1.jpg" alt="Party speaker" className="k-photo" style={{ position: "absolute", inset: 0 }} />
        </div>
        <div className="card" style={{ position: "absolute", left: "6%", bottom: "6px", padding: "14px 18px", display: "flex", alignItems: "center", gap: "14px", boxShadow: "0 2px 6px rgba(35,38,42,.06),0 22px 48px -16px rgba(31,77,58,.4)" }}>
          <span style={{ width: "42px", height: "42px", borderRadius: "14px", background: "#1F4D3A", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center" }}><svg className="ic" viewBox="0 0 24 24"><rect x="5" y="10.5" width="14" height="10" rx="2.5"></rect><path d="M8 10.5V8a4 4 0 0 1 8 0v2.5"></path></svg></span>
          <span style={{ display: "flex", flexDirection: "column" }}><span style={{ fontSize: "12px", color: "#60666C", fontWeight: "600" }}>Pickup code</span><span className="d" style={{ fontSize: "24px", fontWeight: "700", letterSpacing: ".2em", color: "#1F4D3A" }}>4826</span></span>
        </div>
        <div className="card" style={{ position: "absolute", left: "44%", top: "-6px", padding: "10px 14px", display: "flex", alignItems: "center", gap: "10px", fontSize: "13px", fontWeight: "700" }}>
          <span style={{ width: "26px", height: "26px", borderRadius: "50%", background: "#DCEEDF", color: "#1E5A37", display: "flex", alignItems: "center", justifyContent: "center" }}><svg className="ic" viewBox="0 0 24 24" style={{ width: "15px", height: "15px", strokeWidth: "2.6" }}><path d="m5 12.5 4.5 4.5L19 7.5"></path></svg></span>
          Deposit ₹15,000 refunded
        </div>
      </div>
    </div>
  </section>
    </>
  );
}
