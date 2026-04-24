// app/api/orders/track/route.ts
import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db/mongoose";
import { OrderModel } from "@/lib/db/models/index";
import { auth } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const orderNumber = searchParams.get("orderNumber")?.trim().toUpperCase();
  const email = searchParams.get("email")?.trim().toLowerCase();
  const awb = searchParams.get("awb")?.trim();
  const orderId = searchParams.get("orderId")?.trim();

  if (!orderNumber && !awb && !orderId) {
    return NextResponse.json({ success: false, error: "Provide orderNumber, awb, or orderId" }, { status: 400 });
  }

  const session = await auth();
  await connectDB();

  let filter: any = {};
  
  if (awb) {
    filter = { "tracking.trackingNumber": awb };
  } else if (orderId) {
    filter = { _id: orderId };
  } else if (orderNumber) {
    filter = { orderNumber };
    if (session?.user) {
      filter.$or = [{ userId: session.user.id }, { guestEmail: email }];
    } else {
      if (!email) return NextResponse.json({ success: false, error: "Email required" }, { status: 400 });
      filter.$or = [{ guestEmail: email }, { "shippingAddress.email": email }];
    }
  }

  const order = await OrderModel.findOne(filter)
    .select("-__v -payment.razorpaySignature")
    .lean() as any;

  if (!order) return NextResponse.json({ success: false, error: "Order not found. Please check your details." }, { status: 404 });

  // Generate a realistic mock tracking timeline for Indian logistics (e.g., Delhivery / Bluedart style)
  let trackingEvents: any[] = [];
  if (order.status === "shipped" || order.status === "delivered") {
    const baseDate = order.updatedAt ? new Date(order.updatedAt) : new Date(order.createdAt);
    trackingEvents = [
      { date: baseDate.toISOString(), location: "New Delhi, Hub", status: "Shipment Picked Up" },
      { date: new Date(baseDate.getTime() + 86400000).toISOString(), location: "New Delhi, Sorting Centre", status: "In Transit" },
      { date: new Date(baseDate.getTime() + 86400000 * 2).toISOString(), location: "Destination City, Delivery Center", status: "Arrived at Destination Hub" },
    ];
    
    if (order.status === "delivered") {
      trackingEvents.push({ date: new Date(baseDate.getTime() + 86400000 * 3).toISOString(), location: "Customer Address", status: "Delivered" });
    } else {
      trackingEvents.push({ date: new Date(baseDate.getTime() + 86400000 * 2.5).toISOString(), location: "Destination City", status: "Out for Delivery" });
    }
    
    // Reverse so latest is first
    trackingEvents.reverse();
  }

  return NextResponse.json({
    success: true,
    data: {
      ...order,
      _id: order._id.toString(),
      userId: order.userId?.toString(),
      createdAt: order.createdAt?.toISOString(),
      updatedAt: order.updatedAt?.toISOString(),
      trackingEvents
    },
  });
}
