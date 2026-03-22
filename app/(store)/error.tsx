"use client";
// app/(store)/error.tsx — catches errors within the store layout
import Link from "next/link";
import { useEffect } from "react";

export default function StoreError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Store error:", error);
  }, [error]);

  return (
    <div
      style={{
        minHeight: "70vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "40px 20px",
        textAlign: "center",
      }}
    >
      <div style={{ maxWidth: 440 }}>
        <p style={{ fontSize: 48, marginBottom: 16 }}>⚠️</p>
        <h2
          style={{
            fontFamily: "var(--font-display)",
            fontSize: "clamp(1.4rem, 3vw, 2rem)",
            fontWeight: 300,
            marginBottom: 12,
          }}
        >
          Something went wrong
        </h2>
        <p
          style={{
            fontSize: 14,
            color: "var(--color-ink-light)",
            lineHeight: 1.7,
            marginBottom: 28,
          }}
        >
          We hit an unexpected error. Please try again — if the issue continues,
          reach out via WhatsApp.
        </p>
        <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
          <button className="btn btn-primary" onClick={reset}>
            Try Again
          </button>
          <Link href="/">
            <button className="btn btn-outline">Go Home</button>
          </Link>
          <a href="https://wa.me/918368989758" target="_blank" rel="noopener noreferrer">
            <button className="btn btn-ghost" style={{ color: "#25D366" }}>WhatsApp Us</button>
          </a>
        </div>
      </div>
    </div>
  );
}
