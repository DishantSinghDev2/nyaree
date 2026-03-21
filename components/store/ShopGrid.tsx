"use client";
// components/store/ShopGrid.tsx
import { useState, useTransition } from "react";
import { ProductCard } from "./ProductCard";
import { useRouter, useSearchParams, usePathname } from "next/navigation";

const SIZES = ["XS", "S", "M", "L", "XL", "XXL", "3XL"];
const FABRICS = ["Cotton", "Rayon", "Georgette", "Silk", "Chiffon", "Linen", "Crepe"];

interface Props {
  initialData: { items: any[]; total: number; page: number; hasMore: boolean };
  category: string;
  searchParams: Record<string, string | undefined>;
}

export function ShopGrid({ initialData, category, searchParams }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();
  const [filterOpen, setFilterOpen] = useState(false);

  const sort = searchParams.sort ?? "featured";
  const selectedSizes = searchParams.size?.split(",").filter(Boolean) ?? [];
  const maxPrice = parseInt(searchParams.maxPrice ?? "5000");

  const updateParam = (key: string, value: string | null) => {
    const params = new URLSearchParams(Object.entries(searchParams).filter(([, v]) => v != null) as [string, string][]);
    if (value === null) params.delete(key);
    else params.set(key, value);
    params.delete("page");
    startTransition(() => router.push(`${pathname}?${params.toString()}`));
  };

  const toggleSize = (size: string) => {
    const next = selectedSizes.includes(size) ? selectedSizes.filter((s) => s !== size) : [...selectedSizes, size];
    updateParam("size", next.length ? next.join(",") : null);
  };

  return (
    <div style={{ padding: "32px 0 80px" }}>
      <div className="container">
        {/* Toolbar */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24, flexWrap: "wrap", gap: 12 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <button className="btn btn-outline btn-sm" onClick={() => setFilterOpen(!filterOpen)} style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><line x1="4" y1="6" x2="20" y2="6"/><line x1="8" y1="12" x2="16" y2="12"/><line x1="12" y1="18" x2="12" y2="18"/></svg>
              Filter
            </button>
            <p style={{ fontSize: 13, color: "var(--color-ink-light)" }}>
              {initialData.total} product{initialData.total !== 1 ? "s" : ""}
            </p>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <label style={{ fontSize: 12, color: "var(--color-ink-light)" }}>Sort:</label>
            <select
              value={sort}
              onChange={(e) => updateParam("sort", e.target.value)}
              style={{ padding: "6px 10px", border: "1px solid var(--color-border)", borderRadius: "var(--radius-sm)", fontSize: 13, background: "var(--color-surface)", color: "var(--color-ink)" }}
            >
              <option value="featured">Featured</option>
              <option value="newest">Newest First</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              <option value="rating">Best Rated</option>
              <option value="bestselling">Best Selling</option>
            </select>
          </div>
        </div>

        {/* Filter bar (collapsible) */}
        {filterOpen && (
          <div style={{ background: "var(--color-surface)", border: "1px solid var(--color-border)", borderRadius: "var(--radius-sm)", padding: 20, marginBottom: 24, display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 24, animation: "fadeInDown 0.2s ease" }}>
            {/* Size filter */}
            <div>
              <p className="label" style={{ marginBottom: 10 }}>Size</p>
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                {SIZES.map((s) => (
                  <button key={s} onClick={() => toggleSize(s)} style={{ minWidth: 36, height: 36, padding: "0 10px", border: `1px solid ${selectedSizes.includes(s) ? "var(--color-ink)" : "var(--color-border)"}`, background: selectedSizes.includes(s) ? "var(--color-ink)" : "transparent", color: selectedSizes.includes(s) ? "#fff" : "var(--color-ink)", borderRadius: "var(--radius-sm)", fontSize: 12, cursor: "pointer" }}>{s}</button>
                ))}
              </div>
            </div>

            {/* Fabric filter */}
            <div>
              <p className="label" style={{ marginBottom: 10 }}>Fabric</p>
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {FABRICS.map((f) => (
                  <label key={f} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, cursor: "pointer" }}>
                    <input type="checkbox" checked={searchParams.fabric?.split(",").includes(f) ?? false}
                      onChange={(e) => {
                        const prev = searchParams.fabric?.split(",").filter(Boolean) ?? [];
                        const next = e.target.checked ? [...prev, f] : prev.filter((x) => x !== f);
                        updateParam("fabric", next.length ? next.join(",") : null);
                      }}
                    /> {f}
                  </label>
                ))}
              </div>
            </div>

            {/* Price filter */}
            <div>
              <p className="label" style={{ marginBottom: 10 }}>Max Price: ₹{maxPrice}</p>
              <input type="range" min={100} max={5000} step={100} value={maxPrice}
                onChange={(e) => updateParam("maxPrice", e.target.value)}
                style={{ width: "100%", accentColor: "var(--color-gold)" }}
              />
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "var(--color-ink-light)" }}>
                <span>₹100</span><span>₹5000</span>
              </div>
              {(selectedSizes.length > 0 || searchParams.fabric || searchParams.maxPrice) && (
                <button onClick={() => { updateParam("size", null); updateParam("fabric", null); updateParam("maxPrice", null); }} style={{ marginTop: 12, fontSize: 12, color: "var(--color-gold)", background: "none", border: "none", textDecoration: "underline", cursor: "pointer" }}>
                  Clear all filters
                </button>
              )}
            </div>
          </div>
        )}

        {/* Products */}
        {isPending ? (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 20 }}>
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} style={{ aspectRatio: "3/4", borderRadius: "var(--radius-sm)" }} className="skeleton" />
            ))}
          </div>
        ) : initialData.items.length === 0 ? (
          <div style={{ textAlign: "center", padding: "80px 0" }}>
            <p style={{ fontSize: 40, marginBottom: 16 }}>🔍</p>
            <h2 style={{ fontFamily: "var(--font-display)", fontSize: 24, marginBottom: 8 }}>No products found</h2>
            <p style={{ color: "var(--color-ink-light)", marginBottom: 24 }}>Try adjusting your filters</p>
            <button className="btn btn-outline" onClick={() => router.push(pathname)}>Clear Filters</button>
          </div>
        ) : (
          <>
            <div className="product-grid stagger-children">
              {initialData.items.map((product, i) => (
                <ProductCard key={product._id} product={product} priority={i < 4} />
              ))}
            </div>

            {/* Pagination */}
            {(initialData.hasMore || initialData.page > 1) && (
              <div style={{ display: "flex", justifyContent: "center", gap: 8, marginTop: 48 }}>
                {initialData.page > 1 && (
                  <button className="btn btn-outline btn-sm" onClick={() => updateParam("page", String(initialData.page - 1))}>← Previous</button>
                )}
                <span style={{ padding: "8px 16px", fontSize: 13, color: "var(--color-ink-light)", display: "flex", alignItems: "center" }}>
                  Page {initialData.page}
                </span>
                {initialData.hasMore && (
                  <button className="btn btn-outline btn-sm" onClick={() => updateParam("page", String(initialData.page + 1))}>Next →</button>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
