"use client";
// components/admin/RevenueChart.tsx
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

interface Props { data: { date: string; revenue: number; orders: number }[]; }

export function RevenueChart({ data }: Props) {
  const fmt = (v: number) => `₹${(v / 100).toLocaleString("en-IN")}`;
  const chartData = data.map((d) => ({
    date: new Date(d.date).toLocaleDateString("en-IN", { month: "short", day: "numeric" }),
    revenue: d.revenue / 100,
    orders: d.orders,
  }));

  return (
    <div className="card" style={{ padding: 24 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <h2 style={{ fontFamily: "var(--font-display)", fontSize: 20, fontWeight: 400 }}>Revenue (Last 30 Days)</h2>
      </div>
      {chartData.length === 0 ? (
        <div style={{ height: 240, display: "flex", alignItems: "center", justifyContent: "center", color: "var(--color-ink-light)" }}>
          No revenue data yet. Start selling! 🚀
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={240}>
          <BarChart data={chartData} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border-light)" />
            <XAxis dataKey="date" tick={{ fontSize: 11, fill: "var(--color-ink-light)" }} axisLine={false} tickLine={false} />
            <YAxis tickFormatter={(v) => `₹${v}`} tick={{ fontSize: 11, fill: "var(--color-ink-light)" }} axisLine={false} tickLine={false} />
            <Tooltip formatter={(v: number) => [`₹${v.toLocaleString("en-IN")}`, "Revenue"]} contentStyle={{ background: "var(--color-ink)", color: "#fff", border: "none", borderRadius: 4, fontSize: 12 }} />
            <Bar dataKey="revenue" fill="var(--color-gold)" radius={[3, 3, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}
