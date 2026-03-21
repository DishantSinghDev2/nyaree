"use client";
// components/store/InstagramFeed.tsx
import Link from "next/link";

// Replace with real Instagram embed or API
const PLACEHOLDER_POSTS = Array.from({ length: 6 }, (_, i) => ({
  id: i + 1,
  img: `/images/instagram-${i + 1}.jpg`,
  href: "https://instagram.com/nyaree.in",
}));

export function InstagramFeed() {
  return (
    <section style={{ padding: "80px 0", background: "var(--color-ivory)" }}>
      <div className="container">
        <div style={{ textAlign: "center", marginBottom: 40 }}>
          <p style={{ fontFamily: "var(--font-body)", fontSize: 11, letterSpacing: 3, textTransform: "uppercase", color: "var(--color-gold)", marginBottom: 8 }}>
            Follow Along
          </p>
          <h2 style={{ fontFamily: "var(--font-display)", fontSize: "clamp(1.8rem, 4vw, 2.8rem)", fontWeight: 300, marginBottom: 8 }}>
            @nyaree.in
          </h2>
          <p style={{ fontSize: 14, color: "var(--color-ink-light)" }}>
            Tag us in your Nyaree look for a chance to be featured ✨
          </p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(6, 1fr)", gap: 4 }}>
          {PLACEHOLDER_POSTS.map((post) => (
            <a
              key={post.id}
              href={post.href}
              target="_blank"
              rel="noopener noreferrer"
              style={{ display: "block", aspectRatio: "1", position: "relative", overflow: "hidden", background: "var(--color-ivory-dark)" }}
            >
              {/* Placeholder colored block — replace with <Image> */}
              <div style={{
                width: "100%", height: "100%",
                background: `hsl(${post.id * 40}, 30%, 75%)`,
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 24,
                transition: "transform 0.3s ease",
              }}>
                📸
              </div>
              {/* Hover overlay */}
              <div style={{
                position: "absolute", inset: 0, background: "rgba(26,18,8,0)",
                display: "flex", alignItems: "center", justifyContent: "center",
                transition: "background 0.25s",
              }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = "rgba(26,18,8,0.4)"; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = "rgba(26,18,8,0)"; }}
              >
                <svg width="24" height="24" fill="none" stroke="white" strokeWidth="2" viewBox="0 0 24 24" style={{ opacity: 0, transition: "opacity 0.25s" }}>
                  <rect x="2" y="2" width="20" height="20" rx="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>
                </svg>
              </div>
            </a>
          ))}
        </div>

        <div style={{ textAlign: "center", marginTop: 32 }}>
          <a href="https://instagram.com/nyaree.in" target="_blank" rel="noopener noreferrer">
            <button className="btn btn-outline">
              Follow on Instagram
            </button>
          </a>
        </div>
      </div>
    </section>
  );
}
