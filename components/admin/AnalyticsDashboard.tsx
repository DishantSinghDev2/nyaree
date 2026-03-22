"use client";
// components/admin/AnalyticsDashboard.tsx
import { IndiaMap } from "@/components/admin/IndiaMap";
import { useState, useEffect, useRef } from "react";
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const COLORS = ["#C8960C", "#2D4A3E", "#E85D04", "#1A3D7C", "#6B2D8B", "#C0392B"];

interface ActiveUser { sessionId: string; path: string; device: string; country: string; ip: string; timestamp: string; }
interface RealtimeData {
  activeUsers: ActiveUser[]; activeCount: number;
  recentPageCounts: Record<string, number>; bufferSize: number; ts: number;
}

export function AnalyticsDashboard() {
  const [data, setData] = useState<any>(null);
  const [rt, setRt] = useState<RealtimeData>({ activeUsers: [], activeCount: 0, recentPageCounts: {}, bufferSize: 0, ts: 0 });
  const [loading, setLoading] = useState(true);
  const [days, setDays] = useState(30);
  const [tab, setTab] = useState<"overview" | "realtime">("realtime");
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const evtRef = useRef<EventSource | null>(null);
  const pingRef = useRef(0);

  // Historical data
  useEffect(() => {
    setLoading(true);
    fetch(`/api/analytics?days=${days}`)
      .then(r => r.json())
      .then(d => { if (d.success) setData(d.data); })
      .finally(() => setLoading(false));
  }, [days]);

  // SSE realtime connection
  useEffect(() => {
    const connect = () => {
      const es = new EventSource("/api/admin/realtime");
      evtRef.current = es;

      es.onmessage = (e) => {
        try {
          const msg = JSON.parse(e.data);
          if (msg.type === "snapshot" || msg.type === "update") {
            setRt(msg);
            setLastUpdate(new Date());
          }
          pingRef.current = Date.now();
        } catch {}
      };

      es.onerror = () => {
        es.close();
        setTimeout(connect, 5000); // reconnect after 5s
      };
    };

    connect();
    return () => { evtRef.current?.close(); };
  }, []);

  const topPages = Object.entries(rt.recentPageCounts)
    .sort((a, b) => b[1] - a[1]).slice(0, 8)
    .map(([path, count]) => ({ path: path || "/", count }));

  const tabStyle = (t: string): React.CSSProperties => ({
    padding: "8px 20px", background: "none", border: "none",
    borderBottom: tab === t ? "2px solid var(--color-gold)" : "2px solid transparent",
    color: tab === t ? "var(--color-gold)" : "var(--color-ink-light)",
    fontSize: 13, fontWeight: tab === t ? 500 : 400, cursor: "pointer",
  });

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <div>
          <h1 style={{ fontFamily: "var(--font-display)", fontSize: 24, fontWeight: 400 }}>Analytics</h1>
          {lastUpdate && (
            <p style={{ fontSize: 12, color: "var(--color-ink-light)", marginTop: 2 }}>
              Live · updated {lastUpdate.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
            </p>
          )}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          {/* Live indicator */}
          <div style={{ display: "flex", alignItems: "center", gap: 6, padding: "4px 10px", background: "#F0FDF4", borderRadius: "var(--radius-pill)", border: "1px solid #BBF7D0" }}>
            <div style={{ width: 7, height: 7, borderRadius: "50%", background: "#22C55E", animation: "pulse 2s infinite" }} />
            <span style={{ fontSize: 11, color: "#16A34A", fontWeight: 500 }}>LIVE</span>
          </div>
          <select className="input" value={days} onChange={e => setDays(Number(e.target.value))} style={{ width: "auto" }}>
            {[7,14,30,90].map(d => <option key={d} value={d}>Last {d} days</option>)}
          </select>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", borderBottom: "1px solid var(--color-border)", marginBottom: 28 }}>
        <button style={tabStyle("realtime")} onClick={() => setTab("realtime")}>🔴 Realtime</button>
        <button style={tabStyle("overview")} onClick={() => setTab("overview")}>📊 Overview</button>
      </div>

      {tab === "realtime" ? (
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          {/* Active users hero metric */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 16 }}>
            <div className="card" style={{ padding: "20px 24px", borderLeft: "4px solid #22C55E" }}>
              <p style={{ fontSize: 11, letterSpacing: 1, textTransform: "uppercase", color: "var(--color-ink-light)", marginBottom: 6 }}>Active Now</p>
              <p style={{ fontFamily: "var(--font-display)", fontSize: 48, fontWeight: 300, color: "#22C55E", lineHeight: 1 }}>{rt.activeCount}</p>
              <p style={{ fontSize: 12, color: "var(--color-ink-light)", marginTop: 4 }}>users in last 5 min</p>
            </div>
            <div className="card" style={{ padding: "20px 24px" }}>
              <p style={{ fontSize: 11, letterSpacing: 1, textTransform: "uppercase", color: "var(--color-ink-light)", marginBottom: 6 }}>Page Views (30min)</p>
              <p style={{ fontFamily: "var(--font-display)", fontSize: 40, fontWeight: 300, lineHeight: 1 }}>
                {Object.values(rt.recentPageCounts).reduce((a, b) => a + b, 0)}
              </p>
            </div>
            <div className="card" style={{ padding: "20px 24px" }}>
              <p style={{ fontSize: 11, letterSpacing: 1, textTransform: "uppercase", color: "var(--color-ink-light)", marginBottom: 6 }}>Events Buffered</p>
              <p style={{ fontFamily: "var(--font-display)", fontSize: 40, fontWeight: 300, lineHeight: 1 }}>{rt.bufferSize}</p>
              <p style={{ fontSize: 12, color: "var(--color-ink-light)", marginTop: 4 }}>in Redis buffer</p>
            </div>
            <div className="card" style={{ padding: "20px 24px" }}>
              <p style={{ fontSize: 11, letterSpacing: 1, textTransform: "uppercase", color: "var(--color-ink-light)", marginBottom: 6 }}>Device Split</p>
              <div style={{ display: "flex", gap: 10, marginTop: 8 }}>
                {Object.entries(rt.activeUsers.reduce((acc: any, u) => { acc[u.device] = (acc[u.device] ?? 0) + 1; return acc; }, {})).map(([d, n]: any) => (
                  <div key={d} style={{ textAlign: "center" }}>
                    <p style={{ fontSize: 18 }}>{d === "mobile" ? "📱" : d === "tablet" ? "🖥️" : "💻"}</p>
                    <p style={{ fontSize: 11, color: "var(--color-ink-light)" }}>{n}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
            {/* Live user list */}
            <div className="card" style={{ padding: 24 }}>
              <h3 style={{ fontFamily: "var(--font-display)", fontSize: 16, marginBottom: 16 }}>
                Live Users {rt.activeCount > 0 && <span style={{ background: "#22C55E", color: "#fff", borderRadius: "var(--radius-pill)", padding: "2px 8px", fontSize: 11, marginLeft: 8 }}>{rt.activeCount}</span>}
              </h3>
              {rt.activeUsers.length === 0 ? (
                <div style={{ textAlign: "center", padding: 32, color: "var(--color-ink-light)" }}>
                  <p style={{ fontSize: 32 }}>👁️</p>
                  <p style={{ fontSize: 14, marginTop: 8 }}>No active users right now</p>
                  <p style={{ fontSize: 12, marginTop: 4 }}>Visitors appear here within 2 seconds</p>
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 10, maxHeight: 400, overflowY: "auto" }}>
                  {rt.activeUsers.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()).map(u => (
                    <div key={u.sessionId} style={{ display: "flex", gap: 12, alignItems: "center", padding: "10px 12px", background: "var(--color-ivory-dark)", borderRadius: "var(--radius-sm)", borderLeft: "3px solid #22C55E" }}>
                      <span style={{ fontSize: 18 }}>{u.device === "mobile" ? "📱" : u.device === "tablet" ? "🖥️" : "💻"}</span>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ fontSize: 12, fontWeight: 500, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{u.path}</p>
                        <p style={{ fontSize: 11, color: "var(--color-ink-light)" }}>{u.ip} · {u.country || "IN"}</p>
                      </div>
                      <p style={{ fontSize: 10, color: "var(--color-ink-light)", flexShrink: 0 }}>
                        {Math.round((Date.now() - new Date(u.timestamp).getTime()) / 1000)}s ago
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Hot pages (30 min) */}
            <div className="card" style={{ padding: 24 }}>
              <h3 style={{ fontFamily: "var(--font-display)", fontSize: 16, marginBottom: 16 }}>Hot Pages (30 min)</h3>
              {topPages.length === 0 ? (
                <p style={{ color: "var(--color-ink-light)", fontSize: 13, textAlign: "center", padding: 32 }}>No page views yet</p>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {topPages.map(({ path, count }) => {
                    const max = topPages[0].count;
                    return (
                      <div key={path}>
                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 3 }}>
                          <span style={{ fontSize: 12, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: "75%" }}>{path}</span>
                          <span style={{ fontSize: 12, fontWeight: 600, color: "var(--color-gold)" }}>{count}</span>
                        </div>
                        <div style={{ height: 5, background: "var(--color-border)", borderRadius: 3, overflow: "hidden" }}>
                          <div style={{ height: "100%", background: "var(--color-gold)", width: `${(count / max) * 100}%`, transition: "width 0.6s ease", borderRadius: 3 }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* India Map — proper react-simple-maps with state outlines */}
          <div className="card" style={{ padding: 24 }}>
            <h3 style={{ fontFamily: "var(--font-display)", fontSize: 16, marginBottom: 4 }}>User Locations — India</h3>
            <p style={{ fontSize: 12, color: "var(--color-ink-light)", marginBottom: 16 }}>
              Pulsing green dots = active sessions. Hover for details. Scroll to zoom.
            </p>
            <IndiaMap activeUsers={rt.activeUsers} />
          </div>
        </div>
      ) : (
        /* Overview tab — historical charts */
        loading ? (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 16 }}>
            {Array.from({ length: 8 }).map((_, i) => <div key={i} className="skeleton" style={{ height: 100, borderRadius: "var(--radius-sm)" }} />)}
          </div>
        ) : !data ? (
          <div className="card" style={{ padding: 48, textAlign: "center" }}>
            <p style={{ fontSize: 32 }}>📊</p>
            <h2 style={{ fontFamily: "var(--font-display)", fontSize: 20, marginTop: 12 }}>No data yet</h2>
            <p style={{ color: "var(--color-ink-light)", fontSize: 14, marginTop: 6 }}>Analytics will appear here as customers visit your store</p>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
            {/* KPI cards */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(180px,1fr))", gap: 16 }}>
              {[
                { label: "Page Views", value: data.pageViews?.toLocaleString() ?? "0", icon: "👁️" },
                { label: "Add to Cart", value: data.addToCartCount ?? 0, icon: "🛍️" },
                { label: "Checkout Starts", value: data.checkoutStarts ?? 0, icon: "💳" },
                { label: "Orders Placed", value: data.orderCount ?? 0, icon: "✅" },
                { label: "Wishlists", value: data.wishlistAdds ?? 0, icon: "❤️" },
                { label: "Searches", value: data.searchCount ?? 0, icon: "🔍" },
                { label: "Conversion Rate", value: `${data.conversionRate ?? 0}%`, icon: "📈" },
              { label: "Product Views", value: (data.productViews ?? 0).toLocaleString(), icon: "👀" },
              { label: "Reviews", value: data.reviewSubmits ?? 0, icon: "⭐" },
              ].map(kpi => (
                <div key={kpi.label} className="card" style={{ padding: "16px 20px" }}>
                  <p style={{ fontSize: 20, marginBottom: 6 }}>{kpi.icon}</p>
                  <p style={{ fontFamily: "var(--font-display)", fontSize: 28, fontWeight: 300 }}>{kpi.value}</p>
                  <p style={{ fontSize: 11, color: "var(--color-ink-light)", textTransform: "uppercase", letterSpacing: 0.5 }}>{kpi.label}</p>
                </div>
              ))}
            </div>

            {/* Daily trend */}
            {data.dailyPageViews?.length > 0 && (
              <div className="card" style={{ padding: 24 }}>
                <h3 style={{ fontFamily: "var(--font-display)", fontSize: 16, marginBottom: 16 }}>Daily Page Views</h3>
                <ResponsiveContainer width="100%" height={160}>
                  <LineChart data={data.dailyPageViews.map((d: any) => ({ date: d._id?.slice(5), views: d.count }))}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                    <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                    <YAxis tick={{ fontSize: 10 }} />
                    <Tooltip />
                    <Line type="monotone" dataKey="views" stroke="var(--color-gold)" strokeWidth={2} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}

            {/* Charts row */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
              <div className="card" style={{ padding: 24 }}>
                <h3 style={{ fontFamily: "var(--font-display)", fontSize: 16, marginBottom: 16 }}>Top Pages</h3>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={data.topPages?.slice(0,6).map((p: any) => ({ name: p._id?.split("/").pop() || "/", views: p.count })) ?? []}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                    <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} />
                    <Tooltip />
                    <Bar dataKey="views" fill="var(--color-gold)" radius={[2,2,0,0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="card" style={{ padding: 24 }}>
                <h3 style={{ fontFamily: "var(--font-display)", fontSize: 16, marginBottom: 16 }}>Devices</h3>
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie data={data.deviceBreakdown?.map((d: any) => ({ name: d._id ?? "Unknown", value: d.count })) ?? []} cx="50%" cy="50%" outerRadius={80} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                      {data.deviceBreakdown?.map((_: any, i: number) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Checkout funnel */}
            {data.checkoutFunnel?.length > 0 && (
              <div className="card" style={{ padding: 24 }}>
                <h3 style={{ fontFamily: "var(--font-display)", fontSize: 16, marginBottom: 20 }}>Checkout Funnel</h3>
                <div style={{ display: "flex", gap: 0 }}>
                  {data.checkoutFunnel.map((step: any, i: number) => {
                    const pct = i === 0 ? 100 : data.checkoutFunnel[0].count > 0 ? Math.round((step.count / data.checkoutFunnel[0].count) * 100) : 0;
                    const labels: Record<string, string> = { checkout_start: "Checkout Start", checkout_address: "Address", checkout_payment: "Payment", order_placed: "Order Placed" };
                    return (
                      <div key={step.step} style={{ flex: 1, textAlign: "center", padding: "0 8px", borderRight: i < 3 ? "1px dashed var(--color-border)" : "none" }}>
                        <p style={{ fontFamily: "var(--font-display)", fontSize: 28, color: i === 3 ? "#22C55E" : "var(--color-ink)" }}>{step.count}</p>
                        <p style={{ fontSize: 11, color: "var(--color-ink-light)", marginTop: 2 }}>{labels[step.step] ?? step.step}</p>
                        <p style={{ fontSize: 13, color: pct > 50 ? "#22C55E" : "var(--color-accent-red)", fontWeight: 600, marginTop: 4 }}>{pct}%</p>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )
      )}
    </div>
  );
}
