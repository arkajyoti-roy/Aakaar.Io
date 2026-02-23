import { Reveal, RippleBtn } from "../components";
import { GridBg } from "../components";

export function CTASection({
  isMobile,
  openModal,
  BOTTOM_IMG
}) {
  return (
    <>
      <br />
      <br />

      {/* SECTION 6 — CTA (dark + image) */}
      <section style={{ position: "relative", minHeight: "88vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", overflow: "hidden", padding: isMobile ? "100px 16px" : "160px 20px" }}>
        <div style={{ position: "absolute", inset: 0, backgroundImage: `url(${BOTTOM_IMG})`, backgroundSize: "cover", backgroundPosition: "center 60%" }} />
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, #000000 0%, rgba(0,0,0,0.52) 38%, rgba(0,0,0,0.7) 100%)" }} />
        <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse 58% 48% at 50% 55%, rgba(255,140,0,0.18) 0%, transparent 64%)" }} />
        <div className="fade-top" style={{ background: "linear-gradient(to bottom, #000000, transparent)" }} />
        <GridBg opacity={0.022} />

        <div style={{ position: "relative", zIndex: 10, maxWidth: 620, margin: "0 auto", textAlign: "center" }}>
          <Reveal>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 9, background: "rgba(255,140,0,0.1)", border: "1px solid rgba(255,140,0,0.3)", borderRadius: 999, padding: "7px 22px", fontSize: 10, color: "#FF8C00", marginBottom: 36, fontWeight: 300, letterSpacing: "0.1em", textTransform: "uppercase" }}>
              <span style={{ width: 5, height: 5, borderRadius: "50%", background: "#FF8C00", display: "inline-block", animation: "pulseGlow 2s ease infinite" }} />
              Early access now open
            </div>
          </Reveal>

          <Reveal delay={0.15}>
            <h2 style={{ fontSize: isMobile ? "clamp(36px,10vw,64px)" : "clamp(40px,8vw,82px)", fontWeight: 300, marginBottom: 24, color: "white", letterSpacing: "-1px", lineHeight: 1 }}>
              <span className="orange-text" style={{ fontWeight: 500 }}>Start building</span><br />
              for free today
            </h2>
          </Reveal>

          <Reveal delay={0.28}>
            <p style={{ color: "rgba(255,255,255,0.5)", fontSize: isMobile ? 13 : 14, marginBottom: 48, maxWidth: 420, margin: "0 auto 48px", lineHeight: 1.9, fontWeight: 300 }}>
              Join thousands building their dream websites with Aakaar.io — no code, no DevOps, no limits.
            </p>
          </Reveal>

          <Reveal delay={0.4}>
            <div style={{ display: "flex", justifyContent: "center", gap: 14, flexWrap: "wrap" }}>
              <RippleBtn className="cta-btn" style={{ padding: isMobile ? "13px 28px" : "15px 40px", borderRadius: 50, fontSize: 12, boxShadow: "0 8px 36px rgba(255,140,0,0.4)" }} onClick={openModal}>
                Get Early Access →
              </RippleBtn>
              <button className="outline-btn" style={{ padding: isMobile ? "13px 28px" : "15px 40px", borderRadius: 50, fontSize: 12 }} onClick={openModal}>
                View Templates
              </button>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}
