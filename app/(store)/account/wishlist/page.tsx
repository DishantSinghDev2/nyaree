"use client";
// app/(store)/account/wishlist/page.tsx
import { useCartStore } from "@/lib/store/cart";
import Link from "next/link";
import { useEffect, useState } from "react";
import { ProductCard } from "@/components/store/ProductCard";

export default function WishlistPage() {
  const { wishlist, removeFromWishlist } = useCartStore();
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!wishlist.length) { setLoading(false); return; }
    Promise.all(
      wishlist.map((id) => fetch(`/api/products/${id}`).then((r) => r.json()).then((d) => d.success ? d.data : null))
    ).then((prods) => setProducts(prods.filter(Boolean))).finally(() => setLoading(false));
  }, [wishlist]);

  return (
    <div className="container" style={{ maxWidth: 1100, padding: "48px 0 80px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 40 }}>
        <Link href="/account" style={{ color: "var(--color-ink-light)", textDecoration: "none", fontSize: 13 }}>← Account</Link>
        <h1 style={{ fontFamily: "var(--font-display)", fontSize: "clamp(1.5rem, 3vw, 2rem)", fontWeight: 300 }}>
          Wishlist {wishlist.length > 0 && `(${wishlist.length})`}
        </h1>
      </div>

      {wishlist.length === 0 ? (
        <div style={{ textAlign: "center", padding: "80px 0" }}>
          <p style={{ fontSize: 48, marginBottom: 16 }}>♡</p>
          <h2 style={{ fontFamily: "var(--font-display)", fontSize: 24, marginBottom: 12 }}>Your wishlist is empty</h2>
          <p style={{ color: "var(--color-ink-light)", marginBottom: 28 }}>Save pieces you love — click the heart on any product</p>
          <Link href="/shop"><button className="btn btn-primary">Explore Collection</button></Link>
        </div>
      ) : loading ? (
        <div className="product-grid">
          {wishlist.map((id) => <div key={id} className="skeleton" style={{ aspectRatio: "3/4", borderRadius: "var(--radius-sm)" }} />)}
        </div>
      ) : (
        <div className="product-grid stagger-children">
          {products.map((product) => <ProductCard key={product._id} product={product} />)}
        </div>
      )}
    </div>
  );
}
