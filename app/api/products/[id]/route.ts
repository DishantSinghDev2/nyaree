// app/api/products/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db/mongoose";
import { ProductModel } from "@/lib/db/models/Product";
import { cacheGet, cacheSet, cacheDel, CK } from "@/lib/cache/redis";
import { auth } from "@/lib/auth";
import slugify from "slugify";

async function requireAdmin() {
  const session = await auth();
  if (!session?.user || (session.user as any).role !== "admin") return null;
  return session.user;
}

export async function GET(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    // Try by slug first (for wishlist page)
    const cacheKey = CK.product(id);
    const cached = await cacheGet(cacheKey);
    if (cached) return NextResponse.json({ success: true, data: cached });

    await connectDB();
    const isObjectId = /^[a-f\d]{24}$/i.test(id);
    const product = await ProductModel.findOne(
      isObjectId ? { _id: id } : { slug: id }
    ).lean() as any;

    if (!product) return NextResponse.json({ success: false, error: "Product not found" }, { status: 404 });

    const serialized = {
      ...product,
      _id: product._id.toString(),
      collections: product.collections?.map((c: any) => c.toString()) ?? [],
      createdAt: product.createdAt?.toISOString(),
      updatedAt: product.updatedAt?.toISOString(),
    };

    await cacheSet(cacheKey, serialized, 3600);
    return NextResponse.json({ success: true, data: serialized });
  } catch {
    return NextResponse.json({ success: false, error: "Not found" }, { status: 404 });
  }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await requireAdmin();
  if (!user) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  try {
    const body = await req.json();
    await connectDB();

    // Regenerate slug if name changed
    if (body.name) {
      const existing = await ProductModel.findById(id).select("name slug").lean() as any;
      if (existing && existing.name !== body.name) {
        body.slug = slugify(body.name, { lower: true, strict: true }) + "-" + existing.slug.split("-").pop();
      }
    }

    const product = await ProductModel.findByIdAndUpdate(id, { $set: body }, { new: true }).lean() as any;
    if (!product) return NextResponse.json({ success: false, error: "Product not found" }, { status: 404 });

    // Invalidate caches
    await cacheDel(CK.product(product.slug), CK.featured(), CK.newArrivals(), CK.bestsellers(), CK.productList(product.category, 1), "featured_collabs");

    return NextResponse.json({ success: true, data: { _id: product._id.toString(), slug: product.slug } });
  } catch {
    return NextResponse.json({ success: false, error: "Update failed" }, { status: 500 });
  }
}

export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await requireAdmin();
  if (!user) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  try {
    await connectDB();
    const product = await ProductModel.findByIdAndDelete(id).lean() as any;
    if (!product) return NextResponse.json({ success: false, error: "Not found" }, { status: 404 });
    await cacheDel(CK.product(product.slug), CK.featured(), CK.newArrivals(), CK.bestsellers(), "featured_collabs");
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ success: false, error: "Delete failed" }, { status: 500 });
  }
}
