// components/store/BestSellers.tsx
import { ProductCard } from "./ProductCard";
import Link from "next/link";
import type { Product } from "@/types";

export function BestSellers({ products }: { products: Product[] }) {
  if (!products.length) return null;
  return (
    <section style={{ padding: "80px 0", background: "var(--color-ivory-dark)" }}>
      <div className="container">
        <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginBottom: 48 }}>
          <div>
            <p style={{ fontFamily: "var(--font-body)", fontSize: 11, letterSpacing: 3, textTransform: "uppercase", color: "var(--color-gold)", marginBottom: 8 }}>
              Customer Favourites
            </p>
            <h2 style={{ fontFamily: "var(--font-display)", fontSize: "clamp(1.8rem, 4vw, 2.8rem)", fontWeight: 300 }}>
              Best Sellers
            </h2>
          </div>
          <Link href="/collections/best-sellers">
            <span style={{ fontFamily: "var(--font-body)", fontSize: 12, letterSpacing: 1, color: "var(--color-ink-light)", borderBottom: "1px solid var(--color-border)", paddingBottom: 2 }}>
              View All →
            </span>
          </Link>
        </div>
        <div className="product-grid stagger-children">
          {products.slice(0, 4).map((product) => (
            <ProductCard key={product._id} product={product} />
          ))}
        </div>
      </div>
    </section>
  );
}
