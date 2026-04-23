"use client";
// app/(store)/contact/page.tsx
import { useState } from "react";
import type { Metadata } from "next";

export default function ContactPage() {
  const [form, setForm] = useState({ name: "", email: "", phone: "", subject: "", message: "" });
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");
  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSending(true);
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (data.success) setSent(true);
      else setError(data.error || "Failed to send. Please try WhatsApp instead.");
    } catch {
      setError("Network error. Please try WhatsApp instead.");
    } finally {
      setSending(false);
    }
  };

  return (
    <div>
      {/* Hero */}
      <section style={{ background: "var(--color-ink)", padding: "64px 0 48px", textAlign: "center" }}>
        <div className="container" style={{ maxWidth: 600 }}>
          <p style={{ fontFamily: "var(--font-body)", fontSize: 11, letterSpacing: 4, textTransform: "uppercase", color: "var(--color-gold)", marginBottom: 12 }}>
            Get in Touch
          </p>
          <h1 style={{ fontFamily: "var(--font-display)", fontSize: "clamp(2rem, 5vw, 3.5rem)", fontWeight: 300, color: "#fff", marginBottom: 12 }}>
            Contact Us
          </h1>
          <p style={{ fontSize: 14, color: "rgba(255,255,255,0.6)" }}>
            We'd love to hear from you — orders, custom requests, styling advice, or just saying hello.
          </p>
        </div>
      </section>

      <div className="container contact-grid" style={{ maxWidth: 1000, padding: "64px 0 80px" }}>
        {/* Contact info */}
        <div>
          <h2 style={{ fontFamily: "var(--font-display)", fontSize: 24, fontWeight: 400, marginBottom: 32 }}>Ways to Reach Us</h2>

          <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
            {/* WhatsApp — fastest */}
            <a href="https://wa.me/918368989758" target="_blank" rel="noopener noreferrer" style={{ textDecoration: "none" }}>
              <div className="card" style={{ padding: 20, display: "flex", gap: 16, alignItems: "flex-start", borderLeft: "3px solid #25D366" }}>
                <span style={{ fontSize: 28, flexShrink: 0 }}>💬</span>
                <div>
                  <p style={{ fontWeight: 600, fontSize: 14, marginBottom: 3, color: "#25D366" }}>WhatsApp (Fastest)</p>
                  <p style={{ fontSize: 15, fontFamily: "var(--font-display)" }}>+91 8368989758</p>
                  <p style={{ fontSize: 12, color: "var(--color-ink-light)", marginTop: 3 }}>Mon–Sat, 10am–7pm IST · Usually replies in 1 hr</p>
                </div>
              </div>
            </a>

            {/* Email */}
            <a href="mailto:hello@buynyaree" style={{ textDecoration: "none" }}>
              <div className="card" style={{ padding: 20, display: "flex", gap: 16, alignItems: "flex-start", borderLeft: "3px solid var(--color-gold)" }}>
                <span style={{ fontSize: 28, flexShrink: 0 }}>📧</span>
                <div>
                  <p style={{ fontWeight: 600, fontSize: 14, marginBottom: 3 }}>Email</p>
                  <p style={{ fontSize: 15, fontFamily: "var(--font-display)", color: "var(--color-gold)" }}>hello@buynyaree</p>
                  <p style={{ fontSize: 12, color: "var(--color-ink-light)", marginTop: 3 }}>We respond within 24 hours</p>
                </div>
              </div>
            </a>

            {/* Address */}
            <div className="card" style={{ padding: 20, display: "flex", gap: 16, alignItems: "flex-start", borderLeft: "3px solid var(--color-border)" }}>
              <span style={{ fontSize: 28, flexShrink: 0 }}>📍</span>
              <div>
                <p style={{ fontWeight: 600, fontSize: 14, marginBottom: 3 }}>Our Studio</p>
                <p style={{ fontSize: 14, lineHeight: 1.7, color: "var(--color-ink-muted)" }}>
                  Parnala Extended Industrial Area<br />
                  Bahadurgarh, Haryana — 124507
                </p>
              </div>
            </div>

            {/* Hours */}
            <div style={{ padding: "16px 20px", background: "var(--color-ivory-dark)", borderRadius: "var(--radius-sm)", fontSize: 13 }}>
              <p style={{ fontWeight: 600, marginBottom: 8 }}>Business Hours</p>
              <div style={{ display: "flex", justifyContent: "space-between" }}><span style={{ color: "var(--color-ink-light)" }}>Monday – Saturday</span><span>10:00 AM – 7:00 PM</span></div>
              <div style={{ display: "flex", justifyContent: "space-between", marginTop: 4 }}><span style={{ color: "var(--color-ink-light)" }}>Sunday</span><span>Closed</span></div>
            </div>
          </div>
        </div>

        {/* Contact form */}
        <div>
          <h2 style={{ fontFamily: "var(--font-display)", fontSize: 24, fontWeight: 400, marginBottom: 24 }}>Send a Message</h2>

          {sent ? (
            <div style={{ background: "#F0FDF4", border: "1px solid var(--color-success)", borderRadius: "var(--radius-sm)", padding: 32, textAlign: "center" }}>
              <p style={{ fontSize: 36, marginBottom: 12 }}>✅</p>
              <h3 style={{ fontFamily: "var(--font-display)", fontSize: 22, marginBottom: 8 }}>Message Sent!</h3>
              <p style={{ fontSize: 14, color: "var(--color-ink-light)", marginBottom: 20 }}>We'll get back to you within 24 hours. For urgent queries, WhatsApp us directly.</p>
              <a href="https://wa.me/918368989758" target="_blank" rel="noopener noreferrer">
                <button className="btn btn-primary">Open WhatsApp</button>
              </a>
            </div>
          ) : (
            <div className="card" style={{ padding: 32 }}>
              <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                  <div>
                    <label className="label">Full Name *</label>
                    <input className="input" value={form.name} onChange={e => set("name", e.target.value)} placeholder="Priya Sharma" required />
                  </div>
                  <div>
                    <label className="label">Phone Number</label>
                    <input className="input" type="tel" value={form.phone} onChange={e => set("phone", e.target.value)} placeholder="+91 98765 43210" />
                  </div>
                </div>
                <div>
                  <label className="label">Email Address *</label>
                  <input className="input" type="email" value={form.email} onChange={e => set("email", e.target.value)} placeholder="you@example.com" required />
                </div>
                <div>
                  <label className="label">Subject *</label>
                  <select className="input" value={form.subject} onChange={e => set("subject", e.target.value)} required>
                    <option value="">Select a topic...</option>
                    <option value="Order Query">Order Query</option>
                    <option value="Custom Order">Custom Order Request</option>
                    <option value="Return / Exchange">Return / Exchange</option>
                    <option value="Product Question">Product Question</option>
                    <option value="Bulk Order">Bulk / Wholesale Order</option>
                    <option value="Feedback">Feedback & Suggestions</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="label">Message *</label>
                  <textarea className="input" value={form.message} onChange={e => set("message", e.target.value)} placeholder="Tell us how we can help you..." rows={5} required style={{ resize: "vertical" }} />
                </div>
                {error && (
                  <div style={{ background: "#FEE2E2", border: "1px solid var(--color-accent-red)", borderRadius: "var(--radius-sm)", padding: "10px 14px", fontSize: 13, color: "var(--color-accent-red)" }}>
                    {error}
                  </div>
                )}
                <button type="submit" className={`btn btn-primary btn-full ${sending ? "btn-loading" : ""}`} disabled={sending}>
                  {sending ? "Sending..." : "Send Message"}
                </button>
                <p style={{ fontSize: 12, color: "var(--color-ink-light)", textAlign: "center" }}>
                  Or chat directly on{" "}
                  <a href="https://wa.me/918368989758" style={{ color: "#25D366" }}>WhatsApp</a> for instant help
                </p>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
