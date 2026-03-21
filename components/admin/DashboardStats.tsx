"use client";
// components/admin/DashboardStats.tsx
interface Props { stats: { todayOrders: number; todayRevenue: number; weekRevenue: number; monthRevenue: number; pendingCount: number; totalCustomers: number; lowStockCount: number; }; }

export function DashboardStats({ stats }: Props) {
  const fmt = (p: number) => `₹${(p / 100).toLocaleString("en-IN")}`;
  const cards = [
    { label: "Today's Revenue", value: fmt(stats.todayRevenue), icon: "💰", color: "#E8F5E9", iconBg: "#1E6641", sub: `${stats.todayOrders} orders today` },
    { label: "This Week", value: fmt(stats.weekRevenue), icon: "📈", color: "#EDE9FE", iconBg: "#5B21B6", sub: "Last 7 days" },
    { label: "This Month", value: fmt(stats.monthRevenue), icon: "🗓", color: "#DBEAFE", iconBg: "#1E40AF", sub: "Last 30 days" },
    { label: "Pending Orders", value: String(stats.pendingCount), icon: "⏳", color: stats.pendingCount > 0 ? "#FEF3C7" : "#F3F4F6", iconBg: stats.pendingCount > 0 ? "#92400E" : "#6B7280", sub: "Need attention" },
    { label: "Total Customers", value: String(stats.totalCustomers), icon: "👥", color: "#F0FDF4", iconBg: "#065F46", sub: "All time" },
    { label: "Low Stock Items", value: String(stats.lowStockCount), icon: "⚠️", color: stats.lowStockCount > 0 ? "#FEE2E2" : "#F3F4F6", iconBg: stats.lowStockCount > 0 ? "#991B1B" : "#6B7280", sub: "5 or fewer left" },
  ];

  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }}>
      {cards.map((card) => (
        <div key={card.label} className="card" style={{ padding: "20px 24px", display: "flex", gap: 16, alignItems: "center" }}>
          <div style={{ width: 48, height: 48, borderRadius: "var(--radius-lg)", background: card.iconBg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, flexShrink: 0 }}>
            {card.icon}
          </div>
          <div>
            <p style={{ fontSize: 11, color: "var(--color-ink-light)", letterSpacing: 0.5, textTransform: "uppercase", marginBottom: 4 }}>{card.label}</p>
            <p style={{ fontFamily: "var(--font-display)", fontSize: 22, color: "var(--color-ink)", lineHeight: 1 }}>{card.value}</p>
            <p style={{ fontSize: 11, color: "var(--color-ink-light)", marginTop: 4 }}>{card.sub}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
