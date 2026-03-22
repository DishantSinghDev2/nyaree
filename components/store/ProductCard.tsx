"use client";
// components/store/ProductCard.tsx
import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import type { Product } from "@/types";
import { useCartStore } from "@/lib/store/cart";
import { showToast } from "@/components/ui/Toaster";
import { trackEvent } from "@/hooks/useAnalytics";

interface Props {
  product: Product;
  priority?: boolean;
}

export function ProductCard({ product, priority = false }: Props) {
  const [imgIdx, setImgIdx] = useState(0);
  const [hovering, setHovering] = useState(false);
  const [quickAdding, setQuickAdding] = useState(false);
  const { addToWishlist, removeFromWishlist, isWishlisted, addItem } = useCartStore();

  const heroImage = product.images.find((i) => i.isHero) ?? product.images[0];
  const secondImage = product.images[1];
  const wishlisted = isWishlisted(product._id);

  // Cheapest active variant
  const variants = product.variants ?? [];
  const minVariant = variants.reduce((min, v) =>
    !min || v.price < min.price ? v : min, variants[0]);

  const hasDiscount = minVariant?.compareAtPrice > minVariant?.price;
  const discountPct = hasDiscount
    ? Math.round(((minVariant.compareAtPrice - minVariant.price) / minVariant.compareAtPrice) * 100)
    : 0;

  const totalStock = variants.reduce((s, v) => s + v.stock, 0);
  const isLowStock = totalStock > 0 && totalStock <= 5;
  const isOutOfStock = totalStock === 0;

  const fmt = (p: number) => `₹${(p / 100).toLocaleString("en-IN")}`;

  const handleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    if (wishlisted) {
      removeFromWishlist(product._id);
      trackEvent("wishlist_remove", { productId: product._id });
      showToast("Removed from wishlist", "info");
    } else {
      addToWishlist(product._id);
      trackEvent("wishlist_add", { productId: product._id, productName: product.name });
      showToast("Added to wishlist ♥", "success");
    }
  };

  const handleQuickAdd = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (!minVariant || isOutOfStock) return;
    setQuickAdding(true);

    trackEvent("add_to_cart", { productId: product._id, productName: product.name, price: minVariant?.price ?? 0 });
    addItem({
      productId: product._id,
      variantId: minVariant.id,
      name: product.name,
      slug: product.slug,
      image: heroImage?.url ?? "",
      size: minVariant.size,
      color: minVariant.color,
      colorHex: minVariant.colorHex,
      price: minVariant.price,
      compareAtPrice: minVariant.compareAtPrice,
      quantity: 1,
    });

    showToast("Added to bag!", "success");
    setTimeout(() => setQuickAdding(false), 800);
  };

  return (
    <article
      className="card card-lift"
      style={{ position: "relative", background: "var(--color-surface)" }}
      onMouseEnter={() => setHovering(true)}
      onMouseLeave={() => setHovering(false)}
    >
      {/* Badges */}
      <div style={{ position: "absolute", top: 10, left: 10, zIndex: 2, display: "flex", flexDirection: "column", gap: 4 }}>
        {product.isNewArrival && (
          <span className="badge badge-new" style={{ fontSize: 10 }}>NEW</span>
        )}
        {hasDiscount && (
          <span className="badge badge-sale" style={{ fontSize: 10 }}>−{discountPct}%</span>
        )}
        {isLowStock && !isOutOfStock && (
          <span className="badge badge-stock" style={{ fontSize: 10 }}>LOW STOCK</span>
        )}
        {isOutOfStock && (
          <span className="badge" style={{ background: "#ccc", color: "#555", fontSize: 10 }}>SOLD OUT</span>
        )}
      </div>

      {/* Wishlist */}
      <button
        onClick={handleWishlist}
        style={{
          position: "absolute", top: 10, right: 10, zIndex: 2,
          background: "var(--color-surface)", border: "none",
          borderRadius: "50%", width: 32, height: 32,
          display: "flex", alignItems: "center", justifyContent: "center",
          opacity: hovering || wishlisted ? 1 : 0,
          transition: "opacity 0.2s, transform 0.2s",
          transform: hovering || wishlisted ? "scale(1)" : "scale(0.8)",
          boxShadow: "var(--shadow-sm)",
        }}
        aria-label="Add to wishlist"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill={wishlisted ? "var(--color-gold)" : "none"} stroke={wishlisted ? "var(--color-gold)" : "currentColor"} strokeWidth="1.5">
          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
        </svg>
      </button>

      {/* Image */}
      <Link href={`/product/${product.slug}`}>
        <div
          style={{
            aspectRatio: "3/4", position: "relative", overflow: "hidden",
            background: "var(--color-ivory-dark)",
          }}
        >
          {heroImage && (
            <Image
              src={hovering && secondImage ? secondImage.url : (heroImage?.url || "")}
              alt={heroImage.alt || product.name}
              fill
              priority={priority}
              sizes="(max-width: 640px) 50vw, (max-width: 1200px) 33vw, 25vw"
              style={{
                objectFit: "cover",
                transition: "transform 0.5s ease, opacity 0.3s ease",
                transform: hovering ? "scale(1.04)" : "scale(1)",
              }}
            />
          )}
          {isOutOfStock && (
            <div style={{
              position: "absolute", inset: 0, background: "rgba(253,250,244,0.5)",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <span style={{ fontFamily: "var(--font-display)", fontSize: 16, color: "var(--color-ink-light)", letterSpacing: 2 }}>
                Sold Out
              </span>
            </div>
          )}

          {/* Quick Add */}
          {!isOutOfStock && (
            <button
              onClick={handleQuickAdd}
              style={{
                position: "absolute", bottom: 0, left: 0, right: 0,
                background: quickAdding ? "var(--color-success)" : "var(--color-ink)",
                color: "#fff", border: "none", padding: "12px",
                fontSize: 11, letterSpacing: "2px", fontWeight: 500,
                textTransform: "uppercase", fontFamily: "var(--font-body)",
                transform: hovering ? "translateY(0)" : "translateY(100%)",
                transition: "transform 0.25s ease, background 0.2s",
              }}
            >
              {quickAdding ? "✓ Added!" : "Quick Add"}
            </button>
          )}
        </div>
      </Link>

      {/* Info */}
      <Link href={`/product/${product.slug}`} style={{ textDecoration: "none" }}>
        <div style={{ padding: "14px 14px 16px" }}>
          {/* Color swatches */}
          {variants.length > 0 && (
            <div style={{ display: "flex", gap: 4, marginBottom: 8, flexWrap: "wrap" }}>
              {[...new Set(variants.map((v) => v.colorHex))].slice(0, 5).map((hex) => (
                <div
                  key={hex}
                  style={{
                    width: 12, height: 12, borderRadius: "50%",
                    background: hex, border: "1px solid rgba(0,0,0,0.1)",
                    flexShrink: 0,
                  }}
                />
              ))}
              {[...new Set(variants.map((v) => v.colorHex))].length > 5 && (
                <span style={{ fontSize: 10, color: "var(--color-ink-light)", lineHeight: "12px" }}>
                  +{[...new Set(variants.map((v) => v.colorHex))].length - 5}
                </span>
              )}
            </div>
          )}

          <h3
            style={{
              fontFamily: "var(--font-display)", fontSize: 15, fontWeight: 400,
              color: "var(--color-ink)", marginBottom: 6, lineHeight: 1.3,
              display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical",
              overflow: "hidden",
            }}
          >
            {product.name}
          </h3>

          {/* Rating — Flipkart-style compact badge */}
          {product.rating?.count > 0 && (
            <div style={{ display: "flex", alignItems: "center", gap: 5, marginBottom: 5 }}>
              <span style={{
                display: "inline-flex", alignItems: "center", gap: 3,
                background: product.rating.average >= 4 ? "#388E3C" : product.rating.average >= 3 ? "#FB8C00" : "#D32F2F",
                color: "#fff", fontSize: 11, fontWeight: 600, padding: "2px 6px",
                borderRadius: 3, lineHeight: 1,
              }}>
                {product.rating.average.toFixed(1)}
                <svg width="9" height="9" viewBox="0 0 24 24" fill="currentColor">
                  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                </svg>
              </span>
              <span style={{ fontSize: 11, color: "var(--color-ink-light)" }}>
                ({product.rating.count})
              </span>
            </div>
          )}

          {/* Price */}
          <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
            <span className="price" style={{ fontSize: 15 }}>
              {minVariant ? fmt(minVariant.price) : "—"}
            </span>
            {hasDiscount && (
              <span className="price-compare" style={{ fontSize: 12 }}>
                {fmt(minVariant.compareAtPrice)}
              </span>
            )}
          </div>
        </div>
      </Link>
    </article>
  );
}
