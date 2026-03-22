"use client";
// app/(store)/checkout/success/page.tsx
import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";

function SuccessContent() {
  const params = useSearchParams();
  const orderNumber = params.get("order") ?? "";
  const [coupon, setCoupon] = useState<{ code: string; value: string } | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    // Fire confetti
    import("canvas-confetti").then(({ default: confetti }) => {
      const colors = ["#C8960C", "#F0C060", "#2D4A3E", "#ffffff", "#E8B842"];
      const end = Date.now() + 3500;
      const frame = () => {
        confetti({ particleCount: 4, angle: 60, spread: 55, origin: { x: 0 }, colors });
        confetti({ particleCount: 4, angle: 120, spread: 55, origin: { x: 1 }, colors });
        if (Date.now() < end) requestAnimationFrame(frame);
      };
      frame();
    });

    // Fetch post-purchase coupon from settings
    fetch("/api/store/settings?fields=postPurchaseCouponEnabled,postPurchaseCouponCode,storeName")
      .then(r => r.json())
      .then(data => {
        if (data.success && data.data.postPurchaseCouponEnabled) {
          // Auto-find an active coupon or use the configured one
          const code = data.data.postPurchaseCouponCode || "";
          if (code) {
            // Get coupon details
            fetch(`/api/coupons/info?code=${code}`)
              .then(r => r.json())
              .then(d => {
                if (d.success) {
                  const c = d.data;
                  const val = c.type === "percent" ? `${c.value}% off` :
                              c.type === "fixed" ? `₹${(c.value/100).toLocaleString("en-IN")} off` : "Free shipping";
                  setCoupon({ code: c.code, value: val });
                }
              });
          }
        }
      })
      .catch(() => {});
  }, []);

  const copyCoupon = () => {
    if (!coupon) return;
    navigator.clipboard.writeText(coupon.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div style={{ minHeight: "70vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "40px 20px" }}>
      <div style={{ textAlign: "center", maxWidth: 540, width: "100%" }}>

        {/* Success icon */}
        <div style={{
          width: 80, height: 80, borderRadius: "50%",
          background: "linear-gradient(135deg, #E8F5E9, #C8E6C9)",
          border: "3px solid #4CAF50",
          display: "flex", alignItems: "center", justifyContent: "center",
          margin: "0 auto 24px", fontSize: 36,
          boxShadow: "0 0 0 8px rgba(76,175,80,0.1)",
        }}>✓</div>

        <h1 style={{ fontFamily: "var(--font-display)", fontSize: "clamp(1.8rem, 5vw, 2.8rem)", fontWeight: 300, marginBottom: 8 }}>
          Order Confirmed!
        </h1>

        {orderNumber && (
          <p style={{ fontFamily: "var(--font-display)", fontSize: 18, color: "var(--color-gold)", marginBottom: 16, letterSpacing: 1 }}>
            {orderNumber}
          </p>
        )}

        <p style={{ fontSize: 15, color: "var(--color-ink-muted)", lineHeight: 1.7, marginBottom: 28 }}>
          Thank you for shopping with Nyaree! 🌸<br />
          A confirmation email is on its way. We'll notify you when your order ships.
        </p>

        {/* Delivery estimate */}
        <div style={{ background: "var(--color-ivory-dark)", border: "1px solid var(--color-border)", borderRadius: "var(--radius-sm)", padding: "16px 20px", marginBottom: 20, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ textAlign: "left" }}>
            <p style={{ fontSize: 11, color: "var(--color-ink-light)", textTransform: "uppercase", letterSpacing: 1, marginBottom: 3 }}>Estimated Delivery</p>
            <p style={{ fontFamily: "var(--font-display)", fontSize: 16 }}>5–7 Business Days</p>
          </div>
          <span style={{ fontSize: 28 }}>🚚</span>
        </div>

        {/* ── Post-purchase coupon ── */}
        {coupon && (
          <div style={{
            background: "linear-gradient(135deg, #1A1208, #2D1E0A)",
            borderRadius: "var(--radius-sm)",
            padding: "20px 24px",
            marginBottom: 20,
            border: "1px solid var(--color-gold)",
            position: "relative",
            overflow: "hidden",
          }}>
            {/* Decorative dots */}
            <div style={{ position: "absolute", left: -10, top: "50%", transform: "translateY(-50%)", width: 20, height: 20, borderRadius: "50%", background: "var(--color-ivory)" }} />
            <div style={{ position: "absolute", right: -10, top: "50%", transform: "translateY(-50%)", width: 20, height: 20, borderRadius: "50%", background: "var(--color-ivory)" }} />
            {/* Dashed divider */}
            <div style={{ position: "absolute", left: 20, right: 20, top: "55%", borderTop: "1px dashed rgba(200,150,12,0.3)", pointerEvents: "none" }} />

            <p style={{ fontSize: 11, color: "var(--color-gold)", textTransform: "uppercase", letterSpacing: 2, marginBottom: 8 }}>🎁 A Gift For You</p>
            <p style={{ fontSize: 14, color: "rgba(255,255,255,0.8)", marginBottom: 14, lineHeight: 1.5 }}>
              Here's <strong style={{ color: "var(--color-gold)" }}>{coupon.value}</strong> on your next order!
            </p>
            <div style={{ display: "flex", alignItems: "center", gap: 10, justifyContent: "center" }}>
              <div style={{
                background: "rgba(200,150,12,0.15)",
                border: "2px dashed var(--color-gold)",
                borderRadius: 4,
                padding: "8px 20px",
                fontFamily: "monospace",
                fontSize: 20,
                fontWeight: 700,
                color: "var(--color-gold)",
                letterSpacing: 3,
              }}>
                {coupon.code}
              </div>
              <button
                onClick={copyCoupon}
                style={{
                  background: copied ? "var(--color-success)" : "var(--color-gold)",
                  color: "#1A1208",
                  border: "none",
                  borderRadius: 4,
                  padding: "8px 16px",
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: "pointer",
                  transition: "background 0.2s",
                  whiteSpace: "nowrap",
                }}
              >
                {copied ? "✓ Copied!" : "Copy Code"}
              </button>
            </div>
            <p style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", marginTop: 10 }}>
              Use at checkout on your next order at buynyaree.com
            </p>
          </div>
        )}

        {/* What's next */}
        <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 24 }}>
          {[
            { icon: "📧", text: "Confirmation email sent to your inbox" },
            { icon: "📦", text: "We'll carefully pack your order" },
            { icon: "🔔", text: "Tracking link sent when shipped" },
          ].map((item, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 14px", background: "var(--color-surface)", border: "1px solid var(--color-border-light)", borderRadius: "var(--radius-sm)", textAlign: "left" }}>
              <span style={{ fontSize: 18, flexShrink: 0 }}>{item.icon}</span>
              <span style={{ fontSize: 13, color: "var(--color-ink-muted)" }}>{item.text}</span>
            </div>
          ))}
        </div>

        {/* Instagram CTA */}
        <div style={{ background: "linear-gradient(135deg,#833ab4,#fd1d1d,#fcb045)", borderRadius: "var(--radius-sm)", padding: "16px 20px", marginBottom: 24 }}>
          <p style={{ fontFamily: "var(--font-display)", fontSize: 18, color: "#fff", marginBottom: 4 }}>Share Your Look!</p>
          <p style={{ fontSize: 13, color: "rgba(255,255,255,0.9)", marginBottom: 12 }}>
            Tag <strong>@shopnyaree</strong> when your order arrives ✨
          </p>
          <a href="https://instagram.com/shopnyaree" target="_blank" rel="noopener noreferrer"
            style={{ display: "inline-block", background: "rgba(255,255,255,0.2)", color: "#fff", padding: "6px 18px", borderRadius: "var(--radius-pill)", fontSize: 12, fontWeight: 500, textDecoration: "none" }}>
            Follow @shopnyaree
          </a>
        </div>

        {/* Actions */}
        <div style={{ display: "flex", gap: 10, justifyContent: "center", flexWrap: "wrap" }}>
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

export default function OrderSuccessPage() {
  return (
    <Suspense fallback={<div style={{ minHeight: "70vh", display: "flex", alignItems: "center", justifyContent: "center" }}><div style={{ fontFamily: "var(--font-display)", fontSize: 20, color: "var(--color-gold)" }}>Loading...</div></div>}>
      <SuccessContent />
    </Suspense>
  );
}
