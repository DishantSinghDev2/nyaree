"use client";
// components/store/InstagramFeed.tsx
// Shows Instagram-style grid with placeholder tiles until you connect real Instagram
import Link from "next/link";

// Colour palette for the placeholder tiles — looks designed, not broken
const TILE_COLORS = [
  { bg: "#C8960C", emoji: "✨", label: "New arrival" },
  { bg: "#2D4A3E", emoji: "🌿", label: "Cotton kurti" },
  { bg: "#5C1A00", emoji: "🎀", label: "Festive edit" },
  { bg: "#1A3028", emoji: "💛", label: "Summer look" },
  { bg: "#3D1200", emoji: "🌸", label: "Pastel collection" },
  { bg: "#C8960C", emoji: "👗", label: "Trending top" },
];

export function InstagramFeed() {
  return (
    <section style={{ padding: "80px 0", background: "var(--color-ivory)" }}>
      <div className="container">
        <div style={{ textAlign: "center", marginBottom: 40 }}>
          <p style={{ fontFamily: "var(--font-body)", fontSize: 11, letterSpacing: 3, textTransform: "uppercase", color: "var(--color-gold)", marginBottom: 8 }}>
            Follow Along
          </p>
          <h2 style={{ fontFamily: "var(--font-display)", fontSize: "clamp(1.8rem, 4vw, 2.8rem)", fontWeight: 300, marginBottom: 8 }}>
            @buynyaree
          </h2>
          <p style={{ fontSize: 14, color: "var(--color-ink-light)" }}>
            Tag us in your Nyaree look for a chance to be featured ✨
          </p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(6, 1fr)", gap: 4 }}>
          {TILE_COLORS.map((tile, i) => (
            <a
              key={i}
              href="https://instagram.com/buynyaree"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: "flex",
                aspectRatio: "1",
                position: "relative",
                overflow: "hidden",
                background: tile.bg,
                textDecoration: "none",
              }}
            >
              {/* Decorative content */}
              <div style={{
                flex: 1,
                display: "flex", flexDirection: "column",
                alignItems: "center", justifyContent: "center",
                gap: 6,
                transition: "opacity 0.25s",
              }}>
                <span style={{ fontSize: "clamp(20px, 3vw, 32px)", opacity: 0.6 }}>{tile.emoji}</span>
                <span style={{ fontSize: "clamp(8px, 1vw, 11px)", color: "rgba(255,255,255,0.5)", letterSpacing: 1, textTransform: "uppercase", textAlign: "center", padding: "0 4px" }}>
                  {tile.label}
                </span>
              </div>

              {/* Hover overlay */}
              <div style={{
                position: "absolute", inset: 0,
                background: "rgba(26,18,8,0)",
                display: "flex", alignItems: "center", justifyContent: "center",
                transition: "background 0.25s",
              }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = "rgba(26,18,8,0.5)"; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = "rgba(26,18,8,0)"; }}
              >
                <svg width="24" height="24" fill="none" stroke="white" strokeWidth="2" viewBox="0 0 24 24" style={{ opacity: 0, transition: "opacity 0.25s" }}
                  onMouseEnter={(e) => { (e.currentTarget as SVGElement).style.opacity = "1"; }}
                >
                  <rect x="2" y="2" width="20" height="20" rx="5"/>
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
                  <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>
                </svg>
              </div>
            </a>
          ))}
        </div>

        <div style={{ textAlign: "center", marginTop: 32 }}>
          <a href="https://instagram.com/buynyaree" target="_blank" rel="noopener noreferrer">
            <button className="btn btn-outline">Follow on Instagram</button>
          </a>
        </div>
      </div>
    </section>
  );
}
