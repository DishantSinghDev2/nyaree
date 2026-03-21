"use client";
// app/(store)/track-order/page.tsx
import { useState } from "react";
import type { Metadata } from "next";

export default function TrackOrderPage() {
  const [orderNumber, setOrderNumber] = useState("");
  const [email, setEmail] = useState("");
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleTrack = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(""); setOrder(null); setLoading(true);
    try {
      const res = await fetch(`/api/orders/track?orderNumber=${encodeURIComponent(orderNumber)}&email=${encodeURIComponent(email)}`);
      const data = await res.json();
      if (data.success) setOrder(data.data);
      else setError(data.error || "Order not found. Please check the details.");
    } catch { setError("Something went wrong. Please try again."); }
    finally { setLoading(false); }
  };

  const fmt = (p: number) => `₹${(p / 100).toLocaleString("en-IN")}`;

  const STATUS_STEPS = ["pending","confirmed","processing","shipped","delivered"];
  const currentStep = order ? STATUS_STEPS.indexOf(order.status) : -1;

  return (
    <div className="container" style={{ maxWidth: 640, padding: "64px 0 80px" }}>
      <p style={{ fontFamily: "var(--font-body)", fontSize: 11, letterSpacing: 3, textTransform: "uppercase", color: "var(--color-gold)", marginBottom: 12 }}>
        Order Tracking
      </p>
      <h1 style={{ fontFamily: "var(--font-display)", fontSize: "clamp(1.8rem, 4vw, 2.8rem)", fontWeight: 300, marginBottom: 40 }}>
        Track Your Order
      </h1>

      <div className="card" style={{ padding: 32, marginBottom: 32 }}>
        <form onSubmit={handleTrack} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div>
            <label className="label">Order Number</label>
            <input className="input" value={orderNumber} onChange={(e) => setOrderNumber(e.target.value)} placeholder="NYR-XXXXXXXX" required />
          </div>
          <div>
            <label className="label">Email Address</label>
            <input className="input" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email used for the order" required />
          </div>
          {error && <p style={{ fontSize: 13, color: "var(--color-accent-red)", background: "#FEE2E2", padding: "10px 14px", borderRadius: "var(--radius-sm)" }}>{error}</p>}
          <button type="submit" className={`btn btn-primary ${loading ? "btn-loading" : ""}`} disabled={loading}>
            {loading ? "Tracking..." : "Track Order"}
          </button>
        </form>
      </div>

      {order && (
        <div className="card" style={{ padding: 32, animation: "fadeInUp 0.3s ease" }}>
          <div style={{ marginBottom: 28 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 12 }}>
              <div>
                <p style={{ fontFamily: "var(--font-display)", fontSize: 22 }}>{order.orderNumber}</p>
                <p style={{ fontSize: 13, color: "var(--color-ink-light)" }}>
                  Placed: {new Date(order.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}
                </p>
              </div>
              <span className={`status-pill status-${order.status}`} style={{ fontSize: 12 }}>{order.status}</span>
            </div>
          </div>

          {/* Progress bar */}
          {!["cancelled","returned","refunded"].includes(order.status) && (
            <div style={{ marginBottom: 32 }}>
              <div style={{ display: "flex", justifyContent: "space-between", position: "relative", marginBottom: 8 }}>
                <div style={{ position: "absolute", top: 10, left: "10%", right: "10%", height: 2, background: "var(--color-border)", zIndex: 0 }}>
                  <div style={{ height: "100%", background: "var(--color-gold)", width: `${Math.max(0, (currentStep / (STATUS_STEPS.length - 1)) * 100)}%`, transition: "width 0.5s ease" }} />
                </div>
                {STATUS_STEPS.map((step, i) => (
                  <div key={step} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6, zIndex: 1, flex: 1 }}>
                    <div style={{ width: 20, height: 20, borderRadius: "50%", background: i <= currentStep ? "var(--color-gold)" : "var(--color-border)", border: `3px solid ${i <= currentStep ? "var(--color-gold)" : "var(--color-border)"}`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                      {i < currentStep && <svg width="10" height="10" fill="none" stroke="#fff" strokeWidth="3" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg>}
                    </div>
                    <p style={{ fontSize: 10, color: i <= currentStep ? "var(--color-ink)" : "var(--color-ink-light)", textTransform: "capitalize", textAlign: "center", letterSpacing: 0.5 }}>{step}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tracking info */}
          {order.tracking?.trackingNumber && (
            <div style={{ background: "var(--color-ivory-dark)", padding: 16, borderRadius: "var(--radius-sm)", marginBottom: 20 }}>
              <p style={{ fontSize: 12, color: "var(--color-ink-light)", marginBottom: 4 }}>Tracking Number</p>
              <p style={{ fontFamily: "monospace", fontSize: 16, letterSpacing: 1 }}>{order.tracking.trackingNumber}</p>
              <p style={{ fontSize: 12, color: "var(--color-ink-light)", marginTop: 4 }}>Courier: {order.tracking.courier}</p>
              {order.tracking.trackingUrl && (
                <a href={order.tracking.trackingUrl} target="_blank" rel="noopener noreferrer" style={{ display: "inline-block", marginTop: 10, fontSize: 13, color: "var(--color-gold)" }}>
                  Track on courier website →
                </a>
              )}
            </div>
          )}

          {/* Items */}
          <h3 style={{ fontFamily: "var(--font-display)", fontSize: 16, marginBottom: 12 }}>Items Ordered</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 20 }}>
            {order.items?.map((item: any, i: number) => (
              <div key={i} style={{ display: "flex", gap: 12, alignItems: "center" }}>
                {item.image && <img src={item.image} alt={item.name} style={{ width: 48, height: 60, objectFit: "cover", borderRadius: "var(--radius-sm)", flexShrink: 0 }} />}
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: 13, fontWeight: 500 }}>{item.name}</p>
                  <p style={{ fontSize: 11, color: "var(--color-ink-light)" }}>{item.variant?.size} · {item.variant?.color} · Qty: {item.quantity}</p>
                </div>
                <p style={{ fontSize: 13, fontWeight: 500 }}>{fmt(item.total)}</p>
              </div>
            ))}
          </div>

          <div style={{ borderTop: "1px solid var(--color-border)", paddingTop: 16, display: "flex", justifyContent: "space-between", fontFamily: "var(--font-display)", fontSize: 18 }}>
            <span>Total Paid</span>
            <span>{fmt(order.pricing?.total ?? 0)}</span>
          </div>

          <p style={{ marginTop: 20, fontSize: 13, color: "var(--color-ink-light)", textAlign: "center" }}>
            Questions about your order?{" "}
            <a href="https://wa.me/918368989758" style={{ color: "var(--color-gold)" }}>WhatsApp us</a>
          </p>
        </div>
      )}
    </div>
  );
}
