import { useState, useEffect } from "react";
import { ShoppingBag, RefreshCw, CheckCircle, Lock, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface ShopItem {
  id: string;
  icon: string;
  name: string;
  desc: string;
  cost: number;
  category: "boost" | "reward" | "cosmetic";
  purchased: boolean;
  refreshesDaily: boolean;
}

interface CreditsShopProps {
  credits: number;
  onSpend: (amount: number, item: string) => void;
}

const BASE_SHOP: Omit<ShopItem, "purchased">[] = [
  { id: "extra_break", icon: "☕", name: "Pausa Extra", desc: "+5 min de pausa adicional hoje", cost: 10, category: "boost", refreshesDaily: true },
  { id: "focus_30", icon: "🎯", name: "Modo Turbo", desc: "Sessão de foco em 30% do tempo", cost: 25, category: "boost", refreshesDaily: true },
  { id: "streak_shield", icon: "🛡️", name: "Escudo de Sequência", desc: "Protege seu streak por 1 dia", cost: 40, category: "reward", refreshesDaily: false },
  { id: "ambient_forest", icon: "🌲", name: "Som da Floresta", desc: "Ativa sons ambiente de floresta", cost: 15, category: "cosmetic", refreshesDaily: true },
  { id: "theme_neon", icon: "🌈", name: "Tema Neon", desc: "Muda o tema para cores neon por 1 dia", cost: 30, category: "cosmetic", refreshesDaily: false },
  { id: "double_credits", icon: "💰", name: "Créditos Duplos", desc: "Dobra créditos ganhos por 1 hora", cost: 50, category: "boost", refreshesDaily: false },
  { id: "motivation_quote", icon: "💬", name: "Citação Motivacional", desc: "Frase motivacional personalizada", cost: 5, category: "reward", refreshesDaily: true },
  { id: "focus_music", icon: "🎵", name: "Playlist Focus", desc: "Desbloqueia playlist lo-fi exclusiva", cost: 20, category: "cosmetic", refreshesDaily: true },
  { id: "custom_avatar", icon: "🦊", name: "Avatar Fox", desc: "Avatar especial de raposa para o perfil", cost: 60, category: "cosmetic", refreshesDaily: false },
];

const CATEGORY_LABELS: Record<string, string> = { boost: "Boost", reward: "Recompensa", cosmetic: "Visual" };
const CATEGORY_COLORS: Record<string, string> = { boost: "var(--violet)", reward: "var(--amber)", cosmetic: "var(--cyan)" };

const QUOTES = [
  "A disciplina é a ponte entre metas e realizações.",
  "Pequenos progressos diários levam a grandes resultados.",
  "O sucesso é a soma de pequenos esforços repetidos.",
  "Foque no processo, não no resultado.",
  "Cada sessão de foco é um investimento no seu futuro.",
];

export function CreditsShop({ credits, onSpend }: CreditsShopProps) {
  const [items, setItems] = useState<ShopItem[]>(() => {
    const saved = localStorage.getItem("mindfocus_shop_state");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // Check if it's from today
        if (parsed.date === new Date().toDateString()) {
          return parsed.items;
        }
      } catch {}
    }
    return BASE_SHOP.map((item) => ({ ...item, purchased: false }));
  });
  const [filter, setFilter] = useState<"all" | "boost" | "reward" | "cosmetic">("all");
  const [toast, setToast] = useState<string | null>(null);
  const [showQuote, setShowQuote] = useState(false);
  const [quote, setQuote] = useState("");

  useEffect(() => {
    localStorage.setItem("mindfocus_shop_state", JSON.stringify({ date: new Date().toDateString(), items }));
  }, [items]);

  const buy = (item: ShopItem) => {
    if (credits < item.cost || item.purchased) return;
    onSpend(item.cost, item.name);
    setItems((prev) => prev.map((i) => (i.id === item.id ? { ...i, purchased: true } : i)));
    setToast(`${item.icon} ${item.name} ativado!`);
    setTimeout(() => setToast(null), 2500);
    if (item.id === "motivation_quote") {
      setQuote(QUOTES[Math.floor(Math.random() * QUOTES.length)]);
      setShowQuote(true);
    }
  };

  const resetDaily = () => {
    setItems((prev) => prev.map((i) => (i.refreshesDaily ? { ...i, purchased: false } : i)));
    setToast("🔄 Itens diários renovados!");
    setTimeout(() => setToast(null), 2500);
  };

  const filtered = filter === "all" ? items : items.filter((i) => i.category === filter);
  const dailyRefreshCount = items.filter((i) => i.refreshesDaily && !i.purchased).length;

  return (
    <div className="flex flex-col gap-5 py-6 px-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 style={{ color: "var(--foreground)", fontWeight: 700, fontSize: "1.1rem" }}>Loja Diária</h2>
          <p style={{ color: "var(--muted-foreground)", fontSize: "0.8rem" }}>
            Renova todo dia à meia-noite
          </p>
        </div>
        <div
          style={{
            background: "var(--surface-2)",
            border: "1px solid var(--border)",
            borderRadius: "var(--radius)",
            padding: "8px 16px",
            display: "flex",
            alignItems: "center",
            gap: 8,
          }}
        >
          <span style={{ fontSize: "1.1rem" }}>💎</span>
          <span
            style={{
              fontFamily: "'JetBrains Mono', monospace",
              fontWeight: 700,
              fontSize: "1.1rem",
              color: "var(--violet-bright)",
            }}
          >
            {credits}
          </span>
        </div>
      </div>

      {/* How to earn */}
      <div
        style={{
          background: "linear-gradient(135deg, var(--violet)22, var(--surface-2))",
          border: "1px solid var(--violet)",
          borderRadius: "var(--radius)",
          padding: "12px 16px",
          display: "flex",
          alignItems: "center",
          gap: 12,
        }}
      >
        <Sparkles size={20} style={{ color: "var(--violet-bright)", flexShrink: 0 }} />
        <div>
          <div style={{ color: "var(--foreground)", fontSize: "0.8rem", fontWeight: 600 }}>Como ganhar créditos</div>
          <div style={{ color: "var(--muted-foreground)", fontSize: "0.75rem" }}>
            Sessão de foco = +10💎 · Pausa curta = +2💎 · Pausa longa = +5💎
          </div>
        </div>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 flex-wrap">
        {(["all", "boost", "reward", "cosmetic"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            style={{
              background: filter === f ? (f === "all" ? "var(--violet)" : CATEGORY_COLORS[f]) : "var(--surface-2)",
              border: "1px solid var(--border)",
              borderRadius: 99,
              padding: "5px 14px",
              fontSize: "0.8rem",
              color: filter === f ? "#fff" : "var(--muted-foreground)",
              cursor: "pointer",
              transition: "all 0.2s",
              fontWeight: filter === f ? 600 : 400,
            }}
          >
            {f === "all" ? "Todos" : CATEGORY_LABELS[f]}
          </button>
        ))}
        <button
          onClick={resetDaily}
          style={{
            background: "transparent",
            border: "1px solid var(--border)",
            borderRadius: 99,
            padding: "5px 10px",
            fontSize: "0.75rem",
            color: "var(--muted-foreground)",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: 4,
            marginLeft: "auto",
          }}
          title="Reiniciar itens diários (demo)"
        >
          <RefreshCw size={12} />
          Reset
        </button>
      </div>

      {/* Items grid */}
      <div className="grid grid-cols-1 gap-3">
        {filtered.map((item) => {
          const canAfford = credits >= item.cost;
          const catColor = CATEGORY_COLORS[item.category];
          return (
            <motion.div
              key={item.id}
              layout
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              style={{
                background: item.purchased ? "var(--surface-2)" : "var(--surface-1)",
                border: `1px solid ${item.purchased ? catColor + "55" : "var(--border)"}`,
                borderRadius: "var(--radius)",
                padding: "14px 16px",
                display: "flex",
                alignItems: "center",
                gap: 14,
                opacity: !canAfford && !item.purchased ? 0.6 : 1,
                transition: "all 0.2s",
              }}
            >
              <div
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: "var(--radius)",
                  background: `${catColor}22`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "1.4rem",
                  flexShrink: 0,
                }}
              >
                {item.icon}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 2 }}>
                  <span style={{ color: "var(--foreground)", fontWeight: 600, fontSize: "0.9rem" }}>{item.name}</span>
                  <span
                    style={{
                      background: `${catColor}22`,
                      color: catColor,
                      fontSize: "0.65rem",
                      padding: "1px 6px",
                      borderRadius: 99,
                      fontWeight: 600,
                    }}
                  >
                    {CATEGORY_LABELS[item.category]}
                  </span>
                  {item.refreshesDaily && (
                    <span
                      style={{
                        background: "var(--surface-3)",
                        color: "var(--muted-foreground)",
                        fontSize: "0.6rem",
                        padding: "1px 6px",
                        borderRadius: 99,
                      }}
                    >
                      diário
                    </span>
                  )}
                </div>
                <div style={{ color: "var(--muted-foreground)", fontSize: "0.78rem" }}>{item.desc}</div>
              </div>
              <button
                onClick={() => buy(item)}
                disabled={item.purchased || !canAfford}
                style={{
                  background: item.purchased
                    ? "var(--surface-3)"
                    : canAfford
                    ? `linear-gradient(135deg, ${catColor}, var(--violet-dim))`
                    : "var(--surface-3)",
                  border: "none",
                  borderRadius: "var(--radius)",
                  padding: "8px 14px",
                  cursor: item.purchased || !canAfford ? "not-allowed" : "pointer",
                  color: item.purchased ? "var(--emerald)" : canAfford ? "#fff" : "var(--muted-foreground)",
                  fontSize: "0.8rem",
                  fontWeight: 600,
                  display: "flex",
                  alignItems: "center",
                  gap: 4,
                  flexShrink: 0,
                  minWidth: 70,
                  justifyContent: "center",
                  transition: "all 0.2s",
                  boxShadow: !item.purchased && canAfford ? `0 2px 12px ${catColor}44` : "none",
                }}
              >
                {item.purchased ? (
                  <CheckCircle size={14} />
                ) : !canAfford ? (
                  <Lock size={14} />
                ) : (
                  <>
                    <span>💎</span>
                    <span>{item.cost}</span>
                  </>
                )}
              </button>
            </motion.div>
          );
        })}
      </div>

      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10 }}
            style={{
              position: "fixed",
              bottom: 90,
              left: "50%",
              transform: "translateX(-50%)",
              background: "var(--violet)",
              color: "#fff",
              borderRadius: 99,
              padding: "10px 24px",
              fontWeight: 600,
              fontSize: "0.9rem",
              zIndex: 50,
              boxShadow: "var(--glow)",
              whiteSpace: "nowrap",
            }}
          >
            {toast}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Quote modal */}
      <AnimatePresence>
        {showQuote && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowQuote(false)}
            style={{
              position: "fixed",
              inset: 0,
              background: "rgba(0,0,0,0.7)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 100,
              padding: 24,
            }}
          >
            <motion.div
              initial={{ scale: 0.85, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.85, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              style={{
                background: "var(--surface-1)",
                border: "1px solid var(--violet)",
                borderRadius: "var(--radius)",
                padding: 32,
                maxWidth: 360,
                textAlign: "center",
                boxShadow: "var(--glow)",
              }}
            >
              <div style={{ fontSize: "2rem", marginBottom: 16 }}>✨</div>
              <p style={{ color: "var(--foreground)", fontSize: "1.1rem", fontStyle: "italic", lineHeight: 1.6 }}>
                "{quote}"
              </p>
              <button
                onClick={() => setShowQuote(false)}
                style={{
                  marginTop: 20,
                  background: "var(--violet)",
                  border: "none",
                  borderRadius: 99,
                  padding: "8px 24px",
                  color: "#fff",
                  cursor: "pointer",
                  fontWeight: 600,
                }}
              >
                Fechar
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
