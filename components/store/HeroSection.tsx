"use client";
// components/store/HeroSection.tsx
import { useEffect, useRef, useState } from "react";
import Link from "next/link";

const SLIDES = [
  {
    headline: ["Wear India.", "Own It."],
    sub: "Handcrafted kurtis & trending tops for the modern Indian woman",
    cta1: { label: "Shop Kurtis", href: "/shop/kurti" },
    cta2: { label: "Shop Tops", href: "/shop/top" },
    bg: "linear-gradient(135deg, #1A1208 0%, #2D1E0A 50%, #1A1208 100%)",
    accent: "#C8960C",
    // Decorative SVG pattern instead of a real photo
    pattern: `url("data:image/svg+xml,%3Csvg width='80' height='80' viewBox='0 0 80 80' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23C8960C' fill-opacity='0.06'%3E%3Cpath d='M0 0h40v40H0zm40 40h40v40H40z'/%3E%3C/g%3E%3C/svg%3E")`,
  },
  {
    headline: ["New Arrivals", "Every Friday."],
    sub: "Discover this week's fresh drops — limited quantities, crafted with care",
    cta1: { label: "New Arrivals", href: "/collections/new-arrivals" },
    cta2: { label: "Shop All", href: "/shop/all" },
    bg: "linear-gradient(135deg, #2D4A3E 0%, #1A3028 100%)",
    accent: "#F0C060",
    pattern: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23F0C060' fill-opacity='0.07'%3E%3Ccircle cx='30' cy='30' r='20'/%3E%3C/g%3E%3C/svg%3E")`,
  },
  {
    headline: ["Festive Season", "Awaits."],
    sub: "Curated picks for every celebration — from pujas to parties",
    cta1: { label: "Festive Edit", href: "/collections/festive-edit" },
    cta2: { label: "Under ₹499", href: "/collections/under-499" },
    bg: "linear-gradient(135deg, #5C1A00 0%, #3D1200 100%)",
    accent: "#E8B842",
    pattern: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23E8B842' fill-opacity='0.08'%3E%3Cpolygon points='20,2 38,38 2,38'/%3E%3C/g%3E%3C/svg%3E")`,
  },
];

export function HeroSection() {
  const [current, setCurrent] = useState(0);
  const [animated, setAnimated] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval>>();

  useEffect(() => {
    setAnimated(true);
    intervalRef.current = setInterval(() => {
      setCurrent((c) => (c + 1) % SLIDES.length);
      setAnimated(false);
      setTimeout(() => setAnimated(true), 50);
    }, 6000);
    return () => clearInterval(intervalRef.current);
  }, []);

  const slide = SLIDES[current];

  return (
    <section
      style={{
        height: "90vh", minHeight: 500, position: "relative",
        background: slide.bg, overflow: "hidden",
        display: "flex", alignItems: "center",
        transition: "background 0.8s ease",
      }}
    >
      {/* Decorative background pattern (no real image needed) */}
      <div
        style={{
          position: "absolute", inset: 0,
          backgroundImage: slide.pattern,
          backgroundSize: "80px 80px",
          transition: "opacity 0.8s ease",
        }}
      />

      {/* Decorative diagonal accent shape */}
      <div
        style={{
          position: "absolute", right: "-5%", top: "-10%",
          width: "55%", height: "130%",
          background: "rgba(255,255,255,0.03)",
          transform: "skewX(-6deg)",
          pointerEvents: "none",
        }}
      />

      {/* Big decorative letter */}
      <div
        style={{
          position: "absolute", right: "5%", top: "50%",
          transform: "translateY(-50%)",
          fontFamily: "var(--font-display)",
          fontSize: "clamp(200px, 25vw, 320px)",
          fontWeight: 300,
          color: "rgba(255,255,255,0.04)",
          lineHeight: 1,
          userSelect: "none",
          pointerEvents: "none",
          letterSpacing: -10,
        }}
      >
        N
      </div>

      {/* Content */}
      <div
        className="container"
        style={{ position: "relative", zIndex: 1, maxWidth: 700 }}
      >
        {/* Eyebrow */}
        <p
          style={{
            fontFamily: "var(--font-body)", fontSize: 11, letterSpacing: 4,
            textTransform: "uppercase", color: slide.accent,
            marginBottom: 20,
            opacity: animated ? 1 : 0,
            transform: animated ? "translateY(0)" : "translateY(10px)",
            transition: "all 0.6s ease 0.1s",
          }}
        >
          Nyaree Collection — 2025
        </p>

        {/* Headline */}
        <h1
          style={{
            fontFamily: "var(--font-display)", fontWeight: 300,
            fontSize: "clamp(3rem, 8vw, 6rem)", lineHeight: 1.05,
            color: "#fff", marginBottom: 24,
          }}
        >
          {slide.headline.map((line, i) => (
            <span
              key={i}
              style={{
                display: "block",
                opacity: animated ? 1 : 0,
                transform: animated ? "translateY(0)" : "translateY(20px)",
                transition: `all 0.7s ease ${0.15 + i * 0.12}s`,
              }}
            >
              {i === 1
                ? <em style={{ color: slide.accent, fontStyle: "italic" }}>{line}</em>
                : line}
            </span>
          ))}
        </h1>

        {/* Subtitle */}
        <p
          style={{
            fontFamily: "var(--font-body)", fontSize: 16, lineHeight: 1.7,
            color: "rgba(255,255,255,0.7)", marginBottom: 40, maxWidth: 480,
            opacity: animated ? 1 : 0,
            transform: animated ? "translateY(0)" : "translateY(12px)",
            transition: "all 0.6s ease 0.35s",
          }}
        >
          {slide.sub}
        </p>

        {/* CTAs */}
        <div
          style={{
            display: "flex", gap: 16, flexWrap: "wrap",
            opacity: animated ? 1 : 0,
            transition: "opacity 0.6s ease 0.45s",
          }}
        >
          <Link href={slide.cta1.href}>
            <button
              className="btn btn-primary"
              style={{ background: slide.accent, color: "#1A1208" }}
            >
              {slide.cta1.label}
            </button>
          </Link>
          <Link href={slide.cta2.href}>
            <button
              className="btn btn-outline"
              style={{ borderColor: "rgba(255,255,255,0.5)", color: "#fff" }}
            >
              {slide.cta2.label}
            </button>
          </Link>
        </div>
      </div>

      {/* Slide indicators */}
      <div
        style={{
          position: "absolute", bottom: 32, left: "50%",
          transform: "translateX(-50%)",
          display: "flex", gap: 8, zIndex: 1,
        }}
      >
        {SLIDES.map((_, i) => (
          <button
            key={i}
            onClick={() => {
              setCurrent(i);
              setAnimated(false);
              setTimeout(() => setAnimated(true), 50);
            }}
            style={{
              width: i === current ? 32 : 8, height: 8,
              borderRadius: 4, border: "none",
              background: i === current ? slide.accent : "rgba(255,255,255,0.3)",
              transition: "all 0.3s ease",
              padding: 0,
            }}
            aria-label={`Slide ${i + 1}`}
          />
        ))}
      </div>

      {/* Scroll hint */}
      <div
        style={{
          position: "absolute", bottom: 28, right: 40,
          display: "flex", flexDirection: "column", alignItems: "center", gap: 6,
          color: "rgba(255,255,255,0.4)", fontSize: 10, letterSpacing: 2,
        }}
      >
        <span style={{ textTransform: "uppercase" }}>Scroll</span>
        <div style={{
          width: 1, height: 40, background: "rgba(255,255,255,0.2)",
          animation: "bounce 2s ease-in-out infinite",
        }} />
      </div>
    </section>
  );
}
