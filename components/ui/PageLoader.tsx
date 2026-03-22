"use client";
// components/ui/PageLoader.tsx
// Gold sari-wave loader — shown between page navigations
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

export function PageLoader() {
  const pathname = usePathname();
  const [loading, setLoading] = useState(false);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Show loader on route change
    setLoading(true);
    setVisible(true);
    const timer = setTimeout(() => {
      setLoading(false);
      setTimeout(() => setVisible(false), 400); // fade out
    }, 600);
    return () => clearTimeout(timer);
  }, [pathname]);

  if (!visible) return null;

  return (
    <>
      {/* Top progress bar */}
      <div
        style={{
          position: "fixed",
          top: 0, left: 0, right: 0,
          height: 2,
          zIndex: 9999,
          background: "var(--color-gold)",
          transformOrigin: "left",
          transform: loading ? "scaleX(0.7)" : "scaleX(1)",
          transition: loading
            ? "transform 0.5s cubic-bezier(0.1, 0.8, 0.5, 1)"
            : "transform 0.2s ease, opacity 0.3s ease",
          opacity: loading ? 1 : 0,
          boxShadow: "0 0 8px var(--color-gold)",
        }}
      />

      {/* Optional: subtle overlay on slow pages */}
      {loading && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 9990,
            background: "rgba(253, 250, 244, 0)",
            pointerEvents: "none",
          }}
        />
      )}
    </>
  );
}

// ── Inline skeleton used while product data loads ─────────────────────────────
export function ProductCardSkeleton() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
      <div className="skeleton" style={{ aspectRatio: "3/4", borderRadius: "var(--radius-sm)" }} />
      <div style={{ padding: "12px 0", display: "flex", flexDirection: "column", gap: 8 }}>
        <div className="skeleton" style={{ height: 14, width: "75%", borderRadius: 4 }} />
        <div className="skeleton" style={{ height: 12, width: "50%", borderRadius: 4 }} />
        <div className="skeleton" style={{ height: 16, width: "35%", borderRadius: 4 }} />
      </div>
    </div>
  );
}

export function ProductGridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className="product-grid">
      {Array.from({ length: count }).map((_, i) => (
        <ProductCardSkeleton key={i} />
      ))}
    </div>
  );
}

export function ReviewSkeleton() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      {[1, 2, 3].map(i => (
        <div key={i} style={{ borderBottom: "1px solid var(--color-border-light)", paddingBottom: 24 }}>
          <div style={{ display: "flex", gap: 12, marginBottom: 12 }}>
            <div className="skeleton" style={{ width: 36, height: 36, borderRadius: "50%", flexShrink: 0 }} />
            <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 6 }}>
              <div className="skeleton" style={{ height: 12, width: "30%", borderRadius: 4 }} />
              <div className="skeleton" style={{ height: 10, width: "20%", borderRadius: 4 }} />
            </div>
          </div>
          <div className="skeleton" style={{ height: 12, width: "90%", borderRadius: 4, marginBottom: 6 }} />
          <div className="skeleton" style={{ height: 12, width: "70%", borderRadius: 4 }} />
        </div>
      ))}
    </div>
  );
}

// ── Full page loader (used for initial SSR/auth redirects) ────────────────────
export function FullPageLoader() {
  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 9999,
      background: "var(--color-ivory)",
      display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center", gap: 20,
    }}>
      <div style={{
        fontFamily: "var(--font-display)",
        fontSize: 28, letterSpacing: 6,
        color: "var(--color-ink)",
      }}>
        NYA<span style={{ color: "var(--color-gold)" }}>REE</span>
      </div>
      <div style={{ display: "flex", gap: 6 }}>
        {[0, 1, 2].map(i => (
          <div key={i} style={{
            width: 6, height: 6, borderRadius: "50%",
            background: "var(--color-gold)",
            animation: `dotBounce 1.2s ease-in-out ${i * 0.2}s infinite`,
          }} />
        ))}
      </div>
    </div>
  );
}
