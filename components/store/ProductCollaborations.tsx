"use client";
import React from "react";
import useEmblaCarousel from "embla-carousel-react";

interface Collab {
  type: string;
  url: string;
  position: number;
}

interface Props {
  collaborations: Collab[];
}

function getEmbedUrl(url: string) {
  try {
    const urlObj = new URL(url);
    urlObj.search = ""; // remove query params that break embeds
    if (url.includes("instagram.com/reel") || url.includes("instagram.com/p/")) {
      let pathname = urlObj.pathname;
      if (!pathname.endsWith('/')) pathname += '/';
      return `${urlObj.origin}${pathname}embed/`;
    }
    if (url.includes("youtube.com/shorts")) {
      const id = urlObj.pathname.split('/shorts/')[1].split('/')[0];
      return `https://www.youtube.com/embed/${id}`;
    }
    return url;
  } catch {
    return url;
  }
}

export function ProductCollaborations({ collaborations }: Props) {
  const [emblaRef, emblaApi] = useEmblaCarousel({
    align: "start",
    containScroll: "trimSnaps",
    dragFree: true,
  });

  const sortedCollabs = [...collaborations].sort((a, b) => a.position - b.position);

  if (!sortedCollabs.length) return null;

  return (
    <div style={{ marginBottom: 48 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 24 }}>
        <div>
          <h2 style={{ fontFamily: "var(--font-display)", fontSize: 24, marginBottom: 8 }}>See it in Action</h2>
          <p style={{ fontSize: 14, color: "var(--color-ink-muted)" }}>Spotted in our community.</p>
        </div>
        {sortedCollabs.length > 3 && (
          <div style={{ display: "flex", gap: 12 }}>
            <button onClick={() => emblaApi?.scrollPrev()} style={{ width: 36, height: 36, borderRadius: "50%", border: "1px solid var(--color-border)", background: "var(--color-surface)", cursor: "pointer" }}>‹</button>
            <button onClick={() => emblaApi?.scrollNext()} style={{ width: 36, height: 36, borderRadius: "50%", border: "1px solid var(--color-border)", background: "var(--color-surface)", cursor: "pointer" }}>›</button>
          </div>
        )}
      </div>

      <div style={{ overflow: "hidden", margin: "0 -16px", padding: "0 16px" }} ref={emblaRef}>
        <div style={{ display: "flex", gap: 16, touchAction: "pan-y" }}>
          {sortedCollabs.map((collab, i) => (
            <div key={i} style={{ flex: "0 0 260px", minWidth: 0 }}>
              <div style={{ position: "relative", aspectRatio: "9/16", borderRadius: "var(--radius-lg)", overflow: "hidden", background: "#000" }}>
                {collab.url.includes("instagram.com/reel") || collab.url.includes("youtube.com/shorts") ? (
                  <iframe
                    src={getEmbedUrl(collab.url)}
                    width="100%" height="100%" frameBorder="0" scrolling="no" allowTransparency
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                ) : (
                  <div style={{ padding: 20, textAlign: "center", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", height: "100%" }}>
                    <a href={collab.url} target="_blank" rel="noopener noreferrer" style={{ color: "#fff" }}>View Collab</a>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
