// app/api/orders/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db/mongoose";
import { OrderModel } from "@/lib/db/models/index";
import { auth } from "@/lib/auth";
import { sendShippingUpdate, sendOrderDelivered } from "@/lib/email/resend";

async function requireAdmin() {
  const session = await auth();
  if (!session?.user || (session.user as any).role !== "admin") return null;
  return session.user;
}

export async function GET(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  await connectDB();

  const isAdmin = (session.user as any).role === "admin";
  const filter: any = { _id: id };
  if (!isAdmin) filter.userId = session.user.id;

  const order = await OrderModel.findOne(filter).lean() as any;
  if (!order) return NextResponse.json({ success: false, error: "Not found" }, { status: 404 });

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

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await requireAdmin();
  if (!user) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  try {
    const body = await req.json();
    const { status, tracking, notes } = body;

    await connectDB();
    const update: any = {};
    if (status) {
      update.status = status;
      update.$push = { timeline: { status, timestamp: new Date(), note: body.note || `Status updated to ${status}` } };
    }
    if (tracking) update.tracking = tracking;
    if (notes !== undefined) update.notes = notes;

    const order = await OrderModel.findByIdAndUpdate(id, update, { new: true }).lean() as any;
    if (!order) return NextResponse.json({ success: false, error: "Not found" }, { status: 404 });

    // Send email notifications on status change
    const customerEmail = order.guestEmail || "";
    const customerName = order.shippingAddress?.fullName || "Customer";

    if (status === "shipped" && tracking?.trackingNumber && customerEmail) {
      sendShippingUpdate(
        customerEmail, customerName, order.orderNumber,
        tracking.courier || "Courier", tracking.trackingNumber,
        tracking.trackingUrl || "", tracking.estimatedDelivery || ""
      ).catch(console.error);
    }

    if (status === "delivered" && customerEmail) {
      sendOrderDelivered(customerEmail, customerName, order.orderNumber, []).catch(console.error);
    }

    return NextResponse.json({ success: true, data: { _id: order._id.toString(), status: order.status } });
  } catch {
    return NextResponse.json({ success: false, error: "Update failed" }, { status: 500 });
  }
}
