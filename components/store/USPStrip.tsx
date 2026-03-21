// components/store/USPStrip.tsx
export function USPStrip() {
  const items = [
    { icon: "🚚", title: "Free Shipping", desc: "On orders above ₹499" },
    { icon: "↩️", title: "7-Day Returns", desc: "No questions asked" },
    { icon: "✂️", title: "Custom Orders", desc: "Made to your measurements" },
    { icon: "🇮🇳", title: "Made in India", desc: "Crafted with love" },
    { icon: "💳", title: "COD Available", desc: "Pay on delivery" },
    { icon: "🔒", title: "Secure Checkout", desc: "256-bit SSL encrypted" },
  ];
  return (
    <div style={{ background: "var(--color-surface)", borderTop: "1px solid var(--color-border)", borderBottom: "1px solid var(--color-border)" }}>
      <div className="container">
        <div style={{ display: "flex", overflowX: "auto", gap: 0, padding: "20px 0" }}>
          {items.map((item, i) => (
            <div
              key={i}
              style={{
                display: "flex", alignItems: "center", gap: 12,
                padding: "0 32px", flexShrink: 0,
                borderRight: i < items.length - 1 ? "1px solid var(--color-border-light)" : "none",
              }}
            >
              <span style={{ fontSize: 22 }}>{item.icon}</span>
              <div>
                <p style={{ fontFamily: "var(--font-body)", fontSize: 12, fontWeight: 500, color: "var(--color-ink)", marginBottom: 1 }}>
                  {item.title}
                </p>
                <p style={{ fontSize: 11, color: "var(--color-ink-light)" }}>{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
