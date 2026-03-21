// components/store/CollectionBanner.tsx
import Link from "next/link";

interface Props { title: string; subtitle: string; href: string; bg?: string; textColor?: string; }

export function CollectionBanner({ title, subtitle, href, bg = "var(--color-forest)", textColor = "#fff" }: Props) {
  return (
    <section style={{ background: bg, padding: "80px 0" }}>
      <div className="container" style={{ textAlign: "center" }}>
        <p style={{ fontFamily: "var(--font-body)", fontSize: 11, letterSpacing: 3, textTransform: "uppercase", color: "rgba(255,255,255,0.6)", marginBottom: 12 }}>
          {subtitle}
        </p>
        <h2 style={{ fontFamily: "var(--font-display)", fontSize: "clamp(2rem, 5vw, 3.5rem)", fontWeight: 300, color: textColor, letterSpacing: 2, marginBottom: 32 }}>
          {title}
        </h2>
        <Link href={href}>
          <button className="btn btn-outline" style={{ borderColor: "rgba(255,255,255,0.5)", color: textColor }}>
            Shop the Edit →
          </button>
        </Link>
      </div>
    </section>
  );
}
