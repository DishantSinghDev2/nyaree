"use client";
// components/store/Testimonials.tsx
export function Testimonials() {
  const reviews = [
    { name: "Priya Sharma", city: "Delhi", rating: 5, text: "Absolutely in love with my kurti from Nyaree! The fabric quality is exceptional and the fit is perfect. Will definitely shop again!", product: "Ananya Floral Print Kurti", img: "PS" },
    { name: "Mehak Gupta", city: "Chandigarh", rating: 5, text: "Fast delivery, beautiful packaging, and the top looks even better in person. Rishika ji personally responded to my query — best customer service!", product: "Embroidered Cotton Top", img: "MG" },
    { name: "Sunita Verma", city: "Jaipur", rating: 5, text: "I ordered a custom size and they delivered exactly what I wanted. The quality is so good — feels handcrafted with love. My go-to brand now.", product: "Custom Anarkali Kurti", img: "SV" },
  ];

  return (
    <section style={{ padding: "80px 0", background: "var(--color-surface)" }}>
      <div className="container">
        <div style={{ textAlign: "center", marginBottom: 56 }}>
          <p style={{ fontFamily: "var(--font-body)", fontSize: 11, letterSpacing: 3, textTransform: "uppercase", color: "var(--color-gold)", marginBottom: 8 }}>
            What Our Customers Say
          </p>
          <h2 style={{ fontFamily: "var(--font-display)", fontSize: "clamp(1.8rem, 4vw, 2.8rem)", fontWeight: 300 }}>
            Loved by 10,000+ Women
          </h2>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 24 }}>
          {reviews.map((r, i) => (
            <div key={i} className="card" style={{ padding: "32px 28px" }}>
              {/* Stars */}
              <div style={{ display: "flex", gap: 2, marginBottom: 20 }}>
                {[1,2,3,4,5].map(s => (
                  <svg key={s} width="14" height="14" viewBox="0 0 24 24" fill="var(--color-gold)" stroke="none">
                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                  </svg>
                ))}
              </div>
              {/* Quote */}
              <p style={{ fontFamily: "var(--font-accent)", fontSize: 16, fontStyle: "italic", lineHeight: 1.7, color: "var(--color-ink)", marginBottom: 24, position: "relative" }}>
                <span style={{ position: "absolute", top: -10, left: -8, fontSize: 48, color: "var(--color-gold)", opacity: 0.2, fontFamily: "Georgia", lineHeight: 1 }}>"</span>
                {r.text}
              </p>
              {/* Author */}
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div style={{ width: 40, height: 40, borderRadius: "50%", background: "var(--color-gold)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 13, fontWeight: 600, flexShrink: 0 }}>
                  {r.img}
                </div>
                <div>
                  <p style={{ fontFamily: "var(--font-body)", fontSize: 13, fontWeight: 500, color: "var(--color-ink)" }}>{r.name}</p>
                  <p style={{ fontSize: 11, color: "var(--color-ink-light)" }}>{r.city} · {r.product}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
