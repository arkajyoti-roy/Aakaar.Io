import { useState, useRef, useCallback, useEffect } from "react";
import { useInView } from "./hooks";

// ── REVEAL ANIMATION COMPONENT ──
export function Reveal({ children, delay = 0, from = "bottom", style = {} }) {
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

// ── SPLIT REVEAL (animated word reveal) ──
export function SplitReveal({ text, className, style = {}, delay = 0, tag = "h2" }) {
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

// ── COUNTER COMPONENT ──
export function Counter({ target, suffix = "", duration = 2200 }) {
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

// ── TILT CARD COMPONENT ──
export function TiltCard({ children, style = {}, className = "" }) {
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

// ── STAGGER GRID ──
export function StaggerGrid({ children, cols = 3, gap = 14 }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: `repeat(${cols}, 1fr)`, gap }}>
      {children}
    </div>
  );
}

// ── GLITCH TEXT ──
export function GlitchText({ text, style = {} }) {
  return (
    <span className="glitch-text" data-text={text} style={style}>{text}</span>
  );
}

// ── MARQUEE COMPONENT ──
export function Marquee({ items, reverse = false }) {
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

// ── GRID BACKGROUND ──
export function GridBg({ opacity = 0.04 }) {
  return (
    <div style={{ position: "absolute", inset: 0, pointerEvents: "none", overflow: "hidden" }}>
      <div style={{ position: "absolute", inset: 0, backgroundImage: `linear-gradient(rgba(255,140,0,${opacity}) 1px, transparent 1px), linear-gradient(90deg, rgba(255,140,0,${opacity}) 1px, transparent 1px)`, backgroundSize: "64px 64px" }} />
    </div>
  );
}

// ── RIPPLE BUTTON ──
export function RippleBtn({ children, className, style = {}, onClick }) {
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

// ── MAGNETIC CURSOR ──
export function MagneticCursor() {
  const cursorRef = useRef(null);
  const dotRef    = useRef(null);
  const pos       = useRef({ x: -100, y: -100 });
  const target    = useRef({ x: -100, y: -100 });
  const scale     = useRef(1);
  const scaleT    = useRef(1);
  const [isMobile] = useState(() => 
    typeof window !== 'undefined' && (window.innerWidth < 768 || 'ontouchstart' in window)
  );

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
