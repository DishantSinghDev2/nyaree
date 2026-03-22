// app/api/admin/realtime/route.ts
// Server-Sent Events stream for real-time admin dashboard
// 100% free: uses Redis + SSE (no WebSocket server needed)
// Fire-and-forget pattern: analytics events push to Redis list,
// this SSE endpoint polls Redis every 2s and pushes diffs to admin browser
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getRedis } from "@/lib/cache/redis";

export const runtime = "nodejs"; // SSE requires Node.js runtime

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user || (session.user as any).role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const redis = getRedis();

  const stream = new ReadableStream({
    async start(controller) {
      const enc = new TextEncoder();

      const send = (data: unknown) => {
        try {
          controller.enqueue(enc.encode(`data: ${JSON.stringify(data)}\n\n`));
        } catch {}
      };

      // Send initial snapshot immediately
      const snapshot = await buildSnapshot(redis);
      send({ type: "snapshot", ...snapshot });

      // Poll every 2 seconds, drain new events from Redis buffer
      let lastCount = 0;
      let alive = true;

      req.signal.addEventListener("abort", () => { alive = false; });

      while (alive) {
        await sleep(2000);
        if (!alive) break;

        try {
          const len = await redis.llen("nyaree:analytics:buffer");
          if (len !== lastCount) {
            lastCount = len;
            // Drain up to 50 newest events
            const raw = await redis.lrange("nyaree:analytics:buffer", -50, -1);
            const events = raw.map((r: string) => { try { return JSON.parse(r); } catch { return null; } }).filter(Boolean);

            // Build active-users snapshot from recent events (last 5 min)
            const fiveMinAgo = Date.now() - 5 * 60 * 1000;
            const active = events.filter((e: any) => new Date(e.timestamp).getTime() > fiveMinAgo);

            // Group by sessionId → latest page
            const sessions: Record<string, any> = {};
            for (const e of active) {
              if (!sessions[e.sessionId] || new Date(e.timestamp) > new Date(sessions[e.sessionId].timestamp)) {
                sessions[e.sessionId] = e;
              }
            }

            const activeUsers = Object.values(sessions).map((s: any) => ({
              sessionId: s.sessionId,
              path: s.path,
              device: s.device,
              country: s.country,
              ip: s.ip ? s.ip.replace(/\.\d+$/, ".xxx") : "", // mask last octet
              timestamp: s.timestamp,
            }));

            // Page view counts last 30 min
            const thirtyMinAgo = Date.now() - 30 * 60 * 1000;
            const recentEvents = events.filter((e: any) => new Date(e.timestamp).getTime() > thirtyMinAgo);
            const pageCounts: Record<string, number> = {};
            for (const e of recentEvents) {
              if (e.type === "page_view") pageCounts[e.path] = (pageCounts[e.path] ?? 0) + 1;
            }

            send({
              type: "update",
              activeUsers,
              activeCount: activeUsers.length,
              recentPageCounts: pageCounts,
              bufferSize: len,
              ts: Date.now(),
            });
          } else {
            // Heartbeat to keep connection alive
            send({ type: "heartbeat", ts: Date.now() });
          }
        } catch (err) {
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

async function buildSnapshot(redis: any) {
  try {
    const raw = await redis.lrange("nyaree:analytics:buffer", -200, -1);
    const events = raw.map((r: string) => { try { return JSON.parse(r); } catch { return null; } }).filter(Boolean);

    const fiveMinAgo = Date.now() - 5 * 60 * 1000;
    const active = events.filter((e: any) => new Date(e.timestamp).getTime() > fiveMinAgo);
    const sessions: Record<string, any> = {};
    for (const e of active) {
      if (!sessions[e.sessionId] || new Date(e.timestamp) > new Date(sessions[e.sessionId].timestamp)) {
        sessions[e.sessionId] = e;
      }
    }

    const activeUsers = Object.values(sessions).map((s: any) => ({
      sessionId: s.sessionId, path: s.path, device: s.device,
      country: s.country, ip: s.ip ? s.ip.replace(/\.\d+$/, ".xxx") : "",
      timestamp: s.timestamp,
    }));

    const thirtyMinAgo = Date.now() - 30 * 60 * 1000;
    const pageCounts: Record<string, number> = {};
    for (const e of events.filter((e: any) => new Date(e.timestamp).getTime() > thirtyMinAgo)) {
      if (e.type === "page_view") pageCounts[e.path] = (pageCounts[e.path] ?? 0) + 1;
    }

    return { activeUsers, activeCount: activeUsers.length, recentPageCounts: pageCounts, bufferSize: events.length, ts: Date.now() };
  } catch {
    return { activeUsers: [], activeCount: 0, recentPageCounts: {}, bufferSize: 0, ts: Date.now() };
  }
}

function sleep(ms: number) { return new Promise(r => setTimeout(r, ms)); }
