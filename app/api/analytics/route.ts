// app/api/analytics/route.ts
import { auth } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";
import { bufferAnalyticsEvent, getRedis, CK } from "@/lib/cache/redis";
import { connectDB } from "@/lib/db/mongoose";
import { AnalyticsModel } from "@/lib/db/models/index";

// ALL events that should be queryable in the overview dashboard
// These are written directly to MongoDB (fast enough, important enough)
const DIRECT_WRITE_EVENTS = new Set([
  "page_view", "product_view", "add_to_cart", "remove_from_cart",
  "wishlist_add", "wishlist_remove", "search",
  "checkout_start", "checkout_address", "checkout_payment", "order_placed",
  "review_submit", "newsletter_subscribe", "chat_open", "coupon_apply",
]);

// POST - track an event
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { type, sessionId, path, meta } = body;

    if (!type || !sessionId) return NextResponse.json({ ok: true });

    const ip = req.headers.get("cf-connecting-ip") ?? req.headers.get("x-forwarded-for") ?? "";
    const ua = req.headers.get("user-agent") ?? "";
    const country = req.headers.get("cf-ipcountry") ?? "";
    const device = /mobile/i.test(ua) ? "mobile" : /tablet/i.test(ua) ? "tablet" : "desktop";

    const event = {
      type, sessionId, path, meta: meta ?? {}, country, device,
      referrer: req.headers.get("referer") ?? "",
      timestamp: new Date(), // Store as Date, not string, for proper $gte queries
      ip: ip.split(",")[0].trim(),
    };

    // Always buffer to Redis for realtime dashboard (fire-and-forget)
    bufferAnalyticsEvent(event).catch(() => {});

    // Write ALL trackable events directly to MongoDB so overview charts work
    if (DIRECT_WRITE_EVENTS.has(type)) {
      connectDB()
        .then(() => AnalyticsModel.create(event))
        .catch(() => {}); // silent fail — never block the customer
    }

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: true });
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
    const rawDays = parseInt(searchParams.get("days") ?? "30", 10);
    const days = Number.isFinite(rawDays) && rawDays > 0 ? rawDays : 30;
    const since = new Date(Date.now() - days * 86400000);

    await connectDB();

    const [pageViews, topPages, topProducts, eventCounts, deviceBreakdown, checkoutFunnel, dailyPageViews] =
      await Promise.all([
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

        // ALL event types in one pass — efficient
        AnalyticsModel.aggregate([
          { $match: { timestamp: { $gte: since } } },
          { $group: { _id: "$type", count: { $sum: 1 } } },
        ]),

        AnalyticsModel.aggregate([
          { $match: { timestamp: { $gte: since } } },
          { $group: { _id: "$device", count: { $sum: 1 } } },
        ]),

        // Checkout funnel
        Promise.all(
          ["checkout_start", "checkout_address", "checkout_payment", "order_placed"].map(t =>
            AnalyticsModel.countDocuments({ type: t, timestamp: { $gte: since } })
              .then(c => ({ step: t, count: c }))
          )
        ),

        // Daily page views trend for the period
        AnalyticsModel.aggregate([
          { $match: { type: "page_view", timestamp: { $gte: since } } },
          { $group: {
            _id: { $dateToString: { format: "%Y-%m-%d", date: "$timestamp" } },
            count: { $sum: 1 },
          }},
          { $sort: { _id: 1 } },
        ]),
      ]);

    const eventMap = Object.fromEntries(eventCounts.map((e: any) => [e._id, e.count]));

    return NextResponse.json({
      success: true,
      data: {
        pageViews,
        addToCartCount: eventMap["add_to_cart"] ?? 0,
        checkoutStarts: eventMap["checkout_start"] ?? 0,
        orderCount: eventMap["order_placed"] ?? 0,
        wishlistAdds: eventMap["wishlist_add"] ?? 0,
        searchCount: eventMap["search"] ?? 0,
        productViews: eventMap["product_view"] ?? 0,
        reviewSubmits: eventMap["review_submit"] ?? 0,
        topPages,
        topProducts,
        deviceBreakdown,
        checkoutFunnel,
        dailyPageViews,
        conversionRate: pageViews > 0
          ? ((eventMap["order_placed"] ?? 0) / pageViews * 100).toFixed(2)
          : "0",
      },
    });
  } catch (err: any) {
    console.error("Analytics GET error:", err?.message);
    return NextResponse.json({ success: false, error: "Analytics unavailable" }, { status: 500 });
  }
}
