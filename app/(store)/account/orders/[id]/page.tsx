// app/(store)/account/orders/[id]/page.tsx
import { auth } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import { connectDB } from "@/lib/db/mongoose";
import { OrderModel } from "@/lib/db/models/index";
import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Order Details | Nyaree" };

export default async function OrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user) redirect(`/auth/login?next=/account/orders/${id}`);

  await connectDB();
  const o = await OrderModel.findOne({ _id: id, userId: session.user.id }).lean() as any;
  if (!o) notFound();

  const fmt = (p: number) => `₹${(p / 100).toLocaleString("en-IN")}`;
  const STATUS_STEPS = ["pending","confirmed","processing","shipped","delivered"];
  const currentStep = STATUS_STEPS.indexOf(o.status);

  return (
    <div className="container" style={{ maxWidth: 760, padding: "48px 0 80px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 32 }}>
        <Link href="/account/orders" style={{ color: "var(--color-ink-light)", textDecoration: "none", fontSize: 13 }}>← My Orders</Link>
        <h1 style={{ fontFamily: "var(--font-display)", fontSize: "clamp(1.4rem, 3vw, 1.8rem)", fontWeight: 300 }}>{o.orderNumber}</h1>
        <span className={`status-pill status-${o.status}`}>{o.status}</span>
      </div>

      {/* Progress */}
      {!["cancelled","returned","refunded"].includes(o.status) && (
        <div className="card" style={{ padding: 28, marginBottom: 24 }}>
          <h2 style={{ fontFamily: "var(--font-display)", fontSize: 18, marginBottom: 20 }}>Order Progress</h2>
          <div style={{ display: "flex", justifyContent: "space-between", position: "relative" }}>
            <div style={{ position: "absolute", top: 10, left: "5%", right: "5%", height: 2, background: "var(--color-border)", zIndex: 0 }}>
              <div style={{ height: "100%", background: "var(--color-gold)", width: `${Math.max(0, currentStep / (STATUS_STEPS.length - 1) * 100)}%`, transition: "width 0.5s" }} />
            </div>
            {STATUS_STEPS.map((step, i) => (
              <div key={step} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8, zIndex: 1 }}>
                <div style={{ width: 22, height: 22, borderRadius: "50%", background: i <= currentStep ? "var(--color-gold)" : "var(--color-border)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  {i < currentStep && <svg width="10" height="10" fill="none" stroke="#fff" strokeWidth="3" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg>}
                </div>
                <p style={{ fontSize: 10, color: i <= currentStep ? "var(--color-ink)" : "var(--color-ink-light)", textTransform: "capitalize", textAlign: "center" }}>{step}</p>
              </div>
            ))}
          </div>
          {o.tracking?.trackingNumber && (
            <div style={{ marginTop: 20, padding: "14px 18px", background: "var(--color-ivory-dark)", borderRadius: "var(--radius-sm)" }}>
              <p style={{ fontSize: 12, color: "var(--color-ink-light)", marginBottom: 2 }}>Tracking: <strong style={{ fontFamily: "monospace", fontSize: 14 }}>{o.tracking.trackingNumber}</strong> via {o.tracking.courier}</p>
              {o.tracking.trackingUrl && <a href={o.tracking.trackingUrl} target="_blank" rel="noopener noreferrer" style={{ fontSize: 13, color: "var(--color-gold)" }}>Track Package →</a>}
            </div>
          )}
        </div>
      )}

      {/* Items */}
      <div className="card" style={{ padding: 28, marginBottom: 24 }}>
        <h2 style={{ fontFamily: "var(--font-display)", fontSize: 18, marginBottom: 16 }}>Items</h2>
        {o.items?.map((item: any, i: number) => (
          <div key={i} style={{ display: "flex", gap: 16, padding: "14px 0", borderBottom: i < o.items.length - 1 ? "1px solid var(--color-border-light)" : "none" }}>
            {item.image && <div style={{ width: 64, height: 80, position: "relative", borderRadius: 2, overflow: "hidden", flexShrink: 0 }}><Image src={item.image} alt={item.name} fill style={{ objectFit: "cover" }}
              sizes="(max-width: 860px) 100vw, 50vw"
            /></div>}
            <div style={{ flex: 1 }}>
              <p style={{ fontFamily: "var(--font-display)", fontSize: 16 }}>{item.name}</p>
              <p style={{ fontSize: 12, color: "var(--color-ink-light)" }}>{item.variant?.size} · {item.variant?.color} · Qty: {item.quantity}</p>
            </div>
            <p className="price" style={{ fontSize: 15 }}>{fmt(item.total)}</p>
          </div>
        ))}
        <div style={{ marginTop: 16, paddingTop: 16, borderTop: "1px solid var(--color-border)", display: "flex", flexDirection: "column", gap: 8, fontSize: 14 }}>
          <div style={{ display: "flex", justifyContent: "space-between" }}><span style={{ color: "var(--color-ink-light)" }}>Subtotal</span><span>{fmt(o.pricing?.subtotal ?? 0)}</span></div>
          {o.pricing?.discount > 0 && <div style={{ display: "flex", justifyContent: "space-between", color: "var(--color-success)" }}><span>Discount</span><span>-{fmt(o.pricing.discount)}</span></div>}
          {o.pricing?.prepaidDiscount > 0 && <div style={{ display: "flex", justifyContent: "space-between", color: "var(--color-gold)" }}><span>Prepaid Discount</span><span>-{fmt(o.pricing.prepaidDiscount)}</span></div>}
          <div style={{ display: "flex", justifyContent: "space-between" }}><span style={{ color: "var(--color-ink-light)" }}>Shipping</span><span style={{ color: o.pricing?.shipping === 0 ? "var(--color-success)" : "" }}>{o.pricing?.shipping === 0 ? "FREE" : fmt(o.pricing?.shipping ?? 0)}</span></div>
          <div style={{ display: "flex", justifyContent: "space-between", fontFamily: "var(--font-display)", fontSize: 18, paddingTop: 8, borderTop: "1px solid var(--color-border)" }}><span>Total</span><span>{fmt(o.pricing?.total ?? 0)}</span></div>
        </div>
      </div>

      {/* Address + Payment */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        <div className="card" style={{ padding: 24 }}>
          <h3 style={{ fontFamily: "var(--font-display)", fontSize: 16, marginBottom: 12 }}>Shipping To</h3>
          <p style={{ fontSize: 13, lineHeight: 1.8, color: "var(--color-ink-muted)" }}>
            {o.shippingAddress?.fullName}<br/>
            {o.shippingAddress?.addressLine1}{o.shippingAddress?.addressLine2 ? `, ${o.shippingAddress.addressLine2}` : ""}<br/>
            {o.shippingAddress?.city}, {o.shippingAddress?.state} — {o.shippingAddress?.pincode}
          </p>
        </div>
        <div className="card" style={{ padding: 24 }}>
          <h3 style={{ fontFamily: "var(--font-display)", fontSize: 16, marginBottom: 12 }}>Payment</h3>
          <p style={{ fontSize: 13, color: "var(--color-ink-muted)" }}>
            {o.payment?.method === "cod" ? "Cash on Delivery" : "Online Payment"}<br/>
            <span className={`status-pill status-${o.payment?.status === "paid" ? "delivered" : "pending"}`} style={{ marginTop: 6, display: "inline-flex" }}>{o.payment?.status}</span>
          </p>
        </div>
      </div>

      <p style={{ textAlign: "center", marginTop: 32, fontSize: 13, color: "var(--color-ink-light)" }}>
        Need help? <a href="https://wa.me/918368989758" style={{ color: "var(--color-gold)" }}>WhatsApp us</a> with your order number
      </p>
    </div>
  );
}
