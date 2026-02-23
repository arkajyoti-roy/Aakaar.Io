import { Reveal, SplitReveal, RippleBtn, TiltCard } from "../components";
import { GridBg } from "../components";

export function FeaturesSection({
  features,
  activeFeature,
  setActiveFeature,
  isMobile,
  isTablet,
  openModal
}) {
  const featureCols = isMobile || isTablet ? "1fr" : "1fr 1fr";

  return (
    <>
      {/* Section 2 — HOW IT WORKS */}
      <section  style={{ marginBottom: "-90px", background: "linear-gradient(180deg, #000000 0%, #0a0a0a 45%, #111111 100%)", padding: isMobile ? "100px 16px" : "160px 20px", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", top: "12%", right: "-6%", width: 520, height: 520, borderRadius: "50%", background: "radial-gradient(circle, rgba(255,140,0,0.06) 0%, transparent 62%)", pointerEvents: "none" }} />
        <GridBg opacity={0.025} />
        <div className="fade-top" style={{ background: "linear-gradient(to bottom, #000000, transparent)" }} />
        <div className="fade-bottom" style={{ background: "linear-gradient(to top, #0d0d0d, transparent)" }} />

        <div style={{ maxWidth: 1060, margin: "0 auto", position: "relative", zIndex: 2 }}>
          <Reveal style={{ textAlign: "center", marginBottom: isMobile ? 48 : 80 }}>
            <p style={{ color: "#FF8C00", fontSize: 11, fontWeight: 400, letterSpacing: "0.22em", textTransform: "uppercase", marginBottom: 18 }}>How It Works</p>
            <SplitReveal text="Build and launch in minutes" style={{ fontSize: isMobile ? "clamp(26px,8vw,40px)" : "clamp(32px,5vw,58px)", fontWeight: 300, color: "#fff", letterSpacing: "-0.5px", justifyContent: "center" }} delay={0.1} />
          </Reveal>

          <Reveal delay={0.1} style={{ display: "flex", justifyContent: "center", gap: 8, marginBottom: isMobile ? 40 : 80, overflowX: "auto", padding: "4px 0" }}>
            <div style={{ position: "relative", display: "flex", gap: isMobile ? 4 : 8, padding: "6px", background: "rgba(255,140,0,0.04)", border: "1px solid rgba(255,140,0,0.12)", borderRadius: 56, flexShrink: 0 }}>
              {features.map((f, i) => (
                <button key={i} onClick={() => setActiveFeature(i)} className="tab-btn" style={{ padding: isMobile ? "8px 16px" : "9px 28px", borderRadius: 50, fontSize: isMobile ? 11 : 12, border: `1px solid ${activeFeature === i ? "#FF8C00" : "transparent"}`, color: activeFeature === i ? "#fff" : "rgba(255,255,255,0.42)", background: activeFeature === i ? "#FF8C00" : "transparent", letterSpacing: "0.04em", transition: "all 0.4s cubic-bezier(.22,1,.36,1)", zIndex: 1, whiteSpace: "nowrap" }}>
                  {f.title}
                </button>
              ))}
            </div>
          </Reveal>

          <div style={{ display: "grid", gridTemplateColumns: featureCols, gap: isMobile ? 36 : 90, alignItems: "center" }}>
            <Reveal delay={0.08} from={isMobile ? "bottom" : "left"}>
              <div style={{ display: "inline-flex", alignItems: "center", gap: 8, color: "#FF8C00", fontSize: 11, fontWeight: 400, marginBottom: 20, letterSpacing: "0.14em", textTransform: "uppercase" }}>
                <span>{features[activeFeature].icon}</span>
                <span>{features[activeFeature].tag}</span>
              </div>
              <h3 style={{ fontSize: isMobile ? "clamp(22px,6vw,36px)" : "clamp(26px,3.5vw,44px)", fontWeight: 300, color: "#fff", marginBottom: 22, letterSpacing: "-0.3px", lineHeight: 1.15 }}>
                {features[activeFeature].title} anything
              </h3>
              <p style={{ color: "rgba(255,255,255,0.48)", fontSize: 14, lineHeight: 1.9, marginBottom: 36, fontWeight: 300 }}>{features[activeFeature].desc}</p>
              <RippleBtn className="cta-btn" style={{ padding: "13px 32px", borderRadius: 50, fontSize: 12 }} onClick={openModal}>Get Started →</RippleBtn>
            </Reveal>
            <Reveal delay={0.22} from={isMobile ? "bottom" : "right"}>
              <div className="float-anim">{features[activeFeature].preview}</div>
            </Reveal>
          </div>
        </div>
      </section>
    </>
  );
}
