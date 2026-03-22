"use client";
// app/(admin)/dashboard/enquiries/page.tsx — realtime via SSE polling
import { useState, useEffect, useRef } from "react";
import { showToast } from "@/components/ui/Toaster";

export default function EnquiriesPage() {
  const [enquiries, setEnquiries] = useState<any[]>([]);
  const [selected, setSelected] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [reply, setReply] = useState("");
  const [sending, setSending] = useState(false);
  const [filter, setFilter] = useState("all");
  const [unread, setUnread] = useState(0);
  const bottomRef = useRef<HTMLDivElement>(null);
  const originalTitle = useRef(document.title);

  const load = async () => {
    try {
      const d = await fetch("/api/enquiries").then(r => r.json());
      if (d.success) {
        setEnquiries(d.data);
        const u = d.data.filter((e: any) => !e.readByAdmin).length;
        setUnread(u);
        // Update page title with unread count
        document.title = u > 0 ? `(${u}) Enquiries | Nyaree Admin` : "Enquiries | Nyaree Admin";
      }
    } finally { setLoading(false); }
  };

  useEffect(() => {
    load();
    originalTitle.current = document.title;
    return () => { document.title = originalTitle.current; };
  }, []);

  // SSE for realtime new message notifications
  useEffect(() => {
    const es = new EventSource("/api/admin/realtime-enquiries");
    es.onmessage = (e) => {
      try {
        const msg = JSON.parse(e.data);
        if (msg.type === "new_message" || msg.type === "unread_count") {
          load(); // refresh list
        }
      } catch {}
    };
    es.onerror = () => es.close();
    return () => es.close();
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [selected?.messages?.length]);

  const markRead = async (id: string) => {
    await fetch(`/api/enquiries/${id}/read`, { method: "POST" }).catch(() => {});
    load();
  };

  const selectEnquiry = (e: any) => {
    setSelected(e);
    if (!e.readByAdmin) markRead(e._id);
  };

  const sendReply = async () => {
    if (!reply.trim() || !selected) return;
    setSending(true);
    const msg = reply;
    try {
      const res = await fetch(`/api/enquiries/${selected._id}/reply`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: msg }),
      });
      const data = await res.json();
      if (data.success) {
        setReply("");
        setSelected((prev: any) => ({
          ...prev,
          messages: [...prev.messages, { role: "admin", content: msg, timestamp: new Date().toISOString() }],
        }));
        showToast("Reply sent!", "success");
        load();
      } else showToast(data.error || "Failed", "error");
    } finally { setSending(false); }
  };

  const filtered = filter === "all" ? enquiries
    : filter === "unread" ? enquiries.filter(e => !e.readByAdmin)
    : enquiries.filter(e => e.status === filter);

  const statusColor: Record<string, string> = {
    open: "var(--color-gold)", in_progress: "#3B82F6",
    resolved: "var(--color-success)", escalated: "var(--color-accent-red)",
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "calc(100vh - 120px)" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <div>
          <h1 style={{ fontFamily: "var(--font-display)", fontSize: 24, fontWeight: 400, display: "flex", alignItems: "center", gap: 10 }}>
            Enquiries
            {unread > 0 && (
              <span style={{ background: "var(--color-accent-red)", color: "#fff", borderRadius: "var(--radius-pill)", padding: "2px 10px", fontSize: 13, fontWeight: 600 }}>
                {unread} new
              </span>
            )}
          </h1>
          <p style={{ fontSize: 12, color: "var(--color-ink-light)", marginTop: 2 }}>
            Realtime · replies reach customer chat instantly
          </p>
        </div>
        <div style={{ display: "flex", gap: 6 }}>
          {["all", "unread", "open", "in_progress", "escalated", "resolved"].map(f => (
            <button key={f} onClick={() => setFilter(f)}
              style={{ padding: "5px 12px", borderRadius: "var(--radius-pill)", border: "1px solid var(--color-border)", background: filter === f ? "var(--color-ink)" : "transparent", color: filter === f ? "#fff" : "var(--color-ink-light)", fontSize: 11, cursor: "pointer", fontWeight: filter === f ? 500 : 400 }}>
              {f.replace("_", " ")}
              {f === "unread" && unread > 0 && ` (${unread})`}
            </button>
          ))}
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "340px 1fr", gap: 16, flex: 1, minHeight: 0 }}>
        {/* List */}
        <div style={{ overflowY: "auto", display: "flex", flexDirection: "column", gap: 8 }}>
          {loading ? (
            Array.from({ length: 5 }).map((_, i) => <div key={i} className="skeleton" style={{ height: 80, borderRadius: "var(--radius-sm)" }} />)
          ) : filtered.length === 0 ? (
            <div className="card" style={{ padding: 32, textAlign: "center" }}>
              <p style={{ fontSize: 28 }}>💬</p>
              <p style={{ color: "var(--color-ink-light)", marginTop: 8, fontSize: 13 }}>No enquiries</p>
            </div>
          ) : filtered.map(e => (
            <div key={e._id} onClick={() => selectEnquiry(e)} style={{
              padding: "14px 16px", borderRadius: "var(--radius-sm)", cursor: "pointer",
              background: selected?._id === e._id ? "var(--color-ivory-dark)" : "var(--color-surface)",
              border: selected?._id === e._id ? "2px solid var(--color-gold)" : "2px solid var(--color-border)",
              borderLeft: `4px solid ${statusColor[e.status] ?? "var(--color-border)"}`,
            }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 3 }}>
                    {!e.readByAdmin && <div style={{ width: 8, height: 8, borderRadius: "50%", background: "var(--color-accent-red)", flexShrink: 0 }} />}
                    <p style={{ fontSize: 13, fontWeight: e.readByAdmin ? 400 : 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {e.guestName || e.userId?.name || "Guest"}
                    </p>
                  </div>
                  <p style={{ fontSize: 12, color: "var(--color-ink-light)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{e.subject}</p>
                  <p style={{ fontSize: 11, color: "var(--color-ink-light)", marginTop: 3 }}>
                    {e.messages?.length ?? 0} messages · {new Date(e.updatedAt ?? e.createdAt).toLocaleString("en-IN", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
                  </p>
                </div>
                <span style={{ fontSize: 10, padding: "2px 7px", borderRadius: "var(--radius-pill)", background: `${statusColor[e.status]}20`, color: statusColor[e.status], flexShrink: 0, marginLeft: 8 }}>
                  {e.status}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Chat view */}
        {selected ? (
          <div className="card" style={{ display: "flex", flexDirection: "column", overflow: "hidden", padding: 0 }}>
            {/* Header */}
            <div style={{ padding: "16px 20px", borderBottom: "1px solid var(--color-border)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <p style={{ fontWeight: 600, fontSize: 15 }}>{selected.guestName || "Guest"}</p>
                <p style={{ fontSize: 12, color: "var(--color-ink-light)" }}>
                  {selected.guestEmail && <a href={`mailto:${selected.guestEmail}`} style={{ color: "var(--color-gold)" }}>{selected.guestEmail}</a>}
                  {selected.subject && ` · ${selected.subject}`}
                </p>
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                {selected.guestEmail && (
                  <a href={`https://wa.me/?text=${encodeURIComponent(`Hi ${selected.guestName || "there"}, regarding your enquiry: ${selected.subject}`)}`} target="_blank" rel="noopener noreferrer">
                    <button className="btn btn-outline btn-sm" style={{ color: "#25D366", borderColor: "#25D366" }}>WhatsApp</button>
                  </a>
                )}
                <select className="input" style={{ width: "auto", padding: "6px 10px", fontSize: 12 }}
                  value={selected.status}
                  onChange={async e => {
                    await fetch(`/api/enquiries/${selected._id}/status`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status: e.target.value }) });
                    setSelected((p: any) => ({ ...p, status: e.target.value }));
                    load();
                  }}>
                  {["open","in_progress","escalated","resolved"].map(s => <option key={s} value={s}>{s.replace("_"," ")}</option>)}
                </select>
              </div>
            </div>

            {/* Messages */}
            <div style={{ flex: 1, overflowY: "auto", padding: "16px 20px", display: "flex", flexDirection: "column", gap: 12 }}>
              {(selected.messages ?? []).map((msg: any, i: number) => (
                <div key={i} style={{ display: "flex", justifyContent: msg.role === "admin" ? "flex-end" : "flex-start" }}>
                  <div style={{
                    maxWidth: "70%", padding: "10px 14px", borderRadius: msg.role === "admin" ? "12px 12px 2px 12px" : "12px 12px 12px 2px",
                    background: msg.role === "admin" ? "var(--color-ink)" : "var(--color-ivory-dark)",
                    color: msg.role === "admin" ? "#fff" : "var(--color-ink)",
                    fontSize: 14, lineHeight: 1.6,
                  }}>
                    {msg.role !== "admin" && <p style={{ fontSize: 10, color: "var(--color-ink-light)", marginBottom: 4 }}>{msg.role === "ai" ? "🤖 AI" : "👤 Customer"}</p>}
                    {msg.content}
                    <p style={{ fontSize: 10, opacity: 0.6, marginTop: 4, textAlign: "right" }}>
                      {new Date(msg.timestamp).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}
                    </p>
                  </div>
                </div>
              ))}
              <div ref={bottomRef} />
            </div>

            {/* Reply input */}
            <div style={{ padding: "12px 20px", borderTop: "1px solid var(--color-border)", display: "flex", gap: 10 }}>
              <textarea
                value={reply} onChange={e => setReply(e.target.value)}
                onKeyDown={e => { if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) sendReply(); }}
                placeholder="Type reply... (Ctrl+Enter to send)"
                className="input" rows={2}
                style={{ flex: 1, resize: "none", fontSize: 13 }}
              />
              <button className={`btn btn-primary ${sending ? "btn-loading" : ""}`} onClick={sendReply} disabled={sending || !reply.trim()}
                style={{ alignSelf: "flex-end", flexShrink: 0 }}>
                Send
              </button>
            </div>
          </div>
        ) : (
          <div className="card" style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: 48 }}>
            <div style={{ textAlign: "center", color: "var(--color-ink-light)" }}>
              <p style={{ fontSize: 48 }}>💬</p>
              <p style={{ fontSize: 15, marginTop: 12 }}>Select an enquiry to start chatting</p>
              <p style={{ fontSize: 13, marginTop: 6 }}>Replies reach customers in real-time</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
