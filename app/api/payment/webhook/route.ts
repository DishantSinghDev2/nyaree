// app/api/payment/webhook/route.ts
// Razorpay Webhook — receives server-to-server payment events
// Setup in Razorpay Dashboard → Settings → Webhooks → Add URL: https://buynyaree.com/api/payment/webhook
// Events to enable: payment.captured, payment.failed, refund.created, order.paid
//
// IMPORTANT: Set RAZORPAY_WEBHOOK_SECRET in .env.local (from Razorpay Dashboard → Webhooks)
import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { connectDB } from "@/lib/db/mongoose";
import { OrderModel } from "@/lib/db/models/index";
import { sendOrderConfirmation, sendAdminNewOrder } from "@/lib/email/resend";

// Razorpay sends raw body — we must NOT parse as JSON before signature check
export async function POST(req: NextRequest) {
  const rawBody = await req.text();
  const signature = req.headers.get("x-razorpay-signature") ?? "";
  const secret = process.env.RAZORPAY_WEBHOOK_SECRET ?? "";

  if (!secret) {
    console.error("RAZORPAY_WEBHOOK_SECRET not set");
    return NextResponse.json({ ok: true }); // Don't reveal error to Razorpay
  }

  // Verify webhook signature
  const expectedSig = crypto
    .createHmac("sha256", secret)
    .update(rawBody)
    .digest("hex");

  if (expectedSig !== signature) {
    console.warn("Razorpay webhook signature mismatch");
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  let event: any;
  try {
    event = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { event: eventType, payload } = event;

  await connectDB();

  try {
    switch (eventType) {
      case "payment.captured": {
        // Payment successfully captured by Razorpay
        const payment = payload.payment.entity;
        const razorpayOrderId = payment.order_id;

        const order = await OrderModel.findOneAndUpdate(
          { "payment.razorpayOrderId": razorpayOrderId },
          {
            "payment.status": "paid",
            "payment.razorpayPaymentId": payment.id,
            "payment.capturedAt": new Date(payment.created_at * 1000),
            "payment.method": payment.method, // upi/card/netbanking/wallet
            status: "confirmed",
            $push: {
              timeline: {
                status: "confirmed",
                timestamp: new Date(),
                note: `Payment captured via ${payment.method} (${payment.id})`,
              },
            },
          },
          { new: true }
        ).lean() as any;

        if (order) {
          // Fire confirmation emails (non-blocking)
          const storeEmail = process.env.STORE_EMAIL ?? "hello@buynyaree.com";
          Promise.all([
            order.guestEmail && sendOrderConfirmation({
              orderNumber: order.orderNumber,
              customerName: order.shippingAddress?.fullName ?? "Customer",
              email: order.guestEmail,
              items: order.items ?? [],
              pricing: order.pricing,
              paymentMethod: "razorpay",
              shippingAddress: order.shippingAddress,
            }),
            sendAdminNewOrder(storeEmail, order.orderNumber, order.pricing?.total, order.shippingAddress?.fullName, order.items?.length),
          ]).catch(console.error);
        }
        break;
      }

      case "payment.failed": {
        const payment = payload.payment.entity;
        await OrderModel.findOneAndUpdate(
          { "payment.razorpayOrderId": payment.order_id },
          {
            "payment.status": "failed",
            "payment.failureReason": payment.error_description,
            status: "cancelled",
            $push: {
              timeline: {
                status: "cancelled",
                timestamp: new Date(),
                note: `Payment failed: ${payment.error_description ?? "Unknown reason"}`,
              },
            },
          }
        );
        break;
      }

      case "order.paid": {
        // Backup: order fully paid (fires after payment.captured for some methods)
        const rzpOrder = payload.order.entity;
        await OrderModel.findOneAndUpdate(
          { "payment.razorpayOrderId": rzpOrder.id, "payment.status": { $ne: "paid" } },
          { "payment.status": "paid", status: "confirmed" }
        );
        break;
      }

      case "refund.created": {
        const refund = payload.refund.entity;
        await OrderModel.findOneAndUpdate(
          { "payment.razorpayPaymentId": refund.payment_id },
          {
            $push: {
              timeline: {
                status: "refund_initiated",
                timestamp: new Date(),
                note: `Refund ₹${refund.amount / 100} initiated (${refund.id})`,
              },
            },
          }
        );
        break;
      }

      case "refund.processed": {
        const refund = payload.refund.entity;
        await OrderModel.findOneAndUpdate(
          { "payment.razorpayPaymentId": refund.payment_id },
          {
            status: "refunded",
            $push: {
              timeline: {
                status: "refunded",
                timestamp: new Date(),
                note: `Refund processed: ₹${refund.amount / 100} (${refund.id})`,
              },
            },
          }
        );
        break;
      }

      default:
        // Unknown event — log and ignore
        console.log(`Unhandled Razorpay event: ${eventType}`);
    }
  } catch (err) {
    console.error(`Webhook handler error for ${eventType}:`, err);
    // Return 200 to prevent Razorpay retries for processing errors
    // (only return non-200 for auth failures)
  }

  return NextResponse.json({ ok: true });
}
