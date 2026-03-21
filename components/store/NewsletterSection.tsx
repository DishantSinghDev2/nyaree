"use client";
// components/store/NewsletterSection.tsx
import { useState } from "react";
import { showToast } from "@/components/ui/Toaster";

export function NewsletterSection() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      if (res.ok) {
        showToast("Welcome! Check your email for a special gift 🎁", "success");
        setEmail("");
      }
    } catch {
      showToast("Something went wrong. Please try again.", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section style={{ background: "var(--color-ivory-dark)", padding: "80px 0", borderTop: "1px solid var(--color-border)" }}>
      <div className="container" style={{ maxWidth: 560, margin: "0 auto", textAlign: "center" }}>
        <p style={{ fontFamily: "var(--font-body)", fontSize: 11, letterSpacing: 3, textTransform: "uppercase", color: "var(--color-gold)", marginBottom: 12 }}>
          Join the Family
        </p>
        <h2 style={{ fontFamily: "var(--font-display)", fontSize: "clamp(1.8rem, 4vw, 2.8rem)", fontWeight: 300, marginBottom: 12 }}>
          Style Inspiration, Straight to You
        </h2>
        <p style={{ fontSize: 14, color: "var(--color-ink-light)", marginBottom: 32 }}>
          Subscribe for new arrivals, exclusive offers, and styling tips — plus a 10% welcome discount.
        </p>
        <form onSubmit={handleSubmit} style={{ display: "flex", gap: 0, maxWidth: 400, margin: "0 auto" }}>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="your@email.com"
            required
            className="input"
            style={{ borderRadius: "var(--radius-sm) 0 0 var(--radius-sm)", borderRight: "none", flex: 1 }}
          />
          <button
            type="submit"
            className={`btn btn-primary ${loading ? "btn-loading" : ""}`}
            style={{ borderRadius: "0 var(--radius-sm) var(--radius-sm) 0", flexShrink: 0 }}
            disabled={loading}
          >
            {loading ? "..." : "Subscribe"}
          </button>
        </form>
        <p style={{ fontSize: 11, color: "var(--color-ink-light)", marginTop: 12 }}>
          No spam. Unsubscribe anytime. We respect your inbox.
        </p>
      </div>
    </section>
  );
}
