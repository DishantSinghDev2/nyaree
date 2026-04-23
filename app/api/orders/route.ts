// app/api/orders/route.ts
import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db/mongoose";
import { OrderModel } from "@/lib/db/models/index";
import { auth } from "@/lib/auth";
import { nanoid } from "nanoid";
import { sendOrderConfirmation, sendAdminNewOrder } from "@/lib/email/resend";
import { SiteSettingsModel } from "@/lib/db/models/index";

async function getStoreEmail(): Promise<string> {
  try {
    await connectDB();
    const settings = await SiteSettingsModel.findOne({ key: "main" }).lean() as any;
    return settings?.storeEmail || process.env.ADMIN_EMAIL || "hello@buynyaree";
  } catch { return "hello@buynyaree"; }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    const body = await req.json();
    const { items, shippingAddress, pricing, payment, couponCode } = body;

    if (!items?.length) return NextResponse.json({ success: false, error: "No items in order" }, { status: 400 });

    await connectDB();
    const orderNumber = `NYR-${Date.now().toString(36).toUpperCase()}-${nanoid(4).toUpperCase()}`;

    const order = await OrderModel.create({
      orderNumber,
      userId: session?.user?.id ?? undefined,
      guestEmail: !session?.user ? shippingAddress.email : undefined,
      items: items.map((i: any) => ({
        product: i.productId,
        variant: { size: i.size, color: i.color, colorHex: i.colorHex },
        name: i.name, image: i.image,
        price: i.price, quantity: i.quantity, total: i.price * i.quantity,
        customInstructions: i.customInstructions,
      })),
      shippingAddress: { ...shippingAddress, country: "India" },
      pricing: { ...pricing, discountCode: couponCode },
      payment: { ...payment, status: payment.method === "cod" ? "pending" : "pending" },
      status: "confirmed",
      timeline: [{ status: "confirmed", timestamp: new Date(), note: "Order placed successfully" }],
    });

    const storeEmail = await getStoreEmail();
    const customerEmail = session?.user?.email ?? shippingAddress.email;

    Promise.all([
      sendOrderConfirmation({
        orderNumber, customerName: shippingAddress.fullName,
        email: customerEmail,
        items: items.map((i: any) => ({ name: i.name, image: i.image, size: i.size, color: i.color, quantity: i.quantity, price: i.price })),
        pricing,
        paymentMethod: payment.method,
        shippingAddress,
      }),
      sendAdminNewOrder(storeEmail, orderNumber, pricing.total, shippingAddress.fullName, items.length),
    ]).catch(console.error);

    return NextResponse.json({ success: true, data: { _id: order._id.toString(), orderNumber } }, { status: 201 });
  } catch (err) {
    console.error("Order creation error:", err);
    return NextResponse.json({ success: false, error: "Failed to create order" }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });

  await connectDB();
  const isAdmin = (session.user as any).role === "admin";
  const { searchParams } = req.nextUrl;
  const page = parseInt(searchParams.get("page") ?? "1");
  const limit = parseInt(searchParams.get("limit") ?? "20");
  const status = searchParams.get("status");

  const filter: any = isAdmin ? {} : { userId: session.user.id };
  if (status) filter.status = status;

  const [items, total] = await Promise.all([
    OrderModel.find(filter).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit).lean(),
    OrderModel.countDocuments(filter),
  ]);

  return NextResponse.json({
    success: true,
    data: {
      items: items.map((o: any) => ({ ...o, _id: o._id.toString(), userId: o.userId?.toString(), createdAt: o.createdAt?.toISOString() })),
      total, page, limit, hasMore: page * limit < total,
    },
  });
}
