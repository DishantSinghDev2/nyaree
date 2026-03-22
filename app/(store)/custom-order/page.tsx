"use client";
// app/(store)/custom-order/page.tsx
import { useState } from "react";

export default function CustomOrderPage() {
  const [form, setForm] = useState({
    name: "", email: "", phone: "",
    garmentType: "", fabric: "", color: "",
    size: "", length: "", quantity: "1",
    occasion: "", deadline: "", budget: "",
    notes: "", referenceImages: "",
  });
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");
  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true); setError("");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name, email: form.email, phone: form.phone,
          subject: `Custom Order Request — ${form.garmentType || "Garment"}`,
          message: `Custom Order Details:\n\nGarment Type: ${form.garmentType}\nFabric: ${form.fabric}\nColor/Print: ${form.color}\nSize: ${form.size}\nLength: ${form.length}\nQuantity: ${form.quantity}\nOccasion: ${form.occasion}\nRequired By: ${form.deadline}\nBudget: ${form.budget}\nReference Images: ${form.referenceImages || "None"}\n\nAdditional Notes:\n${form.notes}`,
        }),
      });
      const data = await res.json();
      if (data.success) setSent(true);
      else setError(data.error || "Failed to submit. Please WhatsApp us directly.");
    } catch {
      setError("Network error. Please WhatsApp us at +91 8368989758.");
    } finally { setSending(false); }
  };

  return (
    <div>
      <section style={{ background: "var(--color-ink)", padding: "64px 0 48px", textAlign: "center" }}>
        <div className="container" style={{ maxWidth: 620 }}>
          <p style={{ fontFamily: "var(--font-body)", fontSize: 11, letterSpacing: 4, textTransform: "uppercase", color: "var(--color-gold)", marginBottom: 12 }}>
            Made Just For You
          </p>
          <h1 style={{ fontFamily: "var(--font-display)", fontSize: "clamp(2rem, 5vw, 3.5rem)", fontWeight: 300, color: "#fff", marginBottom: 12 }}>
            Custom Orders
          </h1>
          <p style={{ fontSize: 14, color: "rgba(255,255,255,0.6)" }}>
            Can't find exactly what you're looking for? We create custom pieces tailored to your exact measurements and style preferences.
          </p>
        </div>
      </section>

      <div className="container custom-order-grid" style={{ maxWidth: 900, padding: "64px 0 80px" }}>
        {/* How it works */}
        <div>
          <h2 style={{ fontFamily: "var(--font-display)", fontSize: 22, fontWeight: 400, marginBottom: 28 }}>How It Works</h2>
          <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
            {[
              { step: "01", title: "Submit Your Request", desc: "Fill in the form with your requirements — fabric, colour, measurements, and occasion." },
              { step: "02", title: "We'll Reach Out", desc: "Our team contacts you within 24 hours to discuss details, share samples, and confirm pricing." },
              { step: "03", title: "Design & Stitch", desc: "We create your garment with care, updating you with progress photos along the way." },
              { step: "04", title: "Delivery", desc: "Your custom piece is carefully packed and delivered to your door within the agreed timeline." },
            ].map((s, i) => (
              <div key={s.step} style={{ display: "flex", gap: 20, paddingBottom: i < 3 ? 28 : 0, position: "relative" }}>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", flexShrink: 0 }}>
                  <div style={{ width: 36, height: 36, borderRadius: "50%", background: "var(--color-gold)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700, color: "#1A1208", flexShrink: 0 }}>{s.step}</div>
                  {i < 3 && <div style={{ width: 1, flex: 1, background: "var(--color-border)", marginTop: 6 }} />}
                </div>
                <div style={{ paddingBottom: i < 3 ? 8 : 0 }}>
                  <p style={{ fontFamily: "var(--font-display)", fontSize: 16, marginBottom: 4 }}>{s.title}</p>
                  <p style={{ fontSize: 13, color: "var(--color-ink-light)", lineHeight: 1.6 }}>{s.desc}</p>
                </div>
              </div>
            ))}
          </div>

          <div style={{ marginTop: 32, padding: "16px 20px", background: "var(--color-ivory-dark)", borderRadius: "var(--radius-sm)", fontSize: 13 }}>
            <p style={{ fontWeight: 600, marginBottom: 8 }}>Custom Order Details</p>
            <p style={{ color: "var(--color-ink-light)", lineHeight: 1.7 }}>
              Minimum order: 1 piece · Lead time: 7–15 days · Pricing based on fabric + design complexity
            </p>
          </div>
        </div>

        {/* Form */}
        <div>
          {sent ? (
            <div style={{ background: "#F0FDF4", border: "1px solid var(--color-success)", borderRadius: "var(--radius-sm)", padding: 40, textAlign: "center" }}>
              <p style={{ fontSize: 40, marginBottom: 12 }}>🎉</p>
              <h2 style={{ fontFamily: "var(--font-display)", fontSize: 24, marginBottom: 12 }}>Request Received!</h2>
              <p style={{ fontSize: 14, color: "var(--color-ink-light)", marginBottom: 24 }}>
                We'll review your request and reach out within 24 hours. For faster response, WhatsApp us directly.
              </p>
              <a href="https://wa.me/918368989758" target="_blank" rel="noopener noreferrer">
                <button className="btn btn-primary">Chat on WhatsApp</button>
              </a>
            </div>
          ) : (
            <div className="card" style={{ padding: 32 }}>
              <h2 style={{ fontFamily: "var(--font-display)", fontSize: 22, marginBottom: 24 }}>Tell Us What You Need</h2>
              <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                  <div><label className="label">Name *</label><input className="input" value={form.name} onChange={e => set("name", e.target.value)} required /></div>
                  <div><label className="label">Phone *</label><input className="input" type="tel" value={form.phone} onChange={e => set("phone", e.target.value)} required /></div>
                </div>
                <div><label className="label">Email *</label><input className="input" type="email" value={form.email} onChange={e => set("email", e.target.value)} required /></div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                  <div>
                    <label className="label">Garment Type *</label>
                    <select className="input" value={form.garmentType} onChange={e => set("garmentType", e.target.value)} required>
                      <option value="">Select...</option>
                      <option>Kurti</option>
                      <option>Top</option>
                      <option>Co-ord Set</option>
                      <option>Dupatta</option>
                      <option>Lehenga</option>
                      <option>Other</option>
                    </select>
                  </div>
                  <div><label className="label">Quantity</label><input className="input" type="number" min="1" value={form.quantity} onChange={e => set("quantity", e.target.value)} /></div>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                  <div><label className="label">Fabric Preference</label><input className="input" value={form.fabric} onChange={e => set("fabric", e.target.value)} placeholder="Cotton, Rayon, Silk..." /></div>
                  <div><label className="label">Colour / Print</label><input className="input" value={form.color} onChange={e => set("color", e.target.value)} placeholder="Blue floral, Red block print..." /></div>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                  <div>
                    <label className="label">Your Size</label>
                    <select className="input" value={form.size} onChange={e => set("size", e.target.value)}>
                      <option value="">Select...</option>
                      {["XS","S","M","L","XL","2XL","3XL","Custom"].map(s => <option key={s}>{s}</option>)}
                    </select>
                  </div>
                  <div><label className="label">Desired Length (inches)</label><input className="input" value={form.length} onChange={e => set("length", e.target.value)} placeholder="e.g. 44 inches" /></div>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                  <div><label className="label">Occasion</label><input className="input" value={form.occasion} onChange={e => set("occasion", e.target.value)} placeholder="Wedding, Casual, Office..." /></div>
                  <div><label className="label">Required By</label><input className="input" type="date" value={form.deadline} onChange={e => set("deadline", e.target.value)} /></div>
                </div>

                <div><label className="label">Approximate Budget (₹)</label><input className="input" value={form.budget} onChange={e => set("budget", e.target.value)} placeholder="e.g. ₹800–1200" /></div>
                <div><label className="label">Reference Image Links (optional)</label><input className="input" value={form.referenceImages} onChange={e => set("referenceImages", e.target.value)} placeholder="Pinterest links, Google Drive, etc." /></div>
                <div><label className="label">Additional Notes</label><textarea className="input" value={form.notes} onChange={e => set("notes", e.target.value)} rows={3} placeholder="Embroidery details, special requests, measurements..." style={{ resize: "vertical" }} /></div>

                {error && <div style={{ background: "#FEE2E2", padding: "10px 14px", borderRadius: "var(--radius-sm)", fontSize: 13, color: "var(--color-accent-red)" }}>{error}</div>}
                <button type="submit" className={`btn btn-primary btn-full ${sending ? "btn-loading" : ""}`} disabled={sending}>
                  {sending ? "Submitting..." : "Submit Custom Order Request"}
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
