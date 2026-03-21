"use client";
// components/admin/LowStockAlert.tsx
import Link from "next/link";
import Image from "next/image";

export function LowStockAlert({ products }: { products: any[] }) {
  return (
    <div className="card" style={{ padding: 24 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <h2 style={{ fontFamily: "var(--font-display)", fontSize: 20, fontWeight: 400 }}>Low Stock ⚠️</h2>
        <Link href="/dashboard/products?filter=low-stock" style={{ fontSize: 12, color: "var(--color-gold)", textDecoration: "none" }}>View All →</Link>
      </div>
      {products.length === 0 ? (
        <p style={{ color: "var(--color-success)", fontSize: 14, textAlign: "center", padding: "24px 0" }}>✓ All products are well stocked!</p>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {products.map((p) => (
            <Link key={p._id} href={`/dashboard/products/${p._id}/edit`} style={{ display: "flex", alignItems: "center", gap: 12, textDecoration: "none", padding: 8, borderRadius: "var(--radius-sm)", transition: "background 0.15s" }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = "var(--color-ivory)"; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = ""; }}
            >
              <div style={{ width: 40, height: 50, borderRadius: 2, overflow: "hidden", background: "var(--color-ivory-dark)", position: "relative", flexShrink: 0 }}>
                {p.image && <Image src={p.image} alt={p.name} fill style={{ objectFit: "cover" }} />}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontSize: 13, color: "var(--color-ink)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{p.name}</p>
                <p style={{ fontSize: 11, color: p.stock === 0 ? "var(--color-accent-red)" : "var(--color-warning)" }}>
                  {p.stock === 0 ? "Out of stock" : `${p.stock} left`}
                </p>
              </div>
              <span style={{ fontSize: 11, color: "var(--color-gold)", flexShrink: 0 }}>Update →</span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
