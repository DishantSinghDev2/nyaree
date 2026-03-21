// app/api/search/route.ts
import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db/mongoose";
import { ProductModel } from "@/lib/db/models/Product";
import { cacheGet, cacheSet, CK } from "@/lib/cache/redis";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = req.nextUrl;
    const q = searchParams.get("q")?.trim() ?? "";
    const limit = Math.min(parseInt(searchParams.get("limit") ?? "12"), 48);
    const page = parseInt(searchParams.get("page") ?? "1");
    const category = searchParams.get("category");

    if (!q || q.length < 2) return NextResponse.json({ success: true, data: { items: [], total: 0 } });

    const cacheKey = CK.search(q + (category ?? "") + page);
    const cached = await cacheGet(cacheKey);
    if (cached) return NextResponse.json({ success: true, data: cached });

    await connectDB();
    const filter: any = {
      isActive: true,
      $or: [
        { $text: { $search: q } },
        { name: { $regex: q, $options: "i" } },
        { tags: { $in: [q.toLowerCase()] } },
        { fabric: { $regex: q, $options: "i" } },
        { pattern: { $regex: q, $options: "i" } },
      ],
    };
    if (category) filter.category = category;

    const [items, total] = await Promise.all([
      ProductModel.find(filter)
        .sort({ score: { $meta: "textScore" }, isFeatured: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .select("name slug images variants rating isNewArrival isBestSeller category")
        .lean(),
      ProductModel.countDocuments(filter),
    ]);

    const result = {
      items: items.map((p: any) => ({ ...p, _id: p._id.toString() })),
      total, page, limit, hasMore: page * limit < total, query: q,
    };

    await cacheSet(cacheKey, result, 60);
    return NextResponse.json({ success: true, data: result });
  } catch (err) {
    return NextResponse.json({ success: false, error: "Search failed" }, { status: 500 });
  }
}
