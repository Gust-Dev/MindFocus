import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ArrowRight } from "lucide-react";

type Phase = "logo" | "onboarding" | "done";

interface SplashScreenProps {
  onComplete: (name: string) => void;
}

export function SplashScreen({ onComplete }: SplashScreenProps) {
  const [phase, setPhase] = useState<Phase>("logo");
  const [name, setName] = useState("");
  const [focused, setFocused] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setPhase("onboarding"), 2600);
    return () => clearTimeout(t);
  }, []);

  const handleSubmit = () => {
    const trimmed = name.trim();
    if (!trimmed) return;
    setSubmitting(true);
    setTimeout(() => {
      setPhase("done");
      setTimeout(() => onComplete(trimmed), 600);
    }, 400);
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "var(--background)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 200,
        fontFamily: "'Outfit', 'Inter', sans-serif",
      }}
    >
      {/* Ambient radial glow */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: "radial-gradient(ellipse 60% 50% at 50% 50%, rgba(139,92,246,0.1) 0%, transparent 70%)",
          pointerEvents: "none",
        }}
      />

      <AnimatePresence mode="wait">
        {/* ── LOGO PHASE ── */}
        {(phase === "logo" || phase === "onboarding") && phase === "logo" && (
          <motion.div
            key="logo"
            initial={{ opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.04 }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 20 }}
          >
            {/* Icon */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.6, ease: "easeOut" }}
              style={{
                width: 72,
                height: 72,
                borderRadius: 20,
                background: "linear-gradient(135deg, #8b5cf6, #6d28d9)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "0 0 48px rgba(139,92,246,0.45), 0 0 80px rgba(139,92,246,0.15)",
              }}
            >
              <span style={{ fontSize: "2rem" }}>🧠</span>
            </motion.div>

            {/* Wordmark */}
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.6, ease: "easeOut" }}
              style={{ textAlign: "center" }}
            >
              <div
                style={{
                  fontFamily: "'Outfit', sans-serif",
                  fontWeight: 800,
                  fontSize: "2rem",
                  color: "var(--foreground)",
                  letterSpacing: "-0.03em",
                  lineHeight: 1,
                }}
              >
                Mindfocus
              </div>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8, duration: 0.5 }}
                style={{
                  color: "var(--muted-foreground)",
                  fontSize: "0.8rem",
                  marginTop: 6,
                  letterSpacing: "0.12em",
                  textTransform: "uppercase",
                }}
              >
                foco com propósito
              </motion.div>
            </motion.div>

            {/* Pulsing dots */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.0, duration: 0.4 }}
              style={{ display: "flex", gap: 6, marginTop: 8 }}
            >
              {[0, 1, 2].map((i) => (
                <motion.div
                  key={i}
                  animate={{ opacity: [0.3, 1, 0.3] }}
                  transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.2, ease: "easeInOut" }}
                  style={{
                    width: 5,
                    height: 5,
                    borderRadius: "50%",
                    background: "var(--violet)",
                  }}
                />
              ))}
            </motion.div>
          </motion.div>
        )}

        {/* ── ONBOARDING PHASE ── */}
        {phase === "onboarding" && (
          <motion.div
            key="onboarding"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 32,
              width: "100%",
              maxWidth: 340,
              padding: "0 24px",
            }}
          >
            {/* Small logo */}
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 10,
                  background: "linear-gradient(135deg, #8b5cf6, #6d28d9)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  boxShadow: "0 0 20px rgba(139,92,246,0.35)",
                }}
              >
                <span style={{ fontSize: "1.1rem" }}>🧠</span>
              </div>
              <span
                style={{
                  fontFamily: "'Outfit', sans-serif",
                  fontWeight: 800,
                  fontSize: "1.3rem",
                  color: "var(--foreground)",
                  letterSpacing: "-0.02em",
                }}
              >
                Mindfocus
              </span>
            </div>

            {/* Greeting text */}
            <div style={{ textAlign: "center" }}>
              <h1
                style={{
                  color: "var(--foreground)",
                  fontWeight: 700,
                  fontSize: "1.5rem",
                  letterSpacing: "-0.02em",
                  marginBottom: 8,
                  lineHeight: 1.2,
                }}
              >
                Olá! Como podemos{" "}
                <span
                  style={{
                    background: "linear-gradient(90deg, #a78bfa, #8b5cf6)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                  }}
                >
                  te chamar?
                </span>
              </h1>
              <p style={{ color: "var(--muted-foreground)", fontSize: "0.875rem", lineHeight: 1.5 }}>
                Vamos personalizar sua experiência de foco.
              </p>
            </div>

            {/* Input */}
            <div style={{ width: "100%", position: "relative" }}>
              <motion.div
                animate={{
                  boxShadow: focused
                    ? "0 0 0 2px rgba(139,92,246,0.5), 0 0 20px rgba(139,92,246,0.15)"
                    : "0 0 0 1px rgba(139,92,246,0.15)",
                }}
                transition={{ duration: 0.2 }}
                style={{
                  borderRadius: "var(--radius)",
                  overflow: "hidden",
                }}
              >
                <input
                  type="text"
                  autoFocus
                  placeholder="Seu nome..."
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  onFocus={() => setFocused(true)}
                  onBlur={() => setFocused(false)}
                  onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
                  maxLength={30}
                  style={{
                    width: "100%",
                    background: "var(--surface-2)",
                    border: "none",
                    outline: "none",
                    padding: "14px 18px",
                    fontSize: "1rem",
                    color: "var(--foreground)",
                    fontFamily: "'Outfit', sans-serif",
                    fontWeight: 500,
                    boxSizing: "border-box",
                  }}
                />
              </motion.div>
            </div>

            {/* CTA button */}
            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={handleSubmit}
              disabled={!name.trim()}
              style={{
                width: "100%",
                background: name.trim()
                  ? "linear-gradient(135deg, #8b5cf6, #6d28d9)"
                  : "var(--surface-3)",
                border: "none",
                borderRadius: "var(--radius)",
                padding: "14px",
                color: name.trim() ? "#fff" : "var(--muted-foreground)",
                fontFamily: "'Outfit', sans-serif",
                fontWeight: 700,
                fontSize: "1rem",
                cursor: name.trim() ? "pointer" : "not-allowed",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
                transition: "all 0.25s",
                boxShadow: name.trim() ? "0 0 24px rgba(139,92,246,0.35)" : "none",
              }}
            >
              {submitting ? (
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }}
                  style={{
                    width: 18,
                    height: 18,
                    border: "2px solid rgba(255,255,255,0.3)",
                    borderTopColor: "#fff",
                    borderRadius: "50%",
                  }}
                />
              ) : (
                <>
                  <span>Começar a focar</span>
                  <ArrowRight size={18} />
                </>
              )}
            </motion.button>

            {/* Caption */}
            <p style={{ color: "var(--muted-foreground)", fontSize: "0.72rem", textAlign: "center", marginTop: -16 }}>
              Seu progresso é salvo localmente no dispositivo.
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
