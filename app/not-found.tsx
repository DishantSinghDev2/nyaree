// app/not-found.tsx
// Global 404 — shown for any unmatched route
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Page Not Found | Nyaree",
};

export default function NotFound() {
  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "var(--color-ivory)",
        padding: "40px 20px",
        textAlign: "center",
      }}
    >
      <div style={{ maxWidth: 480 }}>
        {/* Brand */}
        <Link
          href="/"
          style={{
            display: "block",
            fontFamily: "var(--font-display)",
            fontSize: 28,
            letterSpacing: 6,
            color: "var(--color-ink)",
            textDecoration: "none",
            marginBottom: 48,
          }}
        >
          NYA<span style={{ color: "var(--color-gold)" }}>REE</span>
        </Link>

        {/* 404 */}
        <p
          style={{
            fontFamily: "var(--font-display)",
            fontSize: "clamp(80px, 18vw, 140px)",
            fontWeight: 300,
            color: "var(--color-gold)",
            lineHeight: 1,
            marginBottom: 8,
            opacity: 0.25,
          }}
        >
          404
        </p>

        <h1
          style={{
            fontFamily: "var(--font-display)",
            fontSize: "clamp(1.6rem, 4vw, 2.4rem)",
            fontWeight: 300,
            marginBottom: 16,
          }}
        >
          This page wandered off
        </h1>
        <p
          style={{
            fontSize: 15,
            color: "var(--color-ink-light)",
            lineHeight: 1.7,
            marginBottom: 36,
          }}
        >
          The page you're looking for doesn't exist or may have moved. Let's get
          you back to discovering beautiful Indian fashion.
        </p>

        <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
          <Link href="/">
            <button className="btn btn-primary">Back to Home</button>
          </Link>
          <Link href="/shop">
            <button className="btn btn-outline">Browse Collection</button>
          </Link>
        </div>

        <p style={{ marginTop: 32, fontSize: 13, color: "var(--color-ink-light)" }}>
          Looking for something specific?{" "}
          <Link href="/search" style={{ color: "var(--color-gold)" }}>
            Search our store
          </Link>{" "}
          or{" "}
          <a href="https://wa.me/918368989758" style={{ color: "var(--color-gold)" }}>
            WhatsApp us
          </a>
        </p>
      </div>
    </div>
  );
}
