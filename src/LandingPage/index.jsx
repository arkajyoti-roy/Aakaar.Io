import { useState, useEffect, useRef } from "react";
import { useSmoothScroll, useScrollProgress, useViewport } from "./hooks";
import { Marquee, MagneticCursor, RippleBtn } from "./components";
import { EarlyAccessModal } from "./sections/EarlyAccessModal";
import { HeroSection } from "./sections/Hero";
import { FeaturesSection } from "./sections/Features";
import { CapabilitiesSection } from "./sections/Capabilities";
import { ScaleAndBrandSection } from "./sections/ScaleAndBrand";
import { CTASection } from "./sections/CTA";
import "./styles.css";

const HERO_IMG = "/hero.jpeg";
const BOTTOM_IMG = "/hero.jpeg";

export default function Landingg() {
  const { wrapRef, currentY, targetY } = useSmoothScroll();
  const vp = useViewport();
  const scrollProgress = useScrollProgress(currentY);

  const [typed, setTyped] = useState("");
  const [activeFeature, setActiveFeature] = useState(0);
  const [hoveredCap, setHoveredCap] = useState(null);
  const [navScrolled, setNavScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [showTop, setShowTop] = useState(false);

  const isMobile = vp.w < 768;
  const isTablet = vp.w < 1024 && vp.w >= 768;

  const heroImgRef = useRef(null);
  const orb1Ref = useRef(null);
  const orb2Ref = useRef(null);

  // Typewriter effect
  useEffect(() => {
    const text = "Build a full-stack website with AI";
    let i = 0;
    const type = () => {
      if (i < text.length) {
        setTyped(text.slice(0, i + 1));
        i++;
        setTimeout(type, 50);
      }
    };
    type();
  }, []);

  // Parallax effect on hero image
  useEffect(() => {
    let raf;
    const tick = () => {
      const y = currentY.current;
      if (heroImgRef.current) {
        heroImgRef.current.style.transform = `translateY(${y * 0.25}px)`;
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [currentY]);

  // Scroll progress tracking
  useEffect(() => {
    let raf;
    const update = () => {
      const scrollPercent = currentY.current / (document.body.scrollHeight - window.innerHeight);
      setNavScrolled(scrollPercent > 0.05);
      setShowTop(currentY.current > window.innerHeight * 0.5);
      raf = requestAnimationFrame(update);
    };
    raf = requestAnimationFrame(update);
    return () => cancelAnimationFrame(raf);
  }, [currentY]);

  const openModal = () => setModalOpen(true);
  const closeModal = () => setModalOpen(false);

  // Data for features section
  const features = [
    {
      tag: "AI Generation", title: "Generate", icon: "✦",
      desc: "Write a single prompt and Aakaar generates a complete, production-ready website with real pages, real content, optimized layout — in seconds.",
      preview: (
        <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,140,0,0.18)", borderRadius: 20, padding: 26 }}>
          <div style={{ marginBottom: 16, display: "flex", gap: 6, flexWrap: "wrap" }}>
            {["HTML","CSS","JavaScript","Database","API"].map(t => (
              <div key={t} style={{ background: "rgba(255,140,0,0.08)", border: "1px solid rgba(255,140,0,0.25)", borderRadius: 8, padding: "5px 12px", fontSize: 11, color: "#FF8C00" }}>{t}</div>
            ))}
          </div>
          <div style={{ background: "rgba(255,140,0,0.06)", border: "2px solid rgba(255,140,0,0.5)", borderRadius: 13, padding: 18, marginBottom: 14, animation: "borderPulse 2s ease-in-out infinite" }}>
            <div style={{ fontSize: 15, color: "#fff", fontWeight: 450 }}>🚀 Website Generated</div>
            <div style={{ fontSize: 11, color: "rgba(255,255,255,0.38)", marginTop: 5 }}>✓ Site generated in 4.2s</div>
          </div>
        </div>
      ),
    },
    {
      tag: "Full Customization", title: "Customize", icon: "◈",
      desc: "Click anything to edit it. Swap images, adjust colors, move sections — every element on your site responds to a single interaction.",
      preview: (
        <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,140,0,0.18)", borderRadius: 20, padding: 26 }}>
          <div style={{ display: "flex", gap: 8, marginBottom: 16, flexWrap: "wrap" }}>
            {["T  Text","⊞  Layout","⊙  Colors"].map(t => (
              <div key={t} style={{ background: "rgba(255,140,0,0.08)", border: "1px solid rgba(255,140,0,0.25)", borderRadius: 8, padding: "5px 12px", fontSize: 11, color: "#FF8C00" }}>{t}</div>
            ))}
          </div>
          <div style={{ background: "rgba(255,140,0,0.06)", border: "2px solid rgba(255,140,0,0.5)", borderRadius: 13, padding: 18, marginBottom: 14, animation: "borderPulse 2s ease-in-out infinite" }}>
            <div style={{ fontSize: 15, color: "#fff" }}>Customize Anything</div>
            <div style={{ fontSize: 11, color: "rgba(255,255,255,0.38)", marginTop: 5 }}>Click to select and edit</div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(6,1fr)", gap: 6 }}>
            {["#000000","#1a1a1a","#FF5500","#FF8C00","#FFB347","#ffffff"].map((c,i) => (
              <div key={c} style={{ height: 26, borderRadius: 6, background: c, border: c === "#ffffff" ? "1px solid rgba(255,140,0,0.2)" : "none", opacity: 0, animation: `scaleIn 0.4s cubic-bezier(0.34,1.56,0.64,1) ${i * 0.06}s forwards` }} />
            ))}
          </div>
        </div>
      ),
    },
    {
      tag: "One-Click Deploy", title: "Deploy", icon: "⬡",
      desc: "Launch your site in seconds. Buy a domain, connect hosting, and go live — all without ever leaving Aakaar.",
      preview: (
        <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,140,0,0.18)", borderRadius: 20, padding: 26 }}>
          {[["Domain","mysite.com"],["Hosting","Included Free"],["SSL","Auto-configured"],["Database","Connected"]].map(([label,val],i) => (
            <div key={label} style={{ opacity: 0, animation: `fadeSlide 0.5s cubic-bezier(0.22,1,0.36,1) ${i * 0.1}s forwards` }}>
              <div style={{ display: "flex", justifyContent: "space-between", padding: "11px 0", alignItems: "center" }}>
                <span style={{ fontSize: 12, color: "rgba(255,255,255,0.45)" }}>{label}</span>
                <span style={{ fontSize: 12, color: "#FF8C00" }}>✓ {val}</span>
              </div>
              <div style={{ height: 1, background: "rgba(255,255,255,0.06)" }} />
            </div>
          ))}
          <button onClick={openModal} style={{ marginTop: 16, width: "100%", background: "linear-gradient(135deg,#FF8C00,#FF5500)", borderRadius: 12, padding: "11px 0", fontSize: 12, color: "#fff", border: "none", cursor: "none", fontFamily: "inherit" }}>
            Deploy Now →
          </button>
        </div>
      ),
    },
  ];

  const capabilities = [
    { icon: "⚡", title: "Instant Generation",    desc: "Full websites from a single prompt — pages, layouts, content, and structure in seconds." },
    { icon: "🗄️", title: "Backend + Database",    desc: "Auto-provisioned backend APIs and database schemas. Your site has real data, not just pretty UI." },
    { icon: "🎨", title: "Brand Intelligence",    desc: "AI picks fonts, colors, and imagery that match your brand voice and industry automatically." },
    { icon: "📊", title: "Built-in Analytics",    desc: "Track visitors, page views, bounce rate, and conversions without installing anything extra." },
    { icon: "🔍", title: "SEO Optimized",          desc: "Every page ships with perfect meta tags, structured data, and sitemap — ready to rank." },
    { icon: "🚀", title: "Deploy in Seconds",      desc: "One-click deploy with your own domain, free hosting, SSL, and CDN. No DevOps required." },
  ];

  const stats = [
    { value: "4.2", suffix: "s",  label: "Avg. generation time" },
    { value: "99",  suffix: "",   label: "Google Lighthouse SEO" },
    { value: "100", suffix: "",   label: "Performance score"     },
    { value: "98",  suffix: "",   label: "Accessibility score"   },
  ];

  const marqueeItems = ["Instant Generation","AI-Powered Design","One-Click Deploy","Real Backend","SEO Ready","Brand Intelligence","Analytics Built-In","Zero Code Required"];
  const marqueeItems2 = ["React","Next.js","Tailwind","Node.js","PostgreSQL","Redis","Vercel","Cloudflare","Stripe","TypeScript"];

  const mono = { fontFamily: "'Roboto Mono', monospace" };

  return (
    <div style={{ ...mono, cursor: isMobile ? "auto" : "none" }}>
      {/* ── SCAN LINE OVERLAY ── */}
      {/* <div className="scan-overlay" /> */}

      {/* ── MAGNETIC CURSOR ── */}
      <MagneticCursor />

      {/* ── EARLY ACCESS MODAL ── */}
      <EarlyAccessModal isOpen={modalOpen} onClose={closeModal} />

      {/* ── SCROLL PROGRESS BAR ── */}
      <div style={{ position: "fixed", top: 0, left: 0, right: 0, height: 2.5, zIndex: 9999, background: "rgba(255,140,0,0.12)" }}>
        <div style={{ height: "100%", width: `${scrollProgress}%`, background: "linear-gradient(90deg,#FF5500,#FF8C00,#FFB347)", backgroundSize: "200% 100%", animation: "progressBar 2s linear infinite", transition: "width 0.1s linear", boxShadow: "0 0 12px rgba(255,140,0,0.7)" }} />
      </div>

      {/* ── NAVBAR ── */}
      <div style={{ position: "fixed", top: 18, left: 0, right: 0, zIndex: 10000, display: "flex", justifyContent: "center", padding: "0 16px", animation: "navSlideDown 0.8s cubic-bezier(0.16,1,0.3,1) 0.2s both" }}>
        {/* <nav style={{ borderRadius: 15, display: "flex", alignItems: "center", justifyContent: "space-between", padding: isMobile ? "10px 18px" : "11px 26px", width: "100%", maxWidth: 1100, background: navScrolled ? "rgba(255,255,255,0.55)" : "rgba(255,255,255,0.55)", backdropFilter: "blur(10px) saturate(160%)", WebkitBackdropFilter: "blur(10px)", border: "1px solid rgba(255,140,0,0.18)", boxShadow: "0 8px 40px rgba(0,0,0,0.55), 0 0 0 0.5px rgba(255,140,0,0.08)", transition: "background 0.4s, box-shadow 0.4s", animation: "navGlow 4s ease infinite" }}> */}
       <nav style={{
  borderRadius: 15,
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  padding: isMobile ? "10px 18px" : "11px 26px",
  width: "100%",
  maxWidth: 1100,
  background: "linear-gradient(135deg, rgba(255,255,255,0.75), rgba(255,255,255,0.65))",
  backdropFilter: "blur(180px) saturate(280%)",
  WebkitBackdropFilter: "blur(180px)",
  border: "1px solid rgba(255,255,255,0.18)",
  boxShadow: "0 8px 40px rgba(0,0,0,0.45), 0 0 0 0.5px rgba(255,140,0,0.12)",
  transition: "background 0.4s, box-shadow 0.4s",
  animation: "navGlow 6s ease-in-out infinite"
}}>




          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 30, height: 30, borderRadius: 9, background: "linear-gradient(135deg,#FF8C00,#FF4500)", display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontWeight: 600, fontSize: 14, boxShadow: "0 4px 14px rgba(255,140,0,0.45)", transition: "transform 0.4s", flexShrink: 0 }}
              onMouseEnter={e => e.currentTarget.style.transform = "rotate(15deg) scale(1.1)"}
              onMouseLeave={e => e.currentTarget.style.transform = ""}>A</div>
            <span style={{ fontWeight: 500, fontSize: 15, color: "black", letterSpacing: "0.01em" }}>Aakaar.io</span>
          </div>

          {!isMobile && (
            <div style={{ display: "flex", alignItems: "center", gap: 30 }}>
              {["",""].map(item => <a key={item} href="#" className="nav-link">{item}</a>)}
            </div>
          )}

          {!isMobile ? (
            <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
              {/* <button className="outline-btn" style={{ fontSize: 12, padding: "7px 18px", borderRadius: 50 }} onClick={openModal}>Sign In</button> */}
              <RippleBtn className="cta-btn" style={{ fontSize: 12, padding: "8px 20px", borderRadius: 50 }} onClick={openModal}>Get Early Access</RippleBtn>
            </div>
          ) : (
            <button onClick={() => setMenuOpen(o => !o)} style={{ width: 36, height: 36, borderRadius: 10, background: "rgba(255,140,0,0.1)", border: "1px solid rgba(255,140,0,0.25)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 5, padding: 8, transition: "all 0.3s", cursor: "pointer" }}>
              {[0,1,2].map(i => (
                <span key={i} style={{ display: "block", width: "100%", height: 1.5, background: "#FF8C00", borderRadius: 2, transition: "all 0.3s", transform: menuOpen ? (i === 0 ? "translateY(6.5px) rotate(45deg)" : i === 2 ? "translateY(-6.5px) rotate(-45deg)" : "scaleX(0)") : "none", opacity: menuOpen && i === 1 ? 0 : 1 }} />
              ))}
            </button>
          )}
        </nav>

        {isMobile && menuOpen && (
          <div style={{ position: "absolute", top: "calc(100% + 10px)", left: 16, right: 16, background: "rgba(255,255,255,0.98)", backdropFilter: "blur(20px)", borderRadius: 20, border: "1px solid rgba(255,140,0,0.2)", padding: "16px", boxShadow: "0 20px 60px rgba(0,0,0,0.3)", animation: "mobileMenuIn 0.35s cubic-bezier(0.34,1.56,0.64,1) both" }}>
            {["",""].map((item) => (
              <div key={item} className="mobile-menu-item" style={{ padding: "14px 12px", borderBottom: "1px solid rgba(255,140,0,0.08)", color: "#000", fontSize: 14, fontWeight: 300, letterSpacing: "0.04em" }}>{item}</div>
            ))}
            <div className="mobile-menu-item" style={{ display: "flex", gap: 8, marginTop: 14 }}>
              {/* <button className="outline-btn" style={{ flex: 1, fontSize: 12, padding: "10px 0", borderRadius: 50, color: "#333", border: "1px solid rgba(0,0,0,0.15)" }} onClick={openModal}>Sign In</button> */}
              <RippleBtn className="cta-btn" style={{ flex: 1, fontSize: 12, padding: "10px 0", borderRadius: 50 }} onClick={openModal}>Get Access</RippleBtn>
            </div>
          </div>
        )}
      </div>

      {/* ── SMOOTH SCROLL WRAPPER ── */}
      <div ref={wrapRef} style={{ position: "fixed", top: 0, left: 0, right: 0, willChange: "transform" }}>
        <div style={{ minHeight: "100vh", overflowX: "hidden", background: "#000000", color: "#fff", ...mono }}>
          {/* Hero Section */}
          <HeroSection
            typed={typed}
            heroImgRef={heroImgRef}
            isMobile={isMobile}
            openModal={openModal}
            orb1Ref={orb1Ref}
            orb2Ref={orb2Ref}
            HERO_IMG={HERO_IMG}
          />

          {/* Marquee */}
          <div style={{ background: "#000000" }}>
            <Marquee items={marqueeItems} />
            <Marquee items={marqueeItems2} reverse />
          </div>

          {/* Features Section */}
          <FeaturesSection
            features={features}
            activeFeature={activeFeature}
            setActiveFeature={setActiveFeature}
            isMobile={isMobile}
            isTablet={isTablet}
            openModal={openModal}
          />

          {/* Capabilities Section */}
          <CapabilitiesSection
            capabilities={capabilities}
            hoveredCap={hoveredCap}
            setHoveredCap={setHoveredCap}
            isMobile={isMobile}
          />

          {/* Scale & Brand Sections */}
          <ScaleAndBrandSection
            stats={stats}
            isMobile={isMobile}
            openModal={openModal}
          />

          {/* CTA Section */}
          <CTASection
            isMobile={isMobile}
              openModal={openModal}
            BOTTOM_IMG={BOTTOM_IMG}
          />

          {/* Scroll to Top Button */}
          <button
            className="scroll-top-btn"
            onClick={() => { targetY.current = 0; }}
            style={{ position: "fixed", bottom: 28, right: 28, zIndex: 10001, width: 46, height: 46, borderRadius: "50%", background: "linear-gradient(135deg,#FF8C00,#FF4500)", border: "none", color: "white", fontSize: 18, display: "flex", alignItems: "center", justifyContent: "center", opacity: showTop ? 1 : 0, pointerEvents: showTop ? "auto" : "none", transition: "opacity 0.55s cubic-bezier(.22,1,.36,1), transform 0.55s cubic-bezier(.22,1,.36,1)", transform: showTop ? "scale(1)" : "scale(0.55)", boxShadow: "0 4px 26px rgba(255,140,0,0.5)" }}>↑</button>
        </div>
      </div>
    </div>
  );
}
