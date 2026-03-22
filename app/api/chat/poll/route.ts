// app/api/chat/poll/route.ts
// Customer polls this to get admin replies in real-time
import { NextRequest, NextResponse } from "next/server";
import { getRedis } from "@/lib/cache/redis";

export async function GET(req: NextRequest) {
  const sessionId = req.nextUrl.searchParams.get("sessionId");
  if (!sessionId) return NextResponse.json({ reply: null });
  try {
    const redis = getRedis();
    const key = `nyaree:enquiry:reply:${sessionId}`;
    const raw = await redis.get(key);
    if (!raw) return NextResponse.json({ reply: null });
    await redis.del(key); // consume once
    return NextResponse.json({ reply: JSON.parse(raw as string) });
  } catch {
    return NextResponse.json({ reply: null });
  }
}
