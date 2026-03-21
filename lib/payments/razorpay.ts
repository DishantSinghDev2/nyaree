// lib/payments/razorpay.ts
import Razorpay from "razorpay";
import crypto from "crypto";

let razorpayClient: Razorpay | null = null;

export function getRazorpay(): Razorpay {
  if (!razorpayClient) {
    razorpayClient = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID || "",
      key_secret: process.env.RAZORPAY_KEY_SECRET || "",
    });
  }
  return razorpayClient;
}

export async function createRazorpayOrder(
  amountInPaise: number,
  orderId: string,
  notes?: Record<string, string>
) {
  const razorpay = getRazorpay();
  return razorpay.orders.create({
    amount: amountInPaise,
    currency: "INR",
    receipt: `order_${orderId}`,
    notes: notes || {},
  });
}

export function verifyRazorpaySignature(
  razorpayOrderId: string,
  razorpayPaymentId: string,
  razorpaySignature: string
): boolean {
  const body = `${razorpayOrderId}|${razorpayPaymentId}`;
  const expectedSignature = crypto
    .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET || "")
    .update(body)
    .digest("hex");
  return expectedSignature === razorpaySignature;
}

export async function initiateRefund(paymentId: string, amountInPaise: number, reason: string) {
  const razorpay = getRazorpay();
  return razorpay.payments.refund(paymentId, {
    amount: amountInPaise,
    speed: "normal",
    notes: { reason },
  });
}

// ─── Pricing helpers ──────────────────────────────────────────────────────────
export function formatPrice(paise: number): string {
  return `₹${(paise / 100).toLocaleString("en-IN")}`;
}

export function paise(rupees: number): number {
  return Math.round(rupees * 100);
}

export function rupees(paise: number): number {
  return paise / 100;
}

export function calculateGST(subtotalPaise: number, gstPercent = 5): number {
  // GST is included in price (MRP inclusive), so extract it
  return Math.round((subtotalPaise * gstPercent) / (100 + gstPercent));
}

export function calculateOrderPricing(
  items: { price: number; quantity: number }[],
  couponDiscount: number,
  couponType: "percent" | "fixed" | "free_shipping" | null,
  couponValue: number,
  freeShippingThreshold: number,
  standardShipping: number,
  paymentMethod: "razorpay" | "cod",
  prepaidDiscountPercent: number,
  codExtraCharge: number
) {
  const subtotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0);

  let discount = 0;
  if (couponType === "percent") discount = Math.round((subtotal * couponValue) / 100);
  else if (couponType === "fixed") discount = Math.min(couponValue, subtotal);

  const afterDiscount = subtotal - discount;

  // Prepaid discount (5% by default)
  let prepaidDiscount = 0;
  if (paymentMethod === "razorpay" && prepaidDiscountPercent > 0) {
    prepaidDiscount = Math.round((afterDiscount * prepaidDiscountPercent) / 100);
  }

  const afterPrepaid = afterDiscount - prepaidDiscount;

  // Shipping
  let shipping = 0;
  if (couponType !== "free_shipping" && afterPrepaid < freeShippingThreshold) {
    shipping = standardShipping;
  }

  // COD charge
  const codCharge = paymentMethod === "cod" ? codExtraCharge : 0;

  const gst = calculateGST(afterPrepaid, 5);
  const total = afterPrepaid + shipping + codCharge;

  return {
    subtotal,
    discount,
    prepaidDiscount,
    shipping,
    gst,
    codCharge,
    total,
  };
}
