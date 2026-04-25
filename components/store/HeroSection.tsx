"use client";
// components/store/HeroSection.tsx — Loads slides from props (SSR)
import { useEffect, useRef, useState, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";

interface Slide {
  id: string; headline: string; subheadline: string;
  imageUrl: string; bgColor: string; bgGradient: string; accentColor: string;
  cta1Label: string; cta1Href: string; cta2Label: string; cta2Href: string;
}

const DEFAULT_PATTERN = (color: string) =>
  `url("data:image/svg+xml,%3Csvg width='80' height='80' viewBox='0 0 80 80' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='${encodeURIComponent(color)}' fill-opacity='0.07'%3E%3Cpath d='M0 0h40v40H0zm40 40h40v40H40z'/%3E%3C/g%3E%3C/svg%3E")`;

export function HeroSection({ initialSlides }: { initialSlides: Slide[] }) {
  const [slides] = useState<Slide[]>(initialSlides);
  const [current, setCurrent] = useState(0);
  const [paused, setPaused] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const next = useCallback(() => setCurrent(c => (c + 1) % slides.length), [slides.length]);
  const prev = useCallback(() => setCurrent(c => (c - 1 + slides.length) % slides.length), [slides.length]);

  useEffect(() => {
    if (paused || slides.length <= 1) return;
    timerRef.current = setInterval(next, 5000);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [next, paused, slides.length]);

  if (slides.length === 0) {
    return (
      <div style={{ minHeight: "85vh", background: "#1A1208", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontFamily: "Georgia,serif", fontSize: 32, letterSpacing: 8, color: "#C8960C", marginBottom: 8 }}>NYAREE</div>
          <div style={{ display: "flex", gap: 6, justifyContent: "center" }}>
            {[0,1,2].map(i => <div key={i} style={{ width: 6, height: 6, borderRadius: "50%", background: "#C8960C", animation: `dotBounce 1.2s ease ${i*0.2}s infinite` }} />)}
          </div>
        </div>
      </div>
    );
  }

  const slide = slides[current];
  const bg = slide.bgGradient || slide.bgColor || "#1A1208";

  return (
    <section
      style={{ position: "relative", minHeight: "85vh", display: "flex", alignItems: "center", overflow: "hidden", background: bg }}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {/* Background image (if set) */}
      {slide.imageUrl && (
        <div style={{ position: "absolute", inset: 0, zIndex: 0 }}>
          {slide.imageUrl.match(/\.(mp4|webm)$/i) ? (
            <video 
              src={slide.imageUrl} 
              autoPlay loop muted playsInline 
              style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "center" }} 
            />
          ) : slide.imageUrl.match(/\.gif$/i) ? (
            <Image 
              src={slide.imageUrl} 
              alt={slide.headline} 
              fill 
              unoptimized 
              style={{ objectFit: "cover", objectPosition: "center" }} 
              priority={current === 0} 
              fetchPriority={current === 0 ? "high" : "auto"}
            />
          ) : (
            <Image 
              src={slide.imageUrl} 
              alt={slide.headline} 
              fill 
              style={{ objectFit: "cover", objectPosition: "center" }} 
              sizes="100vw" 
              priority={current === 0} 
              fetchPriority={current === 0 ? "high" : "auto"}
            />
          )}
          <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.45)" }} />
        </div>
      )}

      {/* Pattern overlay (when no image) */}
      {!slide.imageUrl && (
        <div style={{ position: "absolute", inset: 0, backgroundImage: DEFAULT_PATTERN(slide.accentColor), zIndex: 0 }} />
      )}

      {/* Content */}
      <div className="container" style={{ position: "relative", zIndex: 1, padding: "80px 0", maxWidth: 700 }}>
        <div style={{ animation: "fadeInDown 0.6s ease" }} key={slide.id}>
          <p style={{ fontFamily: "var(--font-body)", fontSize: 11, letterSpacing: 4, textTransform: "uppercase", color: slide.accentColor, marginBottom: 16, opacity: 0.9 }}>
            Nyaree — Wear India. Own It.
          </p>
          <h1 style={{ fontFamily: "var(--font-display)", fontSize: "clamp(2.8rem, 7vw, 5.5rem)", fontWeight: 300, color: "#fff", lineHeight: 1.05, marginBottom: 20 }}>
            {slide.headline.split("\n").map((line, i) => (
              <span key={i} style={{ display: "block" }}>
                {i % 2 === 1 ? <em style={{ color: slide.accentColor, fontStyle: "italic" }}>{line}</em> : line}
              </span>
            ))}
          </h1>
          {slide.subheadline && (
            <p style={{ fontSize: "clamp(14px, 2vw, 17px)", color: "rgba(255,255,255,0.7)", lineHeight: 1.7, marginBottom: 40, maxWidth: 520 }}>
              {slide.subheadline}
            </p>
          )}
          <div style={{ display: "flex", gap: 14, flexWrap: "wrap" }}>
            {slide.cta1Label && slide.cta1Href && (
              <Link href={slide.cta1Href}>
                <button style={{ padding: "14px 32px", background: slide.accentColor, color: "#1A1208", border: "none", borderRadius: "var(--radius-sm)", fontFamily: "var(--font-body)", fontSize: 12, letterSpacing: 2, textTransform: "uppercase", fontWeight: 600, cursor: "pointer", transition: "opacity 0.2s" }}>
                  {slide.cta1Label}
                </button>
              </Link>
            )}
            {slide.cta2Label && slide.cta2Href && (
              <Link href={slide.cta2Href}>
                <button style={{ padding: "14px 32px", background: "transparent", color: "#fff", border: "1px solid rgba(255,255,255,0.4)", borderRadius: "var(--radius-sm)", fontFamily: "var(--font-body)", fontSize: 12, letterSpacing: 2, textTransform: "uppercase", fontWeight: 500, cursor: "pointer", transition: "border-color 0.2s" }}>
                  {slide.cta2Label}
                </button>
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Navigation arrows */}
      {slides.length > 1 && (
        <>
          <button onClick={prev} aria-label="Previous" style={{ position: "absolute", left: 16, top: "50%", transform: "translateY(-50%)", zIndex: 2, background: "rgba(255,255,255,0.15)", border: "1px solid rgba(255,255,255,0.25)", borderRadius: "50%", width: 44, height: 44, color: "#fff", fontSize: 20, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", backdropFilter: "blur(4px)", transition: "background 0.2s" }}>‹</button>
          <button onClick={next} aria-label="Next" style={{ position: "absolute", right: 16, top: "50%", transform: "translateY(-50%)", zIndex: 2, background: "rgba(255,255,255,0.15)", border: "1px solid rgba(255,255,255,0.25)", borderRadius: "50%", width: 44, height: 44, color: "#fff", fontSize: 20, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", backdropFilter: "blur(4px)", transition: "background 0.2s" }}>›</button>
        </>
      )}

      {/* Dot indicators */}
      {slides.length > 1 && (
        <div style={{ position: "absolute", bottom: 24, left: "50%", transform: "translateX(-50%)", zIndex: 2, display: "flex", gap: 8 }}>
          {slides.map((_, i) => (
            <button key={i} onClick={() => setCurrent(i)} aria-label={`Slide ${i + 1}`}
              style={{ width: i === current ? 24 : 8, height: 8, borderRadius: 4, border: "none", background: i === current ? slide.accentColor : "rgba(255,255,255,0.4)", cursor: "pointer", transition: "all 0.3s ease", padding: 0 }} />
          ))}
        </div>
      )}

      {/* Pause indicator */}
      {paused && slides.length > 1 && (
        <div style={{ position: "absolute", bottom: 24, right: 20, zIndex: 2, fontSize: 10, color: "rgba(255,255,255,0.4)", letterSpacing: 1 }}>⏸ PAUSED</div>
      )}
    </section>
  );
}

