import { Reveal, SplitReveal, TiltCard } from "../components";
import { GridBg } from "../components";

export function CapabilitiesSection({
  capabilities,
  hoveredCap,
  setHoveredCap,
  isMobile
}) {
  const capCols = isMobile ? "1fr" : "1fr 1fr";
  const cols3 = isMobile ? "1fr" : "1fr 1fr 1fr";

  return (
    <section style={{ background: "linear-gradient(180deg, #0d0d0d 0%, #111111 50%, #0a0a0a 100%)", padding: isMobile ? "100px 16px" : "160px 20px", position: "relative", overflow: "hidden" }}>
      <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse 52% 38% at 50% 50%, rgba(255,140,0,0.055) 0%, transparent 64%)", pointerEvents: "none" }} />
      <GridBg opacity={0.03} />
      <div className="fade-top"    style={{ background: "linear-gradient(to bottom, #0d0d0d, transparent)" }} />
      <div className="fade-bottom" style={{ background: "linear-gradient(to top, #f5f5f5, transparent)" }} />

      <div style={{ maxWidth: 1060, margin: "0 auto", position: "relative", zIndex: 2 }}>
        <Reveal style={{ textAlign: "center", marginBottom: isMobile ? 48 : 80 }}>
          <p style={{ color: "#FF8C00", fontSize: 11, fontWeight: 400, letterSpacing: "0.22em", textTransform: "uppercase", marginBottom: 18 }}>Everything You Need</p>
          <SplitReveal text="Power your business" style={{ fontSize: isMobile ? "clamp(26px,8vw,40px)" : "clamp(32px,5vw,58px)", fontWeight: 300, color: "#fff", letterSpacing: "-0.5px", justifyContent: "center", marginBottom: 18 }} delay={0.08} />
          <p style={{ color: "rgba(255,255,255,0.38)", maxWidth: 440, margin: "0 auto", fontSize: 13, lineHeight: 1.85, fontWeight: 300 }}>
            Every feature you need to go from idea to live product — without stitching together a dozen tools.
          </p>
        </Reveal>
 
        <div style={{ display: "grid", gridTemplateColumns: cols3, gap: 14 }}>
          {capabilities.map((cap, i) => (
            <Reveal key={i} delay={0.06 * i} from={isMobile ? "bottom" : (i % 2 === 0 ? "left" : "right")}>
              <TiltCard className="dark-card" style={{ padding: isMobile ? "22px 20px" : "30px 28px", height: "100%", borderRadius: 18 }}
                onMouseEnter={() => setHoveredCap(i)}
                onMouseLeave={() => setHoveredCap(null)}>
                <div className="cap-card-icon" style={{ fontSize: 26, marginBottom: 18, display: "inline-block", animationDelay: `${i * 0.3}s` }}>{cap.icon}</div>
                <h3 style={{ fontSize: 15, fontWeight: 500, color: hoveredCap === i ? "#FF8C00" : "#fff", marginBottom: 10, letterSpacing: "-0.1px", transition: "color 0.3s" }}>{cap.title}</h3>
                <p style={{ color: "rgba(255,255,255,0.4)", fontSize: 13, lineHeight: 1.82, fontWeight: 300 }}>{cap.desc}</p>
              </TiltCard>
            </Reveal>
          ))}
          <br />
          <br />
          <br />
        </div>
      </div>
    </section>
  );
}
