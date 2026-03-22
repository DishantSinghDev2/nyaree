// app/api/coupons/info/route.ts — get coupon display info (public, non-sensitive)
import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db/mongoose";
import { DiscountModel } from "@/lib/db/models/index";

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const code = searchParams.get("code")?.trim().toUpperCase();
  if (!code) return NextResponse.json({ success: false, error: "code required" }, { status: 400 });

  await connectDB();
  const coupon = await DiscountModel.findOne({ code, isActive: true })
    .select("code type value minOrderAmount expiresAt")
    .lean() as any;

  if (!coupon) return NextResponse.json({ success: false, error: "Coupon not found" }, { status: 404 });

  const now = new Date();
  if (coupon.expiresAt && new Date(coupon.expiresAt) < now) {
    return NextResponse.json({ success: false, error: "Coupon expired" }, { status: 410 });
  }

  return NextResponse.json({
    success: true,
    data: {
      code: coupon.code,
      type: coupon.type,
      value: coupon.type === "percent" ? coupon.value : coupon.value, // paise for fixed
      minOrderAmount: coupon.minOrderAmount,
      expiresAt: coupon.expiresAt,
    },
  });
}
