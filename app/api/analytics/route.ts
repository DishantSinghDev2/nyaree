import { auth } from "@/lib/auth";
// app/api/analytics/route.ts
import { NextRequest, NextResponse } from "next/server";
import { bufferAnalyticsEvent } from "@/lib/cache/redis";
import { connectDB } from "@/lib/db/mongoose";
import { AnalyticsModel } from "@/lib/db/models/index";



// POST - track an event (public, fast via Redis buffer)
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { type, sessionId, path, meta } = body;

    if (!type || !sessionId) return NextResponse.json({ ok: true }); // Silent fail - never block user

    const ip = req.headers.get("cf-connecting-ip") ?? req.headers.get("x-forwarded-for") ?? "";
    const ua = req.headers.get("user-agent") ?? "";
    const country = req.headers.get("cf-ipcountry") ?? "";

    // Detect device type from UA
    const device = /mobile/i.test(ua) ? "mobile" : /tablet/i.test(ua) ? "tablet" : "desktop";

    const event = {
      type, sessionId, path, meta: meta ?? {}, country, device,
      referrer: req.headers.get("referer") ?? "",
      timestamp: new Date().toISOString(),
      ip: ip.split(",")[0].trim(),
    };

    // Buffer to Redis — batch write to MongoDB every N events or via cron
    await bufferAnalyticsEvent(event);

    // Also write directly for important events
    const IMPORTANT_EVENTS = ["order_placed", "checkout_start", "payment_page"];
    if (IMPORTANT_EVENTS.includes(type)) {
      connectDB().then(() => AnalyticsModel.create(event)).catch(() => {});
    }

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: true }); // Never error to customer
  }
}

// GET - analytics data (admin only)
export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user || (session.user as any).role !== "admin") {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = req.nextUrl;
    const days = parseInt(searchParams.get("days") ?? "30");
    const since = new Date(Date.now() - days * 86400000);

    await connectDB();

    const [pageViews, topPages, topProducts, eventCounts, deviceBreakdown, checkoutFunnel] = await Promise.all([
      AnalyticsModel.countDocuments({ type: "page_view", timestamp: { $gte: since } }),
      AnalyticsModel.aggregate([
        { $match: { type: "page_view", timestamp: { $gte: since } } },
        { $group: { _id: "$path", count: { $sum: 1 } } },
        { $sort: { count: -1 } }, { $limit: 10 },
      ]),
      AnalyticsModel.aggregate([
        { $match: { type: "product_view", timestamp: { $gte: since } } },
        { $group: { _id: "$meta.productId", name: { $first: "$meta.productName" }, count: { $sum: 1 } } },
        { $sort: { count: -1 } }, { $limit: 10 },
      ]),
      AnalyticsModel.aggregate([
        { $match: { timestamp: { $gte: since } } },
        { $group: { _id: "$type", count: { $sum: 1 } } },
      ]),
      AnalyticsModel.aggregate([
        { $match: { timestamp: { $gte: since } } },
        { $group: { _id: "$device", count: { $sum: 1 } } },
      ]),
      // Checkout funnel conversion
      Promise.all(
        ["checkout_start", "checkout_address", "checkout_payment", "order_placed"].map((t) =>
          AnalyticsModel.countDocuments({ type: t, timestamp: { $gte: since } }).then((c) => ({ step: t, count: c }))
        )
      ),
    ]);

    const eventMap = Object.fromEntries(eventCounts.map((e: any) => [e._id, e.count]));

    return NextResponse.json({
      success: true,
      data: {
        pageViews,
        addToCartCount: eventMap.add_to_cart ?? 0,
        checkoutStarts: eventMap.checkout_start ?? 0,
        orderCount: eventMap.order_placed ?? 0,
        wishlistAdds: eventMap.wishlist_add ?? 0,
        searchCount: eventMap.search ?? 0,
        topPages,
        topProducts,
        deviceBreakdown,
        checkoutFunnel,
        conversionRate: pageViews > 0 ? ((eventMap.order_placed ?? 0) / pageViews * 100).toFixed(2) : "0",
      },
    });
  } catch (err) {
    return NextResponse.json({ success: false, error: "Analytics unavailable" }, { status: 500 });
  }
}
