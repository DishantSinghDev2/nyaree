// app/api/ai/generate-description/route.ts
import { NextRequest, NextResponse } from "next/server";
import { generateProductDescription } from "@/lib/ai/claude";
import { getAuth } from "@/lib/auth";
import { headers } from "next/headers";
import { rateLimit } from "@/lib/cache/redis";

export async function POST(req: NextRequest) {
  const auth = getAuth();
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user || (session.user as any).role !== "admin") {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  const ip = req.headers.get("cf-connecting-ip") ?? "unknown";
  const { allowed } = await rateLimit(ip, "ai-gen", 20, 60);
  if (!allowed) return NextResponse.json({ success: false, error: "Rate limit exceeded" }, { status: 429 });

  try {
    const body = await req.json();
    const description = await generateProductDescription(body);
    return NextResponse.json({ success: true, data: { description } });
  } catch (err) {
    return NextResponse.json({ success: false, error: "AI generation failed" }, { status: 500 });
  }
}
