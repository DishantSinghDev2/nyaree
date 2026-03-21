// app/api/payment/verify/route.ts
import { NextRequest, NextResponse } from "next/server";
import { verifyRazorpaySignature } from "@/lib/payments/razorpay";
import { connectDB } from "@/lib/db/mongoose";
import { OrderModel, SiteSettingsModel } from "@/lib/db/models/index";
import { sendOrderConfirmation, sendAdminNewOrder } from "@/lib/email/resend";



export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, internalOrderId } = body;

    const isValid = verifyRazorpaySignature(razorpay_order_id, razorpay_payment_id, razorpay_signature);
    if (!isValid) return NextResponse.json({ success: false, error: "Invalid payment signature" }, { status: 400 });

    await connectDB();
    const order = await OrderModel.findByIdAndUpdate(
      internalOrderId,
      {
        "payment.razorpayPaymentId": razorpay_payment_id,
        "payment.razorpaySignature": razorpay_signature,
        "payment.status": "paid",
        status: "confirmed",
        $push: { timeline: { status: "confirmed", timestamp: new Date(), note: "Payment received via Razorpay" } },
      },
      { new: true }
    );

    if (!order) return NextResponse.json({ success: false, error: "Order not found" }, { status: 404 });

    // Send emails async
    const settings = await SiteSettingsModel.findOne({ key: "main" }).lean() as any;
    const storeEmail = settings?.storeEmail || "hello@nyaree.in";
    const customerEmail = order.guestEmail || "";

    Promise.all([
      customerEmail && sendOrderConfirmation({
        orderNumber: order.orderNumber,
        customerName: order.shippingAddress.fullName,
        email: customerEmail,
        items: order.items.map((i: any) => ({ name: i.name, image: i.image, size: i.variant?.size, color: i.variant?.color, quantity: i.quantity, price: i.price })),
        pricing: order.pricing as any,
        paymentMethod: "razorpay",
        shippingAddress: order.shippingAddress as any,
      }),
      sendAdminNewOrder(storeEmail, order.orderNumber, order.pricing.total, order.shippingAddress.fullName, order.items.length),
    ]).catch(console.error);

    return NextResponse.json({ success: true, data: { orderNumber: order.orderNumber } });
  } catch (err) {
    console.error("Payment verify error:", err);
    return NextResponse.json({ success: false, error: "Verification failed" }, { status: 500 });
  }
}
