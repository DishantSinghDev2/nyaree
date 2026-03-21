// components/store/RelatedProducts.tsx
import { ProductCard } from "./ProductCard";
import type { Product } from "@/types";

interface Props {
  upsell: Product[];
  crossSell: Product[];
}

export function RelatedProducts({ upsell, crossSell }: Props) {
  const hasUpsell = upsell?.length > 0;
  const hasCross = crossSell?.length > 0;
  if (!hasUpsell && !hasCross) return null;

  return (
    <div style={{ background: "var(--color-ivory-dark)", padding: "64px 0" }}>
      <div className="container">
        {hasUpsell && (
          <section style={{ marginBottom: hasCross ? 64 : 0 }}>
            <div style={{ textAlign: "center", marginBottom: 40 }}>
              <p style={{ fontFamily: "var(--font-body)", fontSize: 11, letterSpacing: 3, textTransform: "uppercase", color: "var(--color-gold)", marginBottom: 8 }}>
                Style It With
              </p>
              <h2 style={{ fontFamily: "var(--font-display)", fontSize: "clamp(1.5rem, 3vw, 2.2rem)", fontWeight: 300 }}>
                Complete the Look
              </h2>
            </div>
            <div className="product-grid stagger-children">
              {upsell.slice(0, 4).map((product) => (
                <ProductCard key={product._id} product={product} />
              ))}
            </div>
          </section>
        )}
        {hasCross && (
          <section>
            <div style={{ textAlign: "center", marginBottom: 40 }}>
              <p style={{ fontFamily: "var(--font-body)", fontSize: 11, letterSpacing: 3, textTransform: "uppercase", color: "var(--color-gold)", marginBottom: 8 }}>
                Customers Also Loved
              </p>
              <h2 style={{ fontFamily: "var(--font-display)", fontSize: "clamp(1.5rem, 3vw, 2.2rem)", fontWeight: 300 }}>
                You May Also Like
              </h2>
            </div>
            <div className="product-grid stagger-children">
              {crossSell.slice(0, 4).map((product) => (
                <ProductCard key={product._id} product={product} />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
