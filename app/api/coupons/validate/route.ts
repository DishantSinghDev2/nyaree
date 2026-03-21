// app/api/coupons/validate/route.ts
import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db/mongoose";
import { DiscountModel } from "@/lib/db/models/index";
import { getAuth } from "@/lib/auth";
import { headers } from "next/headers";

export async function POST(req: NextRequest) {
  try {
    const auth = getAuth();
    const session = await auth.api.getSession({ headers: await headers() });
    const { code, subtotal } = await req.json();

    if (!code) return NextResponse.json({ success: false, error: "No coupon code provided" }, { status: 400 });

    await connectDB();
    const discount = await DiscountModel.findOne({
      code: code.toUpperCase().trim(),
      isActive: true,
      $or: [{ expiresAt: { $exists: false } }, { expiresAt: null }, { expiresAt: { $gt: new Date() } }],
      $and: [{ $or: [{ startsAt: { $exists: false } }, { startsAt: { $lte: new Date() } }] }],
    }).lean() as any;

    if (!discount) return NextResponse.json({ success: false, error: "Invalid or expired coupon code" }, { status: 400 });
    if (discount.minOrderAmount > 0 && subtotal < discount.minOrderAmount) {
      return NextResponse.json({
        success: false,
        error: `Minimum order ₹${(discount.minOrderAmount / 100).toLocaleString("en-IN")} required for this coupon`,
      }, { status: 400 });
    }
    if (discount.usageLimit > 0 && discount.usageCount >= discount.usageLimit) {
      return NextResponse.json({ success: false, error: "This coupon has reached its usage limit" }, { status: 400 });
    }

    // Check per-user limit
    if (session?.user && discount.perUserLimit > 0) {
      const userUsageCount = (discount.usedBy ?? []).filter((id: string) => id === session.user.id).length;
      if (userUsageCount >= discount.perUserLimit) {
        return NextResponse.json({ success: false, error: "You have already used this coupon" }, { status: 400 });
      }
    }

    return NextResponse.json({
      success: true,
      data: { code: discount.code, type: discount.type, value: discount.value, maxDiscount: discount.maxDiscount },
    });
  } catch {
    return NextResponse.json({ success: false, error: "Coupon validation failed" }, { status: 500 });
  }
}
