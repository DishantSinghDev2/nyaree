// app/api/ai/blog-outline/route.ts
import { NextRequest, NextResponse } from "next/server";
import { generateBlogOutline } from "@/lib/ai/claude";
import { auth } from "@/lib/auth";
import { connectDB } from "@/lib/db/mongoose";
import { BlogModel } from "@/lib/db/models/index";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user || (session.user as any).role !== "admin") {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }
  try {
    const { topic, keywords } = await req.json();
    if (!topic) return NextResponse.json({ success: false, error: "Topic required" }, { status: 400 });

    // Fetch existing blog titles + slugs so AI avoids duplication and can cross-link
    await connectDB();
    const existingBlogs = await BlogModel.find({ status: "published" })
      .select("title slug")
      .sort({ publishedAt: -1 })
      .limit(20)
      .lean() as any[];

    const content = await generateBlogOutline(
      topic,
      keywords ?? [],
      existingBlogs.map(b => ({ title: b.title, url: `https://buynyaree.com/blog/${b.slug}` }))
    );
    return NextResponse.json({ success: true, data: { content } });
  } catch {
    return NextResponse.json({ success: false, error: "AI generation failed" }, { status: 500 });
  }
}
