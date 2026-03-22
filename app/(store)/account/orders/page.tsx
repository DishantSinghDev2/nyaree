// app/(store)/account/orders/page.tsx
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { connectDB } from "@/lib/db/mongoose";
import { OrderModel } from "@/lib/db/models/index";
import Link from "next/link";
import type { Metadata } from "next";
// Deep-serialize MongoDB docs — strips ObjectIds/Dates from all nested objects
// Prevents "Objects with toJSON methods are not supported" RSC serialization error
function deepSerialize(obj: any): any {
  if (obj === null || obj === undefined) return obj;
  if (Array.isArray(obj)) return obj.map(deepSerialize);
  if (obj instanceof Date) return obj.toISOString();
  if (obj && typeof obj === "object" && obj.constructor?.name === "ObjectId") return obj.toString();
  if (obj && typeof obj === "object" && obj.buffer instanceof ArrayBuffer) return undefined;
  if (typeof obj === "object") {
    const out: any = {};
    for (const k of Object.keys(obj)) {
      if (k === "__v") continue;
      const v = deepSerialize(obj[k]);
      if (v !== undefined) out[k] = v;
    }
    return out;
  }
  return obj;
}



export const metadata: Metadata = { title: "My Orders | Nyaree" };

export default async function OrdersPage() {
  const session = await auth();
  if (!session?.user) redirect("/auth/login?next=/account/orders");

  await connectDB();
  const orders = await OrderModel.find({ userId: session.user.id })
    .sort({ createdAt: -1 }).limit(50)
    .select("orderNumber status pricing.total createdAt items payment.method tracking")
    .lean();

  const fmt = (p: number) => `₹${(p / 100).toLocaleString("en-IN")}`;

  return (
    <div className="container" style={{ maxWidth: 900, padding: "48px 0 80px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 40 }}>
        <Link href="/account" style={{ color: "var(--color-ink-light)", textDecoration: "none", fontSize: 13 }}>← Account</Link>
        <h1 style={{ fontFamily: "var(--font-display)", fontSize: "clamp(1.5rem, 3vw, 2rem)", fontWeight: 300 }}>My Orders</h1>
      </div>

      {orders.length === 0 ? (
        <div style={{ textAlign: "center", padding: "80px 0" }}>
          <p style={{ fontSize: 48, marginBottom: 16 }}>📦</p>
          <h2 style={{ fontFamily: "var(--font-display)", fontSize: 24, marginBottom: 12 }}>No orders yet</h2>
          <p style={{ color: "var(--color-ink-light)", marginBottom: 28 }}>Your orders will appear here after you shop</p>
          <Link href="/shop"><button className="btn btn-primary">Start Shopping</button></Link>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {orders.map((o: any) => (
            <div key={o._id.toString()} className="card" style={{ padding: "20px 24px", display: "flex", justifyContent: "space-between", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
              <div>
                <p style={{ fontFamily: "var(--font-display)", fontSize: 16, marginBottom: 4 }}>{o.orderNumber}</p>
                <p style={{ fontSize: 12, color: "var(--color-ink-light)" }}>
                  {o.createdAt ? new Date(o.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" }) : ""} · {o.items?.length ?? 0} item{o.items?.length !== 1 ? "s" : ""}
                </p>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 20, flexWrap: "wrap" }}>
                <p className="price" style={{ fontSize: 16 }}>{fmt(o.pricing?.total ?? 0)}</p>
                <span className={`status-pill status-${o.status}`}>{o.status}</span>
                <Link href={`/account/orders/${o._id.toString()}`} style={{ fontSize: 13, color: "var(--color-gold)", textDecoration: "none" }}>View Details →</Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
