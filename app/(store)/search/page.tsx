// app/(store)/search/page.tsx
import type { Metadata } from "next";
import { ProductCard } from "@/components/store/ProductCard";
import Link from "next/link";

export const revalidate = 60;

export async function generateMetadata({ searchParams }: { searchParams: Promise<{ q?: string }> }): Promise<Metadata> {
  const sp = await searchParams;
  return {
    title: sp.q ? `"${sp.q}" — Search Results | Nyaree` : "Search | Nyaree",
    robots: { index: false },
  };
}

async function searchProducts(q: string, page = 1) {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  try {
    const res = await fetch(`${baseUrl}/api/search?q=${encodeURIComponent(q)}&page=${page}&limit=24`, { next: { revalidate: 60 } });
    const data = await res.json();
    return data.success ? data.data : { items: [], total: 0 };
  } catch { return { items: [], total: 0 }; }
}

export default async function SearchPage({ searchParams }: { searchParams: Promise<{ q?: string; page?: string }> }) {
  const sp = await searchParams;
  const q = sp.q?.trim() ?? "";
  const page = parseInt(sp.page ?? "1");
  const { items, total } = q ? await searchProducts(q, page) : { items: [], total: 0 };

  return (
    <div className="container" style={{ padding: "48px 0 80px" }}>
      <div style={{ marginBottom: 40 }}>
        <p style={{ fontFamily: "var(--font-body)", fontSize: 11, letterSpacing: 3, textTransform: "uppercase", color: "var(--color-gold)", marginBottom: 8 }}>Search Results</p>
        <h1 style={{ fontFamily: "var(--font-display)", fontSize: "clamp(1.8rem, 4vw, 2.8rem)", fontWeight: 300 }}>
          {q ? `"${q}"` : "Search Our Collection"}
        </h1>
        {q && <p style={{ color: "var(--color-ink-light)", marginTop: 8, fontSize: 14 }}>{total} result{total !== 1 ? "s" : ""} found</p>}
      </div>

      {!q && (
        <div style={{ textAlign: "center", padding: "48px 0" }}>
          <p style={{ fontSize: 48, marginBottom: 16 }}>🔍</p>
          <p style={{ fontSize: 16, color: "var(--color-ink-light)", marginBottom: 32 }}>Search for kurtis, tops, fabrics, patterns...</p>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", justifyContent: "center" }}>
            {["Cotton Kurti", "Floral Top", "Embroidered Kurti", "Festive Wear", "Under ₹499", "Rayon"].map((tag) => (
              <Link key={tag} href={`/search?q=${encodeURIComponent(tag)}`}>
                <span style={{ padding: "8px 18px", border: "1px solid var(--color-border)", borderRadius: "var(--radius-pill)", fontSize: 13, cursor: "pointer" }}>{tag}</span>
              </Link>
            ))}
          </div>
        </div>
      )}

      {q && items.length === 0 && (
        <div style={{ textAlign: "center", padding: "60px 0" }}>
          <p style={{ fontSize: 40, marginBottom: 16 }}>😔</p>
          <h2 style={{ fontFamily: "var(--font-display)", fontSize: 24, marginBottom: 12 }}>No results for "{q}"</h2>
          <p style={{ color: "var(--color-ink-light)", marginBottom: 28 }}>Try different keywords or browse our categories</p>
          <Link href="/shop"><button className="btn btn-primary">Browse All Products</button></Link>
        </div>
      )}

      {items.length > 0 && (
        <>
          <div className="product-grid stagger-children">
            {items.map((product: any, i: number) => <ProductCard key={product._id} product={product} priority={i < 4} />)}
          </div>
          {total > 24 && (
            <div style={{ display: "flex", justifyContent: "center", gap: 8, marginTop: 48 }}>
              {page > 1 && <Link href={`/search?q=${encodeURIComponent(q)}&page=${page - 1}`}><button className="btn btn-outline btn-sm">← Prev</button></Link>}
              <span style={{ padding: "8px 16px", fontSize: 13, color: "var(--color-ink-light)", display: "flex", alignItems: "center" }}>Page {page}</span>
              {page * 24 < total && <Link href={`/search?q=${encodeURIComponent(q)}&page=${page + 1}`}><button className="btn btn-outline btn-sm">Next →</button></Link>}
            </div>
          )}
        </>
      )}
    </div>
  );
}
