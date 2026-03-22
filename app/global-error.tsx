"use client";
// app/global-error.tsx — catches unhandled errors in the root layout
import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log to console in dev; in prod you'd send to Sentry/LogRocket
    console.error("Global error:", error);
  }, [error]);

  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#FDFAF4",
          fontFamily: "Georgia, serif",
          padding: "40px 20px",
          textAlign: "center",
        }}
      >
        <div style={{ maxWidth: 460 }}>
          <div style={{ fontSize: 28, letterSpacing: 6, marginBottom: 32, color: "#1A1208" }}>
            NYA<span style={{ color: "#C8960C" }}>REE</span>
          </div>
          <p style={{ fontSize: 48, marginBottom: 16 }}>⚠️</p>
          <h1 style={{ fontSize: 24, fontWeight: 300, marginBottom: 14, color: "#1A1208" }}>
            Something went wrong
          </h1>
          <p style={{ fontSize: 14, color: "#6B6B6B", lineHeight: 1.7, marginBottom: 28 }}>
            We hit an unexpected error. Our team has been notified. Please try
            again — if the problem persists, WhatsApp us at +91 8368989758.
          </p>
          <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
            <button
              onClick={reset}
              style={{
                padding: "10px 24px",
                background: "#C8960C",
                color: "#1A1208",
                border: "none",
                borderRadius: "4px",
                fontFamily: "Georgia, serif",
                fontSize: 14,
                cursor: "pointer",
                fontWeight: 500,
              }}
            >
              Try Again
            </button>
            <a
              href="/"
              style={{
                padding: "10px 24px",
                border: "1px solid #1A1208",
                color: "#1A1208",
                borderRadius: "4px",
                fontFamily: "Georgia, serif",
                fontSize: 14,
                textDecoration: "none",
                display: "inline-block",
              }}
            >
              Go Home
            </a>
          </div>
          {process.env.NODE_ENV === "development" && error.message && (
            <details
              style={{
                marginTop: 28,
                textAlign: "left",
                background: "#FEF2F2",
                padding: "12px 16px",
                borderRadius: 4,
                fontSize: 12,
                color: "#7F1D1D",
              }}
            >
              <summary style={{ cursor: "pointer", marginBottom: 6 }}>Error details (dev only)</summary>
              <pre style={{ margin: 0, whiteSpace: "pre-wrap", wordBreak: "break-all" }}>
                {error.message}
                {"\n"}
                {error.stack}
              </pre>
            </details>
          )}
        </div>
      </body>
    </html>
  );
}
