"use client";
// components/store/ProductGallery.tsx
import { useState } from "react";
import Image from "next/image";

interface Props { images: { url: string; alt: string; position: number; isHero: boolean }[]; productName: string; }

export function ProductGallery({ images, productName }: Props) {
  const [selected, setSelected] = useState(0);
  const [lightbox, setLightbox] = useState(false);
  const sorted = [...images].sort((a, b) => a.position - b.position);

  if (!sorted.length) return (
    <div style={{ aspectRatio: "3/4", background: "var(--color-ivory-dark)", borderRadius: "var(--radius-sm)", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <span style={{ color: "var(--color-ink-light)", fontSize: 14 }}>No images</span>
    </div>
  );

  return (
    <>
      <div style={{ position: "sticky", top: 80 }}>
        {/* Main image */}
        <div
          style={{ aspectRatio: "3/4", position: "relative", borderRadius: "var(--radius-sm)", overflow: "hidden", background: "var(--color-ivory-dark)", cursor: "zoom-in" }}
          onClick={() => setLightbox(true)}
        >
          <Image src={sorted[selected]?.url ?? ""} alt={sorted[selected]?.alt || productName} fill priority style={{ objectFit: "cover", transition: "transform 0.4s ease" }}
            onMouseEnter={(e) => { (e.target as HTMLElement).style.transform = "scale(1.04)"; }}
            onMouseLeave={(e) => { (e.target as HTMLElement).style.transform = "scale(1)"; }}
          />
          <button style={{ position: "absolute", top: 12, right: 12, background: "rgba(255,255,255,0.8)", border: "none", borderRadius: "var(--radius-sm)", padding: "4px 8px", fontSize: 11, color: "var(--color-ink-light)", letterSpacing: 1 }}>
            ZOOM
          </button>
        </div>

        {/* Thumbnails */}
        {sorted.length > 1 && (
          <div style={{ display: "flex", gap: 8, marginTop: 12, overflowX: "auto" }}>
            {sorted.map((img, i) => (
              <button
                key={i}
                onClick={() => setSelected(i)}
                style={{
                  flexShrink: 0, width: 72, aspectRatio: "3/4", position: "relative",
                  border: `2px solid ${i === selected ? "var(--color-gold)" : "var(--color-border)"}`,
                  borderRadius: "var(--radius-sm)", overflow: "hidden", background: "var(--color-ivory-dark)",
                  padding: 0, cursor: "pointer", transition: "border-color 0.2s",
                }}
              >
                <Image src={img.url} alt={img.alt || productName} fill style={{ objectFit: "cover" }} />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Lightbox */}
      {lightbox && (
        <>
          <div className="backdrop" onClick={() => setLightbox(false)} style={{ zIndex: 300 }} />
          <div style={{ position: "fixed", inset: 0, zIndex: 301, display: "flex", alignItems: "center", justifyContent: "center", padding: 40 }}>
            <div style={{ position: "relative", maxWidth: "80vh", maxHeight: "80vh", aspectRatio: "3/4" }}>
              <Image src={sorted[selected]?.url} alt={productName} fill style={{ objectFit: "contain" }} />
            </div>
            <button onClick={() => setLightbox(false)} style={{ position: "fixed", top: 24, right: 24, background: "rgba(255,255,255,0.9)", border: "none", borderRadius: "50%", width: 40, height: 40, fontSize: 20, cursor: "pointer" }}>×</button>
            {selected > 0 && (
              <button onClick={(e) => { e.stopPropagation(); setSelected(selected - 1); }} style={{ position: "fixed", left: 24, top: "50%", transform: "translateY(-50%)", background: "rgba(255,255,255,0.9)", border: "none", borderRadius: "50%", width: 44, height: 44, fontSize: 20 }}>‹</button>
            )}
            {selected < sorted.length - 1 && (
              <button onClick={(e) => { e.stopPropagation(); setSelected(selected + 1); }} style={{ position: "fixed", right: 24, top: "50%", transform: "translateY(-50%)", background: "rgba(255,255,255,0.9)", border: "none", borderRadius: "50%", width: 44, height: 44, fontSize: 20 }}>›</button>
            )}
          </div>
        </>
      )}
    </>
  );
}
