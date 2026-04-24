import { NextResponse } from "next/server";
import { OrderModel, UserModel } from "@/lib/db/models/index";
import { sendMonthlyInsights } from "@/lib/email/resend";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  // Check auth header if CRON_SECRET is set
  const authHeader = req.headers.get("authorization");
  if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const storeEmail = process.env.STORE_EMAIL || "admin@buynyaree.com";
    
    // Calculate start and end of last month
    const now = new Date();
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999);

    const orders = await OrderModel.find({
      createdAt: { $gte: startOfLastMonth, $lte: endOfLastMonth },
      status: { $ne: "cancelled" }
    });

    let totalRevenue = 0;
    const productsMap = new Map<string, number>();

    if (orders && Array.isArray(orders)) {
      for (const order of orders) {
        totalRevenue += order.pricing?.total || 0;
        if (order.items && Array.isArray(order.items)) {
          for (const item of order.items) {
            if (item.name) {
              const count = productsMap.get(item.name) || 0;
              productsMap.set(item.name, count + (item.quantity || 1));
            }
          }
        }
      }
    }

    const totalOrders = orders && Array.isArray(orders) ? orders.length : 0;

    let newCustomers = 0;
    try {
      newCustomers = await UserModel.countDocuments({
        createdAt: { $gte: startOfLastMonth, $lte: endOfLastMonth }
      });
    } catch (e) {
      console.error("Error fetching new customers count:", e);
    }

    const sortedProducts = Array.from(productsMap.entries())
      .map(([name, quantity]) => ({ name, quantity }))
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 5);

    const stats = {
      totalRevenue,
      totalOrders,
      newCustomers: newCustomers || 0,
      topProducts: sortedProducts
    };

    await sendMonthlyInsights(storeEmail, stats);

    return NextResponse.json({
      success: true,
      message: "Monthly insights sent successfully",
      stats
    });
  } catch (error: any) {
    console.error("Cron error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
