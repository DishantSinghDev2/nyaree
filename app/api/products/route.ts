// app/api/products/route.ts
import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db/mongoose";
import { ProductModel } from "@/lib/db/models/Product";
import { cacheGet, cacheSet, cacheDel, CK } from "@/lib/cache/redis";
import { getAuth } from "@/lib/auth";
import { headers } from "next/headers";
import slugify from "slugify";
import { nanoid } from "nanoid";
import { z } from "zod";

const ProductSchema = z.object({
  name: z.string().min(2).max(200),
  category: z.enum(["kurti", "top", "coord-set", "dupatta", "lehenga", "other"]),
  subcategory: z.string().optional(),
  description: z.string().optional(),
  shortDescription: z.string().optional(),
  fabric: z.string().optional(),
  occasion: z.array(z.string()).optional(),
  pattern: z.string().optional(),
  fit: z.string().optional(),
  workType: z.string().optional(),
  careInstructions: z.array(z.string()).optional(),
  customFields: z.array(z.object({ label: z.string(), value: z.string(), type: z.string() })).optional(),
  allowCustomization: z.boolean().optional(),
  customizationNote: z.string().optional(),
  tags: z.array(z.string()).optional(),
  isActive: z.boolean().optional(),
  isFeatured: z.boolean().optional(),
  isNewArrival: z.boolean().optional(),
  isBestSeller: z.boolean().optional(),
  isCustomOrder: z.boolean().optional(),
  minimumOrderQuantity: z.number().optional(),
  leadTimeDays: z.number().optional(),
  variants: z.array(z.object({
    size: z.string(), color: z.string(), colorHex: z.string(),
    stock: z.number(), price: z.number(), compareAtPrice: z.number(),
    costPrice: z.number().optional(), weight: z.number().optional(),
  })).optional(),
  seo: z.object({ title: z.string().optional(), description: z.string().optional(), keywords: z.array(z.string()).optional() }).optional(),
  images: z.array(z.object({ url: z.string(), publicId: z.string().optional(), alt: z.string().optional(), position: z.number(), isHero: z.boolean() })).optional(),
});

async function requireAdmin() {
  const auth = getAuth();
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user || (session.user as any).role !== "admin") return null;
  return session.user;
}

// GET /api/products — list products (paginated)
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = req.nextUrl;
    const page = parseInt(searchParams.get("page") ?? "1");
    const limit = parseInt(searchParams.get("limit") ?? "24");
    const category = searchParams.get("category");
    const active = searchParams.get("active");
    const featured = searchParams.get("featured");

    const cacheKey = CK.productList(category ?? "all", page);
    const cached = await cacheGet(cacheKey);
    if (cached && active !== "false") return NextResponse.json({ success: true, data: cached });

    await connectDB();
    const filter: any = {};
    if (category) filter.category = category;
    if (active !== "false") filter.isActive = true;
    if (featured === "true") filter.isFeatured = true;

    const [items, total] = await Promise.all([
      ProductModel.find(filter).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit).lean(),
      ProductModel.countDocuments(filter),
    ]);

    const result = {
      items: items.map((p: any) => ({ ...p, _id: p._id.toString(), createdAt: p.createdAt?.toISOString(), updatedAt: p.updatedAt?.toISOString() })),
      total, page, limit, hasMore: page * limit < total,
    };
    await cacheSet(cacheKey, result, 120);
    return NextResponse.json({ success: true, data: result });
  } catch (err) {
    return NextResponse.json({ success: false, error: "Failed to fetch products" }, { status: 500 });
  }
}

// POST /api/products — create product (admin only)
export async function POST(req: NextRequest) {
  const user = await requireAdmin();
  if (!user) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });

  try {
    const body = await req.json();
    const parsed = ProductSchema.safeParse(body);
    if (!parsed.success) return NextResponse.json({ success: false, error: parsed.error.issues[0].message }, { status: 400 });

    await connectDB();
    const slug = slugify(parsed.data.name, { lower: true, strict: true }) + "-" + nanoid(6);
    const variants = (parsed.data.variants ?? []).map((v) => ({ ...v, id: nanoid(8), sku: `${slug}-${v.size}-${v.color}`.toLowerCase().slice(0, 50) }));
    const product = await ProductModel.create({ ...parsed.data, slug, variants });

    // Invalidate cache
    await cacheDel(CK.featured(), CK.newArrivals(), CK.bestsellers(), CK.productList(parsed.data.category, 1));

    return NextResponse.json({ success: true, data: { _id: product._id.toString(), slug: product.slug } }, { status: 201 });
  } catch (err: any) {
    if (err.code === 11000) return NextResponse.json({ success: false, error: "Product with this name already exists" }, { status: 400 });
    return NextResponse.json({ success: false, error: "Failed to create product" }, { status: 500 });
  }
}
