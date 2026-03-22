// app/api/admin/realtime-enquiries/route.ts
// SSE stream for real-time enquiry updates to admin dashboard
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getRedis } from "@/lib/cache/redis";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user || (session.user as any).role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const redis = getRedis();
  const CHANNEL = "nyaree:enquiry:updates";

  const stream = new ReadableStream({
    async start(controller) {
      const enc = new TextEncoder();
      const send = (data: unknown) => {
        try { controller.enqueue(enc.encode(`data: ${JSON.stringify(data)}\n\n`)); } catch {}
      };

      let alive = true;
      req.signal.addEventListener("abort", () => { alive = false; });

      // Get initial unread count
      try {
        const count = await redis.get("nyaree:enquiry:unread") ?? "0";
        send({ type: "init", unread: parseInt(count as string, 10) });
      } catch { send({ type: "init", unread: 0 }); }

      // Poll for updates every 3s
      while (alive) {
        await new Promise(r => setTimeout(r, 3000));
        if (!alive) break;
        try {
          // Check for new messages published to Redis channel
          const pending = await redis.get("nyaree:enquiry:pending");
          if (pending) {
            const data = JSON.parse(pending as string);
            send({ type: "new_message", ...data });
            await redis.del("nyaree:enquiry:pending");
          }
          const count = await redis.get("nyaree:enquiry:unread") ?? "0";
          send({ type: "unread_count", count: parseInt(count as string, 10) });
        } catch {
          send({ type: "heartbeat", ts: Date.now() });
        }
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      "X-Accel-Buffering": "no",
      Connection: "keep-alive",
    },
  });
}
