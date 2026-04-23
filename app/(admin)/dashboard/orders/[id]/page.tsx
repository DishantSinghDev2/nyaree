"use client";
// app/(admin)/dashboard/orders/[id]/page.tsx
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { showToast } from "@/components/ui/Toaster";

const STATUSES = ["pending","confirmed","processing","shipped","delivered","cancelled","returned","refunded"] as const;

export default function AdminOrderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [newStatus, setNewStatus] = useState("");
  const [tracking, setTracking] = useState({ courier: "", trackingNumber: "", trackingUrl: "", estimatedDelivery: "" });
  const [adminNote, setAdminNote] = useState("");

  useEffect(() => {
    fetch(`/api/orders/${id}`).then((r) => r.json()).then((d) => {
      if (d.success) {
        setOrder(d.data);
        setNewStatus(d.data.status);
        if (d.data.tracking) setTracking(d.data.tracking);
      }
    }).finally(() => setLoading(false));
  }, [id]);

  const fmt = (p: number) => `₹${(p / 100).toLocaleString("en-IN")}`;

  const updateOrder = async () => {
    setSaving(true);
    try {
      const res = await fetch(`/api/orders/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus, tracking, note: adminNote }),
      });
      const data = await res.json();
      if (data.success) { showToast("Order updated! Email sent to customer.", "success"); router.refresh(); }
      else showToast(data.error || "Update failed", "error");
    } finally { setSaving(false); }
  };

  if (loading) return <div style={{ textAlign: "center", padding: 80 }}><div className="animate-spin" style={{ width: 32, height: 32, border: "2px solid var(--color-border)", borderTopColor: "var(--color-gold)", borderRadius: "50%", margin: "0 auto" }} /></div>;
  if (!order) return <div style={{ textAlign: "center", padding: 80 }}><p>Order not found</p><Link href="/dashboard/orders"><button className="btn btn-outline btn-sm" style={{ marginTop: 16 }}>← Back to Orders</button></Link></div>;

  return (
    <div>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 32 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <Link href="/dashboard/orders" style={{ color: "var(--color-ink-light)", fontSize: 13, textDecoration: "none" }}>← Orders</Link>
          <h1 style={{ fontFamily: "var(--font-display)", fontSize: 24, fontWeight: 400 }}>{order.orderNumber}</h1>
          <span className={`status-pill status-${order.status}`}>{order.status}</span>
        </div>
        <p style={{ fontSize: 12, color: "var(--color-ink-light)" }}>
          {order.createdAt ? new Date(order.createdAt).toLocaleString("en-IN") : ""}
        </p>
      </div>

      <div className="admin-order-grid">
        {/* Main */}
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          {/* Items */}
          <div className="card" style={{ padding: 24 }}>
            <h2 style={{ fontFamily: "var(--font-display)", fontSize: 18, marginBottom: 16 }}>Items Ordered</h2>
            {order.items?.map((item: any, i: number) => (
              <div key={i} style={{ display: "flex", gap: 14, padding: "12px 0", borderBottom: i < order.items.length - 1 ? "1px solid var(--color-border-light)" : "none", alignItems: "center" }}>
                {item.image && <div style={{ width: 52, height: 66, position: "relative", borderRadius: 2, overflow: "hidden", flexShrink: 0 }}><Image src={item.image} alt={item.name} fill style={{ objectFit: "cover" }}
              sizes="(max-width: 860px) 100vw, 50vw"
            /></div>}
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: 14, fontWeight: 500 }}>{item.name}</p>
                  <p style={{ fontSize: 12, color: "var(--color-ink-light)" }}>{item.variant?.size} · {item.variant?.color} · Qty: {item.quantity}</p>
                  {item.customInstructions && <p style={{ fontSize: 12, color: "var(--color-gold)", marginTop: 3 }}>Custom: {item.customInstructions}</p>}
                </div>
                <p className="price" style={{ fontSize: 14 }}>{fmt(item.total)}</p>
              </div>
            ))}
            <div style={{ marginTop: 16, paddingTop: 16, borderTop: "1px solid var(--color-border)", display: "flex", flexDirection: "column", gap: 6, fontSize: 13 }}>
              <div style={{ display: "flex", justifyContent: "space-between" }}><span style={{ color: "var(--color-ink-light)" }}>Subtotal</span><span>{fmt(order.pricing?.subtotal)}</span></div>
              {order.pricing?.discount > 0 && <div style={{ display: "flex", justifyContent: "space-between", color: "var(--color-success)" }}><span>Discount ({order.pricing?.discountCode})</span><span>-{fmt(order.pricing.discount)}</span></div>}
              {order.pricing?.prepaidDiscount > 0 && <div style={{ display: "flex", justifyContent: "space-between", color: "var(--color-gold)" }}><span>Prepaid Discount</span><span>-{fmt(order.pricing.prepaidDiscount)}</span></div>}
              <div style={{ display: "flex", justifyContent: "space-between" }}><span style={{ color: "var(--color-ink-light)" }}>Shipping</span><span>{order.pricing?.shipping === 0 ? "FREE" : fmt(order.pricing?.shipping)}</span></div>
              <div style={{ display: "flex", justifyContent: "space-between", fontFamily: "var(--font-display)", fontSize: 18, paddingTop: 8, borderTop: "1px solid var(--color-border)", marginTop: 4 }}><span>Total</span><span>{fmt(order.pricing?.total)}</span></div>
            </div>
          </div>

          {/* Update Status */}
          <div className="card" style={{ padding: 24 }}>
            <h2 style={{ fontFamily: "var(--font-display)", fontSize: 18, marginBottom: 20 }}>Update Order</h2>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
              <div>
                <label className="label">Order Status</label>
                <select className="input" value={newStatus} onChange={(e) => setNewStatus(e.target.value)}>
                  {STATUSES.map((s) => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
                </select>
              </div>
              <div>
                <label className="label">Courier Name</label>
                <input className="input" value={tracking.courier} onChange={(e) => setTracking((t) => ({ ...t, courier: e.target.value }))} placeholder="DTDC / India Post / Delhivery" />
              </div>
              <div>
                <label className="label">Tracking Number</label>
                <input className="input" value={tracking.trackingNumber} onChange={(e) => setTracking((t) => ({ ...t, trackingNumber: e.target.value }))} placeholder="AWB123456789" />
              </div>
              <div>
                <label className="label">Tracking URL</label>
                <input className="input" value={tracking.trackingUrl} onChange={(e) => setTracking((t) => ({ ...t, trackingUrl: e.target.value }))} placeholder="https://track.courier.com/..." />
              </div>
              <div style={{ gridColumn: "1/-1" }}>
                <label className="label">Note (optional, saved internally)</label>
                <input className="input" value={adminNote} onChange={(e) => setAdminNote(e.target.value)} placeholder="Internal notes about this update..." />
              </div>
            </div>
            <div style={{ background: "#FEF9EC", border: "1px solid var(--color-gold)", borderRadius: "var(--radius-sm)", padding: "10px 14px", fontSize: 12, color: "var(--color-ink-muted)", marginBottom: 16 }}>
              💡 Updating to <strong>Shipped</strong> will automatically email the customer their tracking details. <strong>Delivered</strong> will send a review request email.
            </div>
            <button className={`btn btn-primary ${saving ? "btn-loading" : ""}`} onClick={updateOrder} disabled={saving}>
              {saving ? "Updating..." : "Update Order & Notify Customer"}
            </button>
          </div>

          {/* Order Timeline */}
          <div className="card" style={{ padding: 24 }}>
            <h2 style={{ fontFamily: "var(--font-display)", fontSize: 18, marginBottom: 16 }}>Timeline</h2>
            <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
              {[...((order.timeline ?? []).reverse())].map((t: any, i: number) => (
                <div key={i} style={{ display: "flex", gap: 14, paddingBottom: 16, position: "relative" }}>
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                    <div style={{ width: 10, height: 10, borderRadius: "50%", background: "var(--color-gold)", flexShrink: 0, marginTop: 3 }} />
                    {i < (order.timeline?.length ?? 0) - 1 && <div style={{ width: 1, flex: 1, background: "var(--color-border)", marginTop: 4 }} />}
                  </div>
                  <div style={{ flex: 1, paddingBottom: 8 }}>
                    <p style={{ fontSize: 13, fontWeight: 500, textTransform: "capitalize" }}>{t.status}</p>
                    {t.note && <p style={{ fontSize: 12, color: "var(--color-ink-light)" }}>{t.note}</p>}
                    <p style={{ fontSize: 11, color: "var(--color-ink-light)", marginTop: 2 }}>
                      {t.timestamp ? new Date(t.timestamp).toLocaleString("en-IN") : ""}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          {/* Customer */}
          <div className="card" style={{ padding: 20 }}>
            <h3 style={{ fontFamily: "var(--font-display)", fontSize: 16, marginBottom: 14 }}>Customer</h3>
            <p style={{ fontSize: 14, fontWeight: 500 }}>{order.shippingAddress?.fullName}</p>
            <p style={{ fontSize: 13, color: "var(--color-ink-light)" }}>{order.shippingAddress?.phone}</p>
            <p style={{ fontSize: 13, color: "var(--color-gold)" }}>{order.guestEmail}</p>
            <a href={`https://wa.me/91${order.shippingAddress?.phone?.replace(/\D/g, "")}`} target="_blank" rel="noopener noreferrer" style={{ display: "inline-block", marginTop: 12, fontSize: 12, color: "#25D366", border: "1px solid #25D366", borderRadius: "var(--radius-pill)", padding: "4px 12px", textDecoration: "none" }}>
              WhatsApp Customer
            </a>
          </div>

          {/* Address */}
          <div className="card" style={{ padding: 20 }}>
            <h3 style={{ fontFamily: "var(--font-display)", fontSize: 16, marginBottom: 14 }}>Shipping Address</h3>
            <p style={{ fontSize: 13, lineHeight: 1.8, color: "var(--color-ink-muted)" }}>
              {order.shippingAddress?.addressLine1}<br />
              {order.shippingAddress?.addressLine2 && <>{order.shippingAddress.addressLine2}<br /></>}
              {order.shippingAddress?.city}, {order.shippingAddress?.state}<br />
              {order.shippingAddress?.pincode}
            </p>
            <button onClick={() => { navigator.clipboard.writeText(`${order.shippingAddress?.fullName}\n${order.shippingAddress?.addressLine1}\n${order.shippingAddress?.city}, ${order.shippingAddress?.state} - ${order.shippingAddress?.pincode}`); showToast("Address copied!", "success"); }} style={{ marginTop: 10, fontSize: 12, color: "var(--color-gold)", background: "none", border: "none", cursor: "pointer", textDecoration: "underline" }}>
              Copy Address
            </button>
            {order.shippingAddress?.latitude && order.shippingAddress?.longitude && (
              <div style={{ marginTop: 14, paddingTop: 14, borderTop: "1px solid var(--color-border-light)" }}>
                <p style={{ fontSize: 12, color: "var(--color-ink-light)", marginBottom: 6 }}>Precise Location:</p>
                <p style={{ fontSize: 12, fontFamily: "monospace", color: "var(--color-ink)", marginBottom: 10 }}>
                  {order.shippingAddress.latitude.toFixed(6)}, {order.shippingAddress.longitude.toFixed(6)}
                </p>
                <a 
                  href={`https://www.google.com/maps?q=${order.shippingAddress.latitude},${order.shippingAddress.longitude}`} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 12, color: "#4285F4", border: "1px solid #4285F4", borderRadius: "var(--radius-pill)", padding: "4px 12px", textDecoration: "none" }}
                >
                  <span>📍</span> View on Google Maps
                </a>
              </div>
            )}
          </div>

          {/* Payment */}
          <div className="card" style={{ padding: 20 }}>
            <h3 style={{ fontFamily: "var(--font-display)", fontSize: 16, marginBottom: 14 }}>Payment</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: 8, fontSize: 13 }}>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: "var(--color-ink-light)" }}>Method</span>
                <span style={{ textTransform: "uppercase", fontWeight: 500 }}>{order.payment?.method}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: "var(--color-ink-light)" }}>Status</span>
                <span className={`status-pill ${order.payment?.status === "paid" ? "status-delivered" : "status-pending"}`}>{order.payment?.status}</span>
              </div>
              {order.payment?.razorpayPaymentId && (
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ color: "var(--color-ink-light)" }}>Payment ID</span>
                  <span style={{ fontFamily: "monospace", fontSize: 11 }}>{order.payment.razorpayPaymentId}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
