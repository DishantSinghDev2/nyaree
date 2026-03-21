"use client";
// app/(store)/checkout/success/page.tsx
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";

export default function OrderSuccessPage() {
  const params = useSearchParams();
  const orderNumber = params.get("order") ?? "";
  const [confettiDone, setConfettiDone] = useState(false);

  useEffect(() => {
    // Fire confetti
    import("canvas-confetti").then(({ default: confetti }) => {
      const duration = 3000;
      const end = Date.now() + duration;
      const colors = ["#C8960C", "#F0C060", "#2D4A3E", "#ffffff"];
      const frame = () => {
        confetti({ particleCount: 3, angle: 60, spread: 55, origin: { x: 0 }, colors });
        confetti({ particleCount: 3, angle: 120, spread: 55, origin: { x: 1 }, colors });
        if (Date.now() < end) requestAnimationFrame(frame);
        else setConfettiDone(true);
      };
      frame();
    });
  }, []);

  return (
    <div style={{ minHeight: "70vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "40px 20px" }}>
      <div style={{ textAlign: "center", maxWidth: 520 }}>
        {/* Success icon */}
        <div style={{ width: 80, height: 80, borderRadius: "50%", background: "#E8F5E9", border: "3px solid var(--color-success)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 24px", fontSize: 32 }}>
          ✓
        </div>

        <h1 style={{ fontFamily: "var(--font-display)", fontSize: "clamp(2rem, 5vw, 3rem)", fontWeight: 300, marginBottom: 12 }}>
          Order Placed!
        </h1>
        <p style={{ fontFamily: "var(--font-display)", fontSize: 20, color: "var(--color-gold)", marginBottom: 16, letterSpacing: 1 }}>
          {orderNumber}
        </p>
        <p style={{ fontSize: 15, color: "var(--color-ink-muted)", lineHeight: 1.7, marginBottom: 32 }}>
          Thank you for shopping with Nyaree! 🌸<br />
          You'll receive a confirmation email shortly. We'll notify you when your order is shipped.
        </p>

        {/* Delivery estimate */}
        <div style={{ background: "var(--color-ivory-dark)", border: "1px solid var(--color-border)", borderRadius: "var(--radius-sm)", padding: "20px 24px", marginBottom: 32, textAlign: "left" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <p style={{ fontSize: 12, color: "var(--color-ink-light)", letterSpacing: 1, textTransform: "uppercase", marginBottom: 4 }}>Estimated Delivery</p>
              <p style={{ fontFamily: "var(--font-display)", fontSize: 18, color: "var(--color-ink)" }}>5–7 Business Days</p>
            </div>
            <span style={{ fontSize: 32 }}>🚚</span>
          </div>
        </div>

        {/* What's next */}
        <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 40 }}>
          {[
            { icon: "📧", text: "Confirmation email sent to your inbox" },
            { icon: "📦", text: "We'll pack your order with care" },
            { icon: "🔔", text: "You'll get a tracking link when shipped" },
          ].map((item, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 16px", background: "var(--color-surface)", border: "1px solid var(--color-border-light)", borderRadius: "var(--radius-sm)", textAlign: "left" }}>
              <span style={{ fontSize: 20, flexShrink: 0 }}>{item.icon}</span>
              <span style={{ fontSize: 13, color: "var(--color-ink-muted)" }}>{item.text}</span>
            </div>
          ))}
        </div>

        {/* Instagram CTA */}
        <div style={{ background: "linear-gradient(135deg, #833ab4, #fd1d1d, #fcb045)", borderRadius: "var(--radius-sm)", padding: "20px 24px", marginBottom: 32, color: "#fff" }}>
          <p style={{ fontFamily: "var(--font-display)", fontSize: 20, marginBottom: 6 }}>Share Your Look!</p>
          <p style={{ fontSize: 13, opacity: 0.9, marginBottom: 16 }}>Tag us <strong>@nyaree.in</strong> on Instagram when your order arrives. You might get featured! ✨</p>
          <a href="https://instagram.com/nyaree.in" target="_blank" rel="noopener noreferrer"
            style={{ display: "inline-block", background: "rgba(255,255,255,0.2)", color: "#fff", padding: "8px 20px", borderRadius: "var(--radius-pill)", fontSize: 12, fontWeight: 500, textDecoration: "none" }}>
            Follow @nyaree.in
          </a>
        </div>

        {/* Action buttons */}
        <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
          <Link href="/account/orders">
            <button className="btn btn-outline">Track My Order</button>
          </Link>
          <Link href="/shop">
            <button className="btn btn-primary">Continue Shopping</button>
          </Link>
        </div>
      </div>
    </div>
  );
}
