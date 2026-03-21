// app/api/reviews/route.ts
import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db/mongoose";
import { ReviewModel, ProductModel } from "@/lib/db/models/index";
import { auth } from "@/lib/auth";
import { z } from "zod";

const ReviewSchema = z.object({
  productId: z.string(),
  rating: z.number().min(1).max(5),
  title: z.string().max(120).optional(),
  body: z.string().min(10).max(2000),
});

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ success: false, error: "Sign in to write a review" }, { status: 401 });

  try {
    const body = await req.json();
    const parsed = ReviewSchema.safeParse(body);
    if (!parsed.success) return NextResponse.json({ success: false, error: parsed.error.issues[0].message }, { status: 400 });

    await connectDB();

    // Check not already reviewed
    const existing = await ReviewModel.findOne({ product: parsed.data.productId, user: session.user.id });
    if (existing) return NextResponse.json({ success: false, error: "You have already reviewed this product" }, { status: 409 });

    const review = await ReviewModel.create({
      product: parsed.data.productId,
      user: session.user.id,
      userName: session.user.name ?? "Customer",
      userImage: session.user.image,
      rating: parsed.data.rating,
      title: parsed.data.title,
      body: parsed.data.body,
      isApproved: false, // Admin approves
    });

    return NextResponse.json({ success: true, data: { _id: review._id.toString() } }, { status: 201 });
  } catch (err) {
    return NextResponse.json({ success: false, error: "Failed to submit review" }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const productId = searchParams.get("productId");
  if (!productId) return NextResponse.json({ success: false, error: "productId required" }, { status: 400 });

  await connectDB();
  const reviews = await ReviewModel.find({ product: productId, isApproved: true })
    .sort({ createdAt: -1 }).limit(30).lean();

  return NextResponse.json({
    success: true,
    data: reviews.map((r: any) => ({ ...r, _id: r._id.toString(), product: r.product?.toString(), user: r.user?.toString(), createdAt: r.createdAt?.toISOString() })),
  });
}
