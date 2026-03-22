// components/store/CategoryCards.tsx
// No external images — uses CSS gradients that look beautiful immediately
import Link from "next/link";

const CATEGORIES = [
  {
    label: "Kurtis",
    sub: "Timeless Classics",
    href: "/shop/kurti",
    bg: "linear-gradient(145deg, #2D1E0A 0%, #C8960C 100%)",
    emoji: "✨",
    accent: "#F0C060",
  },
  {
    label: "Tops",
    sub: "Modern & Chic",
    href: "/shop/top",
    bg: "linear-gradient(145deg, #1A3028 0%, #2D4A3E 100%)",
    emoji: "🌿",
    accent: "#7BC8A0",
  },
  {
    label: "Co-ord Sets",
    sub: "Effortless Style",
    href: "/shop/coord-set",
    bg: "linear-gradient(145deg, #3D1200 0%, #5C1A00 100%)",
    emoji: "🎀",
    accent: "#E8B842",
  },
];

export function CategoryCards() {
  return (
    <section style={{ padding: "64px 0" }}>
      <div className="container">
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: 20,
        }}>
          {CATEGORIES.map((cat) => (
            <Link key={cat.href} href={cat.href} style={{ textDecoration: "none" }}>
              <article
                style={{
                  position: "relative", aspectRatio: "4/5", overflow: "hidden",
                  borderRadius: "var(--radius-sm)",
                  background: cat.bg,
                  cursor: "pointer",
                  transition: "transform 0.3s ease, box-shadow 0.3s ease",
                }}
                className="card"
              >
                {/* Decorative geometric pattern */}
                <div style={{
                  position: "absolute", inset: 0,
                  backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='rgba(255,255,255,0.05)'%3E%3Ccircle cx='30' cy='30' r='25'/%3E%3Ccircle cx='30' cy='30' r='15'/%3E%3C/g%3E%3C/svg%3E")`,
                  backgroundSize: "60px 60px",
                }} />

                {/* Large emoji decoration */}
                <div style={{
                  position: "absolute", top: "20%", right: "15%",
                  fontSize: "clamp(60px, 8vw, 100px)",
                  opacity: 0.15,
                  userSelect: "none",
                  lineHeight: 1,
                }}>
                  {cat.emoji}
                </div>

                {/* Bottom content overlay */}
                <div style={{
                  position: "absolute", inset: 0,
                  background: "linear-gradient(to top, rgba(0,0,0,0.75) 0%, transparent 55%)",
                  display: "flex", flexDirection: "column",
                  alignItems: "center", justifyContent: "flex-end",
                  padding: 28,
                }}>
                  <p style={{
                    fontFamily: "var(--font-body)", fontSize: 11, letterSpacing: 2,
                    textTransform: "uppercase", color: "rgba(255,255,255,0.7)",
                    marginBottom: 6,
                  }}>
                    {cat.sub}
                  </p>
                  <h3 style={{
                    fontFamily: "var(--font-display)",
                    fontSize: "clamp(1.5rem, 3vw, 2.2rem)",
                    color: "#fff", fontWeight: 300, letterSpacing: 2,
                    marginBottom: 16,
                  }}>
                    {cat.label}
                  </h3>
                  <div style={{
                    padding: "6px 20px",
                    border: `1px solid ${cat.accent}`,
                    color: cat.accent, fontSize: 11, letterSpacing: 2,
                    textTransform: "uppercase",
                    borderRadius: "var(--radius-pill)",
                  }}>
                    Explore →
                  </div>
                </div>
              </article>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
