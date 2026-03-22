// app/api/admin/reviews/route.ts — admin list all reviews with product info
import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db/mongoose";
import { ReviewModel } from "@/lib/db/models/index";
import { auth } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user || (session.user as any).role !== "admin") {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }
  const { searchParams } = req.nextUrl;
  const status = searchParams.get("status") ?? "pending";
  await connectDB();

  const filter: Record<string, unknown> = {};
  if (status === "pending") filter.isApproved = false;
  else if (status === "approved") filter.isApproved = true;
  // "all" = no filter

  const reviews = await ReviewModel.find(filter)
    .populate("product", "name slug")
    .sort({ createdAt: -1 }).limit(100).lean();

  return NextResponse.json({
    success: true,
    data: reviews.map((r: any) => ({
      ...r, _id: r._id.toString(),
      product: r.product ? { name: r.product.name, slug: r.product.slug, _id: r.product._id?.toString() } : null,
      user: r.user?.toString(), createdAt: r.createdAt?.toISOString(),
    })),
  });
}
