"use client";
// components/store/ChatWidget.tsx
import { useState, useRef, useEffect } from "react";

interface Message { role: "user" | "ai" | "admin"; content: string; timestamp: string; }

export function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { role: "ai", content: "Hi! 👋 I'm here to help you with questions about our kurtis, tops, sizing, or orders. What can I help you with?", timestamp: new Date().toISOString() }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [escalated, setEscalated] = useState(false);
  const [sessionId] = useState(() => Math.random().toString(36).slice(2));
  const [guestName, setGuestName] = useState("");
  const [guestEmail, setGuestEmail] = useState("");
  const [showIntro, setShowIntro] = useState(true);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open && messages.length > 1) {
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }
    if (open) setTimeout(() => inputRef.current?.focus(), 200);
  }, [messages, open]);

  // Poll for admin replies in real-time (every 5s when chat is open)
  useEffect(() => {
    if (!open || showIntro) return;
    const poll = async () => {
      try {
        const res = await fetch(`/api/chat/poll?sessionId=${sessionId}`);
        const data = await res.json();
        if (data.reply) {
          setMessages(prev => {
            // Only add if not already present
            const already = prev.some(m => m.content === data.reply.content && m.role === "admin");
            if (already) return prev;
            return [...prev, data.reply as Message];
          });
        }
      } catch {}
    };
    const interval = setInterval(poll, 5000);
    return () => clearInterval(interval);
  }, [open, showIntro, sessionId]);

  const sendMessage = async () => {
    if (!input.trim() || loading) return;
    const userMsg: Message = { role: "user", content: input, timestamp: new Date().toISOString() };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId,
          message: input,
          guestName,
          guestEmail,
          messages: [...messages, userMsg].map((m) => ({ role: m.role === "ai" ? "assistant" : "user", content: m.content })),
        }),
      });
      const data = await res.json();
      const aiMsg: Message = { role: "ai", content: data.reply, timestamp: new Date().toISOString() };
      setMessages((prev) => [...prev, aiMsg]);
      if (data.escalated) {
        setEscalated(true);
        setMessages((prev) => [...prev, {
          role: "ai",
          content: "I've notified our team. Rishika or one of our staff will be with you shortly. You can also reach us directly at +91 8368989758 on WhatsApp! 🌸",
          timestamp: new Date().toISOString(),
        }]);
      }
    } catch {
      setMessages((prev) => [...prev, { role: "ai", content: "Sorry, I'm having trouble right now. Please WhatsApp us at +91 8368989758!", timestamp: new Date().toISOString() }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Floating button */}
      <button
        onClick={() => setOpen((o) => !o)}
        style={{
          position: "fixed", bottom: 80, right: 20, zIndex: 180,
          width: 52, height: 52, borderRadius: "50%",
          background: open ? "var(--color-ink)" : "var(--color-gold)",
          border: "none", color: "#fff",
          display: "flex", alignItems: "center", justifyContent: "center",
          boxShadow: "0 4px 20px rgba(200,150,12,0.4)",
          transition: "all 0.25s cubic-bezier(0.34,1.56,0.64,1)",
          transform: open ? "scale(0.9)" : "scale(1)",
        }}
        aria-label="Chat with us"
      >
        {open
          ? <span style={{ fontSize: 20 }}>×</span>
          : <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
        }
      </button>

      {/* Chat window */}
      {open && (
        <div
          style={{
            position: "fixed", bottom: 144, right: 20, zIndex: 181,
            width: "min(360px, calc(100vw - 32px))",
            background: "var(--color-surface)",
            borderRadius: "var(--radius-lg)", boxShadow: "var(--shadow-xl)",
            display: "flex", flexDirection: "column",
            height: 480, maxHeight: "70vh",
            animation: "scaleIn 0.2s cubic-bezier(0.34,1.56,0.64,1)",
            transformOrigin: "bottom right",
            overflow: "hidden",
          }}
        >
          {/* Header */}
          <div style={{ background: "var(--color-ink)", color: "#fff", padding: "16px 20px", display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ width: 36, height: 36, borderRadius: "50%", background: "var(--color-gold)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, flexShrink: 0 }}>🌸</div>
            <div>
              <p style={{ fontSize: 14, fontWeight: 500 }}>Nyaree Support</p>
              <p style={{ fontSize: 11, color: "rgba(255,255,255,0.6)" }}>
                {escalated ? "Connecting to Rishika..." : "AI Assistant · Usually replies instantly"}
              </p>
            </div>
            <a href="https://wa.me/918368989758" target="_blank" rel="noopener noreferrer" style={{ marginLeft: "auto", background: "#25D366", borderRadius: "var(--radius-pill)", padding: "4px 10px", fontSize: 11, color: "#fff", textDecoration: "none", flexShrink: 0 }}>
              WhatsApp
            </a>
          </div>

          {/* Intro form */}
          {showIntro && (
            <div style={{ padding: 20, borderBottom: "1px solid var(--color-border)" }}>
              <p style={{ fontSize: 13, color: "var(--color-ink-muted)", marginBottom: 12 }}>Quick intro so we can help you better:</p>
              <input placeholder="Your name" value={guestName} onChange={(e) => setGuestName(e.target.value)} className="input" style={{ marginBottom: 8 }} />
              <input placeholder="Email (optional)" type="email" value={guestEmail} onChange={(e) => setGuestEmail(e.target.value)} className="input" style={{ marginBottom: 12 }} />
              <button className="btn btn-primary btn-full btn-sm" onClick={() => setShowIntro(false)}>Start Chat</button>
            </div>
          )}

          {/* Messages */}
          {!showIntro && (
            <>
              <div style={{ flex: 1, overflowY: "auto", padding: "16px 16px 8px", display: "flex", flexDirection: "column", gap: 10 }}>
                {messages.map((msg, i) => (
                  <div key={i} style={{ display: "flex", flexDirection: "column", alignItems: msg.role === "user" ? "flex-end" : "flex-start" }}>
                    {msg.role !== "user" && (
                      <span style={{ fontSize: 10, color: "var(--color-ink-light)", marginBottom: 4, letterSpacing: 0.5 }}>
                        {msg.role === "admin" ? "Nyaree Team" : "AI Assistant"}
                      </span>
                    )}
                    <div className={msg.role === "user" ? "chat-bubble-user" : "chat-bubble-ai"}>
                      {msg.content}
                    </div>
                    <span style={{ fontSize: 10, color: "var(--color-ink-light)", marginTop: 3 }}>
                      {new Date(msg.timestamp).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}
                    </span>
                  </div>
                ))}
                {loading && (
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <div className="chat-bubble-ai" style={{ padding: "8px 14px" }}>
                      <span style={{ display: "inline-flex", gap: 4 }}>
                        {[0,1,2].map(i => <span key={i} style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--color-gold)", animation: `pulse 1.2s ease-in-out ${i*0.2}s infinite` }} />)}
                      </span>
                    </div>
                  </div>
                )}
                <div ref={bottomRef} />
              </div>

              {/* Input */}
              <div style={{ padding: "12px 16px", borderTop: "1px solid var(--color-border)", display: "flex", gap: 8 }}>
                <input
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter") sendMessage(); }}
                  placeholder="Ask about sizing, fabric, delivery..."
                  className="input"
                  style={{ flex: 1, padding: "10px 14px", fontSize: 13 }}
                />
                <button
                  onClick={sendMessage}
                  disabled={loading || !input.trim()}
                  className="btn btn-primary btn-sm"
                  style={{ padding: "10px 16px", flexShrink: 0 }}
                >
                  <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
                </button>
              </div>

              {/* Escalate button */}
              {!escalated && messages.length > 2 && (
                <div style={{ padding: "0 16px 12px", textAlign: "center" }}>
                  <button
                    onClick={async () => {
                      const res = await fetch("/api/chat/escalate", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ sessionId, guestName, guestEmail }) });
                      if (res.ok) { setEscalated(true); setMessages((prev) => [...prev, { role: "ai", content: "I've alerted our team! Rishika will get back to you soon. 🌸", timestamp: new Date().toISOString() }]); }
                    }}
                    style={{ fontSize: 11, color: "var(--color-ink-light)", background: "none", border: "none", textDecoration: "underline" }}
                  >
                    Talk to a real person
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </>
  );
}
