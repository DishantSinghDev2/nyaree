// app/(admin)/dashboard/orders/page.tsx
import type { Metadata } from "next";
import { connectDB } from "@/lib/db/mongoose";
import { OrderModel } from "@/lib/db/models/index";
import Link from "next/link";

export const metadata: Metadata = { title: "Orders | Nyaree Admin" };
export const revalidate = 0;

export default async function OrdersPage({ searchParams }: { searchParams: Promise<{ status?: string; page?: string }> }) {
  const sp = await searchParams;
  const page = parseInt(sp.page ?? "1");
  const limit = 25;
  const STATUSES = ["all","pending","confirmed","processing","shipped","delivered","cancelled","refunded"];

  await connectDB();
  const filter: any = {};
  if (sp.status && sp.status !== "all") filter.status = sp.status;

  const [orders, total] = await Promise.all([
    OrderModel.find(filter).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit)
      .populate("userId", "name email").lean(),
    OrderModel.countDocuments(filter),
  ]);

  const fmt = (p: number) => `₹${(p / 100).toLocaleString("en-IN")}`;

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 32 }}>
        <div>
          <h1 style={{ fontFamily: "var(--font-display)", fontSize: 26, fontWeight: 400 }}>Orders</h1>
          <p style={{ fontSize: 13, color: "var(--color-ink-light)", marginTop: 4 }}>{total} total orders</p>
        </div>
      </div>

      {/* Status tabs */}
      <div style={{ display: "flex", gap: 0, borderBottom: "1px solid var(--color-border)", marginBottom: 24, overflowX: "auto" }}>
        {STATUSES.map((s) => (
          <Link key={s} href={`/dashboard/orders${s !== "all" ? `?status=${s}` : ""}`}>
            <button style={{ padding: "10px 16px", background: "none", border: "none", borderBottom: (sp.status ?? "all") === s ? "2px solid var(--color-gold)" : "2px solid transparent", color: (sp.status ?? "all") === s ? "var(--color-gold)" : "var(--color-ink-light)", fontSize: 12, fontWeight: 500, cursor: "pointer", whiteSpace: "nowrap", textTransform: "capitalize", flexShrink: 0 }}>
              {s}
            </button>
          </Link>
        ))}
      </div>

      <div className="card">
        <div className="table-wrap">
          <table>
            <thead>
              <tr><th>Order</th><th>Customer</th><th>Items</th><th>Total</th><th>Payment</th><th>Status</th><th>Date</th><th></th></tr>
            </thead>
            <tbody>
              {orders.length === 0 ? (
                <tr><td colSpan={8} style={{ textAlign: "center", padding: "48px 0", color: "var(--color-ink-light)" }}>No orders found</td></tr>
              ) : orders.map((o: any) => (
                <tr key={o._id.toString()}>
                  <td style={{ fontWeight: 500, color: "var(--color-gold)", fontSize: 13 }}>{o.orderNumber}</td>
                  <td style={{ fontSize: 13 }}>
                    <p>{o.userId?.name ?? o.guestEmail ?? "Guest"}</p>
                    <p style={{ fontSize: 11, color: "var(--color-ink-light)" }}>{o.userId?.email ?? o.shippingAddress?.phone}</p>
                  </td>
                  <td style={{ fontSize: 13 }}>{o.items?.length ?? 0}</td>
                  <td className="price" style={{ fontSize: 13 }}>{fmt(o.pricing?.total ?? 0)}</td>
                  <td>
                    <span style={{ fontSize: 11, textTransform: "uppercase", padding: "2px 8px", borderRadius: "var(--radius-pill)", background: o.payment?.method === "cod" ? "#F3F4F6" : "#DBEAFE", color: o.payment?.method === "cod" ? "#374151" : "#1E40AF" }}>
                      {o.payment?.method ?? "—"}
                    </span>
                  </td>
                  <td><span className={`status-pill status-${o.status}`}>{o.status}</span></td>
                  <td style={{ fontSize: 12, color: "var(--color-ink-light)" }}>
                    {o.createdAt ? new Date(o.createdAt).toLocaleDateString("en-IN") : ""}
                  </td>
                  <td>
                    <Link href={`/dashboard/orders/${o._id.toString()}`} style={{ fontSize: 12, color: "var(--color-gold)", textDecoration: "none" }}>Manage →</Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {total > limit && (
        <div style={{ display: "flex", justifyContent: "center", gap: 8, marginTop: 24 }}>
          {page > 1 && <Link href={`/dashboard/orders?page=${page - 1}${sp.status ? `&status=${sp.status}` : ""}`}><button className="btn btn-outline btn-sm">← Prev</button></Link>}
          <span style={{ padding: "8px 16px", fontSize: 13, color: "var(--color-ink-light)", display: "flex", alignItems: "center" }}>Page {page} of {Math.ceil(total / limit)}</span>
          {page * limit < total && <Link href={`/dashboard/orders?page=${page + 1}${sp.status ? `&status=${sp.status}` : ""}`}><button className="btn btn-outline btn-sm">Next →</button></Link>}
        </div>
      )}
    </div>
  );
}
