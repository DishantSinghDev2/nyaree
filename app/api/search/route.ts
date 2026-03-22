// app/api/search/route.ts
import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db/mongoose";
import { ProductModel } from "@/lib/db/models/Product";
import { cacheGet, cacheSet, CK } from "@/lib/cache/redis";

function serializeProduct(p: any) {
  return {
    _id: p._id.toString(),
    name: p.name,
    slug: p.slug,
    category: p.category,
    rating: p.rating ?? { average: 0, count: 0 },
    isNewArrival: p.isNewArrival ?? false,
    isBestSeller: p.isBestSeller ?? false,
    images: (p.images ?? []).map((img: any) => ({
      url: img.url, alt: img.alt ?? "", position: img.position ?? 0, isHero: img.isHero ?? false,
    })),
    variants: (p.variants ?? []).map((v: any) => ({
      id: v.id, size: v.size, color: v.color, colorHex: v.colorHex,
      price: v.price, compareAtPrice: v.compareAtPrice, stock: v.stock,
    })),
  };
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = req.nextUrl;
    const q = searchParams.get("q")?.trim() ?? "";

    const rawLimit = parseInt(searchParams.get("limit") ?? "12", 10);
    const limit = Number.isFinite(rawLimit) && rawLimit > 0 ? Math.min(rawLimit, 48) : 12;

    const rawPage = parseInt(searchParams.get("page") ?? "1", 10);
    const page = Number.isFinite(rawPage) && rawPage > 0 ? rawPage : 1;

    const category = searchParams.get("category") ?? "";
    const sort = searchParams.get("sort") ?? "relevance";

    if (!q || q.length < 2) {
      return NextResponse.json({ success: true, data: { items: [], total: 0, query: q } });
    }

    const cacheKey = CK.search(`${q}|${category}|${sort}|${page}|${limit}`);
    const cached = await cacheGet(cacheKey);
    if (cached) return NextResponse.json({ success: true, data: cached });

    await connectDB();

    const skip = (page - 1) * limit;

    // ── Strategy: run regex search (always works) + text search (if index exists)
    // then merge and deduplicate by _id. This avoids the MongoDB limitation
    // that $text cannot appear inside $or alongside other operators.

    const baseFilter: any = { isActive: true };
    if (category) baseFilter.category = category;

    const regexFilter = {
      ...baseFilter,
      $or: [
        { name: { $regex: q, $options: "i" } },
        { tags: { $in: [q.toLowerCase()] } },
        { fabric: { $regex: q, $options: "i" } },
        { pattern: { $regex: q, $options: "i" } },
        { shortDescription: { $regex: q, $options: "i" } },
      ],
    };

    // Build sort
    const buildSort = (useText: boolean): any => {
      if (sort === "price_asc")  return { "variants.0.price": 1 as const };
      if (sort === "price_desc") return { "variants.0.price": -1 as const };
      if (sort === "newest")     return { createdAt: -1 as const };
      if (useText) return { score: { $meta: "textScore" as const }, isFeatured: -1 as const };
      return { isFeatured: -1 as const, createdAt: -1 as const };
    };

    const projection = "name slug images variants rating isNewArrival isBestSeller category";

    // Try text search first — if it fails (no index), fall back to regex-only
    let items: any[] = [];
    let total = 0;

    try {
      // $text must be at the TOP LEVEL, never inside $or
      const textFilter = { ...baseFilter, $text: { $search: q } };

      const [textItems, regexItems, textCount, regexCount] = await Promise.all([
        ProductModel.find(textFilter).sort(buildSort(true)).limit(limit * 2).select(projection).lean(),
        ProductModel.find(regexFilter).sort(buildSort(false)).limit(limit * 2).select(projection).lean(),
        ProductModel.countDocuments(textFilter),
        ProductModel.countDocuments(regexFilter),
      ]);

      // Merge: text results first (higher relevance), then regex-only results
      const seen = new Set<string>();
      const merged: any[] = [];
      for (const p of (textItems as any[])) {
        const id = p._id.toString();
        if (!seen.has(id)) { seen.add(id); merged.push(p); }
      }
      for (const p of (regexItems as any[])) {
        const id = p._id.toString();
        if (!seen.has(id)) { seen.add(id); merged.push(p); }
      }

      total = Math.max(textCount, regexCount); // approximate total
      items = merged.slice(skip, skip + limit);

    } catch (textErr: any) {
      // Text index doesn't exist yet — use regex search only
      if (textErr.code === 27 || textErr.message?.includes("text index required")) {
        const [regexItems, regexCount] = await Promise.all([
          ProductModel.find(regexFilter).sort(buildSort(false)).skip(skip).limit(limit).select(projection).lean(),
          ProductModel.countDocuments(regexFilter),
        ]);
        items = regexItems;
        total = regexCount;
      } else {
        throw textErr;
      }
    }

    const result = {
      items: items.map(serializeProduct),
      total,
      page,
      limit,
      hasMore: skip + items.length < total,
      query: q,
    };

    await cacheSet(cacheKey, result, 60);
    return NextResponse.json({ success: true, data: result });

  } catch (err: any) {
    console.error("Search error:", err?.message ?? err);
    return NextResponse.json(
      {
        success: false,
        error: "Search failed",
        details: process.env.NODE_ENV === "development" ? err?.message : undefined,
      },
      { status: 500 }
    );
  }
}
