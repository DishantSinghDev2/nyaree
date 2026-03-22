"use client";
// components/store/ProductInfo.tsx
import { useState, useEffect } from "react";
import { useCartStore } from "@/lib/store/cart";
import { showToast } from "@/components/ui/Toaster";
import { trackEvent } from "@/hooks/useAnalytics";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface Props { product: any; showRatingBelowTitle?: boolean; }

export function ProductInfo({ product, showRatingBelowTitle = true }: Props) {
  const router = useRouter();
  const { addItem, addToWishlist, removeFromWishlist, isWishlisted } = useCartStore();
  const wishlisted = isWishlisted(product._id);

  // Track product view on mount
  useEffect(() => {
    trackEvent("product_view", {
      productId: product._id,
      productName: product.name,
      category: product.category ?? "",
      price: product.variants?.[0]?.price ?? 0,
    });
  }, [product._id]); // eslint-disable-line react-hooks/exhaustive-deps

  const variants = product.variants ?? [];
  const colors = [...new Set(variants.map((v: any) => v.color))] as string[];
  const [selectedColor, setSelectedColor] = useState<string>(colors[0] ?? "");
  const availableSizes = variants.filter((v: any) => v.color === selectedColor).map((v: any) => v.size);
  const [selectedSize, setSelectedSize] = useState<string>("");
  const [quantity, setQty] = useState(1);
  const [customNote, setCustomNote] = useState("");
  const [showCustom, setShowCustom] = useState(false);
  const [adding, setAdding] = useState(false);
  const [accordion, setAccordion] = useState<string | null>("details");
  const [showSizeChart, setShowSizeChart] = useState(false);

  const selectedVariant = variants.find((v: any) => v.color === selectedColor && v.size === selectedSize);
  const colorVariant = variants.find((v: any) => v.color === selectedColor);

  const price = selectedVariant?.price ?? colorVariant?.price ?? variants[0]?.price ?? 0;
  const comparePrice = selectedVariant?.compareAtPrice ?? colorVariant?.compareAtPrice ?? 0;
  const stock = selectedVariant?.stock ?? 0;
  const hasDiscount = comparePrice > price;
  const discountPct = hasDiscount ? Math.round(((comparePrice - price) / comparePrice) * 100) : 0;
  const fmt = (p: number) => `₹${(p / 100).toLocaleString("en-IN")}`;
  const totalStock = variants.reduce((s: number, v: any) => s + (v.color === selectedColor ? v.stock : 0), 0);

  const handleAddToCart = () => {
    if (!selectedSize) { showToast("Please select a size", "error"); return; }
    if (!selectedVariant || selectedVariant.stock < 1) { showToast("This variant is out of stock", "error"); return; }
    setAdding(true);
    trackEvent("add_to_cart", { productId: product._id, productName: product.name, price: selectedVariant?.price ?? 0, source: "product_page" });
    addItem({
      productId: product._id,
      variantId: selectedVariant.id,
      name: product.name,
      slug: product.slug,
      image: product.images?.find((i: any) => i.isHero)?.url ?? product.images?.[0]?.url ?? "",
      size: selectedSize,
      color: selectedColor,
      colorHex: selectedVariant.colorHex,
      price,
      compareAtPrice: comparePrice,
      quantity,
      customInstructions: customNote || undefined,
    });
    showToast("Added to bag! 🛍️", "success");
    setTimeout(() => setAdding(false), 800);
  };

  const handleBuyNow = () => {
    if (!selectedSize) { showToast("Please select a size", "error"); return; }
    handleAddToCart();
    setTimeout(() => router.push("/checkout"), 300);
  };

  const accordions = [
    { id: "details", label: "Product Details", content: (
      <div style={{ fontSize: 13, color: "var(--color-ink-muted)", lineHeight: 1.8 }}>
        {product.fabric && <p>Fabric: <strong>{product.fabric}</strong></p>}
        {product.fit && <p>Fit: <strong>{product.fit}</strong></p>}
        {product.pattern && <p>Pattern: <strong>{product.pattern}</strong></p>}
        {product.workType && <p>Work: <strong>{product.workType}</strong></p>}
        {product.occasion?.length > 0 && <p>Occasion: <strong>{product.occasion.join(", ")}</strong></p>}
        {product.customFields?.map((f: any, i: number) => (
          <p key={i}>{f.label}: <strong>{f.value}</strong></p>
        ))}
      </div>
    )},
    { id: "description", label: "About This Piece", content: (
      <div className="prose" style={{ fontSize: 14 }} dangerouslySetInnerHTML={{ __html: product.description }} />
    )},
    { id: "care", label: "Care Instructions", content: (
      <ul style={{ fontSize: 13, color: "var(--color-ink-muted)", lineHeight: 1.9, paddingLeft: 16 }}>
        {(product.careInstructions ?? ["Machine wash cold", "Do not tumble dry", "Iron on medium heat", "Do not bleach"]).map((c: string, i: number) => (
          <li key={i}>{c}</li>
        ))}
      </ul>
    )},
    { id: "shipping", label: "Shipping & Returns", content: (
      <div style={{ fontSize: 13, color: "var(--color-ink-muted)", lineHeight: 1.9 }}>
        <p>🚚 Free shipping on orders above ₹499</p>
        <p>📦 Standard delivery: 5-7 business days</p>
        <p>↩️ 7-day easy returns on all products</p>
        <p>📞 Need help? Call/WhatsApp: +91 8368989758</p>
      </div>
    )},
  ];

  return (
    <div style={{ paddingTop: 8 }}>
      {/* Badges */}
      <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
        {product.isNewArrival && <span className="badge badge-new">NEW ARRIVAL</span>}
        {product.isBestSeller && <span className="badge badge-gold">BEST SELLER</span>}
        {product.isCustomOrder && <span className="badge" style={{ background: "#F3E5F5", color: "#6A1B9A" }}>CUSTOM ORDERS</span>}
      </div>

      {/* Name */}
      <h1 style={{ fontFamily: "var(--font-display)", fontSize: "clamp(1.6rem, 3vw, 2.4rem)", fontWeight: 400, lineHeight: 1.2, marginBottom: 12, color: "var(--color-ink)" }}>
        {product.name}
      </h1>

      {/* Rating — Flipkart-style (controlled by showRatingBelowTitle setting) */}
      {showRatingBelowTitle && product.rating?.count > 0 && (
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
          {/* Colored rating badge */}
          <span style={{
            display: "inline-flex", alignItems: "center", gap: 4,
            background: product.rating.average >= 4 ? "#388E3C" : product.rating.average >= 3 ? "#FB8C00" : "#D32F2F",
            color: "#fff", fontSize: 13, fontWeight: 600, padding: "3px 10px",
            borderRadius: 4, lineHeight: 1,
          }}>
            {product.rating.average.toFixed(1)}
            <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor">
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
            </svg>
          </span>
          <span style={{ fontSize: 13, color: "var(--color-ink-light)" }}>
            {product.rating.count} review{product.rating.count !== 1 ? "s" : ""}
          </span>
          <a href="#reviews" style={{ fontSize: 12, color: "var(--color-gold)", textDecoration: "none" }}>See all →</a>
        </div>
      )}

      {/* Price */}
      <div style={{ display: "flex", alignItems: "baseline", gap: 12, marginBottom: 24 }}>
        <span className="price" style={{ fontSize: 28, fontFamily: "var(--font-display)" }}>{fmt(price)}</span>
        {hasDiscount && (
          <>
            <span className="price-compare" style={{ fontSize: 18 }}>{fmt(comparePrice)}</span>
            <span className="badge badge-sale">{discountPct}% OFF</span>
          </>
        )}
      </div>
      <p style={{ fontSize: 12, color: "var(--color-ink-light)", marginTop: -16, marginBottom: 20 }}>Inclusive of all taxes (GST) · Free shipping above ₹499</p>

      {/* COD badge */}
      <div style={{ display: "flex", gap: 8, marginBottom: 24, flexWrap: "wrap" }}>
        <span style={{ fontSize: 12, color: "var(--color-forest)", background: "#E8F5E9", padding: "4px 10px", borderRadius: "var(--radius-pill)" }}>✓ Cash on Delivery available</span>
        <span style={{ fontSize: 12, color: "var(--color-gold-dim)", background: "#FEF9EC", padding: "4px 10px", borderRadius: "var(--radius-pill)" }}>💳 5% off on prepaid</span>
      </div>

      {/* Color selector */}
      {colors.length > 0 && (
        <div style={{ marginBottom: 20 }}>
          <p className="label">Color: <strong style={{ color: "var(--color-ink)", textTransform: "none" }}>{selectedColor}</strong></p>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            {colors.map((color) => {
              const v = variants.find((v: any) => v.color === color);
              return (
                <button
                  key={color}
                  onClick={() => { setSelectedColor(color); setSelectedSize(""); }}
                  title={color}
                  style={{
                    width: 32, height: 32, borderRadius: "50%",
                    background: v?.colorHex ?? "#ccc",
                    border: `3px solid ${selectedColor === color ? "var(--color-gold)" : "transparent"}`,
                    outline: `1px solid ${selectedColor === color ? "var(--color-gold)" : "rgba(0,0,0,0.15)"}`,
                    cursor: "pointer", padding: 0, transition: "border 0.15s, outline 0.15s",
                    flexShrink: 0,
                  }}
                />
              );
            })}
          </div>
        </div>
      )}

      {/* Size selector */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
          <p className="label">Size</p>
          <button onClick={() => setShowSizeChart(true)} style={{ fontSize: 12, color: "var(--color-gold)", background: "none", border: "none", textDecoration: "underline" }}>Size Guide</button>
        </div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {["XS","S","M","L","XL","XXL","3XL"].map((size) => {
            const v = variants.find((v: any) => v.color === selectedColor && v.size === size);
            const inStock = v?.stock > 0;
            const available = availableSizes.includes(size);
            return (
              <button
                key={size}
                onClick={() => available && inStock && setSelectedSize(size)}
                disabled={!available || !inStock}
                style={{
                  minWidth: 44, height: 44, padding: "0 12px",
                  border: `1px solid ${selectedSize === size ? "var(--color-ink)" : "var(--color-border)"}`,
                  background: selectedSize === size ? "var(--color-ink)" : "transparent",
                  color: selectedSize === size ? "#fff" : !available || !inStock ? "var(--color-border)" : "var(--color-ink)",
                  borderRadius: "var(--radius-sm)", fontSize: 13, fontWeight: 500,
                  cursor: !available || !inStock ? "not-allowed" : "pointer",
                  position: "relative", transition: "all 0.15s",
                  textDecoration: !available || !inStock ? "line-through" : "none",
                }}
              >
                {size}
              </button>
            );
          })}
        </div>
        {selectedVariant && selectedVariant.stock <= 5 && selectedVariant.stock > 0 && (
          <p style={{ fontSize: 12, color: "var(--color-warning)", marginTop: 8 }}>⚡ Only {selectedVariant.stock} left in stock!</p>
        )}
      </div>

      {/* Quantity */}
      <div style={{ marginBottom: 20 }}>
        <p className="label">Quantity</p>
        <div style={{ display: "flex", alignItems: "center", gap: 0, border: "1px solid var(--color-border)", width: "fit-content", borderRadius: "var(--radius-sm)" }}>
          <button onClick={() => setQty(Math.max(1, quantity - 1))} style={{ width: 40, height: 40, background: "none", border: "none", fontSize: 18 }}>−</button>
          <span style={{ width: 40, textAlign: "center", fontSize: 15, fontWeight: 500 }}>{quantity}</span>
          <button onClick={() => setQty(quantity + 1)} style={{ width: 40, height: 40, background: "none", border: "none", fontSize: 18 }}>+</button>
        </div>
      </div>

      {/* Custom instructions */}
      {product.allowCustomization && (
        <div style={{ marginBottom: 20 }}>
          <button
            onClick={() => setShowCustom(!showCustom)}
            style={{ fontSize: 13, color: "var(--color-gold)", background: "none", border: "none", textDecoration: "underline", marginBottom: 8 }}
          >
            ✂️ {showCustom ? "Hide" : "Add"} custom instructions
          </button>
          {showCustom && (
            <textarea
              value={customNote}
              onChange={(e) => setCustomNote(e.target.value)}
              placeholder={product.customizationNote || "Enter your custom size measurements, color preferences, or any special instructions..."}
              className="input"
              style={{ marginTop: 8 }}
              rows={3}
            />
          )}
        </div>
      )}

      {/* CTA buttons */}
      <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 24 }}>
        <button
          className={`btn btn-primary btn-full btn-lg ${adding ? "btn-loading" : ""}`}
          onClick={handleAddToCart}
          disabled={adding}
          style={{ fontSize: 13 }}
        >
          {adding ? "✓ Added!" : "Add to Bag"}
        </button>
        <button className="btn btn-dark btn-full btn-lg" onClick={handleBuyNow} style={{ fontSize: 13 }}>
          Buy Now
        </button>
        <button
          className="btn btn-ghost btn-full"
          onClick={() => {
            if (wishlisted) { removeFromWishlist(product._id); showToast("Removed from wishlist", "info"); }
            else { addToWishlist(product._id); showToast("Saved to wishlist ♥", "success"); }
          }}
          style={{ fontSize: 12 }}
        >
          {wishlisted ? "♥ Saved to Wishlist" : "♡ Save to Wishlist"}
        </button>
      </div>

      {/* Lead time notice */}
      {product.leadTimeDays > 0 && (
        <div style={{ background: "#FEF9EC", border: "1px solid var(--color-gold)", padding: "12px 16px", borderRadius: "var(--radius-sm)", fontSize: 13, color: "var(--color-ink-muted)", marginBottom: 20 }}>
          ⏱ This item is made to order. Expected dispatch in <strong>{product.leadTimeDays} days</strong>.
        </div>
      )}

      {/* Accordions */}
      <div style={{ borderTop: "1px solid var(--color-border)", marginBottom: 24 }}>
        {accordions.map((a) => (
          <div key={a.id} style={{ borderBottom: "1px solid var(--color-border)" }}>
            <button
              onClick={() => setAccordion(accordion === a.id ? null : a.id)}
              style={{
                width: "100%", padding: "16px 0", display: "flex", justifyContent: "space-between", alignItems: "center",
                background: "none", border: "none", fontFamily: "var(--font-body)", fontSize: 13, fontWeight: 500,
                letterSpacing: 0.5, color: "var(--color-ink)", cursor: "pointer",
              }}
            >
              {a.label}
              <span style={{ fontSize: 18, transition: "transform 0.2s", transform: accordion === a.id ? "rotate(45deg)" : "rotate(0)" }}>+</span>
            </button>
            {accordion === a.id && (
              <div style={{ paddingBottom: 20, animation: "fadeInDown 0.2s ease" }}>
                {a.content}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Social proof */}
      <div style={{ display: "flex", gap: 16, fontSize: 12, color: "var(--color-ink-light)" }}>
        <span>👁 {product.viewCount || 12} views today</span>
        <span>✓ {product.totalSold || 0} sold</span>
      </div>

      {/* Size chart modal */}
      {showSizeChart && (
        <>
          <div className="backdrop" onClick={() => setShowSizeChart(false)} />
          <div style={{ position: "fixed", top: "50%", left: "50%", transform: "translate(-50%,-50%)", zIndex: 260, background: "var(--color-surface)", padding: 40, borderRadius: "var(--radius-sm)", width: "min(640px, 95vw)", maxHeight: "80vh", overflow: "auto", animation: "scaleIn 0.2s ease" }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 20 }}>
              <h2 style={{ fontFamily: "var(--font-display)", fontSize: 22 }}>Size Chart (inches)</h2>
              <button onClick={() => setShowSizeChart(false)} style={{ background: "none", border: "none", fontSize: 24 }}>×</button>
            </div>
            <div className="table-wrap">
              <table>
                <thead><tr><th>Size</th><th>Chest</th><th>Waist</th><th>Hip</th><th>Length</th></tr></thead>
                <tbody>
                  {[["XS","32","26","35","44"],["S","34","28","37","44"],["M","36","30","39","45"],["L","38","32","41","46"],["XL","40","34","43","46"],["XXL","42","36","45","47"],["3XL","44","38","47","48"]].map(([sz,...m]) => (
                    <tr key={sz}><td><strong>{sz}</strong></td>{m.map((v,i)=><td key={i}>{v}"</td>)}</tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p style={{ fontSize: 12, color: "var(--color-ink-light)", marginTop: 16 }}>Need a custom size? Contact us at +91 8368989758 or use the enquiry button.</p>
          </div>
        </>
      )}
    </div>
  );
}
