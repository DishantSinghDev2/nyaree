"use client";
// components/store/ProductGallery.tsx
import { useState, useEffect } from "react";
import Image from "next/image";

interface ProductImage {
  url: string;
  alt: string;
  position: number;
  isHero: boolean;
}

interface ProductVideo {
  url: string;
  title?: string;
  thumbnailUrl?: string;
}

interface Props {
  images: ProductImage[];
  productName: string;
  videos?: ProductVideo[];
}

export function ProductGallery({ images, productName, videos = [] }: Props) {
  const [selected, setSelected] = useState(0);
  const [lightbox, setLightbox] = useState(false);
  const [activeVideo, setActiveVideo] = useState<number | null>(null);

  const sorted = [...images].sort((a, b) => a.position - b.position);

  // Keyboard navigation in lightbox
  useEffect(() => {
    if (!lightbox) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") setLightbox(false);
      if (e.key === "ArrowLeft") setSelected(s => Math.max(0, s - 1));
      if (e.key === "ArrowRight") setSelected(s => Math.min(sorted.length - 1, s + 1));
    };
    document.addEventListener("keydown", handler);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handler);
      document.body.style.overflow = "";
    };
  }, [lightbox, sorted.length]);

  if (!sorted.length && !videos.length) {
    return (
      <div style={{
        aspectRatio: "3/4", background: "var(--color-ivory-dark)",
        borderRadius: "var(--radius-sm)", display: "flex",
        alignItems: "center", justifyContent: "center",
      }}>
        <span style={{ color: "var(--color-ink-light)", fontSize: 14 }}>No images yet</span>
      </div>
    );
  }

  return (
    <>
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>

        {/* Main display — either image or video */}
        {activeVideo !== null && videos[activeVideo] ? (
          <div style={{
            borderRadius: "var(--radius-sm)", overflow: "hidden",
            background: "#000", position: "relative", aspectRatio: "3/4",
          }}>
            <video
              src={videos[activeVideo].url}
              controls autoPlay
              style={{ width: "100%", height: "100%", objectFit: "contain" }}
              title={videos[activeVideo].title ?? "Product video"}
            />
            <button
              onClick={() => setActiveVideo(null)}
              style={{
                position: "absolute", top: 8, right: 8,
                background: "rgba(0,0,0,0.6)", border: "none",
                color: "#fff", borderRadius: "50%",
                width: 30, height: 30, fontSize: 16, cursor: "pointer",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}
            >×</button>
          </div>
        ) : sorted.length > 0 ? (
          <div
            onClick={() => setLightbox(true)}
            style={{
              position: "relative", aspectRatio: "3/4",
              background: "var(--color-ivory-dark)",
              borderRadius: "var(--radius-sm)", overflow: "hidden",
              cursor: "zoom-in",
            }}
          >
            <Image
              src={sorted[selected].url}
              alt={sorted[selected].alt || productName}
              fill
              priority={selected === 0}
              style={{ objectFit: "cover" }}
              sizes="(max-width: 860px) 100vw, 50vw"
            />
            {/* Zoom hint */}
            <div style={{
              position: "absolute", bottom: 12, right: 12,
              background: "rgba(255,255,255,0.85)", borderRadius: "var(--radius-pill)",
              padding: "4px 10px", fontSize: 11, color: "var(--color-ink-muted)",
              display: "flex", alignItems: "center", gap: 4,
              backdropFilter: "blur(4px)",
            }}>
              🔍 Click to zoom
            </div>
          </div>
        ) : null}

        {/* Thumbnails row */}
        {(sorted.length > 1 || videos.length > 0) && (
          <div style={{ display: "flex", gap: 8, overflowX: "auto", paddingBottom: 4 }}>
            {/* Image thumbnails */}
            {sorted.map((img, i) => (
              <button
                key={`img-${i}`}
                onClick={() => { setSelected(i); setActiveVideo(null); }}
                style={{
                  flexShrink: 0, width: 64, height: 80,
                  position: "relative", borderRadius: "var(--radius-sm)",
                  overflow: "hidden", padding: 0,
                  border: selected === i && activeVideo === null
                    ? "2px solid var(--color-gold)"
                    : "2px solid var(--color-border)",
                  background: "var(--color-ivory-dark)",
                  cursor: "pointer", transition: "border-color 0.15s",
                }}
                aria-label={`View image ${i + 1}`}
              >
                <Image src={img.url} alt={`View ${i + 1}`} fill style={{ objectFit: "cover" }} sizes="64px" />
              </button>
            ))}

            {/* Video thumbnails */}
            {videos.map((vid, i) => (
              <button
                key={`vid-${i}`}
                onClick={() => setActiveVideo(i)}
                style={{
                  flexShrink: 0, width: 64, height: 80,
                  borderRadius: "var(--radius-sm)",
                  border: activeVideo === i
                    ? "2px solid var(--color-gold)"
                    : "2px solid var(--color-border)",
                  background: vid.thumbnailUrl ? "transparent" : "var(--color-ink)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  padding: 0, cursor: "pointer", position: "relative", overflow: "hidden",
                }}
                aria-label={`Play video ${i + 1}`}
              >
                {vid.thumbnailUrl && (
                  <Image src={vid.thumbnailUrl} alt={`Video ${i + 1}`} fill style={{ objectFit: "cover" }} sizes="64px" />
                )}
                <div style={{
                  position: "absolute", inset: 0, display: "flex",
                  alignItems: "center", justifyContent: "center",
                  background: vid.thumbnailUrl ? "rgba(0,0,0,0.35)" : "transparent",
                }}>
                  <svg width="20" height="20" fill="white" viewBox="0 0 24 24">
                    <polygon points="5 3 19 12 5 21 5 3" />
                  </svg>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Lightbox */}
      {lightbox && sorted.length > 0 && (
        <div
          onClick={() => setLightbox(false)}
          style={{
            position: "fixed", inset: 0, zIndex: 9999,
            background: "rgba(0,0,0,0.92)",
            display: "flex", alignItems: "center", justifyContent: "center",
            padding: 20, animation: "fadeIn 0.15s ease",
          }}
        >
          {/* Close */}
          <button
            onClick={() => setLightbox(false)}
            style={{
              position: "fixed", top: 16, right: 16,
              background: "rgba(255,255,255,0.15)", border: "none",
              color: "#fff", borderRadius: "50%",
              width: 44, height: 44, fontSize: 22, cursor: "pointer",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}
            aria-label="Close"
          >×</button>

          {/* Image */}
          <div
            onClick={e => e.stopPropagation()}
            style={{ position: "relative", width: "min(85vh, 90vw)", height: "min(85vh, 90vw)", maxWidth: 680 }}
          >
            <Image
              src={sorted[selected].url}
              alt={sorted[selected].alt || productName}
              fill
              style={{ objectFit: "contain" }}
              sizes="(max-width: 680px) 90vw, 680px"
              priority
            />
          </div>

          {/* Prev */}
          {selected > 0 && (
            <button
              onClick={e => { e.stopPropagation(); setSelected(s => s - 1); }}
              style={{
                position: "fixed", left: 16, top: "50%", transform: "translateY(-50%)",
                background: "rgba(255,255,255,0.15)", border: "none", color: "#fff",
                borderRadius: "50%", width: 48, height: 48, fontSize: 24, cursor: "pointer",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}
              aria-label="Previous"
            >‹</button>
          )}

          {/* Next */}
          {selected < sorted.length - 1 && (
            <button
              onClick={e => { e.stopPropagation(); setSelected(s => s + 1); }}
              style={{
                position: "fixed", right: 16, top: "50%", transform: "translateY(-50%)",
                background: "rgba(255,255,255,0.15)", border: "none", color: "#fff",
                borderRadius: "50%", width: 48, height: 48, fontSize: 24, cursor: "pointer",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}
              aria-label="Next"
            >›</button>
          )}

          {/* Counter */}
          {sorted.length > 1 && (
            <div style={{
              position: "fixed", bottom: 20, left: "50%", transform: "translateX(-50%)",
              background: "rgba(255,255,255,0.15)", borderRadius: "var(--radius-pill)",
              padding: "4px 14px", fontSize: 12, color: "rgba(255,255,255,0.8)",
            }}>
              {selected + 1} / {sorted.length}
            </div>
          )}
        </div>
      )}
    </>
  );
}
