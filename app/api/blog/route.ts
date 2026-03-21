// app/api/blog/route.ts
import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db/mongoose";
import { BlogModel } from "@/lib/db/models/index";
import { auth } from "@/lib/auth";
import { cacheDel } from "@/lib/cache/redis";
import slugify from "slugify";
import { nanoid } from "nanoid";

async function requireAdmin() {
  const session = await auth();
  if (!session?.user || (session.user as any).role !== "admin") return null;
  return session.user;
}

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const status = searchParams.get("status");
  const page = parseInt(searchParams.get("page") ?? "1");
  const limit = parseInt(searchParams.get("limit") ?? "20");

  await connectDB();
  const filter: any = {};
  const session = await auth();
  const isAdmin = (session?.user as any)?.role === "admin";

  if (!isAdmin) filter.status = "published";
  else if (status) filter.status = status;

  const [items, total] = await Promise.all([
    BlogModel.find(filter).sort({ publishedAt: -1, createdAt: -1 }).skip((page - 1) * limit).limit(limit).lean(),
    BlogModel.countDocuments(filter),
  ]);

  return NextResponse.json({
    success: true,
    data: { items: items.map((b: any) => ({ ...b, _id: b._id.toString(), createdAt: b.createdAt?.toISOString(), updatedAt: b.updatedAt?.toISOString() })), total, page, limit },
  });
}

export async function POST(req: NextRequest) {
  const user = await requireAdmin();
  if (!user) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });

  try {
    const body = await req.json();
    const { title, status } = body;
    if (!title) return NextResponse.json({ success: false, error: "Title required" }, { status: 400 });

    await connectDB();
    const slug = (body.slug || slugify(title, { lower: true, strict: true })) + "-" + nanoid(5);

    const blog = await BlogModel.create({
      ...body, slug,
      publishedAt: status === "published" ? new Date() : undefined,
    });

    return NextResponse.json({ success: true, data: { _id: blog._id.toString(), slug: blog.slug } }, { status: 201 });
  } catch (err: any) {
    if (err.code === 11000) return NextResponse.json({ success: false, error: "A blog with this title already exists" }, { status: 400 });
    return NextResponse.json({ success: false, error: "Failed to create blog" }, { status: 500 });
  }
}
