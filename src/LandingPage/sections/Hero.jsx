import { Reveal, GlitchText, RippleBtn } from "../components";
// import { GridBg } from "../components";

export function HeroSection({ 
  typed, 
  heroImgRef, 
  isMobile, 
  openModal, 
  orb1Ref, 
  orb2Ref, 
  HERO_IMG 
}) {
  return (
    <section id="top" style={{ position: "relative", minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", overflow: "hidden" }}>
      <div ref={heroImgRef} style={{ position: "absolute", inset: "-10%", backgroundImage: `url(${HERO_IMG})`, backgroundSize: "cover", backgroundPosition: "center", willChange: "transform" }} />
      <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, rgba(0,0,0,0.82) 0%, rgba(0,0,0,0.4) 44%, rgba(0,0,0,0.62) 70%, #000000 100%)" }} />
      <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse 65% 44% at 50% 62%, rgba(255,140,0,0.18) 0%, transparent 68%)" }} />
      {/* <GridBg opacity={0.03} /> */}

      <div ref={orb1Ref} className="orb-float" style={{ position: "absolute", top: "18%", left: isMobile ? "2%" : "8%", width: isMobile ? 160 : 280, height: isMobile ? 160 : 280, borderRadius: "50%", background: "radial-gradient(circle, rgba(255,140,0,0.12) 0%, transparent 68%)", pointerEvents: "none", filter: "blur(2px)" }} />
      <div ref={orb2Ref} className="orb-float" style={{ position: "absolute", bottom: "22%", right: isMobile ? "2%" : "6%", width: isMobile ? 120 : 220, height: isMobile ? 120 : 220, borderRadius: "50%", background: "radial-gradient(circle, rgba(255,80,0,0.1) 0%, transparent 65%)", pointerEvents: "none", animationDelay: "-3s" }} />

      {!isMobile && (
        <>
          <div className="spin-slow" style={{ position: "absolute", top: "12%", right: "12%", width: 160, height: 160, border: "1px solid rgba(255,140,0,0.1)", borderRadius: "50%", pointerEvents: "none" }}>
            <div style={{ position: "absolute", top: -3, left: "50%", width: 6, height: 6, borderRadius: "50%", background: "rgba(255,140,0,0.5)", transform: "translateX(-50%)" }} />
          </div>
          <div className="spin-rev" style={{ position: "absolute", bottom: "30%", left: "5%", width: 90, height: 90, border: "1px dashed rgba(255,140,0,0.15)", borderRadius: "50%", pointerEvents: "none" }}>
            <div style={{ position: "absolute", bottom: -3, left: "50%", width: 5, height: 5, borderRadius: "50%", background: "rgba(255,140,0,0.4)", transform: "translateX(-50%)" }} />
          </div>
        </>
      )}

      <div className="hero-entrance" style={{ position: "relative", zIndex: 10, display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", padding: isMobile ? "0 16px" : "0 20px", maxWidth: 800, margin: "0 auto", paddingTop: isMobile ? 90 : 100 }}>

        <Reveal delay={0}>
          <div data-magnetic style={{ display: "inline-flex", alignItems: "center", gap: 9, borderRadius: 999, padding: isMobile ? "6px 16px" : "7px 22px", fontSize: isMobile ? 10 : 11, color: "rgba(255,255,255,0.72)", marginBottom: isMobile ? 24 : 36, background: "rgba(255,140,0,0.07)", border: "1px solid rgba(255,140,0,0.25)", backdropFilter: "blur(14px)", letterSpacing: "0.05em", fontWeight: 300 }}>
            <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#FF8C00", display: "inline-block", animation: "pulseGlow 2s ease infinite" }} />
            <span style={{ position: "relative", width: 6, height: 6, display: "inline-block" }}>
              <span style={{ position: "absolute", inset: 0, borderRadius: "50%", background: "#FF8C00", animation: "dotPing 1.8s ease-in-out infinite" }} />
            </span>
            {isMobile ? "Generate. Launch." : "Generate it. "}
            {!isMobile && <span style={{ color: "#FF8C00", fontWeight: 400 }}>Customize it.</span>}
            {!isMobile && " Launch it."}
          </div>
        </Reveal>

        <Reveal delay={0.1}>
          <h1 style={{ fontSize: isMobile ? "clamp(40px,12vw,64px)" : "clamp(48px,8.5vw,96px)", fontWeight: 300, lineHeight: 1, marginBottom: isMobile ? 18 : 28, color: "white", letterSpacing: "-1px" }}>
            Idea to{" "}
            <GlitchText text="website" style={{ fontWeight: 500 }} />
          </h1>
        </Reveal>

        {/* <Reveal delay={0.22}>
          <p style={{ color: "rgba(255,255,255,0.55)", fontSize: isMobile ? "clamp(11px,3.5vw,14px)" : "clamp(12px,1.4vw,15px)", maxWidth: 460, marginBottom: isMobile ? 36 : 52, lineHeight: 1.9, fontWeight: 300, letterSpacing: "0.01em" }}>
            Type a prompt. Get a full-stack website — with real backend, database, and deployment — in seconds.
          </p>
        </Reveal> */}

        <Reveal delay={0.32} style={{ width: "100%", maxWidth: 640 }}>
          <div style={{ borderRadius: 20, padding: isMobile ? "14px 16px" : "18px 22px", marginBottom: 14, background: "rgba(255,255,255,0.05)", backdropFilter: "blur(30px)", border: "1px solid rgba(255,140,0,0.25)", boxShadow: "0 10px 52px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.06)", transition: "border-color 0.4s, box-shadow 0.4s" }}
            onFocus={e => { e.currentTarget.style.borderColor = "rgba(255,140,0,0.6)"; e.currentTarget.style.boxShadow = "0 10px 52px rgba(0,0,0,0.5), 0 0 0 3px rgba(255,140,0,0.1)"; }}
            onBlur={e => { e.currentTarget.style.borderColor = "rgba(255,140,0,0.25)"; e.currentTarget.style.boxShadow = "0 10px 52px rgba(0,0,0,0.5)"; }}>
            <div style={{ color: "rgba(255,255,255,0.85)", textAlign: "left", minHeight: 26, fontSize: isMobile ? 12 : 13, letterSpacing: "-0.1px", fontWeight: 300 }}>
              {typed}
              <span style={{ display: "inline-block", width: 1.5, height: 15, background: "#FF8C00", marginLeft: 2, verticalAlign: "middle", animation: "blink 1s step-end infinite" }} />
            </div>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 14 }}>
              <div style={{ display: "flex", gap: 8 }}>
                {(isMobile ? ["✦ Plan"] : ["⌘ Clone","✦ Plan"]).map(label => (
                  <button key={label} style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)", padding: "6px 14px", borderRadius: 50, letterSpacing: "0.02em", fontWeight: 300, transition: "all 0.3s", fontFamily: "inherit" }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = "rgba(255,140,0,0.4)"; e.currentTarget.style.color = "#FF8C00"; }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)"; e.currentTarget.style.color = "rgba(255,255,255,0.4)"; }}
                    onClick={openModal}>
                    {label}
                  </button>
                ))}
              </div>
              <RippleBtn className="cta-btn" style={{ width: 38, height: 38, borderRadius: 50, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16 }} onClick={openModal}>→</RippleBtn>
            </div>
          </div>
        </Reveal>

        <Reveal delay={0.44} style={{ width: "100%", maxWidth: 640 }}>
          <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr 1fr" : "repeat(4,1fr)", gap: isMobile ? 8 : 10 }}>
            {[{ l: "Food & Dining", e: "🍜" },{ l: "Travel", e: "✈️" },{ l: "Education", e: "📚" },{ l: "SaaS", e: "⚡" }].map((t, i) => (
              <div key={i} className="prompt-tag" style={{ height: isMobile ? 48 : 56, borderRadius: 14, display: "flex", alignItems: "center", justifyContent: "center", gap: 7, background: "rgba(255,255,255,0.05)", backdropFilter: "blur(12px)", border: "1px solid rgba(255,255,255,0.08)", fontSize: isMobile ? 10 : 11, color: "rgba(255,255,255,0.52)", letterSpacing: "0.02em", fontWeight: 300, transition: "all 0.45s cubic-bezier(.22,1,.36,1)", cursor: "none" }}
                onMouseEnter={e => { e.currentTarget.style.background = "rgba(255,140,0,0.12)"; e.currentTarget.style.borderColor = "rgba(255,140,0,0.35)"; e.currentTarget.style.color = "#FF8C00"; e.currentTarget.style.transform = "translateY(-4px) scale(1.04)"; }}
                onMouseLeave={e => { e.currentTarget.style.background = "rgba(255,255,255,0.05)"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)"; e.currentTarget.style.color = "rgba(255,255,255,0.52)"; e.currentTarget.style.transform = ""; }}>
                <span style={{ fontSize: isMobile ? 14 : 16 }}>{t.e}</span>
                {isMobile ? t.l.split(" ")[0] : t.l}
              </div>
            ))}
          </div>
        </Reveal>
      </div>

      <div style={{ position: "absolute", bottom: 40, left: "50%", transform: "translateX(-50%)", display: "flex", flexDirection: "column", alignItems: "center", gap: 10, color: "rgba(255,255,255,0.18)", fontSize: 10, letterSpacing: "0.2em", textTransform: "uppercase", animation: "floatUp 2.8s ease-in-out infinite" }}>
        <div style={{ width: 1, height: 46, background: "linear-gradient(to bottom, transparent, rgba(255,140,0,0.6))", animation: "lineGrow 1.5s cubic-bezier(0.22,1,0.36,1) 1s both", transformOrigin: "top" }} />
        scroll
      </div>

      <div className="fade-bottom" style={{ background: "linear-gradient(to bottom, transparent, #000000)" }} />
    </section>
  );
}
