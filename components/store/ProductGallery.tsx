"use client";
import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import useEmblaCarousel from "embla-carousel-react";

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
  autoplay?: boolean;
  loop?: boolean;
  muted?: boolean;
  position?: number;
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

  // Create an array of media items: videos and images, sorted by position
  const mediaItems = [
    ...videos.map(v => ({ type: "video" as const, ...v })),
    ...images.map(img => ({ type: "image" as const, ...img }))
  ].sort((a, b) => (a.position ?? 0) - (b.position ?? 0));

  const [mainRef, mainApi] = useEmblaCarousel({ loop: false });
  const [thumbRef, thumbApi] = useEmblaCarousel({
    containScroll: "keepSnaps",
    dragFree: true,
  });

  const onThumbClick = useCallback((index: number) => {
    if (!mainApi || !thumbApi) return;
    mainApi.scrollTo(index);
  }, [mainApi, thumbApi]);

  const onSelect = useCallback(() => {
    if (!mainApi || !thumbApi) return;
    const idx = mainApi.selectedScrollSnap();
    setSelected(idx);
    thumbApi.scrollTo(idx);
  }, [mainApi, thumbApi, setSelected]);

  useEffect(() => {
    if (!mainApi) return;
    onSelect();
    mainApi.on("select", onSelect);
    mainApi.on("reInit", onSelect);
  }, [mainApi, onSelect]);

  // Keyboard navigation in lightbox
  useEffect(() => {
    if (!lightbox) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") setLightbox(false);
      if (e.key === "ArrowLeft") setSelected(s => Math.max(0, s - 1));
      if (e.key === "ArrowRight") setSelected(s => Math.min(mediaItems.length - 1, s + 1));
    };
    document.addEventListener("keydown", handler);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handler);
      document.body.style.overflow = "";
    };
  }, [lightbox, mediaItems.length]);

  if (!mediaItems.length) {
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
      <div style={{ display: "flex", flexDirection: "column", gap: 10, width: "100%", minWidth: 0 }}>

        {/* Main display Carousel */}
        <div style={{ overflow: "hidden", borderRadius: "var(--radius-sm)", position: "relative", width: "100%", minWidth: 0 }} ref={mainRef}>
          <div style={{ display: "flex", touchAction: "pan-y" }}>
            {mediaItems.map((item, i) => (
              <div key={i} style={{ flex: "0 0 100%", minWidth: 0, position: "relative", aspectRatio: "3/4" }}>
                {item.type === "video" ? (
                  <div style={{ background: "#000", width: "100%", height: "100%" }}>
                    <video
                      src={item.url}
                      controls
                      autoPlay={item.autoplay ?? true}
                      loop={item.loop ?? false}
                      muted={item.muted ?? false}
                      playsInline
                      style={{ width: "100%", height: "100%", objectFit: "contain" }}
                      title={item.title ?? "Product video"}
                    />
                  </div>
                ) : (
                  <div
                    onClick={() => setLightbox(true)}
                    style={{
                      width: "100%", height: "100%",
                      background: "var(--color-ivory-dark)",
                      cursor: "zoom-in", position: "relative"
                    }}
                  >
                    <Image
                      src={item.url}
                      alt={item.alt || productName}
                      fill
                      priority={i === 0}
                      fetchPriority={i === 0 ? "high" : "auto"}
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
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Thumbnails row Carousel */}
        {mediaItems.length > 1 && (
          <div style={{ overflow: "hidden", paddingBottom: 4, width: "100%", minWidth: 0 }} ref={thumbRef}>
            <div style={{ display: "flex", gap: 10, touchAction: "pan-y", marginLeft: 2, marginRight: 2 }}>
              {mediaItems.map((item, i) => (
                <button
                  key={`thumb-${i}`}
                  onClick={() => onThumbClick(i)}
                  style={{
                    flex: "0 0 22%", minWidth: 64, maxWidth: 84, aspectRatio: "3/4", height: "auto",
                    position: "relative", borderRadius: "var(--radius-sm)",
                    overflow: "hidden", padding: 0,
                    border: selected === i
                      ? "2px solid var(--color-gold)"
                      : "2px solid transparent",
                    opacity: selected === i ? 1 : 0.6,
                    background: item.type === "video" && !item.thumbnailUrl ? "var(--color-ink)" : "var(--color-ivory-dark)",
                    cursor: "pointer", transition: "all 0.2s",
                  }}
                  aria-label={`View ${item.type} ${i + 1}`}
                >
                  {item.type === "video" ? (
                    <>
                      {item.thumbnailUrl && (
                        <Image src={item.thumbnailUrl} alt={`Video ${i + 1}`} fill style={{ objectFit: "cover" }} sizes="64px" />
                      )}
                      <div style={{
                        position: "absolute", inset: 0, display: "flex",
                        alignItems: "center", justifyContent: "center",
                        background: item.thumbnailUrl ? "rgba(0,0,0,0.35)" : "transparent",
                      }}>
                        <svg width="20" height="20" fill="white" viewBox="0 0 24 24">
                          <polygon points="5 3 19 12 5 21 5 3" />
                        </svg>
                      </div>
                    </>
                  ) : (
                    <Image src={item.url} alt={`View ${i + 1}`} fill style={{ objectFit: "cover" }} sizes="64px" />
                  )}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Lightbox */}
      {lightbox && mediaItems.length > 0 && (
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

          {/* Item */}
          <div
            onClick={e => e.stopPropagation()}
            style={{ position: "relative", width: "min(85vh, 90vw)", height: "min(85vh, 90vw)", maxWidth: 680 }}
          >
            {mediaItems[selected].type === "video" ? (
               <video
                 src={mediaItems[selected].url}
                 controls autoPlay loop muted playsInline
                 style={{ width: "100%", height: "100%", objectFit: "contain" }}
               />
            ) : (
               <Image
                 src={mediaItems[selected].url}
                 alt={mediaItems[selected].alt || productName}
                 fill
                 style={{ objectFit: "contain" }}
                 sizes="(max-width: 680px) 90vw, 680px"
                 priority
               />
            )}
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
          {selected < mediaItems.length - 1 && (
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
          {mediaItems.length > 1 && (
            <div style={{
              position: "fixed", bottom: 20, left: "50%", transform: "translateX(-50%)",
              background: "rgba(255,255,255,0.15)", borderRadius: "var(--radius-pill)",
              padding: "4px 14px", fontSize: 12, color: "rgba(255,255,255,0.8)",
            }}>
              {selected + 1} / {mediaItems.length}
            </div>
          )}
        </div>
      )}
    </>
  );
}
