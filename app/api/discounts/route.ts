// app/api/discounts/route.ts
import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db/mongoose";
import { DiscountModel } from "@/lib/db/models/index";
import { auth } from "@/lib/auth";
import { nanoid } from "nanoid";
import { z } from "zod";

const DiscountSchema = z.object({
  code: z.string().min(3).max(30).optional(),
  type: z.enum(["percent", "fixed", "free_shipping", "bxgy"]),
  value: z.number().min(0),
  minOrderAmount: z.number().min(0).default(0),
  maxDiscount: z.number().optional(),
  usageLimit: z.number().min(0).default(0),
  perUserLimit: z.number().min(1).default(1),
  isActive: z.boolean().default(true),
  applicableTo: z.enum(["all", "category", "product"]).default("all"),
  categories: z.array(z.string()).optional(),
  startsAt: z.string().optional(),
  expiresAt: z.string().optional(),
});

async function requireAdmin() {
  const session = await auth();
  if (!session?.user || (session.user as any).role !== "admin") return null;
  return session.user;
}

export async function GET() {
  const user = await requireAdmin();
  if (!user) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  await connectDB();
  const discounts = await DiscountModel.find().sort({ createdAt: -1 }).lean();
  return NextResponse.json({
    success: true,
    data: discounts.map((d: any) => ({ ...d, _id: d._id.toString() })),
  });
}

export async function POST(req: NextRequest) {
  const user = await requireAdmin();
  if (!user) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  try {
    const body = await req.json();
    const parsed = DiscountSchema.safeParse(body);
    if (!parsed.success) return NextResponse.json({ success: false, error: parsed.error.issues[0].message }, { status: 400 });

    await connectDB();
    const code = (parsed.data.code || nanoid(8)).toUpperCase();
    const discount = await DiscountModel.create({ ...parsed.data, code });
    return NextResponse.json({ success: true, data: { _id: discount._id.toString(), code } }, { status: 201 });
  } catch (err: any) {
    if (err.code === 11000) return NextResponse.json({ success: false, error: "Coupon code already exists" }, { status: 400 });
    return NextResponse.json({ success: false, error: "Failed to create discount" }, { status: 500 });
  }
}
