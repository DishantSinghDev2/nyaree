// app/(admin)/dashboard/customers/page.tsx
import type { Metadata } from "next";
import { connectDB } from "@/lib/db/mongoose";
import { UserModel } from "@/lib/db/models/index";
import Link from "next/link";

export const metadata: Metadata = { title: "Customers | Nyaree Admin" };
export const revalidate = 0;

export default async function CustomersPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; q?: string }>;
}) {
  const sp = await searchParams;
  const page = parseInt(sp.page ?? "1");
  const limit = 25;
  const q = sp.q?.trim();

  await connectDB();

  const filter: any = { role: "customer" };
  if (q) {
    filter.$or = [
      { name: { $regex: q, $options: "i" } },
      { email: { $regex: q, $options: "i" } },
    ];
  }

  const [customers, total] = await Promise.all([
    UserModel.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .select("name email phone totalOrders totalSpent createdAt lastLoginAt")
      .lean(),
    UserModel.countDocuments(filter),
  ]);

  const fmt = (p: number) => `₹${(p / 100).toLocaleString("en-IN")}`;

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 32 }}>
        <div>
          <h1 style={{ fontFamily: "var(--font-display)", fontSize: 26, fontWeight: 400 }}>
            Customers
          </h1>
          <p style={{ fontSize: 13, color: "var(--color-ink-light)", marginTop: 4 }}>
            {total} registered customer{total !== 1 ? "s" : ""}
          </p>
        </div>
      </div>

      {/* Search */}
      <form style={{ marginBottom: 24, display: "flex", gap: 12 }}>
        <input
          name="q"
          defaultValue={q}
          placeholder="Search by name or email..."
          className="input"
          style={{ maxWidth: 320 }}
        />
        <button type="submit" className="btn btn-outline btn-sm">Search</button>
        {q && (
          <Link href="/dashboard/customers">
            <button type="button" className="btn btn-ghost btn-sm">Clear</button>
          </Link>
        )}
      </form>

      <div className="card">
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Customer</th>
                <th>Phone</th>
                <th>Orders</th>
                <th>Total Spent</th>
                <th>Joined</th>
                <th>Last Login</th>
              </tr>
            </thead>
            <tbody>
              {customers.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ textAlign: "center", padding: "48px 0", color: "var(--color-ink-light)" }}>
                    {q ? `No customers found for "${q}"` : "No customers yet"}
                  </td>
                </tr>
              ) : (
                customers.map((c: any) => (
                  <tr key={c._id.toString()}>
                    <td>
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <div
                          style={{
                            width: 32, height: 32, borderRadius: "50%",
                            background: "var(--color-gold)", color: "#fff",
                            display: "flex", alignItems: "center", justifyContent: "center",
                            fontSize: 13, fontWeight: 600, flexShrink: 0,
                          }}
                        >
                          {c.name?.[0]?.toUpperCase() ?? "?"}
                        </div>
                        <div>
                          <p style={{ fontSize: 13, fontWeight: 500 }}>{c.name ?? "—"}</p>
                          <p style={{ fontSize: 11, color: "var(--color-ink-light)" }}>{c.email}</p>
                        </div>
                      </div>
                    </td>
                    <td style={{ fontSize: 13, color: "var(--color-ink-light)" }}>
                      {c.phone ?? "—"}
                    </td>
                    <td style={{ fontSize: 13, fontWeight: 500 }}>{c.totalOrders ?? 0}</td>
                    <td className="price" style={{ fontSize: 13 }}>
                      {c.totalSpent ? fmt(c.totalSpent) : "₹0"}
                    </td>
                    <td style={{ fontSize: 12, color: "var(--color-ink-light)" }}>
                      {c.createdAt
                        ? new Date(c.createdAt).toLocaleDateString("en-IN", {
                            day: "numeric", month: "short", year: "numeric",
                          })
                        : "—"}
                    </td>
                    <td style={{ fontSize: 12, color: "var(--color-ink-light)" }}>
                      {c.lastLoginAt
                        ? new Date(c.lastLoginAt).toLocaleDateString("en-IN")
                        : "Never"}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {total > limit && (
        <div style={{ display: "flex", justifyContent: "center", gap: 8, marginTop: 24 }}>
          {page > 1 && (
            <Link href={`/dashboard/customers?page=${page - 1}${q ? `&q=${q}` : ""}`}>
              <button className="btn btn-outline btn-sm">← Prev</button>
            </Link>
          )}
          <span style={{ padding: "8px 16px", fontSize: 13, color: "var(--color-ink-light)", display: "flex", alignItems: "center" }}>
            Page {page} of {Math.ceil(total / limit)}
          </span>
          {page * limit < total && (
            <Link href={`/dashboard/customers?page=${page + 1}${q ? `&q=${q}` : ""}`}>
              <button className="btn btn-outline btn-sm">Next →</button>
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
