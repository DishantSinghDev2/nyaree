// app/(store)/account/page.tsx
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { connectDB } from "@/lib/db/mongoose";
import { OrderModel } from "@/lib/db/models/index";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "My Account | Nyaree" };

export default async function AccountPage() {
  const session = await auth();
  if (!session?.user) redirect("/auth/login?next=/account");

  await connectDB();
  const recentOrders = await OrderModel.find(
    { userId: session.user.id },
    "orderNumber status pricing.total createdAt items"
  ).sort({ createdAt: -1 }).limit(5).lean();

  const fmt = (p: number) => `₹${(p / 100).toLocaleString("en-IN")}`;

  return (
    <div className="container" style={{ padding: "48px 0 80px", maxWidth: 900 }}>
      {/* Header */}
      <div style={{ marginBottom: 40 }}>
        <p style={{ fontFamily: "var(--font-body)", fontSize: 11, letterSpacing: 3, textTransform: "uppercase", color: "var(--color-gold)", marginBottom: 8 }}>
          Welcome back
        </p>
        <h1 style={{ fontFamily: "var(--font-display)", fontSize: "clamp(1.8rem, 4vw, 2.8rem)", fontWeight: 300 }}>
          {session.user.name ?? "My Account"}
        </h1>
        <p style={{ color: "var(--color-ink-light)", fontSize: 14, marginTop: 4 }}>{session.user.email}</p>
      </div>

      {/* Quick links */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16, marginBottom: 48 }}>
        {[
          { href: "/account/orders", icon: "📦", label: "My Orders", desc: "Track & manage orders" },
          { href: "/account/wishlist", icon: "♥", label: "Wishlist", desc: "Saved items" },
          { href: "/track-order", icon: "🚚", label: "Track Order", desc: "Enter tracking number" },
        ].map((item) => (
          <Link key={item.href} href={item.href} style={{ textDecoration: "none" }}>
            <div className="card" style={{ padding: "24px 20px", textAlign: "center", transition: "all 0.2s" }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.boxShadow = "var(--shadow-md)"; (e.currentTarget as HTMLElement).style.transform = "translateY(-2px)"; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.boxShadow = ""; (e.currentTarget as HTMLElement).style.transform = ""; }}
            >
              <p style={{ fontSize: 28, marginBottom: 8 }}>{item.icon}</p>
              <p style={{ fontFamily: "var(--font-display)", fontSize: 16, marginBottom: 4 }}>{item.label}</p>
              <p style={{ fontSize: 12, color: "var(--color-ink-light)" }}>{item.desc}</p>
            </div>
          </Link>
        ))}
      </div>

      {/* Recent Orders */}
      <div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <h2 style={{ fontFamily: "var(--font-display)", fontSize: 22, fontWeight: 400 }}>Recent Orders</h2>
          <Link href="/account/orders" style={{ fontSize: 12, color: "var(--color-gold)", textDecoration: "none" }}>View All →</Link>
        </div>
        {recentOrders.length === 0 ? (
          <div className="card" style={{ padding: 48, textAlign: "center" }}>
            <p style={{ fontSize: 32, marginBottom: 12 }}>🛍️</p>
            <p style={{ fontFamily: "var(--font-display)", fontSize: 20, marginBottom: 8 }}>No orders yet</p>
            <p style={{ fontSize: 14, color: "var(--color-ink-light)", marginBottom: 24 }}>Start exploring our collection!</p>
            <Link href="/shop"><button className="btn btn-primary">Shop Now</button></Link>
          </div>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr><th>Order</th><th>Items</th><th>Amount</th><th>Status</th><th>Date</th><th></th></tr>
              </thead>
              <tbody>
                {recentOrders.map((o: any) => (
                  <tr key={o._id.toString()}>
                    <td style={{ fontWeight: 500, color: "var(--color-gold)" }}>{o.orderNumber}</td>
                    <td style={{ fontSize: 13 }}>{o.items?.length ?? 0} item{o.items?.length !== 1 ? "s" : ""}</td>
                    <td className="price" style={{ fontSize: 13 }}>{fmt(o.pricing?.total ?? 0)}</td>
                    <td><span className={`status-pill status-${o.status}`}>{o.status}</span></td>
                    <td style={{ fontSize: 12, color: "var(--color-ink-light)" }}>
                      {o.createdAt ? new Date(o.createdAt).toLocaleDateString("en-IN") : ""}
                    </td>
                    <td>
                      <Link href={`/account/orders/${o._id.toString()}`} style={{ fontSize: 12, color: "var(--color-gold)", textDecoration: "none" }}>
                        View →
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
