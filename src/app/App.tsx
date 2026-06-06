import { useState, useEffect } from "react";
import { Timer, Trophy, ShoppingBag } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { PomodoroTimer } from "./components/PomodoroTimer";
import { RecordsScreen } from "./components/RecordsScreen";
import { CreditsShop } from "./components/CreditsShop";
import { SplashScreen } from "./components/SplashScreen";
import "../styles/fonts.css";

type Tab = "timer" | "records" | "shop";

interface Session {
  type: "focus" | "break";
  minutes: number;
  timestamp: number;
}

const CREDIT_MAP = { focus: 10, break_short: 2, break_long: 5 };

function loadState<T>(key: string, fallback: T): T {
  try {
    const v = localStorage.getItem(key);
    if (v) return JSON.parse(v) as T;
  } catch {}
  return fallback;
}

export default function App() {
  const [userName, setUserName] = useState<string | null>(() => loadState("mindfocus_user", null));
  const [appVisible, setAppVisible] = useState(false);
  const [tab, setTab] = useState<Tab>("timer");
  const [sessions, setSessions] = useState<Session[]>(() => loadState("mindfocus_sessions", []));
  const [credits, setCredits] = useState<number>(() => loadState("mindfocus_credits", 0));

  const handleOnboardingComplete = (name: string) => {
    localStorage.setItem("mindfocus_user", JSON.stringify(name));
    setUserName(name);
    setTimeout(() => setAppVisible(true), 100);
  };

  // If already has name, show app immediately
  useEffect(() => {
    if (userName) setAppVisible(true);
  }, []);

  useEffect(() => { localStorage.setItem("mindfocus_sessions", JSON.stringify(sessions)); }, [sessions]);
  useEffect(() => { localStorage.setItem("mindfocus_credits", JSON.stringify(credits)); }, [credits]);

  const handleSessionComplete = (type: "focus" | "break", minutes: number) => {
    const session: Session = { type, minutes, timestamp: Date.now() };
    setSessions((prev) => [...prev, session]);
    const earn = type === "focus" ? CREDIT_MAP.focus : minutes <= 5 ? CREDIT_MAP.break_short : CREDIT_MAP.break_long;
    setCredits((c) => c + earn);
  };

  const handleSpend = (amount: number) => {
    setCredits((c) => Math.max(0, c - amount));
  };

  const TABS = [
    { id: "timer" as Tab, icon: Timer, label: "Foco" },
    { id: "records" as Tab, icon: Trophy, label: "Recordes" },
    { id: "shop" as Tab, icon: ShoppingBag, label: "Loja" },
  ];

  return (
    <div style={{ minHeight: "100vh", background: "var(--background)", fontFamily: "'Outfit', 'Inter', sans-serif" }}>
      <AnimatePresence>
        {!userName && (
          <SplashScreen onComplete={handleOnboardingComplete} />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {appVisible && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            style={{
              minHeight: "100vh",
              display: "flex",
              flexDirection: "column",
              maxWidth: 480,
              margin: "0 auto",
              position: "relative",
            }}
          >
      {/* Ambient glow */}
      <div
        style={{
          position: "fixed",
          top: -100,
          left: "50%",
          transform: "translateX(-50%)",
          width: 400,
          height: 400,
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(139,92,246,0.12) 0%, transparent 70%)",
          pointerEvents: "none",
          zIndex: 0,
        }}
      />

      {/* Header */}
      <header
        style={{
          padding: "20px 24px 16px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          position: "relative",
          zIndex: 1,
          borderBottom: "1px solid var(--border)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div
            style={{
              width: 32,
              height: 32,
              borderRadius: 8,
              background: "linear-gradient(135deg, var(--violet), var(--violet-dim))",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 0 16px rgba(139,92,246,0.4)",
            }}
          >
            <span style={{ fontSize: "0.95rem" }}>🧠</span>
          </div>
          <span
            style={{
              fontFamily: "'Outfit', sans-serif",
              fontWeight: 800,
              fontSize: "1.2rem",
              color: "var(--foreground)",
              letterSpacing: "-0.01em",
            }}
          >
            Mindfocus
          </span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          {userName && (
            <span style={{ color: "var(--muted-foreground)", fontSize: "0.78rem" }}>
              Olá, <strong style={{ color: "var(--violet-bright)" }}>{userName}</strong>
            </span>
          )}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              background: "var(--surface-2)",
              border: "1px solid var(--border)",
              borderRadius: 99,
              padding: "5px 12px",
            }}
          >
            <span style={{ fontSize: "0.9rem" }}>💎</span>
            <span
              style={{
                fontFamily: "'JetBrains Mono', monospace",
                fontWeight: 700,
                fontSize: "0.9rem",
                color: "var(--violet-bright)",
              }}
            >
              {credits}
            </span>
          </div>
        </div>
      </header>

      {/* Page content */}
      <main
        style={{
          flex: 1,
          overflowY: "auto",
          overflowX: "hidden",
          position: "relative",
          zIndex: 1,
          paddingBottom: 80,
          scrollbarWidth: "none",
        }}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={tab}
            initial={{ opacity: 0, x: tab === "timer" ? -20 : tab === "shop" ? 20 : 0, y: tab === "records" ? 10 : 0 }}
            animate={{ opacity: 1, x: 0, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
          >
            {tab === "timer" && (
              <PomodoroTimer onSessionComplete={handleSessionComplete} totalCredits={credits} />
            )}
            {tab === "records" && (
              <RecordsScreen sessions={sessions} totalCredits={credits} />
            )}
            {tab === "shop" && (
              <CreditsShop credits={credits} onSpend={handleSpend} />
            )}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Bottom nav */}
      <nav
        style={{
          position: "fixed",
          bottom: 0,
          left: "50%",
          transform: "translateX(-50%)",
          width: "100%",
          maxWidth: 480,
          background: "var(--surface-1)",
          borderTop: "1px solid var(--border)",
          display: "flex",
          zIndex: 10,
        }}
      >
        {TABS.map(({ id, icon: Icon, label }) => {
          const active = tab === id;
          return (
            <button
              key={id}
              onClick={() => setTab(id)}
              style={{
                flex: 1,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                gap: 3,
                padding: "12px 0",
                background: "transparent",
                border: "none",
                cursor: "pointer",
                color: active ? "var(--violet-bright)" : "var(--muted-foreground)",
                transition: "color 0.2s",
                position: "relative",
              }}
            >
              {active && (
                <motion.div
                  layoutId="tab-indicator"
                  style={{
                    position: "absolute",
                    top: 0,
                    left: "20%",
                    right: "20%",
                    height: 2,
                    background: "var(--violet)",
                    borderRadius: "0 0 4px 4px",
                  }}
                />
              )}
              <Icon size={20} />
              <span style={{ fontSize: "0.65rem", fontWeight: active ? 600 : 400 }}>{label}</span>
            </button>
          );
        })}
      </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
