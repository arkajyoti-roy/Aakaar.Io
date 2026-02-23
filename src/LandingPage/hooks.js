import { useState, useEffect, useRef } from "react";

// ── SMOOTH SCROLL ENGINE (lerp-based, ~60fps) ──────────────────────────────
export function useSmoothScroll(lerpFactor = 0.072) {
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

export function useScrollProgress(currentY) {
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

export function useViewport() {
  const [vp, setVp] = useState({ w: typeof window !== 'undefined' ? window.innerWidth : 1200, h: typeof window !== 'undefined' ? window.innerHeight : 800 });
  useEffect(() => {
    const update = () => setVp({ w: window.innerWidth, h: window.innerHeight });
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);
  return vp;
}

export function useInView(threshold = 0.1) {
  const ref = useRef(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setInView(true); }, { threshold });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, [threshold]);
  return [ref, inView];
}

export function useParallax(speed = 0.15, currentY) {
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
