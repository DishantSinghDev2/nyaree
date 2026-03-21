// components/store/CategoryCards.tsx
import Link from "next/link";
import Image from "next/image";

const CATEGORIES = [
  { label: "Kurtis", sub: "Timeless Classics", href: "/shop/kurti", color: "#C8960C", img: "/images/cat-kurti.jpg" },
  { label: "Tops", sub: "Modern & Chic", href: "/shop/top", color: "#2D4A3E", img: "/images/cat-top.jpg" },
  { label: "Co-ord Sets", sub: "Effortless Style", href: "/shop/coord-set", color: "#5C1A00", img: "/images/cat-coord.jpg" },
];

export function CategoryCards() {
  return (
    <section style={{ padding: "64px 0" }}>
      <div className="container">
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 20 }}>
          {CATEGORIES.map((cat) => (
            <Link key={cat.href} href={cat.href} style={{ textDecoration: "none" }}>
              <article
                style={{
                  position: "relative", aspectRatio: "4/5", overflow: "hidden",
                  borderRadius: "var(--radius-sm)", cursor: "pointer",
                  background: cat.color,
                }}
                className="card"
              >
                <div style={{ position: "absolute", inset: 0, background: cat.img ? undefined : cat.color }}>
                  {cat.img && (
                    <Image src={cat.img} alt={cat.label} fill style={{ objectFit: "cover", opacity: 0.5, transition: "transform 0.6s ease", }} />
                  )}
                </div>
                <div style={{
                  position: "absolute", inset: 0, display: "flex", flexDirection: "column",
                  alignItems: "center", justifyContent: "flex-end", padding: 28,
                  background: "linear-gradient(to top, rgba(0,0,0,0.7) 0%, transparent 60%)",
                }}>
                  <p style={{ fontFamily: "var(--font-body)", fontSize: 11, letterSpacing: 2, textTransform: "uppercase", color: "rgba(255,255,255,0.7)", marginBottom: 4 }}>
                    {cat.sub}
                  </p>
                  <h3 style={{ fontFamily: "var(--font-display)", fontSize: "clamp(1.5rem, 3vw, 2.2rem)", color: "#fff", fontWeight: 300, letterSpacing: 2 }}>
                    {cat.label}
                  </h3>
                  <div style={{ marginTop: 12, padding: "6px 20px", border: "1px solid rgba(255,255,255,0.6)", color: "#fff", fontSize: 11, letterSpacing: 2, textTransform: "uppercase" }}>
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
