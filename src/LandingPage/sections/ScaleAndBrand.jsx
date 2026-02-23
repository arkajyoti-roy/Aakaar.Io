import { useEffect, useRef, useState, useCallback } from "react";
import { Reveal, SplitReveal, Counter, RippleBtn, TiltCard } from "../components";

// ─── useInView ────────────────────────────────────────────────────────────────
// Calls `onEnter` once when the attached ref element enters the viewport.
function useInView(onEnter, threshold = 0.3) {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { onEnter(); obs.disconnect(); } },
      { threshold }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return ref;
}

// ─── useCountUp ───────────────────────────────────────────────────────────────
// Returns { ref, display }. Attach ref to any DOM element; when it scrolls into
// view the displayed value counts from 0 → target with easeOutCubic.
// Handles plain numbers (99) and formatted strings ("85,458" / "26%").
function useCountUp(target, duration = 1600, delay = 0) {
  const [display, setDisplay] = useState("0");
  const rafRef = useRef(null);

  const parse = (val) => {
    if (typeof val === "number") return { numeric: val, suffix: "", hasCommas: false };
    const str = String(val);
    const suffix = str.endsWith("%") ? "%" : "";
    const hasCommas = str.includes(",");
    const numeric = parseFloat(str.replace(/[^0-9.]/g, ""));
    return { numeric, suffix, hasCommas };
  };

  const format = useCallback((val) => {
    const { suffix, hasCommas } = parse(target);
    const rounded = Math.round(val);
    return (hasCommas ? rounded.toLocaleString("en-US") : String(rounded)) + suffix;
  }, [target]);

  const ref = useInView(() => {
    const { numeric } = parse(target);
    let startTime = null;
    const tick = (ts) => {
      if (!startTime) startTime = ts + delay;
      const elapsed = Math.max(0, ts - startTime);
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(format(eased * numeric));
      if (progress < 1) rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
  });

  useEffect(() => () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); }, []);

  return { ref, display };
}

// ─── AnimatedStat ─────────────────────────────────────────────────────────────
// Drop-in for the static value div in the Visitors / Page Views / Bounce row.
function AnimatedStat({ value, style }) {
  const { ref, display } = useCountUp(value, 1600);
  return <div ref={ref} style={style}>{display}</div>;
}

// ─── AnimatedBar ──────────────────────────────────────────────────────────────
// Same as the original bar div but starts at scaleY(0) and transitions to
// scaleY(1) when `triggered` becomes true (set by the parent's IntersectionObserver).
function AnimatedBar({ h, i, triggered }) {
  return (
    <div
      style={{
        flex: 1,
        borderRadius: "4px 4px 0 0",
        background: `linear-gradient(180deg, rgba(255,${100 + i * 8},0,${0.5 + i * 0.04}) 0%, rgba(255,140,0,0.07) 100%)`,
        height: `${h}%`,
        transform: triggered ? "scaleY(1)" : "scaleY(0)",
        transformOrigin: "bottom",
        transition: triggered
          ? `transform 0.6s cubic-bezier(0.34,1.56,0.64,1) ${i * 0.05}s`
          : "none",
      }}
      onMouseEnter={e => { e.currentTarget.style.filter = "brightness(1.4)"; e.currentTarget.style.transform = "scaleY(1.05)"; }}
      onMouseLeave={e => { e.currentTarget.style.filter = ""; e.currentTarget.style.transform = "scaleY(1)"; }}
    />
  );
}

// ─── AnimatedLighthouse ───────────────────────────────────────────────────────
// Same markup as the original score circle. SVG dash draws on scroll entry;
// inner number counts up from 0. Everything else (size, colors, layout) is identical.
function AnimatedLighthouse({ item, isMobile }) {
  const [triggered, setTriggered] = useState(false);
  const { ref: numRef, display } = useCountUp(item.score, 1400, 200);
  const wrapRef = useInView(() => setTriggered(true));

  const size = isMobile ? 56 : 72;
  const circumference = 2 * Math.PI * 28; // r=28, ≈ 175.93

  return (
    <div ref={wrapRef} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10 }}>
      <div style={{ position: "relative", width: size, height: size }}>
        <svg style={{ width: size, height: size, transform: "rotate(-90deg)" }} viewBox="0 0 72 72">
          <circle cx="36" cy="36" r="28" fill="none" stroke="#f0f0f0" strokeWidth="4.5" />
          <circle
            cx="36" cy="36" r="28"
            fill="none"
            stroke={item.color}
            strokeWidth="4.5"
            strokeLinecap="round"
            strokeDasharray={`${(item.score / 100) * circumference} ${circumference}`}
            style={{
              filter: `drop-shadow(0 0 5px ${item.color}88)`,
              strokeDashoffset: triggered ? 0 : circumference,
              transition: triggered
                ? "stroke-dashoffset 1.8s cubic-bezier(0.22,1,0.36,1) 0.1s"
                : "none",
            }}
          />
        </svg>
        <div ref={numRef} style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: isMobile ? 14 : 18, fontWeight: 400, color: "#000" }}>
          {display}
        </div>
      </div>
      <span style={{ color: "#aaa", fontSize: 11, fontWeight: 300 }}>{item.label}</span>
    </div>
  );
}

// ─── Main Component ────────────────────────────────────────────────────────────
export function ScaleAndBrandSection({ stats, isMobile, openModal }) {
  const statCols = isMobile ? "1fr 1fr" : "repeat(4,1fr)";
  const scaleCols = isMobile ? "1fr" : "1fr 1fr";
  const brandCols = isMobile ? "1fr" : "1fr 1fr";

  // Shared scroll trigger for the bar chart — all 12 bars animate together
  const [barTriggered, setBarTriggered] = useState(false);
  const barWrapRef = useInView(() => setBarTriggered(true));

  return (
    <>
      {/* SECTION 4 — SCALE (white) */}
      <section style={{ marginBottom: "-90px", background: "linear-gradient(180deg, #f5f5f5 0%, #ffffff 35%, #fafafa 100%)", padding: isMobile ? "100px 16px" : "160px 20px", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse 48% 52% at 76% 48%, rgba(255,140,0,0.06) 0%, transparent 58%)", pointerEvents: "none" }} />
        <div className="fade-top"    style={{ background: "linear-gradient(to bottom, #f5f5f5, transparent)" }} />
        <div className="fade-bottom" style={{ background: "linear-gradient(to up, #ffffff, transparent)" }} />

        <div style={{ maxWidth: 1060, margin: "0 auto", position: "relative", zIndex: 2 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: isMobile ? 48 : 72, flexWrap: "wrap", gap: 28 }}>
            <Reveal from="left">
              <p style={{ color: "#FF5500", fontSize: 11, fontWeight: 400, letterSpacing: "0.22em", textTransform: "uppercase", marginBottom: 16 }}>Built-In Intelligence</p>
              <SplitReveal text="Scale without changing platforms" style={{ fontSize: isMobile ? "clamp(22px,6vw,36px)" : "clamp(28px,4.5vw,52px)", fontWeight: 300, color: "#000", letterSpacing: "-0.5px", lineHeight: 1.1 }} delay={0.1} />
            </Reveal>
            <Reveal delay={0.2} from="right">
              <RippleBtn className="cta-btn" style={{ padding: "14px 32px", borderRadius: 50, fontSize: 12 }} onClick={openModal}>Get Started →</RippleBtn>
            </Reveal>
          </div>

          <Reveal delay={0.1} style={{ display: "grid", gridTemplateColumns: statCols, gap: 14, marginBottom: 48 }}>
            {stats.map((s, i) => (
              <div key={i} className="stat-card" style={{ textAlign: "center", background: "#fff", borderRadius: 18, padding: isMobile ? "20px 12px" : "28px 16px", border: "1px solid rgba(255,140,0,0.1)", boxShadow: "0 4px 28px rgba(0,0,0,0.06)", transition: "transform 0.5s cubic-bezier(.22,1,.36,1), box-shadow 0.5s", animationDelay: `${i * 0.5}s` }}
                onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-8px) scale(1.02)"; e.currentTarget.style.boxShadow = "0 24px 60px rgba(255,140,0,0.14)"; }}
                onMouseLeave={e => { e.currentTarget.style.transform = ""; e.currentTarget.style.boxShadow = "0 4px 28px rgba(0,0,0,0.06)"; }}>
                <div style={{ fontSize: isMobile ? 36 : 44, fontWeight: 400, marginBottom: 7, background: "linear-gradient(135deg,#FF5500,#FF8C00)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text", lineHeight: 1 }}>
                  <Counter target={s.value} suffix={s.suffix} />
                </div>
                <div style={{ color: "#888", fontSize: 11, fontWeight: 300, letterSpacing: "0.02em" }}>{s.label}</div>
              </div>
            ))}
          </Reveal>

          <div style={{ display: "grid", gridTemplateColumns: scaleCols, gap: 18 }}>
            <Reveal delay={0.12} from={isMobile ? "bottom" : "left"}>
              <TiltCard className="light-card" style={{ padding: isMobile ? 20 : 30, borderRadius: 18 }}>
                <div style={{ display: "flex", gap: isMobile ? 14 : 28, marginBottom: 24, flexWrap: "wrap" }}>
                  {[["Visitors","85,458"],["Page Views","258,256"],["Bounce","26%"]].map(([l,v]) => (
                    <div key={l}>
                      <div style={{ fontSize: 10, color: "#aaa", marginBottom: 5, letterSpacing: "0.08em", textTransform: "uppercase", fontWeight: 400 }}>{l}</div>
                      {/* ↓ was: <div style={...}>{v}</div> — now counts up on scroll */}
                      <AnimatedStat value={v} style={{ fontSize: isMobile ? 18 : 22, fontWeight: 400, color: "#000", lineHeight: 1 }} />
                    </div>
                  ))}
                </div>
                {/* ↓ barWrapRef watches this container; AnimatedBar uses shared `barTriggered` */}
                <div ref={barWrapRef} style={{ height: 96, display: "flex", alignItems: "flex-end", gap: 4 }}>
                  {[35,55,40,70,45,85,60,90,75,95,80,100].map((h, i) => (
                    // ↓ was: static <div> with animation keyframe — now scroll-triggered
                    <AnimatedBar key={i} h={h} i={i} triggered={barTriggered} />
                  ))}
                </div>
                <p style={{ color: "#aaa", fontSize: 11, marginTop: 15, fontWeight: 300 }}>Track real-time visitors and performance for every live website.</p>
              </TiltCard>
            </Reveal>

            <Reveal delay={0.26} from={isMobile ? "bottom" : "right"}>
              <TiltCard className="light-card" style={{ padding: isMobile ? 20 : 30, borderRadius: 18 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 28 }}>
                  <div style={{ width: 18, height: 18, background: "#FF8C00", borderRadius: 5, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 9, color: "white", fontWeight: 600 }}>G</div>
                  <span style={{ color: "#888", fontSize: 12, fontWeight: 300, letterSpacing: "0.01em" }}>Google Lighthouse</span>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: isMobile ? 8 : 16 }}>
                  {[{ score: 99, label: "SEO", color: "#FF8C00" },{ score: 100, label: "Performance", color: "#FF5500" },{ score: 98, label: "Accessibility", color: "#FFB347" }].map(item => (
                    // ↓ was: static svg + static score number — now scroll-triggered draw + count
                    <AnimatedLighthouse key={item.label} item={item} isMobile={isMobile} />
                  ))}
                </div>
                <p style={{ color: "#aaa", fontSize: 11, marginTop: 24, fontWeight: 300 }}>SEO optimization that boosts your site's traffic and reach.</p>
              </TiltCard>
            </Reveal>
          </div>
        </div>
      </section>

      {/* SECTION 5 — BRAND (white) — untouched */}
      <section style={{ background: "linear-gradient(180deg, #ffffff 0%, #fafafa 50%, #f5f5f5 100%)", padding: isMobile ? "100px 16px" : "160px 20px", position: "relative", overflow: "hidden" }}>
        <div className="fade-top"    style={{ background: "linear-gradient(to bottom, #ffffff, transparent)" }} />
        <div className="fade-bottom" style={{ background: "linear-gradient(to top, #000000, transparent)" }} />

        <div style={{ maxWidth: 1060, margin: "0 auto", position: "relative", zIndex: 2 }}>
          <Reveal style={{ textAlign: "center", marginBottom: isMobile ? 48 : 80 }}>
            <p style={{ color: "#FF5500", fontSize: 11, fontWeight: 400, letterSpacing: "0.22em", textTransform: "uppercase", marginBottom: 18 }}>Make it uniquely yours</p>
            <SplitReveal text="Bring your brand to life" style={{ fontSize: isMobile ? "clamp(26px,8vw,40px)" : "clamp(32px,5vw,58px)", fontWeight: 300, color: "#000", letterSpacing: "-0.5px", justifyContent: "center" }} delay={0.08} />
          </Reveal>

          <div style={{ display: "grid", gridTemplateColumns: brandCols, gap: 18 }}>
            <Reveal delay={0.1} from={isMobile ? "bottom" : "left"}>
              <TiltCard className="light-card" style={{ padding: isMobile ? 20 : 30, borderRadius: 18 }}>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 8, marginBottom: 24 }}>
                  {["#000000","#111111","#FF3300","#FF5500","#FF8C00","#FFB347","#FFD280","#FFE8B5","#ffffff"].map((bg, i) => (
                    <div key={i} style={{ height: 54, borderRadius: 10, background: bg, border: bg === "#ffffff" ? "1px solid #eee" : "none", transform: "scale(0.8)", opacity: 0, animation: `scaleIn 0.5s cubic-bezier(0.34,1.56,0.64,1) ${0.05 * i}s forwards`, transition: "transform 0.4s cubic-bezier(.22,1,.36,1)", cursor: "none" }}
                      onMouseEnter={e => { e.currentTarget.style.transform = "scale(1.12)"; e.currentTarget.style.zIndex = "10"; e.currentTarget.style.boxShadow = `0 8px 24px ${bg}44`; }}
                      onMouseLeave={e => { e.currentTarget.style.transform = "scale(1)"; e.currentTarget.style.zIndex = ""; e.currentTarget.style.boxShadow = ""; }} />
                  ))}
                </div>
                <button onClick={openModal} style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, background: "#FFF5E0", border: "1px solid rgba(255,140,0,0.25)", borderRadius: 50, padding: "11px 0", fontSize: 12, color: "#FF5500", fontWeight: 400, letterSpacing: "0.05em", transition: "all 0.4s cubic-bezier(.22,1,.36,1)", fontFamily: "inherit" }}
                  onMouseEnter={e => { e.currentTarget.style.background = "#FF8C00"; e.currentTarget.style.color = "#fff"; e.currentTarget.style.transform = "translateY(-3px)"; e.currentTarget.style.boxShadow = "0 12px 36px rgba(255,140,0,0.35)"; }}
                  onMouseLeave={e => { e.currentTarget.style.background = "#FFF5E0"; e.currentTarget.style.color = "#FF5500"; e.currentTarget.style.transform = ""; e.currentTarget.style.boxShadow = ""; }}>
                  ✦ Generate Brand Palette
                </button>
                <p style={{ color: "#aaa", fontSize: 11, marginTop: 16, fontWeight: 300, lineHeight: 1.78 }}>
                  <span style={{ color: "#333", fontWeight: 400 }}>Create on-brand imagery</span> for your website and marketing, instantly.
                </p>
              </TiltCard>
            </Reveal>

            <Reveal delay={0.24} from={isMobile ? "bottom" : "right"}>
              <TiltCard className="light-card" style={{ padding: isMobile ? 20 : 30, borderRadius: 18 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24, flexWrap: isMobile ? "wrap" : "nowrap", gap: 12 }}>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                    {[{ bg: "#FF8C00", s: "✦" },{ bg: "#FF5500", s: "◈" },{ bg: "#000000", s: "A" },{ bg: "#FFB347", s: "M" }].map((l, i) => (
                      <div key={i} style={{ width: 58, height: 58, borderRadius: 15, background: l.bg, display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontSize: 17, fontWeight: 500, transition: "transform 0.4s cubic-bezier(.22,1,.36,1), box-shadow 0.4s", cursor: "none" }}
                        onMouseEnter={e => { e.currentTarget.style.transform = "scale(1.12) rotate(-4deg)"; e.currentTarget.style.boxShadow = `0 10px 28px ${l.bg}66`; }}
                        onMouseLeave={e => { e.currentTarget.style.transform = ""; e.currentTarget.style.boxShadow = ""; }}>
                        {l.s}
                      </div>
                    ))}
                  </div>
                  <div style={{ background: "#FFF5E0", border: "1px solid rgba(255,140,0,0.22)", borderRadius: 50, padding: "8px 16px", fontSize: 11, color: "#FF5500", display: "flex", alignItems: "center", gap: 7, fontWeight: 300, flexShrink: 0 }}>
                    <div style={{ width: 5, height: 5, borderRadius: "50%", background: "#FF8C00", animation: "pulseGlow 1.5s ease infinite" }} />
                    Generating...
                  </div>
                </div>
                <p style={{ color: "#aaa", fontSize: 11, fontWeight: 300, lineHeight: 1.78 }}>
                  <span style={{ color: "#333", fontWeight: 400 }}>AI-crafted logos</span> that fit your brand's style, color, and tone perfectly.
                </p>
              </TiltCard>
            </Reveal>
          </div>
          <br />
          <br />
          <br />
        </div>
      </section>
    </>
  );
}