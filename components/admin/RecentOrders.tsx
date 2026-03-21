"use client";
// components/admin/RecentOrders.tsx
import Link from "next/link";

interface Order { _id: string; orderNumber: string; customerName: string; total: number; status: string; paymentMethod: string; createdAt: string; itemCount: number; }

export function RecentOrders({ orders }: { orders: Order[] }) {
  const fmt = (p: number) => `₹${(p / 100).toLocaleString("en-IN")}`;
  return (
    <div className="card" style={{ padding: 24 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <h2 style={{ fontFamily: "var(--font-display)", fontSize: 20, fontWeight: 400 }}>Recent Orders</h2>
        <Link href="/dashboard/orders" style={{ fontSize: 12, color: "var(--color-gold)", textDecoration: "none" }}>View All →</Link>
      </div>
      {orders.length === 0 ? (
        <p style={{ color: "var(--color-ink-light)", fontSize: 14, textAlign: "center", padding: "32px 0" }}>No orders yet. Share your store! 🛍️</p>
      ) : (
        <div className="table-wrap">
          <table>
            <thead>
              <tr><th>Order</th><th>Customer</th><th>Amount</th><th>Status</th><th>Date</th></tr>
            </thead>
            <tbody>
              {orders.map((o) => (
                <tr key={o._id}>
                  <td>
                    <Link href={`/dashboard/orders/${o._id}`} style={{ color: "var(--color-gold)", fontWeight: 500, fontSize: 13 }}>{o.orderNumber}</Link>
                    <br /><span style={{ fontSize: 11, color: "var(--color-ink-light)" }}>{o.itemCount} item{o.itemCount !== 1 ? "s" : ""}</span>
                  </td>
                  <td style={{ fontSize: 13 }}>{o.customerName}</td>
                  <td className="price" style={{ fontSize: 13 }}>{fmt(o.total)}</td>
                  <td><span className={`status-pill status-${o.status}`}>{o.status}</span></td>
                  <td style={{ fontSize: 12, color: "var(--color-ink-light)" }}>{new Date(o.createdAt).toLocaleDateString("en-IN")}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
