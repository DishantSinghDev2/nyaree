"use client";
// components/admin/AdminAIAssistant.tsx
import { useState } from "react";

export function AdminAIAssistant({ stats }: { stats: any }) {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<{ role: "user" | "ai"; text: string }[]>([
    { role: "ai", text: "Hi Rishika! 🌸 I'm your AI assistant. Ask me anything about your store — sales, inventory, tips to grow — I'm here to help!" }
  ]);
  const [loading, setLoading] = useState(false);

  const send = async () => {
    if (!input.trim() || loading) return;
    const q = input; setInput(""); setLoading(true);
    setMessages((m) => [...m, { role: "user", text: q }]);
    try {
      const res = await fetch("/api/ai/admin-chat", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ question: q, context: stats }) });
      const data = await res.json();
      setMessages((m) => [...m, { role: "ai", text: data.reply }]);
    } catch {
      setMessages((m) => [...m, { role: "ai", text: "Something went wrong. Please try again." }]);
    } finally { setLoading(false); }
  };

  return (
    <div className="card" style={{ padding: 24, display: "flex", flexDirection: "column", height: 400 }}>
      <h2 style={{ fontFamily: "var(--font-display)", fontSize: 20, fontWeight: 400, marginBottom: 16, flexShrink: 0 }}>AI Assistant ✨</h2>
      <div style={{ flex: 1, overflowY: "auto", display: "flex", flexDirection: "column", gap: 10, marginBottom: 12 }}>
        {messages.map((m, i) => (
          <div key={i} style={{ display: "flex", flexDirection: "column", alignItems: m.role === "user" ? "flex-end" : "flex-start" }}>
            <div style={{
              padding: "8px 14px", borderRadius: m.role === "user" ? "12px 12px 4px 12px" : "12px 12px 12px 4px",
              background: m.role === "user" ? "var(--color-ink)" : "var(--color-ivory-dark)",
              color: m.role === "user" ? "#fff" : "var(--color-ink)", fontSize: 13, lineHeight: 1.5, maxWidth: "90%",
            }}>
              {m.text}
            </div>
          </div>
        ))}
        {loading && (
          <div style={{ alignSelf: "flex-start", padding: "8px 14px", background: "var(--color-ivory-dark)", borderRadius: "12px 12px 12px 4px" }}>
            <span style={{ display: "inline-flex", gap: 4 }}>
              {[0,1,2].map(i => <span key={i} style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--color-gold)", animation: `pulse 1.2s ease-in-out ${i * 0.2}s infinite` }} />)}
            </span>
          </div>
        )}
      </div>
      <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
        <input className="input" value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => e.key === "Enter" && send()} placeholder="Ask about sales, stock, tips..." style={{ flex: 1, fontSize: 13 }} />
        <button className="btn btn-primary btn-sm" onClick={send} disabled={loading || !input.trim()}>→</button>
      </div>
    </div>
  );
}
