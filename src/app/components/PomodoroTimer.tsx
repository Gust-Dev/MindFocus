import { useState, useEffect, useRef, useCallback } from "react";
import { Play, Pause, RotateCcw, SkipForward, Settings, Volume2, VolumeX } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import confetti from "canvas-confetti";

type Mode = "focus" | "short" | "long";

interface PomodoroTimerProps {
  onSessionComplete: (type: "focus" | "break", minutes: number) => void;
  totalCredits: number;
}

const MODES: Record<Mode, { label: string; duration: number; color: string }> = {
  focus: { label: "Foco", duration: 25 * 60, color: "#8b5cf6" },
  short: { label: "Pausa Curta", duration: 5 * 60, color: "#10b981" },
  long: { label: "Pausa Longa", duration: 15 * 60, color: "#06b6d4" },
};

export function PomodoroTimer({ onSessionComplete, totalCredits }: PomodoroTimerProps) {
  const [mode, setMode] = useState<Mode>("focus");
  const [timeLeft, setTimeLeft] = useState(MODES.focus.duration);
  const [running, setRunning] = useState(false);
  const [sessionsCompleted, setSessions] = useState(0);
  const [sound, setSound] = useState(true);
  const [showSettings, setShowSettings] = useState(false);
  const [customFocus, setCustomFocus] = useState(25);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);

  const currentMode = MODES[mode];
  const totalDuration = mode === "focus" ? customFocus * 60 : currentMode.duration;
  const progress = (timeLeft / totalDuration) * 100;
  const circumference = 2 * Math.PI * 120;
  const strokeDashoffset = circumference * (1 - progress / 100);

  const playBeep = useCallback(() => {
    if (!sound) return;
    try {
      if (!audioCtxRef.current) audioCtxRef.current = new AudioContext();
      const ctx = audioCtxRef.current;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.frequency.value = 880;
      osc.type = "sine";
      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.8);
      osc.start();
      osc.stop(ctx.currentTime + 0.8);
    } catch {}
  }, [sound]);

  const handleComplete = useCallback(() => {
    setRunning(false);
    playBeep();
    if (mode === "focus") {
      setSessions((s) => s + 1);
      onSessionComplete("focus", customFocus);
      confetti({ particleCount: 80, spread: 70, origin: { y: 0.5 }, colors: ["#8b5cf6", "#a78bfa", "#c4b8ff"] });
      setMode("short");
      setTimeLeft(MODES.short.duration);
    } else {
      onSessionComplete("break", mode === "short" ? 5 : 15);
      setMode("focus");
      setTimeLeft(customFocus * 60);
    }
  }, [mode, customFocus, onSessionComplete, playBeep]);

  useEffect(() => {
    if (running) {
      intervalRef.current = setInterval(() => {
        setTimeLeft((t) => {
          if (t <= 1) {
            handleComplete();
            return 0;
          }
          return t - 1;
        });
      }, 1000);
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [running, handleComplete]);

  const switchMode = (m: Mode) => {
    setRunning(false);
    setMode(m);
    setTimeLeft(m === "focus" ? customFocus * 60 : MODES[m].duration);
  };

  const reset = () => {
    setRunning(false);
    setTimeLeft(mode === "focus" ? customFocus * 60 : MODES[mode].duration);
  };

  const skip = () => {
    handleComplete();
  };

  const mm = String(Math.floor(timeLeft / 60)).padStart(2, "0");
  const ss = String(timeLeft % 60).padStart(2, "0");

  return (
    <div className="flex flex-col items-center gap-8 py-6 px-4">
      {/* Mode tabs */}
      <div
        style={{ background: "var(--surface-2)", borderRadius: "var(--radius)" }}
        className="flex gap-1 p-1"
      >
        {(["focus", "short", "long"] as Mode[]).map((m) => (
          <button
            key={m}
            onClick={() => switchMode(m)}
            style={{
              background: mode === m ? MODES[m].color : "transparent",
              color: mode === m ? "#fff" : "var(--muted-foreground)",
              borderRadius: "calc(var(--radius) - 2px)",
              transition: "all 0.2s",
              padding: "6px 16px",
              fontSize: "0.875rem",
              fontWeight: 500,
              border: "none",
              cursor: "pointer",
            }}
          >
            {MODES[m].label}
          </button>
        ))}
      </div>

      {/* Timer ring */}
      <div className="relative flex items-center justify-center" style={{ width: 280, height: 280 }}>
        {/* Glow */}
        <div
          style={{
            position: "absolute",
            width: 220,
            height: 220,
            borderRadius: "50%",
            background: `radial-gradient(circle, ${currentMode.color}22 0%, transparent 70%)`,
            filter: "blur(20px)",
          }}
        />
        <svg width="280" height="280" style={{ position: "absolute", top: 0, left: 0 }}>
          {/* Track */}
          <circle cx="140" cy="140" r="120" fill="none" stroke="var(--surface-3)" strokeWidth="8" />
          {/* Progress */}
          <circle
            cx="140"
            cy="140"
            r="120"
            fill="none"
            stroke={currentMode.color}
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            transform="rotate(-90 140 140)"
            style={{ transition: "stroke-dashoffset 0.5s ease, stroke 0.4s" }}
          />
        </svg>
        <div className="flex flex-col items-center gap-1 relative z-10">
          <span
            style={{
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: "3.5rem",
              fontWeight: 700,
              color: "var(--foreground)",
              letterSpacing: "-0.02em",
              lineHeight: 1,
            }}
          >
            {mm}:{ss}
          </span>
          <span style={{ color: currentMode.color, fontSize: "0.875rem", fontWeight: 500 }}>
            {currentMode.label}
          </span>
          <span style={{ color: "var(--muted-foreground)", fontSize: "0.75rem" }}>
            Sessão #{sessionsCompleted + 1}
          </span>
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center gap-4">
        <button
          onClick={reset}
          style={{
            background: "var(--surface-2)",
            border: "1px solid var(--border)",
            borderRadius: "50%",
            width: 44,
            height: 44,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            color: "var(--muted-foreground)",
            transition: "all 0.2s",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.color = "var(--foreground)")}
          onMouseLeave={(e) => (e.currentTarget.style.color = "var(--muted-foreground)")}
        >
          <RotateCcw size={18} />
        </button>

        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={() => setRunning((r) => !r)}
          style={{
            background: `linear-gradient(135deg, ${currentMode.color}, var(--violet-dim))`,
            border: "none",
            borderRadius: "50%",
            width: 72,
            height: 72,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            color: "#fff",
            boxShadow: `0 0 24px ${currentMode.color}66`,
            transition: "box-shadow 0.3s",
          }}
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={running ? "pause" : "play"}
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.5, opacity: 0 }}
              transition={{ duration: 0.15 }}
            >
              {running ? <Pause size={28} /> : <Play size={28} />}
            </motion.div>
          </AnimatePresence>
        </motion.button>

        <button
          onClick={skip}
          style={{
            background: "var(--surface-2)",
            border: "1px solid var(--border)",
            borderRadius: "50%",
            width: 44,
            height: 44,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            color: "var(--muted-foreground)",
            transition: "all 0.2s",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.color = "var(--foreground)")}
          onMouseLeave={(e) => (e.currentTarget.style.color = "var(--muted-foreground)")}
        >
          <SkipForward size={18} />
        </button>
      </div>

      {/* Bottom bar */}
      <div
        className="flex items-center justify-between w-full max-w-sm"
        style={{
          background: "var(--surface-1)",
          border: "1px solid var(--border)",
          borderRadius: "var(--radius)",
          padding: "12px 20px",
        }}
      >
        <div className="flex items-center gap-3">
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: "50%",
              background: "var(--surface-3)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <span style={{ fontSize: "1rem" }}>💎</span>
          </div>
          <div>
            <div style={{ color: "var(--muted-foreground)", fontSize: "0.7rem" }}>Créditos</div>
            <div
              style={{
                color: "var(--violet-bright)",
                fontFamily: "'JetBrains Mono', monospace",
                fontWeight: 700,
                fontSize: "1rem",
              }}
            >
              {totalCredits}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div>
            <div style={{ color: "var(--muted-foreground)", fontSize: "0.7rem", textAlign: "right" }}>Sessões hoje</div>
            <div
              style={{
                color: "var(--foreground)",
                fontFamily: "'JetBrains Mono', monospace",
                fontWeight: 700,
                fontSize: "1rem",
                textAlign: "right",
              }}
            >
              {sessionsCompleted}
            </div>
          </div>
          <div className="flex gap-1">
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: "50%",
                  background: i < sessionsCompleted % 4 ? currentMode.color : "var(--surface-3)",
                  transition: "background 0.3s",
                }}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Settings toggle */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => setSound((s) => !s)}
          style={{
            background: "transparent",
            border: "none",
            cursor: "pointer",
            color: sound ? "var(--violet-bright)" : "var(--muted-foreground)",
            transition: "color 0.2s",
          }}
        >
          {sound ? <Volume2 size={18} /> : <VolumeX size={18} />}
        </button>
        <button
          onClick={() => setShowSettings((s) => !s)}
          style={{
            background: "transparent",
            border: "none",
            cursor: "pointer",
            color: showSettings ? "var(--violet-bright)" : "var(--muted-foreground)",
            transition: "color 0.2s",
          }}
        >
          <Settings size={18} />
        </button>
      </div>

      <AnimatePresence>
        {showSettings && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            style={{ overflow: "hidden", width: "100%", maxWidth: 360 }}
          >
            <div
              style={{
                background: "var(--surface-1)",
                border: "1px solid var(--border)",
                borderRadius: "var(--radius)",
                padding: "16px 20px",
              }}
            >
              <label style={{ color: "var(--muted-foreground)", fontSize: "0.8rem", display: "block", marginBottom: 8 }}>
                Duração do foco: {customFocus} min
              </label>
              <input
                type="range"
                min={5}
                max={60}
                step={5}
                value={customFocus}
                onChange={(e) => {
                  const v = Number(e.target.value);
                  setCustomFocus(v);
                  if (mode === "focus") setTimeLeft(v * 60);
                }}
                style={{ width: "100%", accentColor: "var(--violet)" }}
              />
              <div className="flex justify-between" style={{ marginTop: 4 }}>
                {[5, 15, 25, 45, 60].map((v) => (
                  <button
                    key={v}
                    onClick={() => { setCustomFocus(v); if (mode === "focus") setTimeLeft(v * 60); }}
                    style={{
                      background: customFocus === v ? "var(--violet)" : "var(--surface-3)",
                      border: "none",
                      borderRadius: 4,
                      padding: "4px 8px",
                      fontSize: "0.75rem",
                      color: customFocus === v ? "#fff" : "var(--muted-foreground)",
                      cursor: "pointer",
                    }}
                  >
                    {v}m
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
