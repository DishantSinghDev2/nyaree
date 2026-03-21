// app/api/orders/track/route.ts
import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db/mongoose";
import { OrderModel } from "@/lib/db/models/index";
import { auth } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const orderNumber = searchParams.get("orderNumber")?.trim().toUpperCase();
  const email = searchParams.get("email")?.trim().toLowerCase();

  if (!orderNumber) return NextResponse.json({ success: false, error: "Order number required" }, { status: 400 });

  const session = await auth();
  await connectDB();

  const filter: any = { orderNumber };
  if (session?.user) {
    // Logged in: match by userId OR email
    filter.$or = [{ userId: session.user.id }, { guestEmail: email }];
  } else {
    // Guest: must provide email
    if (!email) return NextResponse.json({ success: false, error: "Email required" }, { status: 400 });
    filter.$or = [{ guestEmail: email }, { "shippingAddress.email": email }];
  }

  const order = await OrderModel.findOne(filter)
    .select("-__v -payment.razorpaySignature")
    .lean() as any;

  if (!order) return NextResponse.json({ success: false, error: "Order not found. Please check your order number and email." }, { status: 404 });

  return NextResponse.json({
    success: true,
    data: {
      ...order,
      _id: order._id.toString(),
      userId: order.userId?.toString(),
      createdAt: order.createdAt?.toISOString(),
      updatedAt: order.updatedAt?.toISOString(),
    },
  });
}
