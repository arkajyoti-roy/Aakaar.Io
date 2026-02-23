import { useState, useEffect, useRef } from "react";

export function EarlyAccessModal({ isOpen, onClose }) {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const overlayRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      setEmail("");
      setSubmitted(false);
      setLoading(false);
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKey = (e) => { if (e.key === "Escape") onClose(); };
    if (isOpen) window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [isOpen, onClose]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setSubmitted(true);
    }, 1400);
  };

  const handleOverlayClick = (e) => {
    if (e.target === overlayRef.current) onClose();
  };

  if (!isOpen) return null;

  return (
    <div
      ref={overlayRef}
      onClick={handleOverlayClick}
      style={{
        position: "fixed", 
        inset: 0, 
        zIndex: 999999,
        background: "rgba(0,0,0,0.85)", // Slightly darker for better focus
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
        display: "flex", 
        alignItems: "center", 
        justifyContent: "center",
        padding: "20px",
        cursor: "default", // Ensures pointer is visible on overlay
      }}
    >
      <div style={{
        position: "relative",
        width: "100%", 
        maxWidth: 420, // Slightly tighter for better aesthetic
        background: "#111", // Solid background to prevent input rendering issues
        border: "1px solid rgba(255,140,0,0.2)",
        borderRadius: 28,
        padding: "40px",
        boxShadow: "0 28px 80px rgba(0,0,0,0.8)",
      }}>
        <button onClick={onClose} style={{
          position: "absolute", top: 16, right: 16,
          width: 32, height: 32, borderRadius: "50%",
          background: "rgba(255,140,0,0.1)",
          border: "1px solid rgba(255,140,0,0.2)",
          color: "#FF8C00", fontSize: 18, cursor: "pointer",
          display: "flex", alignItems: "center", justifyContent: "center",
          transition: "all 0.3s",
        }}
          onMouseEnter={e => { e.currentTarget.style.background = "rgba(255,140,0,0.2)"; }}
          onMouseLeave={e => { e.currentTarget.style.background = "rgba(255,140,0,0.1)"; }}>
          ✕
        </button>

        <div style={{ marginBottom: 24, textAlign: "center" }}>
          <div style={{ width: 44, height: 44, borderRadius: 12, background: "linear-gradient(135deg,#FF8C00,#FF5500)", margin: "0 auto 14px", display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontSize: 20, fontWeight: 600, boxShadow: "0 8px 24px rgba(255,140,0,0.4)" }}>
            ✦
          </div>
          <h2 style={{ fontSize: 22, fontWeight: 500, color: "white", marginBottom: 8, letterSpacing: "-0.02em" }}>Get Early Access</h2>
          <p style={{ color: "rgba(255,255,255,0.6)", fontSize: 13, fontWeight: 300, lineHeight: "1.5" }}>Join our community and launch your first website with Aakaar</p>
        </div>

        {!submitted ? (
          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <div style={{ position: "relative" }}>
              <input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                style={{
                  width: "100%",
                  padding: "14px 16px",
                  borderRadius: 12,
                  border: "1px solid rgba(255,140,0,0.3)",
                  background: "rgba(255,255,255,0.03)",
                  color: "#fff",
                  fontSize: 14,
                  fontFamily: "inherit",
                  outline: "none",
                  transition: "all 0.2s ease",
                  boxSizing: "border-box",
                  // FIXES START HERE
                  cursor: "text",          // Forces text cursor
                  caretColor: "#FF8C00",   // Makes the blinking cursor bright orange
                  WebkitAppearance: "none",
                }}
                onFocus={e => { 
                    e.currentTarget.style.borderColor = "#FF8C00"; 
                    e.currentTarget.style.background = "rgba(255,255,255,0.07)"; 
                    e.currentTarget.style.boxShadow = "0 0 0 4px rgba(255,140,0,0.1)";
                }}
                onBlur={e => { 
                    e.currentTarget.style.borderColor = "rgba(255,140,0,0.3)"; 
                    e.currentTarget.style.background = "rgba(255,255,255,0.03)";
                    e.currentTarget.style.boxShadow = "none";
                }}
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              style={{
                padding: "14px 20px",
                borderRadius: 12,
                border: "none",
                background: loading ? "#444" : "linear-gradient(90deg, #FF8C00 0%, #FF5500 100%)",
                color: "#fff",
                fontSize: 14,
                fontWeight: 600,
                cursor: loading ? "wait" : "pointer",
                fontFamily: "inherit",
                transition: "all 0.3s",
                boxShadow: loading ? "" : "0 8px 20px rgba(255,140,0,0.3)",
              }}
              onMouseEnter={e => !loading && (e.currentTarget.style.transform = "translateY(-1px)")}
              onMouseLeave={e => !loading && (e.currentTarget.style.transform = "translateY(0)")}
            >
              {loading ? "Processing..." : "Get Access →"}
            </button>
          </form>
        ) : (
          <div style={{ textAlign: "center" }}>
            <div style={{ width: 60, height: 60, borderRadius: 50, background: "rgba(255,140,0,0.1)", margin: "0 auto 16px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 32, color: "#FF8C00" }}>
              ✓
            </div>
            <h3 style={{ color: "#fff", fontSize: 18, fontWeight: 500, marginBottom: 6 }}>Check your email!</h3>
            <p style={{ color: "rgba(255,255,255,0.6)", fontSize: 13, marginBottom: 20 }}>We've sent you early access details</p>
            <button onClick={onClose} style={{
              padding: "10px 24px",
              borderRadius: 50,
              border: "1px solid rgba(255,140,0,0.4)",
              background: "transparent",
              color: "#FF8C00",
              fontSize: 13,
              fontWeight: 500,
              cursor: "pointer",
              transition: "all 0.3s",
            }}
              onMouseEnter={e => { e.currentTarget.style.background = "rgba(255,140,0,0.1)"; }}
              onMouseLeave={e => { e.currentTarget.style.background = "transparent"; }}>
              Close
            </button>
          </div>
        )}
      </div>
    </div>
  );
}