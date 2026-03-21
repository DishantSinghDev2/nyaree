"use client";
// components/admin/AnalyticsDashboard.tsx
import { useState, useEffect } from "react";
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, FunnelChart, Funnel, LabelList } from "recharts";

const COLORS = ["#C8960C", "#2D4A3E", "#5C1A00", "#1A3D7C", "#6B2D8B", "#C0392B"];

export function AnalyticsDashboard() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [days, setDays] = useState(30);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/analytics?days=${days}`)
      .then((r) => r.json())
      .then((d) => { if (d.success) setData(d.data); })
      .finally(() => setLoading(false));
  }, [days]);

  if (loading) return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16 }}>
      {Array.from({ length: 8 }).map((_, i) => <div key={i} className="skeleton" style={{ height: 100, borderRadius: "var(--radius-sm)" }} />)}
    </div>
  );

  if (!data) return <p style={{ color: "var(--color-ink-light)" }}>Analytics data unavailable</p>;

  const conversionRate = parseFloat(data.conversionRate);
  const deviceData = data.deviceBreakdown?.map((d: any) => ({ name: d._id ?? "Unknown", value: d.count })) ?? [];

  const funnelData = [
    { name: "Page Views", value: data.pageViews },
    { name: "Add to Cart", value: data.addToCartCount },
    { name: "Checkout Start", value: data.checkoutStarts },
    { name: "Orders Placed", value: data.orderCount },
  ];

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 32 }}>
        <div>
          <h1 style={{ fontFamily: "var(--font-display)", fontSize: 26, fontWeight: 400 }}>Analytics</h1>
          <p style={{ fontSize: 13, color: "var(--color-ink-light)", marginTop: 4 }}>Real-time store performance data</p>
        </div>
        <div style={{ display: "flex", gap: 6 }}>
          {[7, 30, 90].map((d) => (
            <button key={d} onClick={() => setDays(d)} className={`btn btn-sm ${days === d ? "btn-primary" : "btn-outline"}`}>{d}d</button>
          ))}
        </div>
      </div>

      {/* KPI Row */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, marginBottom: 24 }}>
        {[
          { label: "Total Page Views", value: data.pageViews.toLocaleString(), icon: "👁", color: "#DBEAFE" },
          { label: "Orders Placed", value: data.orderCount.toLocaleString(), icon: "📦", color: "#D1FAE5" },
          { label: "Conversion Rate", value: `${conversionRate}%`, icon: "📈", color: conversionRate > 2 ? "#D1FAE5" : "#FEF3C7" },
          { label: "Wishlist Adds", value: data.wishlistAdds.toLocaleString(), icon: "♥", color: "#FCE7F3" },
        ].map((kpi) => (
          <div key={kpi.label} className="card" style={{ padding: "20px 24px", display: "flex", gap: 14, alignItems: "center" }}>
            <div style={{ width: 44, height: 44, borderRadius: "var(--radius-lg)", background: kpi.color, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, flexShrink: 0 }}>{kpi.icon}</div>
            <div>
              <p style={{ fontSize: 10, color: "var(--color-ink-light)", letterSpacing: 0.5, textTransform: "uppercase" }}>{kpi.label}</p>
              <p style={{ fontFamily: "var(--font-display)", fontSize: 22, color: "var(--color-ink)" }}>{kpi.value}</p>
            </div>
          </div>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24, marginBottom: 24 }}>

        {/* Checkout Funnel */}
        <div className="card" style={{ padding: 24 }}>
          <h2 style={{ fontFamily: "var(--font-display)", fontSize: 18, fontWeight: 400, marginBottom: 20 }}>Conversion Funnel</h2>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {funnelData.map((step, i) => {
              const pct = funnelData[0].value > 0 ? (step.value / funnelData[0].value) * 100 : 0;
              return (
                <div key={step.name}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                    <span style={{ fontSize: 13, color: "var(--color-ink-muted)" }}>{step.name}</span>
                    <span style={{ fontSize: 13, fontWeight: 500 }}>{step.value.toLocaleString()} <span style={{ fontWeight: 400, color: "var(--color-ink-light)", fontSize: 11 }}>({pct.toFixed(1)}%)</span></span>
                  </div>
                  <div style={{ height: 8, background: "var(--color-border)", borderRadius: 4 }}>
                    <div style={{ height: "100%", borderRadius: 4, background: COLORS[i % COLORS.length], width: `${pct}%`, transition: "width 0.6s ease" }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Device Breakdown */}
        <div className="card" style={{ padding: 24 }}>
          <h2 style={{ fontFamily: "var(--font-display)", fontSize: 18, fontWeight: 400, marginBottom: 20 }}>Traffic by Device</h2>
          {deviceData.length > 0 ? (
            <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
              <ResponsiveContainer width={140} height={140}>
                <PieChart>
                  <Pie data={deviceData} cx="50%" cy="50%" innerRadius={40} outerRadius={60} dataKey="value">
                    {deviceData.map((_: any, index: number) => <Cell key={index} fill={COLORS[index % COLORS.length]} />)}
                  </Pie>
                  <Tooltip formatter={(v: number) => [v.toLocaleString(), ""]} />
                </PieChart>
              </ResponsiveContainer>
              <div style={{ display: "flex", flexDirection: "column", gap: 10, flex: 1 }}>
                {deviceData.map((d: any, i: number) => (
                  <div key={d.name} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <div style={{ width: 10, height: 10, borderRadius: "50%", background: COLORS[i % COLORS.length] }} />
                      <span style={{ fontSize: 13, textTransform: "capitalize" }}>{d.name}</span>
                    </div>
                    <span style={{ fontSize: 13, fontWeight: 500 }}>
                      {deviceData.reduce((s: number, x: any) => s + x.value, 0) > 0
                        ? `${((d.value / deviceData.reduce((s: number, x: any) => s + x.value, 0)) * 100).toFixed(0)}%`
                        : "0%"}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <p style={{ color: "var(--color-ink-light)", fontSize: 14, textAlign: "center", padding: "32px 0" }}>No device data yet</p>
          )}
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
        {/* Top Pages */}
        <div className="card" style={{ padding: 24 }}>
          <h2 style={{ fontFamily: "var(--font-display)", fontSize: 18, fontWeight: 400, marginBottom: 20 }}>Top Pages</h2>
          {data.topPages?.length > 0 ? (
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {data.topPages.map((p: any, i: number) => (
                <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid var(--color-border-light)" }}>
                  <span style={{ fontSize: 13, color: "var(--color-ink-muted)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", flex: 1, marginRight: 12 }}>{p._id || "/"}</span>
                  <span style={{ fontSize: 13, fontWeight: 500, flexShrink: 0 }}>{p.count.toLocaleString()}</span>
                </div>
              ))}
            </div>
          ) : <p style={{ color: "var(--color-ink-light)", fontSize: 14 }}>No page view data yet</p>}
        </div>

        {/* Top Products */}
        <div className="card" style={{ padding: 24 }}>
          <h2 style={{ fontFamily: "var(--font-display)", fontSize: 18, fontWeight: 400, marginBottom: 20 }}>Top Viewed Products</h2>
          {data.topProducts?.length > 0 ? (
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {data.topProducts.map((p: any, i: number) => (
                <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid var(--color-border-light)" }}>
                  <span style={{ fontSize: 13, color: "var(--color-ink-muted)", flex: 1, marginRight: 12, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{p.name || p._id || "Unknown"}</span>
                  <span style={{ fontSize: 13, fontWeight: 500, flexShrink: 0 }}>{p.count} views</span>
                </div>
              ))}
            </div>
          ) : <p style={{ color: "var(--color-ink-light)", fontSize: 14 }}>No product view data yet</p>}
        </div>
      </div>
    </div>
  );
}
