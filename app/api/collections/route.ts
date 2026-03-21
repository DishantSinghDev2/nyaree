// app/api/collections/route.ts
import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db/mongoose";
import { CollectionModel } from "@/lib/db/models/index";
import { auth } from "@/lib/auth";
import { cacheGet, cacheSet, cacheDel, CK } from "@/lib/cache/redis";
import slugify from "slugify";
import { nanoid } from "nanoid";

export async function GET() {
  const cached = await cacheGet(CK.collections());
  if (cached) return NextResponse.json({ success: true, data: cached });

  await connectDB();
  const collections = await CollectionModel.find({ isActive: true })
    .sort({ sortOrder: 1 }).select("title handle description bannerImage sortOrder").lean();

  const result = collections.map((c: any) => ({ ...c, _id: c._id.toString() }));
  await cacheSet(CK.collections(), result, 600);
  return NextResponse.json({ success: true, data: result });
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user || (session.user as any).role !== "admin") {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }
  try {
    const body = await req.json();
    if (!body.title) return NextResponse.json({ success: false, error: "Title required" }, { status: 400 });
    await connectDB();
    const handle = body.handle || slugify(body.title, { lower: true, strict: true }) + "-" + nanoid(4);
    const col = await CollectionModel.create({ ...body, handle });
    await cacheDel(CK.collections());
    return NextResponse.json({ success: true, data: { _id: col._id.toString(), handle } }, { status: 201 });
  } catch (err: any) {
    if (err.code === 11000) return NextResponse.json({ success: false, error: "Collection with this name already exists" }, { status: 400 });
    return NextResponse.json({ success: false, error: "Failed to create collection" }, { status: 500 });
  }
}
