// app/(store)/about/page.tsx
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "About Us | Nyaree — Wear India. Own It.",
  description:
    "Nyaree is a premium Indian women's fashion brand founded by Rishika Singh in Bahadurgarh, Haryana. Discover our story, our values, and our commitment to Indian craftsmanship.",
  alternates: { canonical: "https://buynyaree.com/about" },
};

export default function AboutPage() {
  return (
    <div>
      {/* Hero */}
      <section
        style={{
          background: "var(--color-ink)",
          padding: "80px 0 64px",
          textAlign: "center",
        }}
      >
        <div className="container" style={{ maxWidth: 700 }}>
          <p
            style={{
              fontFamily: "var(--font-body)",
              fontSize: 11,
              letterSpacing: 4,
              textTransform: "uppercase",
              color: "var(--color-gold)",
              marginBottom: 16,
            }}
          >
            Our Story
          </p>
          <h1
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "clamp(2.5rem, 6vw, 4rem)",
              fontWeight: 300,
              color: "#fff",
              lineHeight: 1.1,
              marginBottom: 20,
            }}
          >
            Wear India.{" "}
            <em style={{ color: "var(--color-gold)", fontStyle: "italic" }}>
              Own It.
            </em>
          </h1>
          <p
            style={{
              fontSize: 16,
              color: "rgba(255,255,255,0.65)",
              lineHeight: 1.8,
            }}
          >
            A brand born from a love for Indian craftsmanship, built for the
            modern Indian woman.
          </p>
        </div>
      </section>

      {/* Founder story */}
      <section style={{ padding: "80px 0" }}>
        <div
          className="container"
          style={{
            maxWidth: 900,
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 64,
            alignItems: "center",
          }}
        >
          {/* Placeholder portrait */}
          <div
            style={{
              aspectRatio: "3/4",
              background:
                "linear-gradient(145deg, #2D1E0A 0%, #C8960C 100%)",
              borderRadius: "var(--radius-sm)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 80,
            }}
          >
            <span style={{ opacity: 0.4 }}>✨</span>
          </div>

          <div>
            <p
              style={{
                fontFamily: "var(--font-body)",
                fontSize: 11,
                letterSpacing: 3,
                textTransform: "uppercase",
                color: "var(--color-gold)",
                marginBottom: 16,
              }}
            >
              Founder
            </p>
            <h2
              style={{
                fontFamily: "var(--font-display)",
                fontSize: "clamp(1.8rem, 3vw, 2.5rem)",
                fontWeight: 300,
                marginBottom: 20,
              }}
            >
              Rishika Singh
            </h2>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 16,
                fontSize: 15,
                color: "var(--color-ink-muted)",
                lineHeight: 1.8,
              }}
            >
              <p>
                Nyaree was born in Bahadurgarh, Haryana — a city known for its
                textile heritage — from a simple conviction: that Indian women
                deserve clothing as beautiful and unique as they are.
              </p>
              <p>
                Rishika founded Nyaree with a vision to bridge the gap between
                traditional Indian craftsmanship and contemporary everyday wear.
                Every piece in our collection is thoughtfully designed to help
                you express your identity — confidently, comfortably, and with
                pride.
              </p>
              <p>
                From hand-selected fabrics to careful quality checks, we pour
                love into every detail so you can wear it with confidence.
              </p>
            </div>
            <div style={{ display: "flex", gap: 8, marginTop: 28 }}>
              <a
                href="https://instagram.com/shopnyaree"
                target="_blank"
                rel="noopener noreferrer"
              >
                <button className="btn btn-primary">Follow Our Journey</button>
              </a>
              <Link href="/shop">
                <button className="btn btn-outline">Shop the Collection</button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section
        style={{
          background: "var(--color-ivory-dark)",
          padding: "80px 0",
        }}
      >
        <div className="container" style={{ maxWidth: 1000 }}>
          <div style={{ textAlign: "center", marginBottom: 56 }}>
            <p
              style={{
                fontFamily: "var(--font-body)",
                fontSize: 11,
                letterSpacing: 3,
                textTransform: "uppercase",
                color: "var(--color-gold)",
                marginBottom: 12,
              }}
            >
              What We Stand For
            </p>
            <h2
              style={{
                fontFamily: "var(--font-display)",
                fontSize: "clamp(1.8rem, 3vw, 2.5rem)",
                fontWeight: 300,
              }}
            >
              Our Values
            </h2>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
              gap: 24,
            }}
          >
            {[
              {
                icon: "🌿",
                title: "Craftsmanship First",
                desc: "Every piece is made with care — from fabric selection to final stitching. We never compromise on quality.",
              },
              {
                icon: "💛",
                title: "Made in India",
                desc: "Proudly designed and produced in Haryana, supporting local artisans and the Indian textile industry.",
              },
              {
                icon: "✨",
                title: "Timeless Style",
                desc: "We design pieces that outlast trends — classic silhouettes with modern sensibility for the everyday Indian woman.",
              },
              {
                icon: "🤝",
                title: "Customer First",
                desc: "From easy returns to WhatsApp support, we are always here for you. Your satisfaction is our priority.",
              },
            ].map((v) => (
              <div
                key={v.title}
                className="card"
                style={{ padding: "28px 24px", textAlign: "center" }}
              >
                <p style={{ fontSize: 36, marginBottom: 16 }}>{v.icon}</p>
                <h3
                  style={{
                    fontFamily: "var(--font-display)",
                    fontSize: 18,
                    marginBottom: 10,
                  }}
                >
                  {v.title}
                </h3>
                <p
                  style={{
                    fontSize: 13,
                    color: "var(--color-ink-light)",
                    lineHeight: 1.7,
                  }}
                >
                  {v.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section style={{ padding: "64px 0" }}>
        <div className="container" style={{ maxWidth: 800 }}>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(3, 1fr)",
              gap: 0,
              textAlign: "center",
            }}
          >
            {[
              { num: "2026", label: "Founded" },
              // Updated: we launched in 2026
              { num: "100%", label: "Made in India" },
              { num: "₹499+", label: "Free Shipping" },
            ].map((stat, i) => (
              <div
                key={stat.label}
                style={{
                  padding: "32px 20px",
                  borderRight:
                    i < 2 ? "1px solid var(--color-border)" : "none",
                }}
              >
                <p
                  style={{
                    fontFamily: "var(--font-display)",
                    fontSize: "clamp(2rem, 4vw, 3rem)",
                    color: "var(--color-gold)",
                    marginBottom: 6,
                  }}
                >
                  {stat.num}
                </p>
                <p style={{ fontSize: 13, color: "var(--color-ink-light)" }}>
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section
        style={{
          background: "var(--color-ink)",
          padding: "64px 0",
          textAlign: "center",
        }}
      >
        <div className="container" style={{ maxWidth: 600 }}>
          <h2
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "clamp(1.8rem, 3vw, 2.5rem)",
              color: "#fff",
              fontWeight: 300,
              marginBottom: 16,
            }}
          >
            Ready to discover your style?
          </h2>
          <p
            style={{
              fontSize: 14,
              color: "rgba(255,255,255,0.6)",
              marginBottom: 32,
            }}
          >
            Explore our full collection of handcrafted kurtis and trending tops.
          </p>
          <div
            style={{ display: "flex", gap: 12, justifyContent: "center" }}
          >
            <Link href="/shop">
              <button className="btn btn-primary">Shop Now</button>
            </Link>
            <Link href="/contact">
              <button
                className="btn btn-outline"
                style={{
                  borderColor: "rgba(255,255,255,0.4)",
                  color: "#fff",
                }}
              >
                Contact Us
              </button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
