"use client";
// components/store/FeaturedProducts.tsx
import { ProductCard } from "./ProductCard";
import Link from "next/link";
import type { Product } from "@/types";

interface Props {
  products: Product[];
  title?: string;
  subtitle?: string;
  viewAllHref?: string;
}

export function FeaturedProducts({
  products,
  title = "Featured Pieces",
  subtitle = "Curated for you",
  viewAllHref = "/shop",
}: Props) {
  if (!products.length) return null;
  return (
    <section style={{ padding: "80px 0" }}>
      <div className="container">
        <div style={{ textAlign: "center", marginBottom: 48 }}>
          <p style={{ fontFamily: "var(--font-body)", fontSize: 11, letterSpacing: 3, textTransform: "uppercase", color: "var(--color-gold)", marginBottom: 8 }}>
            {subtitle}
          </p>
          <h2 style={{ fontFamily: "var(--font-display)", fontSize: "clamp(1.8rem, 4vw, 2.8rem)", fontWeight: 300, letterSpacing: 1 }}>
            {title}
          </h2>
        </div>
        <div className="product-grid stagger-children">
          {products.map((product, i) => (
            <ProductCard key={product._id} product={product} priority={i < 4} />
          ))}
        </div>
        <div style={{ textAlign: "center", marginTop: 48 }}>
          <Link href={viewAllHref}>
            <button className="btn btn-outline">View All</button>
          </Link>
        </div>
      </div>
    </section>
  );
}
