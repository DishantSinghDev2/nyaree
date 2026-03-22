// app/(admin)/dashboard/page.tsx
import type { Metadata } from "next";
import { connectDB } from "@/lib/db/mongoose";
import { OrderModel, ProductModel, UserModel } from "@/lib/db/models/index";
import { DashboardStats } from "@/components/admin/DashboardStats";
import { RevenueChart } from "@/components/admin/RevenueChart";
import { RecentOrders } from "@/components/admin/RecentOrders";
import { LowStockAlert } from "@/components/admin/LowStockAlert";
import { AdminAIAssistant } from "@/components/admin/AdminAIAssistant";

export const metadata: Metadata = { title: "Dashboard | Nyaree Admin" };
export const revalidate = 60;

async function getDashboardData() {
  await connectDB();
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const weekAgo = new Date(Date.now() - 7 * 86400000);
  const monthAgo = new Date(Date.now() - 30 * 86400000);

  const [todayOrders, weekOrders, monthRevArr, pendingCount, totalCustomers, lowStockProducts, recentOrders, dailyRevenue] = await Promise.all([
    OrderModel.countDocuments({ createdAt: { $gte: today }, "payment.status": "paid" }),
    OrderModel.find({ createdAt: { $gte: weekAgo }, "payment.status": "paid" }, "pricing.total").lean(),
    OrderModel.aggregate([{ $match: { createdAt: { $gte: monthAgo }, "payment.status": "paid" } }, { $group: { _id: null, total: { $sum: "$pricing.total" } } }]),
    OrderModel.countDocuments({ status: { $in: ["pending", "confirmed"] } }),
    UserModel.countDocuments({ role: "customer" }),
      ProductModel.find({ isActive: true }).lean().then((prods: any) =>
        prods.filter((p: any) => p.variants?.reduce((s: number, v: any) => s + v.stock, 0) <= 5)
      ),
    OrderModel.find().sort({ createdAt: -1 }).limit(10)
      .populate("userId", "name email").lean(),
    // Last 30 days daily revenue
    OrderModel.aggregate([
      { $match: { createdAt: { $gte: monthAgo }, "payment.status": "paid" } },
      { $group: { _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } }, revenue: { $sum: "$pricing.total" }, orders: { $sum: 1 } } },
      { $sort: { _id: 1 } },
    ]),
  ]);

  const todayRevenue = weekOrders.reduce((s: number, o: any) => {
    const oDate = new Date(o.createdAt ?? "");
    if (oDate >= today) return s + (o.pricing?.total ?? 0);
    return s;
  }, 0);
  const weekRevenue = weekOrders.reduce((s: number, o: any) => s + (o.pricing?.total ?? 0), 0);
  const monthRevenue = monthRevArr[0]?.total ?? 0;

  return {
    stats: { todayOrders, todayRevenue, weekRevenue, monthRevenue, pendingCount, totalCustomers, lowStockCount: lowStockProducts.length },
    lowStockProducts: lowStockProducts.slice(0, 5).map((p: any) => ({
      _id: p._id.toString(), name: p.name, slug: p.slug,
      stock: p.variants?.reduce((s: number, v: any) => s + v.stock, 0),
      image: p.images?.[0]?.url,
    })),
    recentOrders: recentOrders.map((o: any) => ({
      _id: o._id.toString(),
      orderNumber: o.orderNumber,
      customerName: o.userId?.name ?? o.guestEmail ?? "Guest",
      total: o.pricing?.total ?? 0,
      status: o.status,
      paymentMethod: o.payment?.method,
      createdAt: o.createdAt?.toISOString(),
      itemCount: o.items?.length ?? 0,
    })),
    dailyRevenue: dailyRevenue.map((d: any) => ({ date: d._id, revenue: d.revenue, orders: d.orders })),
  };
}

export default async function DashboardPage() {
  const data = await getDashboardData();
  return (
    <div>
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontFamily: "var(--font-display)", fontSize: 28, fontWeight: 400 }}>Welcome back, Rishika 🌸</h1>
        <p style={{ color: "var(--color-ink-light)", fontSize: 14, marginTop: 4 }}>
          Here's what's happening with Nyaree today.
        </p>
      </div>

      <DashboardStats stats={data.stats} />

      <div style={{ display: "grid", gridTemplateColumns: "1fr 380px", gap: 24, marginTop: 32 }}>
        <RevenueChart data={data.dailyRevenue} />
        <LowStockAlert products={data.lowStockProducts} />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 380px", gap: 24, marginTop: 24 }}>
        <RecentOrders orders={data.recentOrders} />
        <AdminAIAssistant stats={data.stats} />
      </div>
    </div>
  );
}
