import { Trophy, Flame, Clock, Target, TrendingUp, Star, Zap, Medal } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";

interface Session {
  type: "focus" | "break";
  minutes: number;
  timestamp: number;
}

interface RecordsScreenProps {
  sessions: Session[];
  totalCredits: number;
}

const BADGES = [
  { id: "first", icon: "🎯", label: "Primeira Sessão", desc: "Complete sua primeira sessão", threshold: 1, stat: "totalSessions" },
  { id: "streak5", icon: "🔥", label: "Em Chamas", desc: "5 sessões em um dia", threshold: 5, stat: "todaySessions" },
  { id: "hour", icon: "⏱️", label: "Maratonista", desc: "60 min focados em um dia", threshold: 60, stat: "todayMinutes" },
  { id: "streak10", icon: "⚡", label: "Relâmpago", desc: "10 sessões totais", threshold: 10, stat: "totalSessions" },
  { id: "4hours", icon: "🏆", label: "Lendário", desc: "4h de foco em um dia", threshold: 240, stat: "todayMinutes" },
  { id: "credits100", icon: "💎", label: "Milionário", desc: "Acumule 100 créditos", threshold: 100, stat: "credits" },
];

function formatTime(minutes: number) {
  if (minutes < 60) return `${minutes}m`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m > 0 ? `${h}h ${m}m` : `${h}h`;
}

export function RecordsScreen({ sessions, totalCredits }: RecordsScreenProps) {
  const focusSessions = sessions.filter((s) => s.type === "focus");
  const totalFocusMinutes = focusSessions.reduce((a, s) => a + s.minutes, 0);

  const now = Date.now();
  const todayStart = new Date().setHours(0, 0, 0, 0);
  const todaySessions = focusSessions.filter((s) => s.timestamp >= todayStart);
  const todayMinutes = todaySessions.reduce((a, s) => a + s.minutes, 0);

  // Last 7 days chart data
  const last7 = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(now - (6 - i) * 86400000);
    const dayStart = new Date(d).setHours(0, 0, 0, 0);
    const dayEnd = dayStart + 86400000;
    const mins = focusSessions
      .filter((s) => s.timestamp >= dayStart && s.timestamp < dayEnd)
      .reduce((a, s) => a + s.minutes, 0);
    return {
      day: ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"][d.getDay()],
      min: mins,
      today: i === 6,
    };
  });

  const statsForBadge: Record<string, number> = {
    totalSessions: focusSessions.length,
    todaySessions: todaySessions.length,
    todayMinutes,
    credits: totalCredits,
  };

  const stats = [
    { icon: <Clock size={18} />, label: "Total de foco", value: formatTime(totalFocusMinutes), color: "var(--violet)" },
    { icon: <Target size={18} />, label: "Sessões totais", value: String(focusSessions.length), color: "var(--emerald)" },
    { icon: <Flame size={18} />, label: "Hoje", value: `${todaySessions.length} sessões`, color: "var(--amber)" },
    { icon: <TrendingUp size={18} />, label: "Foco hoje", value: formatTime(todayMinutes), color: "var(--cyan)" },
  ];

  return (
    <div className="flex flex-col gap-6 py-6 px-4">
      {/* Stats grid */}
      <div className="grid grid-cols-2 gap-3">
        {stats.map((s, i) => (
          <div
            key={i}
            style={{
              background: "var(--surface-1)",
              border: "1px solid var(--border)",
              borderRadius: "var(--radius)",
              padding: "16px",
            }}
          >
            <div className="flex items-center gap-2 mb-2" style={{ color: s.color }}>
              {s.icon}
              <span style={{ fontSize: "0.75rem", color: "var(--muted-foreground)" }}>{s.label}</span>
            </div>
            <div
              style={{
                fontFamily: "'JetBrains Mono', monospace",
                fontWeight: 700,
                fontSize: "1.25rem",
                color: "var(--foreground)",
              }}
            >
              {s.value}
            </div>
          </div>
        ))}
      </div>

      {/* Weekly chart */}
      <div
        style={{
          background: "var(--surface-1)",
          border: "1px solid var(--border)",
          borderRadius: "var(--radius)",
          padding: "20px",
        }}
      >
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp size={16} style={{ color: "var(--violet)" }} />
          <span style={{ color: "var(--foreground)", fontWeight: 600, fontSize: "0.9rem" }}>Últimos 7 dias</span>
        </div>
        {focusSessions.length === 0 ? (
          <div className="flex flex-col items-center py-8" style={{ color: "var(--muted-foreground)" }}>
            <Zap size={32} style={{ marginBottom: 8, opacity: 0.4 }} />
            <span style={{ fontSize: "0.875rem" }}>Comece uma sessão para ver seu progresso!</span>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={140}>
            <BarChart data={last7} margin={{ top: 0, right: 0, bottom: 0, left: -30 }}>
              <XAxis dataKey="day" tick={{ fill: "var(--muted-foreground)", fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: "var(--muted-foreground)", fontSize: 10 }} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{ background: "var(--surface-2)", border: "1px solid var(--border)", borderRadius: 8, color: "var(--foreground)" }}
                formatter={(v: number) => [`${v} min`, "Foco"]}
                cursor={{ fill: "rgba(139,92,246,0.08)" }}
              />
              <Bar dataKey="min" radius={[4, 4, 0, 0]}>
                {last7.map((entry, i) => (
                  <Cell key={i} fill={entry.today ? "var(--violet)" : "var(--surface-3)"} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Badges */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <Trophy size={16} style={{ color: "var(--amber)" }} />
          <span style={{ color: "var(--foreground)", fontWeight: 600, fontSize: "0.9rem" }}>Conquistas</span>
          <span
            style={{
              background: "var(--surface-3)",
              color: "var(--muted-foreground)",
              fontSize: "0.7rem",
              padding: "2px 8px",
              borderRadius: 99,
              marginLeft: 4,
            }}
          >
            {BADGES.filter((b) => (statsForBadge[b.stat] ?? 0) >= b.threshold).length}/{BADGES.length}
          </span>
        </div>
        <div className="grid grid-cols-3 gap-3">
          {BADGES.map((badge) => {
            const earned = (statsForBadge[badge.stat] ?? 0) >= badge.threshold;
            return (
              <div
                key={badge.id}
                style={{
                  background: earned ? "var(--surface-2)" : "var(--surface-1)",
                  border: `1px solid ${earned ? "var(--violet)" : "var(--border)"}`,
                  borderRadius: "var(--radius)",
                  padding: "12px 8px",
                  textAlign: "center",
                  opacity: earned ? 1 : 0.45,
                  transition: "all 0.3s",
                }}
              >
                <div style={{ fontSize: "1.75rem", marginBottom: 4 }}>{badge.icon}</div>
                <div style={{ color: "var(--foreground)", fontSize: "0.7rem", fontWeight: 600, lineHeight: 1.3 }}>
                  {badge.label}
                </div>
                <div style={{ color: "var(--muted-foreground)", fontSize: "0.6rem", marginTop: 2, lineHeight: 1.3 }}>
                  {badge.desc}
                </div>
                {earned && (
                  <div style={{ marginTop: 4 }}>
                    <Star size={10} style={{ color: "var(--amber)", display: "inline" }} />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Ranking / Best sessions */}
      {focusSessions.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Medal size={16} style={{ color: "var(--cyan)" }} />
            <span style={{ color: "var(--foreground)", fontWeight: 600, fontSize: "0.9rem" }}>Melhores Dias</span>
          </div>
          <div
            style={{
              background: "var(--surface-1)",
              border: "1px solid var(--border)",
              borderRadius: "var(--radius)",
              overflow: "hidden",
            }}
          >
            {last7
              .filter((d) => d.min > 0)
              .sort((a, b) => b.min - a.min)
              .slice(0, 5)
              .map((d, i) => {
                const maxMin = Math.max(...last7.map((x) => x.min), 1);
                const pct = (d.min / maxMin) * 100;
                const medals = ["🥇", "🥈", "🥉", "4️⃣", "5️⃣"];
                return (
                  <div
                    key={i}
                    style={{
                      padding: "12px 16px",
                      borderBottom: i < 4 ? "1px solid var(--border)" : "none",
                      display: "flex",
                      alignItems: "center",
                      gap: 12,
                    }}
                  >
                    <span style={{ fontSize: "1.1rem", width: 24 }}>{medals[i]}</span>
                    <span style={{ color: "var(--muted-foreground)", fontSize: "0.875rem", width: 32 }}>{d.day}</span>
                    <div style={{ flex: 1, background: "var(--surface-3)", borderRadius: 4, height: 6, overflow: "hidden" }}>
                      <div
                        style={{
                          width: `${pct}%`,
                          height: "100%",
                          background: i === 0 ? "var(--violet)" : "var(--surface-3)",
                          backgroundImage: i === 0 ? "linear-gradient(90deg, var(--violet), var(--cyan))" : "none",
                          borderRadius: 4,
                          transition: "width 0.8s ease",
                        }}
                      />
                    </div>
                    <span
                      style={{
                        fontFamily: "'JetBrains Mono', monospace",
                        fontSize: "0.8rem",
                        color: i === 0 ? "var(--violet-bright)" : "var(--foreground)",
                        fontWeight: 600,
                        width: 40,
                        textAlign: "right",
                      }}
                    >
                      {formatTime(d.min)}
                    </span>
                  </div>
                );
              })}
          </div>
        </div>
      )}
    </div>
  );
}
