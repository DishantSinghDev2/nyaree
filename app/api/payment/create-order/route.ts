// app/api/payment/create-order/route.ts
import { NextRequest, NextResponse } from "next/server";
import { createRazorpayOrder } from "@/lib/payments/razorpay";
import { connectDB } from "@/lib/db/mongoose";
import { OrderModel } from "@/lib/db/models/index";
import { nanoid } from "nanoid";
import { getAuth } from "@/lib/auth";
import { headers } from "next/headers";

export async function POST(req: NextRequest) {
  try {
    const auth = getAuth();
    const session = await auth.api.getSession({ headers: await headers() });
    const body = await req.json();
    const { amount, items, shippingAddress, pricing, couponCode } = body;

    await connectDB();
    const orderNumber = `NYR-${Date.now().toString(36).toUpperCase()}-${nanoid(4).toUpperCase()}`;

    // Create internal order first (pending payment)
    const order = await OrderModel.create({
      orderNumber,
      userId: session?.user?.id ?? undefined,
      guestEmail: !session?.user ? shippingAddress.email : undefined,
      items: items.map((i: any) => ({
        product: i.productId, variant: { size: i.size, color: i.color, colorHex: i.colorHex },
        name: i.name, image: i.image, price: i.price, quantity: i.quantity, total: i.price * i.quantity, customInstructions: i.customInstructions,
      })),
      shippingAddress: { ...shippingAddress, country: "India" },
      pricing: { ...pricing, discountCode: couponCode },
      payment: { method: "razorpay", status: "pending" },
      status: "pending",
      timeline: [{ status: "pending", timestamp: new Date(), note: "Awaiting payment" }],
    });

    // Create Razorpay order
    const rzpOrder = await createRazorpayOrder(amount, order._id.toString());

    // Store razorpay order ID
    await OrderModel.findByIdAndUpdate(order._id, { "payment.razorpayOrderId": rzpOrder.id });

    return NextResponse.json({ success: true, data: { razorpayOrderId: rzpOrder.id, orderId: order._id.toString(), orderNumber } });
  } catch (err) {
    console.error("Payment order creation error:", err);
    return NextResponse.json({ success: false, error: "Failed to create payment order" }, { status: 500 });
  }
}
