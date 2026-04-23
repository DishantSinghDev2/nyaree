// app/(admin)/dashboard/products/page.tsx
import type { Metadata } from "next";
import Link from "next/link";
import { connectDB } from "@/lib/db/mongoose";
import { ProductModel } from "@/lib/db/models/Product";
import Image from "next/image";

export const metadata: Metadata = { title: "Products | Nyaree Admin" };
export const revalidate = 0;

export default async function ProductsPage({ searchParams }: { searchParams: Promise<{ page?: string; category?: string; status?: string }> }) {
  const sp = await searchParams;
  const page = parseInt(sp.page ?? "1");
  const limit = 25;

  await connectDB();
  const filter: any = {};
  if (sp.category) filter.category = sp.category;
  if (sp.status === "active") filter.isActive = true;
  if (sp.status === "draft") filter.isActive = false;

  const [products, total] = await Promise.all([
    ProductModel.find(filter).select("-description").sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit).lean(),
    ProductModel.countDocuments(filter),
  ]);

  const fmt = (p: number) => `₹${(p / 100).toLocaleString("en-IN")}`;

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 32 }}>
        <div>
          <h1 style={{ fontFamily: "var(--font-display)", fontSize: 26, fontWeight: 400 }}>Products</h1>
          <p style={{ fontSize: 13, color: "var(--color-ink-light)", marginTop: 4 }}>{total} total products</p>
        </div>
        <Link href="/dashboard/products/new">
          <button className="btn btn-primary">+ Add Product</button>
        </Link>
      </div>

      {/* Filters */}
      <div style={{ display: "flex", gap: 8, marginBottom: 20, flexWrap: "wrap" }}>
        {[
          { label: "All", href: "/dashboard/products" },
          { label: "Active", href: "/dashboard/products?status=active" },
          { label: "Drafts", href: "/dashboard/products?status=draft" },
          { label: "Kurtis", href: "/dashboard/products?category=kurti" },
          { label: "Tops", href: "/dashboard/products?category=top" },
        ].map((f) => (
          <Link key={f.href} href={f.href}>
            <button className="btn btn-outline btn-sm" style={{ fontSize: 12 }}>{f.label}</button>
          </Link>
        ))}
      </div>

      <div className="card">
        <div className="table-wrap">
          <table>
            <thead>
              <tr><th>Product</th><th>Category</th><th>Stock</th><th>Price</th><th>Status</th><th>Actions</th></tr>
            </thead>
            <tbody>
              {products.length === 0 ? (
                <tr><td colSpan={6} style={{ textAlign: "center", padding: "48px 0", color: "var(--color-ink-light)" }}>
                  No products yet. <Link href="/dashboard/products/new" style={{ color: "var(--color-gold)" }}>Add your first product →</Link>
                </td></tr>
              ) : products.map((p: any) => {
                const totalStock = p.variants?.reduce((s: number, v: any) => s + v.stock, 0) ?? 0;
                const minPrice = p.variants?.reduce((min: number, v: any) => v.price < min ? v.price : min, p.variants[0]?.price ?? 0) ?? 0;
                const img = p.images?.find((i: any) => i.isHero) ?? p.images?.[0];
                return (
                  <tr key={p._id.toString()}>
                    <td>
                      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                        <div style={{ width: 44, height: 56, position: "relative", background: "var(--color-ivory-dark)", borderRadius: 2, overflow: "hidden", flexShrink: 0 }}>
                          {img && <Image src={img.url} alt={p.name} fill style={{ objectFit: "cover" }}
              sizes="(max-width: 860px) 100vw, 50vw"
            />}
                        </div>
                        <div>
                          <p style={{ fontSize: 13, fontWeight: 500, color: "var(--color-ink)" }}>{p.name}</p>
                          <p style={{ fontSize: 11, color: "var(--color-ink-light)" }}>{p.slug}</p>
                        </div>
                      </div>
                    </td>
                    <td style={{ fontSize: 13, textTransform: "capitalize" }}>{p.category}</td>
                    <td>
                      <span style={{ fontSize: 13, color: totalStock === 0 ? "var(--color-accent-red)" : totalStock <= 5 ? "var(--color-warning)" : "var(--color-success)" }}>
                        {totalStock === 0 ? "Out of stock" : `${totalStock} units`}
                      </span>
                    </td>
                    <td className="price" style={{ fontSize: 13 }}>{minPrice > 0 ? fmt(minPrice) : "—"}</td>
                    <td>
                      <span className={`status-pill ${p.isActive ? "status-delivered" : "status-cancelled"}`}>
                        {p.isActive ? "Active" : "Draft"}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: "flex", gap: 8 }}>
                        <Link href={`/dashboard/products/${p._id.toString()}/edit`} style={{ fontSize: 12, color: "var(--color-gold)", textDecoration: "none" }}>Edit</Link>
                        <Link href={`/product/${p.slug}`} target="_blank" style={{ fontSize: 12, color: "var(--color-ink-light)", textDecoration: "none" }}>View</Link>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {total > limit && (
        <div style={{ display: "flex", justifyContent: "center", gap: 8, marginTop: 24 }}>
          {page > 1 && <Link href={`/dashboard/products?page=${page - 1}`}><button className="btn btn-outline btn-sm">← Prev</button></Link>}
          <span style={{ padding: "8px 16px", fontSize: 13, color: "var(--color-ink-light)" }}>Page {page} of {Math.ceil(total / limit)}</span>
          {page * limit < total && <Link href={`/dashboard/products?page=${page + 1}`}><button className="btn btn-outline btn-sm">Next →</button></Link>}
        </div>
      )}
    </div>
  );
}
