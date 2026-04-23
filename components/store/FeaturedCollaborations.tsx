"use client";
import React from "react";
import Image from "next/image";
import Link from "next/link";
import useEmblaCarousel from "embla-carousel-react";
import { Product } from "@/types";

interface Props {
  products: Product[];
}

export function FeaturedCollaborations({ products }: Props) {
  const [emblaRef, emblaApi] = useEmblaCarousel({
    align: "start",
    containScroll: "trimSnaps",
    dragFree: true,
  });

  const featuredCollabs = products.flatMap(p => 
    (p.collaborations || [])
      .filter(c => c.isFeaturedOnHome)
      .map(c => ({ ...c, product: p }))
  ).sort((a, b) => a.position - b.position);

  if (!featuredCollabs.length) return null;

  return (
    <section style={{ padding: "80px 0", background: "var(--color-ivory)" }}>
      <div className="container">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 40 }}>
          <div>
            <h2 style={{ fontFamily: "var(--font-display)", fontSize: 32, marginBottom: 8 }}>Spotted in Nyaree</h2>
            <p style={{ fontSize: 14, color: "var(--color-ink-muted)" }}>See how our community styles it.</p>
          </div>
          {featuredCollabs.length > 4 && (
            <div style={{ display: "flex", gap: 12 }}>
              <button onClick={() => emblaApi?.scrollPrev()} style={{ width: 44, height: 44, borderRadius: "50%", border: "1px solid var(--color-border)", background: "var(--color-surface)", cursor: "pointer" }}>‹</button>
              <button onClick={() => emblaApi?.scrollNext()} style={{ width: 44, height: 44, borderRadius: "50%", border: "1px solid var(--color-border)", background: "var(--color-surface)", cursor: "pointer" }}>›</button>
            </div>
          )}
        </div>

        <div style={{ overflow: "hidden", margin: "0 -16px", padding: "0 16px" }} ref={emblaRef}>
          <div style={{ display: "flex", gap: 24, touchAction: "pan-y" }}>
            {featuredCollabs.map((collab, i) => (
              <div key={i} style={{ flex: "0 0 280px", minWidth: 0 }}>
                <div style={{ position: "relative", aspectRatio: "9/16", borderRadius: "var(--radius-lg)", overflow: "hidden", background: "#000", marginBottom: 16 }}>
                  {collab.url.includes("instagram.com/reel") ? (
                    <iframe
                      src={`${collab.url.replace(/\/?$/, "")}/embed`}
                      width="100%" height="100%" frameBorder="0" scrolling="no" allowTransparency
                    />
                  ) : collab.url.includes("youtube.com/shorts") ? (
                    <iframe
                      src={collab.url.replace("youtube.com/shorts/", "youtube.com/embed/")}
                      width="100%" height="100%" frameBorder="0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  ) : (
                    <div style={{ padding: 20, textAlign: "center", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", height: "100%" }}>
                      <a href={collab.url} target="_blank" rel="noopener noreferrer" style={{ color: "#fff" }}>View Collab</a>
                    </div>
                  )}
                </div>
                <Link href={`/product/${collab.product.slug}`} style={{ display: "flex", alignItems: "center", gap: 12, padding: 12, background: "var(--color-surface)", borderRadius: "var(--radius-sm)", border: "1px solid var(--color-border-light)", textDecoration: "none", transition: "box-shadow 0.2s" }} className="card-lift">
                  <div style={{ width: 40, height: 50, position: "relative", borderRadius: 2, overflow: "hidden", flexShrink: 0 }}>
                    <Image src={collab.product.images?.find(i => i.isHero)?.url || collab.product.images?.[0]?.url || ""} alt={collab.product.name} fill style={{ objectFit: "cover" }} />
                  </div>
                  <div>
                    <p style={{ fontSize: 13, fontWeight: 500, color: "var(--color-ink)", marginBottom: 2 }}>{collab.product.name}</p>
                    <p style={{ fontSize: 11, color: "var(--color-gold)", textTransform: "uppercase", letterSpacing: 1 }}>Shop the look →</p>
                  </div>
                </Link>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
