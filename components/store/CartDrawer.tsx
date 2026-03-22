"use client";
// components/store/CartDrawer.tsx
import { useCartStore } from "@/lib/store/cart";
import Link from "next/link";
import Image from "next/image";

interface Props { open: boolean; onClose: () => void; }

export function CartDrawer({ open, onClose }: Props) {
  const { items, removeItem, updateQty, subtotal } = useCartStore();
  const sub = subtotal();
  const FREE_SHIPPING = 49900; // ₹499 in paise
  const shipping = sub >= FREE_SHIPPING ? 0 : 4900;
  const total = sub + shipping;
  const remaining = FREE_SHIPPING - sub;

  const fmt = (p: number) => `₹${(p / 100).toLocaleString("en-IN")}`;

  return (
    <>
      {open && (
        <div
          className="backdrop"
          onClick={onClose}
          style={{ zIndex: 200 }}
        />
      )}
      <aside
        style={{
          position: "fixed", top: 0, right: 0, bottom: 0,
          width: "min(420px, 95vw)",
          background: "var(--color-ivory)",
          zIndex: 201,
          transform: open ? "translateX(0)" : "translateX(100%)",
          transition: "transform 0.3s cubic-bezier(0.4,0,0.2,1)",
          display: "flex", flexDirection: "column",
          boxShadow: "var(--shadow-xl)",
        }}
        aria-label="Shopping cart"
      >
        {/* Header */}
        <div style={{
          padding: "20px 24px", borderBottom: "1px solid var(--color-border)",
          display: "flex", justifyContent: "space-between", alignItems: "center",
          background: "var(--color-surface)",
        }}>
          <div>
            <h2 style={{ fontSize: 18, letterSpacing: 2 }}>Your Bag</h2>
            <p style={{ fontSize: 12, color: "var(--color-ink-light)", marginTop: 2 }}>
              {items.length} {items.length === 1 ? "item" : "items"}
            </p>
          </div>
          <button
            onClick={onClose}
            style={{ background: "none", border: "none", fontSize: 24, color: "var(--color-ink)", padding: 4 }}
          >×</button>
        </div>

        {/* Free shipping progress */}
        {items.length > 0 && remaining > 0 && (
          <div style={{ padding: "12px 24px", background: "#FEF9EC", borderBottom: "1px solid var(--color-border-light)" }}>
            <p style={{ fontSize: 12, color: "var(--color-ink-muted)", marginBottom: 6 }}>
              Add <strong style={{ color: "var(--color-gold)" }}>{fmt(remaining)}</strong> more for FREE shipping!
            </p>
            <div style={{ height: 4, background: "var(--color-border)", borderRadius: 2 }}>
              <div style={{
                height: "100%", borderRadius: 2,
                background: "var(--color-gold)",
                width: `${Math.min(100, (sub / FREE_SHIPPING) * 100)}%`,
                transition: "width 0.4s ease",
              }} />
            </div>
          </div>
        )}

        {/* Items */}
        <div style={{ flex: 1, overflowY: "auto", padding: "16px 24px" }}>
          {items.length === 0 ? (
            <div style={{ textAlign: "center", padding: "60px 0" }}>
              <p style={{ fontSize: 40, marginBottom: 16 }}>🛍️</p>
              <h3 style={{ fontFamily: "var(--font-display)", fontSize: 22, marginBottom: 8 }}>
                Your bag is empty
              </h3>
              <p style={{ fontSize: 14, color: "var(--color-ink-light)", marginBottom: 24 }}>
                Discover our handcrafted collection
              </p>
              <button onClick={onClose} className="btn btn-dark">
                Explore Shop
              </button>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {items.map((item) => (
                <div
                  key={`${item.productId}-${item.variantId}`}
                  style={{
                    display: "flex", gap: 12,
                    padding: "12px 0", borderBottom: "1px solid var(--color-border-light)",
                  }}
                >
                  {/* Image */}
                  <Link href={`/product/${item.slug}`} onClick={onClose}>
                    <div style={{ width: 72, height: 90, position: "relative", flexShrink: 0, background: "var(--color-ivory-dark)", borderRadius: "var(--radius-sm)", overflow: "hidden" }}>
                      {item.image && (
                        <Image src={item.image} alt={item.name} fill style={{ objectFit: "cover" }}
              sizes="64px"
            />
                      )}
                    </div>
                  </Link>

                  {/* Details */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <Link href={`/product/${item.slug}`} onClick={onClose}>
                      <p style={{ fontFamily: "var(--font-display)", fontSize: 15, color: "var(--color-ink)", marginBottom: 4, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                        {item.name}
                      </p>
                    </Link>
                    <p style={{ fontSize: 12, color: "var(--color-ink-light)", marginBottom: 8 }}>
                      {item.size} · {item.color}
                    </p>
                    {item.customInstructions && (
                      <p style={{ fontSize: 11, color: "var(--color-gold)", marginBottom: 8, fontStyle: "italic" }}>
                        Custom: {item.customInstructions.slice(0, 40)}...
                      </p>
                    )}

                    {/* Qty + price row */}
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 0, border: "1px solid var(--color-border)", borderRadius: "var(--radius-sm)" }}>
                        <button
                          onClick={() => updateQty(item.productId, item.variantId, item.quantity - 1)}
                          style={{ width: 28, height: 28, background: "none", border: "none", fontSize: 16, display: "flex", alignItems: "center", justifyContent: "center" }}
                        >−</button>
                        <span style={{ width: 28, textAlign: "center", fontSize: 13 }}>{item.quantity}</span>
                        <button
                          onClick={() => updateQty(item.productId, item.variantId, item.quantity + 1)}
                          style={{ width: 28, height: 28, background: "none", border: "none", fontSize: 16, display: "flex", alignItems: "center", justifyContent: "center" }}
                        >+</button>
                      </div>
                      <div style={{ textAlign: "right" }}>
                        <p className="price" style={{ fontSize: 14 }}>
                          {fmt(item.price * item.quantity)}
                        </p>
                        {item.compareAtPrice > item.price && (
                          <p className="price-compare" style={{ fontSize: 11 }}>
                            {fmt(item.compareAtPrice * item.quantity)}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Remove */}
                  <button
                    onClick={() => removeItem(item.productId, item.variantId)}
                    style={{ background: "none", border: "none", color: "var(--color-ink-light)", alignSelf: "flex-start", padding: 2, fontSize: 14 }}
                  >✕</button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div style={{ padding: "20px 24px", borderTop: "1px solid var(--color-border)", background: "var(--color-surface)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
              <span style={{ fontSize: 13, color: "var(--color-ink-light)" }}>Subtotal</span>
              <span className="price" style={{ fontSize: 13 }}>{fmt(sub)}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 16 }}>
              <span style={{ fontSize: 13, color: "var(--color-ink-light)" }}>Shipping</span>
              <span style={{ fontSize: 13, color: shipping === 0 ? "var(--color-success)" : "var(--color-ink)" }}>
                {shipping === 0 ? "FREE" : fmt(shipping)}
              </span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4, paddingTop: 12, borderTop: "1px solid var(--color-border)" }}>
              <span style={{ fontFamily: "var(--font-display)", fontSize: 18 }}>Total</span>
              <span className="price" style={{ fontFamily: "var(--font-display)", fontSize: 18 }}>{fmt(total)}</span>
            </div>
            <p style={{ fontSize: 11, color: "var(--color-ink-light)", marginBottom: 16 }}>
              Taxes included. Shipping calculated at checkout.
            </p>
            <Link href="/checkout" onClick={onClose}>
              <button className="btn btn-primary btn-full" style={{ marginBottom: 8 }}>
                Checkout · {fmt(total)}
              </button>
            </Link>
            <Link href="/cart" onClick={onClose}>
              <button className="btn btn-ghost btn-full" style={{ fontSize: 12 }}>
                View Cart
              </button>
            </Link>
          </div>
        )}
      </aside>
    </>
  );
}
