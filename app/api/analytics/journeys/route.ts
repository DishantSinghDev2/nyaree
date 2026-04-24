import { auth } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db/mongoose";
import { AnalyticsModel } from "@/lib/db/models/index";

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user || (session.user as any).role !== "admin") {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = req.nextUrl;
    const limit = parseInt(searchParams.get("limit") || "20", 10);

    await connectDB();

    // 1. Find recent distinct sessionIds that placed an order
    const recentOrders = await AnalyticsModel.find({ type: "order_placed" })
      .sort({ timestamp: -1 })
      .limit(limit)
      .select("sessionId timestamp")
      .lean();

    const sessionIds = [...new Set(recentOrders.map((r: any) => r.sessionId).filter(Boolean))];

    if (sessionIds.length === 0) {
      return NextResponse.json({ success: true, data: [] });
    }

    // 2. Fetch all events for these sessions
    const events = await AnalyticsModel.find({
      sessionId: { $in: sessionIds }
    })
      .sort({ timestamp: 1 })
      .lean();

    // 3. Group by sessionId
    const grouped = sessionIds.map((sid) => {
      const sessionEvents = events.filter((e: any) => e.sessionId === sid);
      const purchaseEvent = sessionEvents.find((e: any) => e.type === "order_placed");
      
      const purchaseTime = purchaseEvent ? purchaseEvent.timestamp : null;
      const startTime = sessionEvents[0]?.timestamp;
      const durationMs = purchaseTime && startTime ? new Date(purchaseTime).getTime() - new Date(startTime).getTime() : 0;
      
      return {
        sessionId: sid,
        purchaseTime,
        startTime,
        durationMs,
        device: sessionEvents[0]?.device || "unknown",
        country: sessionEvents[0]?.country || "unknown",
        events: sessionEvents.map((e: any) => ({
          type: e.type,
          path: e.path,
          timestamp: e.timestamp,
          meta: e.meta,
          device: e.device,
          country: e.country,
        })),
      };
    });

    // Sort journeys by purchase time descending
    grouped.sort((a, b) => {
      const aTime = a.purchaseTime ? new Date(a.purchaseTime).getTime() : 0;
      const bTime = b.purchaseTime ? new Date(b.purchaseTime).getTime() : 0;
      return bTime - aTime;
    });

    return NextResponse.json({ success: true, data: grouped });
  } catch (err: any) {
    console.error("Journeys API Error:", err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
