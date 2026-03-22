"use client";
// components/store/AnnouncementBar.tsx
import { useState, useEffect } from "react";

const messages = [
  "🚚 Free shipping on orders above ₹499",
  "✨ New arrivals every Friday — Follow @shopnyaree",
  "↩️ Easy 7-day returns | No questions asked",
  "💳 5% extra discount on prepaid orders",
  "🇮🇳 Proudly Made in India | Handcrafted with love",
];

export function AnnouncementBar() {
  const [idx, setIdx] = useState(0);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setIdx((i) => (i + 1) % messages.length);
    }, 3500);
    return () => clearInterval(interval);
  }, []);

  if (!visible) return null;

  return (
    <div
      style={{
        background: "var(--color-ink)", color: "var(--color-gold-muted)",
        padding: "8px 16px", textAlign: "center",
        fontSize: 12, letterSpacing: "1.5px", fontWeight: 500,
        textTransform: "uppercase", fontFamily: "var(--font-body)",
        position: "relative",
      }}
    >
      <span style={{ animation: "fadeIn 0.4s ease" }} key={idx}>
        {messages[idx]}
      </span>
      <button
        onClick={() => setVisible(false)}
        style={{
          position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)",
          background: "none", border: "none", color: "var(--color-gold-muted)",
          fontSize: 16, lineHeight: 1, padding: 4, opacity: 0.6,
        }}
        aria-label="Close announcement"
      >
        ×
      </button>
    </div>
  );
}
