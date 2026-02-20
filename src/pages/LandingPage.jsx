import { useState, useEffect, useRef, useCallback } from "react";

const HERO_IMG = "/hero.jpeg";
const BOTTOM_IMG = "/hero.jpeg";

// ── SMOOTH SCROLL ENGINE (lerp-based, ~60fps) ──────────────────────────────
function useSmoothScroll(lerpFactor = 0.072) {
  const currentY = useRef(0);
  const targetY  = useRef(0);
  const rafId    = useRef(null);
  const wrapRef  = useRef(null);

  useEffect(() => {
    const wrap = wrapRef.current;
    if (!wrap) return;

    const setHeight = () => {
      document.body.style.height = wrap.scrollHeight + "px";
    };
    setHeight();
    const ro = new ResizeObserver(setHeight);
    ro.observe(wrap);

    const onWheel = (e) => {
      e.preventDefault();
      targetY.current += e.deltaY * 0.9;
      targetY.current = Math.max(0, Math.min(targetY.current, document.body.scrollHeight - window.innerHeight));
    };

    window.addEventListener("wheel", onWheel, { passive: false });

    const tick = () => {
      currentY.current += (targetY.current - currentY.current) * lerpFactor;
      if (Math.abs(targetY.current - currentY.current) < 0.1) {
        currentY.current = targetY.current;
      }
      wrap.style.transform = `translateY(${-currentY.current}px)`;
      window._smoothY = currentY.current;
      rafId.current = requestAnimationFrame(tick);
    };
    rafId.current = requestAnimationFrame(tick);

    const onKeyDown = (e) => {
      const d = { ArrowDown: 120, ArrowUp: -120, PageDown: window.innerHeight * 0.85, PageUp: -window.innerHeight * 0.85, End: 999999, Home: -999999 };
      if (d[e.key]) {
        e.preventDefault();
        targetY.current = Math.max(0, Math.min(targetY.current + d[e.key], document.body.scrollHeight - window.innerHeight));
      }
    };
    window.addEventListener("keydown", onKeyDown);

    // Touch support
    let touchStartY = 0;
    const onTouchStart = (e) => { touchStartY = e.touches[0].clientY; };
    const onTouchMove = (e) => {
      const dy = touchStartY - e.touches[0].clientY;
      touchStartY = e.touches[0].clientY;
      targetY.current = Math.max(0, Math.min(targetY.current + dy * 1.2, document.body.scrollHeight - window.innerHeight));
    };
    window.addEventListener("touchstart", onTouchStart, { passive: true });
    window.addEventListener("touchmove", onTouchMove, { passive: true });

    return () => {
      ro.disconnect();
      window.removeEventListener("wheel", onWheel);
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("touchstart", onTouchStart);
      window.removeEventListener("touchmove", onTouchMove);
      cancelAnimationFrame(rafId.current);
      document.body.style.height = "";
    };
  }, [lerpFactor]);

  return { wrapRef, currentY, targetY };
}

// ── SCROLL PROGRESS ─────────────────────────────────────────────────────────
function useScrollProgress(currentY) {
  const [progress, setProgress] = useState(0);
  useEffect(() => {
    let raf;
    const update = () => {
      const max = document.body.scrollHeight - window.innerHeight;
      setProgress(max > 0 ? (currentY.current / max) * 100 : 0);
      raf = requestAnimationFrame(update);
    };
    raf = requestAnimationFrame(update);
    return () => cancelAnimationFrame(raf);
  }, [currentY]);
  return progress;
}

// ── VIEWPORT SIZE HOOK ───────────────────────────────────────────────────────
function useViewport() {
  const [vp, setVp] = useState({ w: typeof window !== 'undefined' ? window.innerWidth : 1200, h: typeof window !== 'undefined' ? window.innerHeight : 800 });
  useEffect(() => {
    const update = () => setVp({ w: window.innerWidth, h: window.innerHeight });
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);
  return vp;
}

// ── MAGNETIC CURSOR ──────────────────────────────────────────────────────────
function MagneticCursor() {
  const cursorRef = useRef(null);
  const dotRef    = useRef(null);
  const pos       = useRef({ x: -100, y: -100 });
  const target    = useRef({ x: -100, y: -100 });
  const scale     = useRef(1);
  const scaleT    = useRef(1);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    setIsMobile(window.innerWidth < 768 || 'ontouchstart' in window);
  }, []);

  useEffect(() => {
    if (isMobile) return;
    const move = (e) => { target.current = { x: e.clientX, y: e.clientY }; };
    window.addEventListener("mousemove", move);

    const over = (e) => {
      if (e.target.closest("button, a, [data-magnetic]")) {
        scaleT.current = 2.2;
        cursorRef.current && (cursorRef.current.style.mixBlendMode = "difference");
      }
    };
    const out = () => {
      scaleT.current = 1;
      cursorRef.current && (cursorRef.current.style.mixBlendMode = "normal");
    };
    window.addEventListener("mouseover", over);
    window.addEventListener("mouseout", out);

    let raf;
    const tick = () => {
      pos.current.x += (target.current.x - pos.current.x) * 0.13;
      pos.current.y += (target.current.y - pos.current.y) * 0.13;
      scale.current += (scaleT.current - scale.current) * 0.14;

      if (cursorRef.current) {
        cursorRef.current.style.transform = `translate(${pos.current.x - 18}px, ${pos.current.y - 18}px) scale(${scale.current})`;
      }
      if (dotRef.current) {
        dotRef.current.style.transform = `translate(${target.current.x - 3}px, ${target.current.y - 3}px)`;
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    return () => {
      window.removeEventListener("mousemove", move);
      window.removeEventListener("mouseover", over);
      window.removeEventListener("mouseout", out);
      cancelAnimationFrame(raf);
    };
  }, [isMobile]);

  if (isMobile) return null;

  return (
    <>
      <div ref={cursorRef} style={{ position: "fixed", width: 36, height: 36, borderRadius: "50%", border: "1.5px solid rgba(255,140,0,0.75)", pointerEvents: "none", zIndex: 99999, willChange: "transform", transition: "opacity 0.3s", top: 0, left: 0 }} />
      <div ref={dotRef}    style={{ position: "fixed", width: 6,  height: 6,  borderRadius: "50%", background: "#FF8C00", pointerEvents: "none", zIndex: 99999, willChange: "transform", top: 0, left: 0 }} />
    </>
  );
}

// ── INTERSECTION OBSERVER HOOK ───────────────────────────────────────────────
function useInView(threshold = 0.1) {
  const ref = useRef(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setInView(true); }, { threshold });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);
  return [ref, inView];
}

// ── REVEAL COMPONENT ─────────────────────────────────────────────────────────
function Reveal({ children, delay = 0, from = "bottom", style = {} }) {
  const [ref, inView] = useInView(0.08);
  const transforms = {
    bottom: `translateY(${inView ? 0 : 60}px)`,
    left:   `translateX(${inView ? 0 : -60}px)`,
    right:  `translateX(${inView ? 0 : 60}px)`,
    scale:  `scale(${inView ? 1 : 0.88})`,
    none:   "none",
  };
  return (
    <div ref={ref} style={{
      ...style,
      opacity: inView ? 1 : 0,
      transform: transforms[from] || transforms.bottom,
      transition: `opacity 1.3s cubic-bezier(0.16,1,0.3,1) ${delay}s, transform 1.3s cubic-bezier(0.16,1,0.3,1) ${delay}s`,
    }}>
      {children}
    </div>
  );
}

// ── CHAR-BY-CHAR REVEAL ──────────────────────────────────────────────────────
function SplitReveal({ text, className, style = {}, delay = 0, tag = "h2" }) {
  const [ref, inView] = useInView(0.15);
  const Tag = tag;
  const words = text.split(" ");
  return (
    <Tag ref={ref} style={{ ...style, overflow: "hidden", display: "flex", flexWrap: "wrap", gap: "0 0.28em" }}>
      {words.map((word, wi) => (
        <span key={wi} style={{ display: "inline-block", overflow: "hidden" }}>
          <span className={className} style={{
            display: "inline-block",
            opacity: inView ? 1 : 0,
            transform: inView ? "translateY(0)" : "translateY(110%)",
            transition: `opacity 1.1s cubic-bezier(0.16,1,0.3,1) ${delay + wi * 0.07}s, transform 1.1s cubic-bezier(0.16,1,0.3,1) ${delay + wi * 0.07}s`,
          }}>
            {word}
          </span>
        </span>
      ))}
    </Tag>
  );
}

// ── ANIMATED COUNTER ─────────────────────────────────────────────────────────
function Counter({ target, suffix = "", duration = 2200 }) {
  const [val, setVal]   = useState(0);
  const [ref, inView]   = useInView(0.5);
  const started         = useRef(false);

  useEffect(() => {
    if (!inView || started.current) return;
    started.current = true;
    const start = performance.now();
    const isFloat = String(target).includes(".");
    const numTarget = parseFloat(target);

    const tick = (now) => {
      const p = Math.min((now - start) / duration, 1);
      const ease = 1 - Math.pow(1 - p, 4);
      const cur = numTarget * ease;
      setVal(isFloat ? cur.toFixed(1) : Math.round(cur));
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [inView, target, duration]);

  return <span ref={ref}>{val}{suffix}</span>;
}

// ── 3D TILT CARD ─────────────────────────────────────────────────────────────
function TiltCard({ children, style = {}, className = "" }) {
  const ref = useRef(null);
  const onMove = useCallback((e) => {
    const el = ref.current; if (!el) return;
    const { left, top, width, height } = el.getBoundingClientRect();
    const x = ((e.clientX - left) / width  - 0.5) * 20;
    const y = ((e.clientY - top)  / height - 0.5) * -20;
    el.style.transform = `perspective(800px) rotateX(${y}deg) rotateY(${x}deg) translateY(-8px)`;
    el.style.boxShadow = `${-x * 1.2}px ${y * 1.2}px 48px rgba(255,140,0,0.18)`;
  }, []);
  const onLeave = useCallback(() => {
    const el = ref.current; if (!el) return;
    el.style.transform = "perspective(800px) rotateX(0) rotateY(0) translateY(0)";
    el.style.boxShadow = "";
  }, []);

  return (
    <div ref={ref} className={className} style={{ ...style, transition: "transform 0.6s cubic-bezier(0.22,1,0.36,1), box-shadow 0.6s cubic-bezier(0.22,1,0.36,1)", willChange: "transform" }}
      onMouseMove={onMove} onMouseLeave={onLeave}>
      {children}
    </div>
  );
}

// ── PARALLAX LAYER ───────────────────────────────────────────────────────────
function useParallax(speed = 0.15, currentY) {
  const ref    = useRef(null);
  const offset = useRef(0);
  useEffect(() => {
    let raf;
    const tick = () => {
      const y = currentY ? currentY.current : (window._smoothY || window.scrollY);
      const el = ref.current;
      if (el) {
        offset.current += (y * speed - offset.current) * 0.08;
        el.style.transform = `translateY(${offset.current}px)`;
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [speed, currentY]);
  return ref;
}

// ── STAGGER REVEAL GRID ──────────────────────────────────────────────────────
function StaggerGrid({ children, cols = 3, gap = 14 }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: `repeat(${cols}, 1fr)`, gap }}>
      {children}
    </div>
  );
}

// ── GLITCH TEXT ──────────────────────────────────────────────────────────────
function GlitchText({ text, style = {} }) {
  return (
    <span className="glitch-text" data-text={text} style={style}>{text}</span>
  );
}

// ── MARQUEE ──────────────────────────────────────────────────────────────────
function Marquee({ items, reverse = false }) {
  return (
    <div style={{ overflow: "hidden", whiteSpace: "nowrap", padding: "18px 0", borderTop: "1px solid rgba(255,140,0,0.12)", borderBottom: "1px solid rgba(255,140,0,0.12)", background: "rgba(255,140,0,0.03)" }}>
      <div style={{ display: "inline-flex", animation: `marqueeScroll${reverse ? 'R' : ''} 22s linear infinite`, gap: 0 }}>
        {[...items, ...items].map((item, i) => (
          <span key={i} style={{ fontSize: 11, fontFamily: "'Roboto Mono', monospace", color: "rgba(255,140,0,0.5)", letterSpacing: "0.18em", textTransform: "uppercase", padding: "0 42px", fontWeight: 300 }}>
            {item} <span style={{ color: "rgba(255,140,0,0.25)" }}>◆</span>
          </span>
        ))}
      </div>
    </div>
  );
}

// ── ANIMATED GRID BG ─────────────────────────────────────────────────────────
function GridBg({ opacity = 0.04 }) {
  return (
    <div style={{ position: "absolute", inset: 0, pointerEvents: "none", overflow: "hidden" }}>
      <div style={{ position: "absolute", inset: 0, backgroundImage: `linear-gradient(rgba(255,140,0,${opacity}) 1px, transparent 1px), linear-gradient(90deg, rgba(255,140,0,${opacity}) 1px, transparent 1px)`, backgroundSize: "64px 64px" }} />
    </div>
  );
}

// ── RIPPLE BUTTON ────────────────────────────────────────────────────────────
function RippleBtn({ children, className, style = {}, onClick }) {
  const [ripples, setRipples] = useState([]);
  const handleClick = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const id = Date.now();
    setRipples(r => [...r, { id, x, y }]);
    setTimeout(() => setRipples(r => r.filter(rp => rp.id !== id)), 700);
    onClick && onClick(e);
  };
  return (
    <button className={className} style={{ ...style, position: "relative", overflow: "hidden" }} onClick={handleClick}>
      {children}
      {ripples.map(rp => (
        <span key={rp.id} style={{ position: "absolute", left: rp.x, top: rp.y, width: 0, height: 0, borderRadius: "50%", background: "rgba(255,255,255,0.3)", transform: "translate(-50%,-50%)", animation: "rippleAnim 0.7s ease-out forwards", pointerEvents: "none" }} />
      ))}
    </button>
  );
}

// ────────────────────────────────────────────────────────────────────────────
// MAIN COMPONENT
// ────────────────────────────────────────────────────────────────────────────
export default function Landingg() {
  const [typed, setTyped]             = useState("");
  const [promptIdx, setPromptIdx]     = useState(0);
  const [activeFeature, setActiveFeature] = useState(0);
  const [showTop, setShowTop]         = useState(false);
  const [hoveredCap, setHoveredCap]   = useState(null);
  const [navScrolled, setNavScrolled] = useState(false);
  const [menuOpen, setMenuOpen]       = useState(false);

  const { wrapRef, currentY, targetY } = useSmoothScroll(0.072);
  const scrollProgress = useScrollProgress(currentY);
  const { w } = useViewport();

  const isMobile  = w < 640;
  const isTablet  = w < 1024;

  // Parallax refs
  const heroImgRef   = useParallax(0.18, currentY);
  const orb1Ref      = useParallax(0.08, currentY);
  const orb2Ref      = useParallax(-0.06, currentY);

  const prompts = [
    "Design a bold streetwear e-commerce site.",
    "Build a SaaS dashboard for analytics startups.",
    "Create a luxury travel agency website.",
    "Generate a minimal portfolio for a photographer.",
  ];

  useEffect(() => {
    let raf;
    const tick = () => {
      const y = currentY.current;
      setShowTop(y > 500);
      setNavScrolled(y > 60);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [currentY]);

  // Typewriter
  useEffect(() => {
    let i = 0;
    setTyped("");
    const full = prompts[promptIdx];
    const iv = setInterval(() => {
      if (i <= full.length) { setTyped(full.slice(0, i)); i++; }
      else { clearInterval(iv); setTimeout(() => setPromptIdx(p => (p + 1) % prompts.length), 2400); }
    }, 46);
    return () => clearInterval(iv);
  }, [promptIdx]);

  const features = [
    {
      tag: "Prompt to Site", title: "Generate", icon: "✦",
      desc: "Start with a single sentence. Aakaar builds a complete, professional website — pages, sections, copy — tailored to your idea in seconds.",
      preview: (
        <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,140,0,0.18)", borderRadius: 20, padding: 26 }}>
          <div style={{ display: "flex", gap: 6, marginBottom: 18 }}>
            {["#f87171","#fbbf24","#4ade80"].map(c => <div key={c} style={{ width: 9, height: 9, borderRadius: "50%", background: c }} />)}
          </div>
          <div style={{ background: "rgba(255,140,0,0.08)", borderRadius: 12, padding: "11px 14px", marginBottom: 14, fontSize: 12, color: "#FF8C00", border: "1px solid rgba(255,140,0,0.25)", fontFamily: "inherit" }}>
            "Build me a modern SaaS landing page..."
          </div>
          {["Hero Section","Features Grid","Pricing Table","FAQ"].map((s,i) => (
            <div key={s} style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 12, color: "rgba(255,255,255,0.45)", padding: "7px 0", borderBottom: "1px solid rgba(255,255,255,0.05)", opacity: 0, animation: `fadeSlide 0.5s cubic-bezier(0.22,1,0.36,1) ${0.1 + i * 0.12}s forwards` }}>
              <div style={{ width: 5, height: 5, borderRadius: "50%", background: "#FF8C00", flexShrink: 0 }} />{s}
              <div style={{ marginLeft: "auto", width: 56, height: 3, borderRadius: 3, background: "rgba(255,140,0,0.18)" }} />
            </div>
          ))}
          <div style={{ marginTop: 16, background: "rgba(255,140,0,0.1)", border: "1px solid rgba(255,140,0,0.28)", borderRadius: 10, padding: "9px 14px", fontSize: 12, color: "#FF8C00", textAlign: "center" }}>
            ✓ Site generated in 4.2s
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
          <button style={{ marginTop: 16, width: "100%", background: "linear-gradient(135deg,#FF8C00,#FF5500)", borderRadius: 12, padding: "11px 0", fontSize: 12, color: "#fff", border: "none", cursor: "pointer", fontFamily: "inherit" }}>
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

  // Responsive grid cols
  const capCols = isMobile ? "1fr" : isTablet ? "1fr 1fr" : "repeat(3,1fr)";
  const statCols = isMobile ? "1fr 1fr" : "repeat(4,1fr)";
  const brandCols = isMobile ? "1fr" : "1fr 1fr";
  const scaleCols = isMobile ? "1fr" : "1fr 1fr";
  const featureCols = isMobile || isTablet ? "1fr" : "1fr 1fr";

  return (
    <div style={{ ...mono, cursor: isMobile ? "auto" : "none" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Roboto+Mono:wght@300;400;500;600&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        html { overflow: hidden; }
        body { overflow: hidden; font-family: 'Roboto Mono', monospace; -webkit-font-smoothing: antialiased; cursor: none; }

        @keyframes shimmer      { 0%{background-position:-200% 0} 100%{background-position:200% 0} }
        @keyframes gradShift    { 0%{background-position:0% 50%} 50%{background-position:100% 50%} 100%{background-position:0% 50%} }
        @keyframes blink        { 0%,49%{opacity:1} 50%,100%{opacity:0} }
        @keyframes floatUp      { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-16px)} }
        @keyframes pulseGlow    { 0%,100%{box-shadow:0 0 0 0 rgba(255,140,0,0.42)} 50%{box-shadow:0 0 0 14px rgba(255,140,0,0)} }
        @keyframes rotate360    { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
        @keyframes rotateRev    { from{transform:rotate(360deg)} to{transform:rotate(0deg)} }
        @keyframes fadeSlide    { from{opacity:0;transform:translateX(-12px)} to{opacity:1;transform:translateX(0)} }
        @keyframes scaleIn      { from{opacity:0;transform:scale(0.5)} to{opacity:1;transform:scale(1)} }
        @keyframes borderPulse  { 0%,100%{border-color:rgba(255,140,0,0.4)} 50%{border-color:rgba(255,140,0,0.9)} }
        @keyframes progressBar  { from{background-position:0% 50%} to{background-position:100% 50%} }
        @keyframes orbFloat     { 0%,100%{transform:scale(1) translateY(0)} 50%{transform:scale(1.08) translateY(-20px)} }
        @keyframes navSlideDown { from{opacity:0;transform:translateY(-16px)} to{opacity:1;transform:translateY(0)} }
        @keyframes dotPing      { 0%{transform:scale(1);opacity:1} 100%{transform:scale(2.4);opacity:0} }
        @keyframes lineGrow     { from{transform:scaleX(0)} to{transform:scaleX(1)} }
        @keyframes marqueeScroll{ from{transform:translateX(0)} to{transform:translateX(-50%)} }
        @keyframes marqueeScrollR{ from{transform:translateX(-50%)} to{transform:translateX(0)} }
        @keyframes rippleAnim   { 0%{width:0;height:0;opacity:0.6} 100%{width:300px;height:300px;opacity:0} }
        @keyframes slideUpFade  { from{opacity:0;transform:translateY(30px)} to{opacity:1;transform:translateY(0)} }
        @keyframes glitchMove1  { 0%,100%{clip-path:inset(0 0 90% 0);transform:translate(-3px,0)} 20%{clip-path:inset(30% 0 50% 0);transform:translate(3px,0)} 40%{clip-path:inset(70% 0 10% 0);transform:translate(-2px,0)} 60%{clip-path:inset(10% 0 80% 0);transform:translate(2px,0)} 80%{clip-path:inset(50% 0 30% 0);transform:translate(-1px,0)} }
        @keyframes glitchMove2  { 0%,100%{clip-path:inset(80% 0 5% 0);transform:translate(3px,0)} 25%{clip-path:inset(20% 0 60% 0);transform:translate(-3px,0)} 50%{clip-path:inset(60% 0 20% 0);transform:translate(2px,0)} 75%{clip-path:inset(5% 0 85% 0);transform:translate(-2px,0)} }
        @keyframes scanLine     { 0%{transform:translateY(-100%)} 100%{transform:translateY(100vh)} }
        @keyframes typewriterBar{ 0%,100%{opacity:1} 50%{opacity:0} }
        @keyframes heroEntrance { 0%{opacity:0;transform:scale(1.08) translateY(20px)} 100%{opacity:1;transform:scale(1) translateY(0)} }
        @keyframes iconBob      { 0%,100%{transform:translateY(0) rotate(0deg)} 50%{transform:translateY(-6px) rotate(5deg)} }
        @keyframes tagEntrance  { 0%{opacity:0;transform:translateY(20px) scale(0.9)} 100%{opacity:1;transform:translateY(0) scale(1)} }
        @keyframes navGlow      { 0%,100%{box-shadow:0 8px 40px rgba(0,0,0,0.55),0 0 0 0.5px rgba(255,140,0,0.08)} 50%{box-shadow:0 8px 40px rgba(0,0,0,0.55),0 0 0 0.5px rgba(255,140,0,0.2),0 0 30px rgba(255,140,0,0.06)} }
        @keyframes mobileMenuIn { from{opacity:0;transform:translateY(-20px) scale(0.96)} to{opacity:1;transform:translateY(0) scale(1)} }
        @keyframes statsFloat   { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-5px)} }
        @keyframes cardReveal   { from{opacity:0;transform:perspective(600px) rotateY(20deg) translateX(40px)} to{opacity:1;transform:perspective(600px) rotateY(0deg) translateX(0)} }
        @keyframes dash         { from{stroke-dashoffset:176} to{stroke-dashoffset:0} }
        @keyframes shimmerBg    { 0%{background-position:200% center} 100%{background-position:-200% center} }

        .glitch-text { position: relative; }
        .glitch-text::before, .glitch-text::after {
          content: attr(data-text);
          position: absolute;
          top: 0; left: 0;
          background: inherit;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        .glitch-text:hover::before { animation: glitchMove1 0.4s steps(1) infinite; color: #ff0000; -webkit-text-fill-color: #ff4400; }
        .glitch-text:hover::after  { animation: glitchMove2 0.4s steps(1) infinite; color: #0000ff; -webkit-text-fill-color: #FFB347; }

        .orange-text {
          background: linear-gradient(130deg, #FF8C00 0%, #FFB347 50%, #FF5500 100%);
          background-size: 200% 200%;
          animation: gradShift 4s ease infinite;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .cta-btn {
          font-family: 'Roboto Mono', monospace;
          background: linear-gradient(90deg, #FF8C00 0%, #FF5500 50%, #FF8C00 100%);
          background-size: 200% 100%;
          animation: shimmer 3.5s linear infinite;
          border: none; cursor: none; color: #fff;
          font-weight: 500; letter-spacing: 0.05em;
          transition: transform 0.45s cubic-bezier(.22,1,.36,1), box-shadow 0.45s;
        }
        .cta-btn:hover { transform: translateY(-4px) scale(1.03); box-shadow: 0 20px 50px rgba(255,140,0,0.45); }

        .outline-btn {
          font-family: 'Roboto Mono', monospace;
          background: transparent; border: 1px solid rgba(255,255,255,0.2);
          color: rgba(255,255,255,0.65); cursor: none; font-weight: 300; letter-spacing: 0.04em;
          transition: border-color 0.35s, color 0.35s, transform 0.35s, background 0.35s;
        }
        .outline-btn:hover { border-color: #FF8C00; color: #FF8C00; transform: translateY(-2px); background: rgba(255,140,0,0.06); }

        .dark-card {
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,140,0,0.1);
          border-radius: 18px;
          transition: border-color 0.5s, transform 0.5s cubic-bezier(0.22,1,0.36,1), box-shadow 0.5s;
        }
        .dark-card:hover { border-color: rgba(255,140,0,0.35); transform: translateY(-6px); box-shadow: 0 24px 60px rgba(255,140,0,0.1); }

        .light-card {
          background: #ffffff;
          border: 1px solid rgba(0,0,0,0.06);
          border-radius: 18px;
          transition: box-shadow 0.5s, transform 0.5s cubic-bezier(0.22,1,0.36,1);
        }
        .light-card:hover { box-shadow: 0 28px 66px rgba(255,140,0,0.12); transform: translateY(-4px); }

        .tab-btn {
          font-family: 'Roboto Mono', monospace; font-weight: 300;
          letter-spacing: 0.05em; cursor: none;
          transition: all 0.4s cubic-bezier(.22,1,.36,1);
          position: relative; overflow: hidden;
        }
        .tab-btn::after {
          content: ''; position: absolute; bottom: 0; left: 0; right: 0;
          height: 100%; background: rgba(255,140,0,0.08);
          transform: translateY(100%); transition: transform 0.4s cubic-bezier(.22,1,.36,1);
        }
        .tab-btn:hover::after { transform: translateY(0); }

        .nav-link {
          color: black; text-decoration: none;
          font-family: 'Roboto Mono', monospace; font-weight: 300; font-size: 13px;
          letter-spacing: 0.04em; transition: color 0.3s; cursor: none; position: relative;
        }
        .nav-link::after {
          content: ''; position: absolute; bottom: -3px; left: 0; right: 0; height: 1px;
          background: #FF8C00; transform: scaleX(0); transform-origin: right;
          transition: transform 0.4s cubic-bezier(.22,1,.36,1);
        }
        .nav-link:hover { color: #FF8C00; }
        .nav-link:hover::after { transform: scaleX(1); transform-origin: left; }

        a { font-family: 'Roboto Mono', monospace; cursor: none; }
        a:hover { color: #FF8C00 !important; }
        button { cursor: none; }

        .fade-top    { position: absolute; top: 0; left: 0; right: 0; height: 180px; pointer-events: none; z-index: 2; }
        .fade-bottom { position: absolute; bottom: 0; left: 0; right: 0; height: 220px; pointer-events: none; z-index: 2; }

        .float-anim  { animation: floatUp 7.5s ease-in-out infinite; }
        .orb-float   { animation: orbFloat 9s ease-in-out infinite; }
        .scroll-top-btn { animation: pulseGlow 2.8s ease infinite; cursor: none; }
        .spin-slow   { animation: rotate360 22s linear infinite; }
        .spin-rev    { animation: rotateRev 30s linear infinite; }

        .cap-card-icon { animation: iconBob 3s ease-in-out infinite; display: inline-block; }
        .hero-entrance { animation: heroEntrance 1.2s cubic-bezier(0.16,1,0.3,1) both; }

        .scan-overlay {
          position: fixed; top: 0; left: 0; right: 0; bottom: 0;
          pointer-events: none; z-index: 99998; overflow: hidden;
        }
        .scan-overlay::after {
          content: '';
          position: absolute;
          left: 0; right: 0; height: 2px;
          background: linear-gradient(90deg, transparent, rgba(255,140,0,0.15), transparent);
          animation: scanLine 8s linear infinite;
        }

        .stat-card { animation: statsFloat 4s ease-in-out infinite; }
        .stat-card:nth-child(2) { animation-delay: 0.5s; }
        .stat-card:nth-child(3) { animation-delay: 1s; }
        .stat-card:nth-child(4) { animation-delay: 1.5s; }

        .prompt-tag { animation: tagEntrance 0.6s cubic-bezier(0.34,1.56,0.64,1) both; }
        .prompt-tag:nth-child(1){animation-delay:0.6s}
        .prompt-tag:nth-child(2){animation-delay:0.72s}
        .prompt-tag:nth-child(3){animation-delay:0.84s}
        .prompt-tag:nth-child(4){animation-delay:0.96s}

        .mobile-menu-item { animation: slideUpFade 0.4s cubic-bezier(0.16,1,0.3,1) both; }
        .mobile-menu-item:nth-child(1){animation-delay:0.05s}
        .mobile-menu-item:nth-child(2){animation-delay:0.1s}
        .mobile-menu-item:nth-child(3){animation-delay:0.15s}
        .mobile-menu-item:nth-child(4){animation-delay:0.2s}

        ::-webkit-scrollbar { display: none; }

        @media (max-width: 768px) {
          body { cursor: auto; }
          .nav-link::after { display: none; }
        }
      `}</style>

      {/* ── SCAN LINE OVERLAY ── */}
      <div className="scan-overlay" />

      {/* ── MAGNETIC CURSOR ── */}
      <MagneticCursor />

      {/* ── SCROLL PROGRESS BAR ── */}
      <div style={{ position: "fixed", top: 0, left: 0, right: 0, height: 2.5, zIndex: 9999, background: "rgba(255,140,0,0.12)" }}>
        <div style={{ height: "100%", width: `${scrollProgress}%`, background: "linear-gradient(90deg,#FF5500,#FF8C00,#FFB347)", backgroundSize: "200% 100%", animation: "progressBar 2s linear infinite", transition: "width 0.1s linear", boxShadow: "0 0 12px rgba(255,140,0,0.7)" }} />
      </div>

      {/* ── NAVBAR ── */}
      <div style={{ position: "fixed", top: 18, left: 0, right: 0, zIndex: 10000, display: "flex", justifyContent: "center", padding: "0 16px", animation: "navSlideDown 0.8s cubic-bezier(0.16,1,0.3,1) 0.2s both" }}>
        <nav style={{ borderRadius: 50, display: "flex", alignItems: "center", justifyContent: "space-between", padding: isMobile ? "10px 18px" : "11px 26px", width: "100%", maxWidth: 800, background: navScrolled ? "rgba(255,255,255,0.35)" : "rgba(255,255,255,0.25)", backdropFilter: "blur(20px) saturate(160%)", WebkitBackdropFilter: "blur(20px)", border: "1px solid rgba(255,140,0,0.18)", boxShadow: "0 8px 40px rgba(0,0,0,0.55), 0 0 0 0.5px rgba(255,140,0,0.08)", transition: "background 0.4s, box-shadow 0.4s", animation: "navGlow 4s ease infinite" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 30, height: 30, borderRadius: 9, background: "linear-gradient(135deg,#FF8C00,#FF4500)", display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontWeight: 600, fontSize: 14, boxShadow: "0 4px 14px rgba(255,140,0,0.45)", transition: "transform 0.4s", flexShrink: 0 }}
              onMouseEnter={e => e.currentTarget.style.transform = "rotate(15deg) scale(1.1)"}
              onMouseLeave={e => e.currentTarget.style.transform = ""}>A</div>
            <span style={{ fontWeight: 500, fontSize: 15, color: "black", letterSpacing: "0.01em" }}>Aakaar.io</span>
          </div>

          {/* Desktop nav links */}
          {!isMobile && (
            <div style={{ display: "flex", alignItems: "center", gap: 30 }}>
              {["Features","Docs"].map(item => <a key={item} href="#" className="nav-link">{item}</a>)}
            </div>
          )}

          {/* Desktop buttons */}
          {!isMobile ? (
            <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
              <button className="outline-btn" style={{ fontSize: 12, padding: "7px 18px", borderRadius: 50 }}>Sign In</button>
              <RippleBtn className="cta-btn" style={{ fontSize: 12, padding: "8px 20px", borderRadius: 50 }}>Get Early Access</RippleBtn>
            </div>
          ) : (
            /* Hamburger */
            <button onClick={() => setMenuOpen(o => !o)} style={{ width: 36, height: 36, borderRadius: 10, background: "rgba(255,140,0,0.1)", border: "1px solid rgba(255,140,0,0.25)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 5, padding: 8, transition: "all 0.3s", cursor: "pointer" }}>
              {[0,1,2].map(i => (
                <span key={i} style={{ display: "block", width: "100%", height: 1.5, background: "#FF8C00", borderRadius: 2, transition: "all 0.3s", transform: menuOpen ? (i === 0 ? "translateY(6.5px) rotate(45deg)" : i === 2 ? "translateY(-6.5px) rotate(-45deg)" : "scaleX(0)") : "none", opacity: menuOpen && i === 1 ? 0 : 1 }} />
              ))}
            </button>
          )}
        </nav>

        {/* Mobile menu */}
        {isMobile && menuOpen && (
          <div style={{ position: "absolute", top: "calc(100% + 10px)", left: 16, right: 16, background: "rgba(255,255,255,0.98)", backdropFilter: "blur(20px)", borderRadius: 20, border: "1px solid rgba(255,140,0,0.2)", padding: "16px", boxShadow: "0 20px 60px rgba(0,0,0,0.3)", animation: "mobileMenuIn 0.35s cubic-bezier(0.34,1.56,0.64,1) both" }}>
            {["Features","Docs"].map((item, i) => (
              <div key={item} className="mobile-menu-item" style={{ padding: "14px 12px", borderBottom: "1px solid rgba(255,140,0,0.08)", color: "#000", fontSize: 14, fontWeight: 300, letterSpacing: "0.04em" }}>{item}</div>
            ))}
            <div className="mobile-menu-item" style={{ display: "flex", gap: 8, marginTop: 14 }}>
              <button className="outline-btn" style={{ flex: 1, fontSize: 12, padding: "10px 0", borderRadius: 50, color: "#333", border: "1px solid rgba(0,0,0,0.15)" }}>Sign In</button>
              <RippleBtn className="cta-btn" style={{ flex: 1, fontSize: 12, padding: "10px 0", borderRadius: 50 }}>Get Access</RippleBtn>
            </div>
          </div>
        )}
      </div>

      {/* ── SMOOTH SCROLL WRAPPER ── */}
      <div ref={wrapRef} style={{ position: "fixed", top: 0, left: 0, right: 0, willChange: "transform" }}>
        <div style={{ minHeight: "100vh", overflowX: "hidden", background: "#000000", color: "#fff", ...mono }}>

          {/* ════════════════════════════════
              SECTION 1 — HERO
          ════════════════════════════════ */}
          <section id="top" style={{ position: "relative", minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", overflow: "hidden" }}>
            <div ref={heroImgRef} style={{ position: "absolute", inset: "-10%", backgroundImage: `url(${HERO_IMG})`, backgroundSize: "cover", backgroundPosition: "center", willChange: "transform" }} />
            <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, rgba(0,0,0,0.82) 0%, rgba(0,0,0,0.4) 44%, rgba(0,0,0,0.62) 70%, #000000 100%)" }} />
            <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse 65% 44% at 50% 62%, rgba(255,140,0,0.18) 0%, transparent 68%)" }} />
            <GridBg opacity={0.03} />

            {/* Floating orbs */}
            <div ref={orb1Ref} className="orb-float" style={{ position: "absolute", top: "18%", left: isMobile ? "2%" : "8%", width: isMobile ? 160 : 280, height: isMobile ? 160 : 280, borderRadius: "50%", background: "radial-gradient(circle, rgba(255,140,0,0.12) 0%, transparent 68%)", pointerEvents: "none", filter: "blur(2px)" }} />
            <div ref={orb2Ref} className="orb-float" style={{ position: "absolute", bottom: "22%", right: isMobile ? "2%" : "6%", width: isMobile ? 120 : 220, height: isMobile ? 120 : 220, borderRadius: "50%", background: "radial-gradient(circle, rgba(255,80,0,0.1) 0%, transparent 65%)", pointerEvents: "none", animationDelay: "-3s" }} />

            {/* Spinning rings */}
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
                  {isMobile ? "Generate. Launch." : "Generate it.\u00A0"}
                  {!isMobile && <span style={{ color: "#FF8C00", fontWeight: 400 }}>Customize it.</span>}
                  {!isMobile && "\u00A0Launch it."}
                </div>
              </Reveal>

              <Reveal delay={0.1}>
                <h1 style={{ fontSize: isMobile ? "clamp(40px,12vw,64px)" : "clamp(48px,8.5vw,96px)", fontWeight: 300, lineHeight: 1, marginBottom: isMobile ? 18 : 28, color: "white", letterSpacing: "-1px" }}>
                  Idea to{" "}
                  <GlitchText text="website" style={{ fontWeight: 500 }} />
                </h1>
              </Reveal>

              <Reveal delay={0.22}>
                <p style={{ color: "rgba(255,255,255,0.55)", fontSize: isMobile ? "clamp(11px,3.5vw,14px)" : "clamp(12px,1.4vw,15px)", maxWidth: 460, marginBottom: isMobile ? 36 : 52, lineHeight: 1.9, fontWeight: 300, letterSpacing: "0.01em" }}>
                  Type a prompt. Get a full-stack website — with real backend, database, and deployment — in seconds.
                </p>
              </Reveal>

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
                          onMouseLeave={e => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)"; e.currentTarget.style.color = "rgba(255,255,255,0.4)"; }}>
                          {label}
                        </button>
                      ))}
                    </div>
                    <RippleBtn className="cta-btn" style={{ width: 38, height: 38, borderRadius: 50, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16 }}>→</RippleBtn>
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

            {/* Scroll indicator */}
            <div style={{ position: "absolute", bottom: 40, left: "50%", transform: "translateX(-50%)", display: "flex", flexDirection: "column", alignItems: "center", gap: 10, color: "rgba(255,255,255,0.18)", fontSize: 10, letterSpacing: "0.2em", textTransform: "uppercase", animation: "floatUp 2.8s ease-in-out infinite" }}>
              <div style={{ width: 1, height: 46, background: "linear-gradient(to bottom, transparent, rgba(255,140,0,0.6))", animation: "lineGrow 1.5s cubic-bezier(0.22,1,0.36,1) 1s both", transformOrigin: "top" }} />
              scroll
            </div>

            <div className="fade-bottom" style={{ background: "linear-gradient(to bottom, transparent, #000000)" }} />
          </section>

          {/* ── MARQUEE DOUBLE ── */}
          <div style={{ background: "#000000" }}>
            <Marquee items={marqueeItems} />
            <Marquee items={marqueeItems2} reverse />
          </div>

          {/* ════════════════════════════════
              SECTION 2 — HOW IT WORKS
          ════════════════════════════════ */}
          <section style={{ background: "linear-gradient(180deg, #000000 0%, #0a0a0a 45%, #111111 100%)", padding: isMobile ? "100px 16px" : "160px 20px", position: "relative", overflow: "hidden" }}>
            <div style={{ position: "absolute", top: "12%", right: "-6%", width: 520, height: 520, borderRadius: "50%", background: "radial-gradient(circle, rgba(255,140,0,0.06) 0%, transparent 62%)", pointerEvents: "none" }} />
            <GridBg opacity={0.025} />
            <div className="fade-top" style={{ background: "linear-gradient(to bottom, #000000, transparent)" }} />
            <div className="fade-bottom" style={{ background: "linear-gradient(to top, #0d0d0d, transparent)" }} />

            <div style={{ maxWidth: 1060, margin: "0 auto", position: "relative", zIndex: 2 }}>
              <Reveal style={{ textAlign: "center", marginBottom: isMobile ? 48 : 80 }}>
                <p style={{ color: "#FF8C00", fontSize: 11, fontWeight: 400, letterSpacing: "0.22em", textTransform: "uppercase", marginBottom: 18 }}>How It Works</p>
                <SplitReveal text="Build and launch in minutes" style={{ fontSize: isMobile ? "clamp(26px,8vw,40px)" : "clamp(32px,5vw,58px)", fontWeight: 300, color: "#fff", letterSpacing: "-0.5px", justifyContent: "center" }} delay={0.1} />
              </Reveal>

              {/* Tabs */}
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
                  <RippleBtn className="cta-btn" style={{ padding: "13px 32px", borderRadius: 50, fontSize: 12 }}>Get Started →</RippleBtn>
                </Reveal>
                <Reveal delay={0.22} from={isMobile ? "bottom" : "right"}>
                  <div className="float-anim">{features[activeFeature].preview}</div>
                </Reveal>
              </div>
            </div>
          </section>

          {/* ════════════════════════════════
              SECTION 3 — CAPABILITIES
          ════════════════════════════════ */}
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

              <div style={{ display: "grid", gridTemplateColumns: capCols, gap: 14 }}>
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
                {/* <br /> */}
                <br />
                <br />
                <br />
              </div>
            </div>
          </section>

          {/* ════════════════════════════════
              SECTION 4 — SCALE (white)
          ════════════════════════════════ */}
          <section style={{ background: "linear-gradient(180deg, #f5f5f5 0%, #ffffff 35%, #fafafa 100%)", padding: isMobile ? "100px 16px" : "160px 20px", position: "relative", overflow: "hidden" }}>
           <br /> <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse 48% 52% at 76% 48%, rgba(255,140,0,0.06) 0%, transparent 58%)", pointerEvents: "none" }} />
            <div className="fade-top"    style={{ background: "linear-gradient(to bottom, #f5f5f5, transparent)" }} />
            <div className="fade-bottom" style={{ background: "linear-gradient(to top, #ffffff, transparent)" }} />

            <div style={{ maxWidth: 1060, margin: "0 auto", position: "relative", zIndex: 2 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: isMobile ? 48 : 72, flexWrap: "wrap", gap: 28 }}>
                <Reveal from="left">
                  <p style={{ color: "#FF5500", fontSize: 11, fontWeight: 400, letterSpacing: "0.22em", textTransform: "uppercase", marginBottom: 16 }}>Built-In Intelligence</p>
                  <SplitReveal text="Scale without changing platforms" style={{ fontSize: isMobile ? "clamp(22px,6vw,36px)" : "clamp(28px,4.5vw,52px)", fontWeight: 300, color: "#000", letterSpacing: "-0.5px", lineHeight: 1.1 }} delay={0.1} />
                </Reveal>
                <Reveal delay={0.2} from="right">
                  <RippleBtn className="cta-btn" style={{ padding: "14px 32px", borderRadius: 50, fontSize: 12 }}>Get Started →</RippleBtn>
                </Reveal>
              </div>

              {/* Stats */}
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
                          <div style={{ fontSize: isMobile ? 18 : 22, fontWeight: 400, color: "#000", lineHeight: 1 }}>{v}</div>
                        </div>
                      ))}
                    </div>
                    <div style={{ height: 96, display: "flex", alignItems: "flex-end", gap: 4 }}>
                      {[35,55,40,70,45,85,60,90,75,95,80,100].map((h, i) => (
                        <div key={i} style={{ flex: 1, borderRadius: "4px 4px 0 0", background: `linear-gradient(180deg, rgba(255,${100+i*8},0,${0.5+i*0.04}) 0%, rgba(255,140,0,0.07) 100%)`, height: `${h}%`, transform: "scaleY(0)", transformOrigin: "bottom", animation: `scaleIn 0.6s cubic-bezier(0.34,1.56,0.64,1) ${i * 0.05}s forwards`, transition: "height 0.5s cubic-bezier(0.22,1,0.36,1)" }}
                          onMouseEnter={e => { e.currentTarget.style.filter = "brightness(1.4)"; e.currentTarget.style.transform = "scaleY(1.05)"; }}
                          onMouseLeave={e => { e.currentTarget.style.filter = ""; e.currentTarget.style.transform = "scaleY(1)"; }}/>
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
                        <div key={item.label} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10 }}>
                          <div style={{ position: "relative", width: isMobile ? 56 : 72, height: isMobile ? 56 : 72 }}>
                            <svg style={{ width: isMobile ? 56 : 72, height: isMobile ? 56 : 72, transform: "rotate(-90deg)" }} viewBox="0 0 72 72">
                              <circle cx="36" cy="36" r="28" fill="none" stroke="#f0f0f0" strokeWidth="4.5" />
                              <circle cx="36" cy="36" r="28" fill="none" stroke={item.color} strokeWidth="4.5" strokeLinecap="round" strokeDasharray={`${(item.score / 100) * 176} 176`} style={{ filter: `drop-shadow(0 0 5px ${item.color}88)`, strokeDashoffset: 176, animation: `dash 1.8s cubic-bezier(0.22,1,0.36,1) 0.4s forwards` }} />
                            </svg>
                            <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: isMobile ? 14 : 18, fontWeight: 400, color: "#000" }}>{item.score}</div>
                          </div>
                          <span style={{ color: "#aaa", fontSize: 11, fontWeight: 300 }}>{item.label}</span>
                        </div>
                      ))}
                    </div>
                    <p style={{ color: "#aaa", fontSize: 11, marginTop: 24, fontWeight: 300 }}>SEO optimization that boosts your site's traffic and reach.</p>
                  </TiltCard>
                </Reveal>
              </div>
            </div>
          </section>

          {/* ════════════════════════════════
              SECTION 5 — BRAND (white)
          ════════════════════════════════ */}
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
                    <button style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, background: "#FFF5E0", border: "1px solid rgba(255,140,0,0.25)", borderRadius: 50, padding: "11px 0", fontSize: 12, color: "#FF5500", fontWeight: 400, letterSpacing: "0.05em", transition: "all 0.4s cubic-bezier(.22,1,.36,1)", fontFamily: "inherit" }}
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
          
                <br />
                <br />

          {/* ════════════════════════════════
              SECTION 6 — CTA (dark + image)
          ════════════════════════════════ */}
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
                  <RippleBtn className="cta-btn" style={{ padding: isMobile ? "13px 28px" : "15px 40px", borderRadius: 50, fontSize: 12, boxShadow: "0 8px 36px rgba(255,140,0,0.4)" }}>
                    Get Early Access →
                  </RippleBtn>
                  <button className="outline-btn" style={{ padding: isMobile ? "13px 28px" : "15px 40px", borderRadius: 50, fontSize: 12 }}>
                    View Templates
                  </button>
                </div>
              </Reveal>
            </div>
          </section>

          {/* ── SCROLL TO TOP ── */}
          <button
            className="scroll-top-btn"
            onClick={() => { targetY.current = 0; }}
            style={{ position: "fixed", bottom: 28, right: 28, zIndex: 10001, width: 46, height: 46, borderRadius: "50%", background: "linear-gradient(135deg,#FF8C00,#FF4500)", border: "none", color: "white", fontSize: 18, display: "flex", alignItems: "center", justifyContent: "center", opacity: showTop ? 1 : 0, pointerEvents: showTop ? "auto" : "none", transition: "opacity 0.55s cubic-bezier(.22,1,.36,1), transform 0.55s cubic-bezier(.22,1,.36,1)", transform: showTop ? "scale(1)" : "scale(0.55)", boxShadow: "0 4px 26px rgba(255,140,0,0.5)" }}>↑</button>

        </div>
      </div>

      {/* SVG defs for circle dash animation */}
      <style>{`
        @keyframes dash {
          from { stroke-dashoffset: 176; }
          to   { stroke-dashoffset: 0; }
        }
      `}</style>
    </div>
  );
}