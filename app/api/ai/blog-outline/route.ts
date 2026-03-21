// app/api/ai/blog-outline/route.ts
import { NextRequest, NextResponse } from "next/server";
import { generateBlogOutline } from "@/lib/ai/claude";
import { auth } from "@/lib/auth";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user || (session.user as any).role !== "admin") {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }
  try {
    const { topic, keywords } = await req.json();
    if (!topic) return NextResponse.json({ success: false, error: "Topic required" }, { status: 400 });
    const content = await generateBlogOutline(topic, keywords ?? []);
    return NextResponse.json({ success: true, data: { content } });
  } catch {
    return NextResponse.json({ success: false, error: "AI generation failed" }, { status: 500 });
  }
}
