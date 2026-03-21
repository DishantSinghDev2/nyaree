"use client";
// app/(admin)/dashboard/enquiries/page.tsx
import { useState, useEffect, useRef } from "react";
import { showToast } from "@/components/ui/Toaster";

export default function EnquiriesPage() {
  const [enquiries, setEnquiries] = useState<any[]>([]);
  const [selected, setSelected] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [reply, setReply] = useState("");
  const [sending, setSending] = useState(false);
  const [filter, setFilter] = useState("all");
  const bottomRef = useRef<HTMLDivElement>(null);

  const load = () => {
    fetch("/api/enquiries").then(r => r.json()).then(d => {
      if (d.success) setEnquiries(d.data);
    }).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [selected?.messages?.length]);

  const sendReply = async () => {
    if (!reply.trim() || !selected) return;
    setSending(true);
    try {
      const res = await fetch(`/api/enquiries/${selected._id}/reply`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: reply }),
      });
      const data = await res.json();
      if (data.success) {
        setReply("");
        // Update locally
        setSelected((prev: any) => ({ ...prev, messages: [...prev.messages, { role: "admin", content: reply, timestamp: new Date().toISOString() }] }));
        load();
      } else { showToast(data.error || "Failed to send", "error"); }
    } finally { setSending(false); }
  };

  const markResolved = async (id: string) => {
    await fetch(`/api/enquiries/${id}/resolve`, { method: "POST" });
    showToast("Marked as resolved ✓", "success");
    load();
    if (selected?._id === id) setSelected(null);
  };

  const filtered = enquiries.filter(e => filter === "all" ? true : filter === "escalated" ? e.isEscalated : e.status === filter);

  const STATUS_COLORS: Record<string, string> = {
    open: "status-confirmed", in_progress: "status-processing",
    escalated: "status-pending", resolved: "status-delivered",
  };

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontFamily: "var(--font-display)", fontSize: 26, fontWeight: 400 }}>Customer Enquiries</h1>
        <p style={{ fontSize: 13, color: "var(--color-ink-light)", marginTop: 4 }}>
          Respond to customer questions. Escalated chats need your immediate attention.
        </p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "320px 1fr", gap: 20, height: "calc(100vh - 200px)", minHeight: 500 }}>
        {/* Sidebar - enquiry list */}
        <div className="card" style={{ overflow: "hidden", display: "flex", flexDirection: "column" }}>
          {/* Filter tabs */}
          <div style={{ display: "flex", borderBottom: "1px solid var(--color-border)", flexShrink: 0 }}>
            {["all","escalated","open","resolved"].map(f => (
              <button key={f} onClick={() => setFilter(f)} style={{
                flex: 1, padding: "10px 4px", background: "none", border: "none",
                borderBottom: filter === f ? "2px solid var(--color-gold)" : "2px solid transparent",
                color: filter === f ? "var(--color-gold)" : "var(--color-ink-light)",
                fontSize: 11, fontWeight: 500, cursor: "pointer", textTransform: "capitalize",
              }}>{f}</button>
            ))}
          </div>

          <div style={{ overflowY: "auto", flex: 1 }}>
            {loading ? (
              <div style={{ padding: 20, textAlign: "center", color: "var(--color-ink-light)" }}>Loading...</div>
            ) : filtered.length === 0 ? (
              <div style={{ padding: 32, textAlign: "center" }}>
                <p style={{ fontSize: 24, marginBottom: 8 }}>💬</p>
                <p style={{ fontSize: 13, color: "var(--color-ink-light)" }}>No enquiries in this category</p>
              </div>
            ) : filtered.map(e => (
              <div key={e._id} onClick={() => setSelected(e)} style={{
                padding: "14px 16px", borderBottom: "1px solid var(--color-border-light)",
                cursor: "pointer", background: selected?._id === e._id ? "var(--color-ivory-dark)" : "transparent",
                borderLeft: e.isEscalated ? "3px solid var(--color-accent-red)" : "3px solid transparent",
                transition: "background 0.15s",
              }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8, marginBottom: 4 }}>
                  <p style={{ fontSize: 13, fontWeight: 500, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", flex: 1 }}>
                    {e.guestName || "Customer"}
                  </p>
                  <span className={`status-pill ${STATUS_COLORS[e.status] || "status-pending"}`} style={{ fontSize: 10, flexShrink: 0 }}>
                    {e.isEscalated ? "⚠️ Escalated" : e.status}
                  </span>
                </div>
                <p style={{ fontSize: 12, color: "var(--color-ink-light)", marginBottom: 3 }}>{e.subject}</p>
                <p style={{ fontSize: 11, color: "var(--color-ink-light)" }}>
                  {e.messages?.length} message{e.messages?.length !== 1 ? "s" : ""} · {e.createdAt ? new Date(e.createdAt).toLocaleDateString("en-IN") : ""}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Chat panel */}
        {!selected ? (
          <div className="card" style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
            <div style={{ textAlign: "center" }}>
              <p style={{ fontSize: 48, marginBottom: 12 }}>💬</p>
              <h2 style={{ fontFamily: "var(--font-display)", fontSize: 22, fontWeight: 300, marginBottom: 8 }}>Select an enquiry</h2>
              <p style={{ fontSize: 14, color: "var(--color-ink-light)" }}>Click on a customer enquiry to view and respond</p>
            </div>
          </div>
        ) : (
          <div className="card" style={{ display: "flex", flexDirection: "column", overflow: "hidden" }}>
            {/* Header */}
            <div style={{ padding: "16px 20px", borderBottom: "1px solid var(--color-border)", display: "flex", justifyContent: "space-between", alignItems: "center", flexShrink: 0 }}>
              <div>
                <h2 style={{ fontFamily: "var(--font-display)", fontSize: 18, fontWeight: 400 }}>{selected.guestName || "Customer"}</h2>
                <p style={{ fontSize: 12, color: "var(--color-ink-light)" }}>
                  {selected.guestEmail} · {selected.subject}
                  {selected.isEscalated && <span style={{ color: "var(--color-accent-red)", marginLeft: 8 }}>⚠️ Needs human help</span>}
                </p>
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                {selected.guestEmail && (
                  <a href={`mailto:${selected.guestEmail}?subject=Re: ${selected.subject}`} style={{ fontSize: 12, color: "var(--color-gold)", border: "1px solid var(--color-gold)", borderRadius: "var(--radius-pill)", padding: "5px 12px", textDecoration: "none" }}>
                    Email Customer
                  </a>
                )}
                {selected.status !== "resolved" && (
                  <button className="btn btn-outline btn-sm" onClick={() => markResolved(selected._id)} style={{ fontSize: 11 }}>
                    Mark Resolved ✓
                  </button>
                )}
              </div>
            </div>

            {/* Messages */}
            <div style={{ flex: 1, overflowY: "auto", padding: "16px 20px", display: "flex", flexDirection: "column", gap: 12 }}>
              {selected.messages?.map((msg: any, i: number) => (
                <div key={i} style={{ display: "flex", flexDirection: "column", alignItems: msg.role === "user" ? "flex-start" : "flex-end" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
                    <span style={{ fontSize: 10, color: "var(--color-ink-light)", textTransform: "uppercase", letterSpacing: 0.5 }}>
                      {msg.role === "user" ? selected.guestName || "Customer" : msg.role === "ai" ? "AI Assistant" : "Nyaree Team"}
                    </span>
                    <span style={{ fontSize: 10, color: "var(--color-ink-light)" }}>
                      {msg.timestamp ? new Date(msg.timestamp).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }) : ""}
                    </span>
                  </div>
                  <div style={{
                    maxWidth: "80%", padding: "10px 16px", borderRadius: msg.role === "user" ? "16px 16px 16px 4px" : "16px 16px 4px 16px",
                    background: msg.role === "user" ? "var(--color-ivory-dark)" : msg.role === "ai" ? "var(--color-surface)" : "var(--color-ink)",
                    color: msg.role === "admin" ? "#fff" : "var(--color-ink)",
                    border: msg.role !== "admin" ? "1px solid var(--color-border-light)" : "none",
                    fontSize: 14, lineHeight: 1.5,
                  }}>
                    {msg.content}
                  </div>
                </div>
              ))}
              <div ref={bottomRef} />
            </div>

            {/* Reply input */}
            {selected.status !== "resolved" ? (
              <div style={{ padding: "14px 20px", borderTop: "1px solid var(--color-border)", display: "flex", gap: 10, flexShrink: 0, background: "var(--color-surface)" }}>
                <textarea
                  value={reply}
                  onChange={e => setReply(e.target.value)}
                  onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendReply(); } }}
                  placeholder="Type your reply... (Enter to send, Shift+Enter for new line)"
                  className="input"
                  style={{ flex: 1, resize: "none", padding: "10px 14px", fontSize: 13, minHeight: 44, maxHeight: 120 }}
                  rows={2}
                />
                <button className={`btn btn-primary btn-sm ${sending ? "btn-loading" : ""}`} onClick={sendReply} disabled={sending || !reply.trim()} style={{ alignSelf: "flex-end", padding: "10px 20px" }}>
                  Send
                </button>
              </div>
            ) : (
              <div style={{ padding: "14px 20px", borderTop: "1px solid var(--color-border)", textAlign: "center", background: "#F0FDF4", color: "var(--color-success)", fontSize: 13, flexShrink: 0 }}>
                ✓ This enquiry is resolved
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
