// app/api/reviews/[id]/route.ts — admin approve/edit/delete
import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db/mongoose";
import { ReviewModel } from "@/lib/db/models/index";
import { ProductModel } from "@/lib/db/models/Product";
import { auth } from "@/lib/auth";

async function requireAdmin() {
  const session = await auth();
  if (!session?.user || (session.user as any).role !== "admin") return null;
  return session.user;
}

// Update a review (approve/edit/toggle)
export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await requireAdmin();
  if (!user) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const body = await req.json();
  await connectDB();

  const review = await ReviewModel.findByIdAndUpdate(id, { $set: body }, { new: true }).lean() as any;
  if (!review) return NextResponse.json({ success: false, error: "Not found" }, { status: 404 });

  // Recalculate product rating if approval status changed
  if ("isApproved" in body) {
    await recalcProductRating(review.product?.toString());
  }

  return NextResponse.json({ success: true, data: { _id: review._id.toString(), isApproved: review.isApproved } });
}

// Delete a review
export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await requireAdmin();
  if (!user) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  await connectDB();
  const review = await ReviewModel.findByIdAndDelete(id).lean() as any;
  if (!review) return NextResponse.json({ success: false, error: "Not found" }, { status: 404 });

  await recalcProductRating(review.product?.toString());
  return NextResponse.json({ success: true });
}

async function recalcProductRating(productId: string) {
  if (!productId) return;
  try {
    const reviews = await ReviewModel.find({ product: productId, isApproved: true }).select("rating").lean() as any[];
    if (!reviews.length) {
      await ProductModel.findByIdAndUpdate(productId, { "rating.average": 0, "rating.count": 0 });
      return;
    }
    const avg = reviews.reduce((s: number, r: any) => s + r.rating, 0) / reviews.length;
    await ProductModel.findByIdAndUpdate(productId, {
      "rating.average": Math.round(avg * 10) / 10,
      "rating.count": reviews.length,
    });
  } catch {}
}
