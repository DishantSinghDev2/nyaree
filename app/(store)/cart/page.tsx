"use client";
// app/(store)/cart/page.tsx
import { useCartStore } from "@/lib/store/cart";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";

export default function CartPage() {
  const { items, removeItem, updateQty, subtotal } = useCartStore();
  const router = useRouter();
  const sub = subtotal();
  const FREE_SHIPPING = 49900;
  const shipping = sub >= FREE_SHIPPING ? 0 : 4900;
  const total = sub + shipping;
  const remaining = FREE_SHIPPING - sub;
  const fmt = (p: number) => `₹${(p / 100).toLocaleString("en-IN")}`;

  return (
    <div className="container" style={{ padding: "48px 0 80px" }}>
      <h1 style={{ fontFamily: "var(--font-display)", fontSize: "clamp(1.8rem, 4vw, 2.8rem)", fontWeight: 300, marginBottom: 40 }}>
        Your Bag {items.length > 0 && <span style={{ fontSize: "0.6em", color: "var(--color-ink-light)", fontFamily: "var(--font-body)" }}>({items.length} item{items.length !== 1 ? "s" : ""})</span>}
      </h1>

      {items.length === 0 ? (
        <div style={{ textAlign: "center", padding: "80px 0" }}>
          <p style={{ fontSize: 48, marginBottom: 20 }}>🛍️</p>
          <h2 style={{ fontFamily: "var(--font-display)", fontSize: 28, fontWeight: 300, marginBottom: 12 }}>Your bag is empty</h2>
          <p style={{ color: "var(--color-ink-light)", marginBottom: 32 }}>Discover our handcrafted collection of kurtis and tops</p>
          <Link href="/shop"><button className="btn btn-primary btn-lg">Start Shopping</button></Link>
        </div>
      ) : (
        <div className="cart-layout">
          {/* Items */}
          <div>
            {/* Free shipping bar */}
            {remaining > 0 && (
              <div style={{ background: "#FEF9EC", border: "1px solid var(--color-gold)", borderRadius: "var(--radius-sm)", padding: "14px 18px", marginBottom: 24 }}>
                <p style={{ fontSize: 13, marginBottom: 8 }}>
                  Add <strong style={{ color: "var(--color-gold)" }}>{fmt(remaining)}</strong> more for <strong>FREE shipping!</strong>
                </p>
                <div style={{ height: 6, background: "var(--color-border)", borderRadius: 3 }}>
                  <div style={{ height: "100%", borderRadius: 3, background: "var(--color-gold)", width: `${Math.min(100, (sub / FREE_SHIPPING) * 100)}%`, transition: "width 0.4s ease" }} />
                </div>
              </div>
            )}

            <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
              {items.map((item) => (
                <div key={`${item.productId}-${item.variantId}`} style={{ display: "flex", gap: 20, padding: "24px 0", borderBottom: "1px solid var(--color-border-light)", alignItems: "flex-start" }}>
                  <Link href={`/product/${item.slug}`}>
                    <div style={{ width: 96, height: 120, position: "relative", background: "var(--color-ivory-dark)", borderRadius: "var(--radius-sm)", overflow: "hidden", flexShrink: 0 }}>
                      {item.image && <Image src={item.image} alt={item.name} fill style={{ objectFit: "cover" }}
              sizes="64px"
            />}
                    </div>
                  </Link>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <Link href={`/product/${item.slug}`} style={{ textDecoration: "none" }}>
                      <h3 style={{ fontFamily: "var(--font-display)", fontSize: 18, fontWeight: 400, color: "var(--color-ink)", marginBottom: 6 }}>{item.name}</h3>
                    </Link>
                    <p style={{ fontSize: 13, color: "var(--color-ink-light)", marginBottom: 4 }}>Size: {item.size} · Color: {item.color}</p>
                    {item.customInstructions && (
                      <p style={{ fontSize: 12, color: "var(--color-gold)", marginBottom: 8, fontStyle: "italic" }}>Custom: {item.customInstructions}</p>
                    )}
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 16, flexWrap: "wrap", gap: 12 }}>
                      <div style={{ display: "flex", alignItems: "center", border: "1px solid var(--color-border)", borderRadius: "var(--radius-sm)" }}>
                        <button onClick={() => updateQty(item.productId, item.variantId, item.quantity - 1)} style={{ width: 36, height: 36, background: "none", border: "none", fontSize: 18, display: "flex", alignItems: "center", justifyContent: "center" }}>−</button>
                        <span style={{ width: 36, textAlign: "center", fontSize: 14, fontWeight: 500 }}>{item.quantity}</span>
                        <button onClick={() => updateQty(item.productId, item.variantId, item.quantity + 1)} style={{ width: 36, height: 36, background: "none", border: "none", fontSize: 18, display: "flex", alignItems: "center", justifyContent: "center" }}>+</button>
                      </div>
                      <div style={{ textAlign: "right" }}>
                        <p className="price" style={{ fontSize: 18 }}>{fmt(item.price * item.quantity)}</p>
                        {item.compareAtPrice > item.price && (
                          <p className="price-compare" style={{ fontSize: 13 }}>{fmt(item.compareAtPrice * item.quantity)}</p>
                        )}
                      </div>
                    </div>
                  </div>
                  <button onClick={() => removeItem(item.productId, item.variantId)} style={{ background: "none", border: "none", color: "var(--color-ink-light)", fontSize: 18, padding: 4, flexShrink: 0 }} title="Remove">✕</button>
                </div>
              ))}
            </div>
          </div>

          {/* Summary */}
          <div style={{ position: "sticky", top: 88 }}>
            <div className="card" style={{ padding: 28 }}>
              <h2 style={{ fontFamily: "var(--font-display)", fontSize: 22, fontWeight: 400, marginBottom: 24 }}>Order Summary</h2>
              <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 20 }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 14 }}>
                  <span style={{ color: "var(--color-ink-light)" }}>Subtotal ({items.length} items)</span>
                  <span>{fmt(sub)}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 14 }}>
                  <span style={{ color: "var(--color-ink-light)" }}>Shipping</span>
                  <span style={{ color: shipping === 0 ? "var(--color-success)" : "" }}>{shipping === 0 ? "FREE" : fmt(shipping)}</span>
                </div>
                <div style={{ borderTop: "1px solid var(--color-border)", paddingTop: 12, display: "flex", justifyContent: "space-between" }}>
                  <span style={{ fontFamily: "var(--font-display)", fontSize: 20 }}>Estimated Total</span>
                  <span className="price" style={{ fontFamily: "var(--font-display)", fontSize: 20 }}>{fmt(total)}</span>
                </div>
              </div>
              <p style={{ fontSize: 12, color: "var(--color-ink-light)", marginBottom: 20 }}>Taxes included. Final total calculated at checkout.</p>
              <button className="btn btn-primary btn-full btn-lg" onClick={() => router.push("/checkout")} style={{ marginBottom: 10 }}>
                Proceed to Checkout
              </button>
              <Link href="/shop">
                <button className="btn btn-ghost btn-full" style={{ fontSize: 12 }}>Continue Shopping</button>
              </Link>
              <div style={{ marginTop: 20, display: "flex", gap: 6, flexWrap: "wrap", justifyContent: "center" }}>
                {["UPI", "Visa", "Mastercard", "COD"].map((m) => (
                  <span key={m} style={{ fontSize: 10, background: "var(--color-ivory-dark)", border: "1px solid var(--color-border)", padding: "2px 8px", borderRadius: 2 }}>{m}</span>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
