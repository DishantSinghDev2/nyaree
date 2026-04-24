// lib/email/resend.ts
import { Resend } from "resend";

let resendClient: Resend | null = null;

function getResend(): Resend {
  if (!resendClient) {
    resendClient = new Resend(process.env.RESEND_API_KEY);
  }
  return resendClient;
}

const FROM = "Nyaree <noreply@buynyaree.com>";
const STORE_EMAIL = process.env.STORE_EMAIL || "hello@buynyaree.com";

// ─── Email template builders ──────────────────────────────────────────────────

function baseTemplate(content: string, preheader = ""): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Nyaree</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { background: #FDFAF4; font-family: 'Georgia', serif; color: #1A1208; }
    .wrapper { max-width: 600px; margin: 0 auto; background: #fff; }
    .header { background: #1A1208; padding: 32px 40px; text-align: center; }
    .logo { color: #C8960C; font-size: 28px; letter-spacing: 4px; font-weight: 400; }
    .logo span { color: #fff; }
    .body { padding: 40px; }
    .footer { background: #F5F0E8; padding: 24px 40px; text-align: center; }
    .footer p { font-size: 12px; color: #6B5D4F; line-height: 1.6; }
    .btn { display: inline-block; background: #C8960C; color: #fff !important; padding: 14px 32px; text-decoration: none; font-size: 14px; letter-spacing: 1px; margin: 24px 0; }
    .btn-outline { display: inline-block; border: 1px solid #1A1208; color: #1A1208 !important; padding: 12px 28px; text-decoration: none; font-size: 14px; letter-spacing: 1px; margin: 16px 0; }
    h1 { font-size: 24px; font-weight: 400; margin-bottom: 16px; color: #1A1208; letter-spacing: 1px; }
    h2 { font-size: 18px; font-weight: 400; margin-bottom: 12px; color: #1A1208; }
    p { font-size: 15px; line-height: 1.7; margin-bottom: 12px; color: #3D3025; }
    .divider { border: none; border-top: 1px solid #E8DCC8; margin: 24px 0; }
    .order-item { display: flex; padding: 12px 0; border-bottom: 1px solid #F0E8D8; }
    .order-item img { width: 64px; height: 80px; object-fit: cover; margin-right: 16px; }
    .item-details { flex: 1; }
    .item-name { font-size: 14px; font-weight: bold; }
    .item-meta { font-size: 12px; color: #6B5D4F; }
    .price-row { display: flex; justify-content: space-between; padding: 6px 0; font-size: 14px; }
    .total-row { display: flex; justify-content: space-between; padding: 12px 0; font-size: 16px; font-weight: bold; border-top: 1px solid #1A1208; }
    .badge { display: inline-block; background: #E8F5E9; color: #2D6A4F; padding: 4px 12px; font-size: 12px; }
    .social-links a { color: #C8960C !important; text-decoration: none; margin: 0 8px; font-size: 13px; }
  </style>
</head>
<body>
  ${preheader ? `<div style="display:none;max-height:0;overflow:hidden;">${preheader}</div>` : ""}
  <div class="wrapper">
    <div class="header">
      <div class="logo">NYA<span>REE</span></div>
      <p style="color:#9A8070;font-size:11px;letter-spacing:2px;margin-top:6px;">WEAR INDIA. OWN IT.</p>
    </div>
    ${content}
    <div class="footer">
      <div class="social-links" style="margin-bottom:16px;">
        <a href="https://instagram.com/buy_nyaree">Instagram</a> |
        <a href="https://facebook.com/nyaree">Facebook</a> |
        <a href=process.env.NEXT_PUBLIC_SITE_URL ?? "https://buynyaree.com">Shop Now</a>
      </div>
      <p>Nyaree | Parnala Extended Industrial Area, Bahadurgarh, Haryana 124507</p>
      <p>Phone: +91 8368989758 | <a href="mailto:hello@buynyaree.com" style="color:#C8960C;">hello@buynyaree.com</a></p>
      <p style="margin-top:12px;font-size:11px;">You received this email because you made a purchase or signed up at buynyaree.com</p>
      <p style="margin-top:4px;font-size:11px;"><a href="https://buynyaree.com/legal/privacy-policy" style="color:#C8960C;">Privacy Policy</a> | <a href="https://buynyaree.com/legal/terms" style="color:#C8960C;">Terms</a></p>
    </div>
  </div>
</body>
</html>`;
}

// ─── 1. Welcome Email ─────────────────────────────────────────────────────────
export async function sendWelcomeEmail(
  email: string,
  name: string,
  couponCode?: string
) {
  const resend = getResend();
  const content = `<div class="body">
    <h1>Welcome to Nyaree, ${name}! ✨</h1>
    <p>We're thrilled to have you join the Nyaree family. Discover our handcrafted kurtis and trending tops — made with love, designed for you.</p>
    ${couponCode ? `<div style="background:#FEF9EC;border:1px solid #C8960C;padding:20px;text-align:center;margin:24px 0;">
      <p style="font-size:12px;letter-spacing:2px;color:#6B5D4F;margin-bottom:8px;">YOUR WELCOME GIFT</p>
      <p style="font-size:28px;letter-spacing:4px;color:#C8960C;font-weight:bold;">${couponCode}</p>
      <p style="font-size:13px;color:#6B5D4F;margin-top:8px;">10% off your first order</p>
    </div>` : ""}
    <center><a href="https://buynyaree.com/shop" class="btn">EXPLORE COLLECTIONS</a></center>
    <hr class="divider" />
    <p style="font-size:13px;color:#6B5D4F;">Follow us on Instagram <a href="https://instagram.com/buy_nyaree" style="color:#C8960C;">@buy_nyaree</a> for daily inspiration, new arrivals, and styling tips.</p>
  </div>`;

  return resend.emails.send({
    from: FROM,
    to: email,
    subject: `Welcome to Nyaree, ${name}! Your style journey begins 🌸`,
    html: baseTemplate(content, "Your welcome gift is inside..."),
  });
}

// ─── 2. Order Confirmation ────────────────────────────────────────────────────
export async function sendOrderConfirmation(order: {
  orderNumber: string;
  customerName: string;
  email: string;
  items: { name: string; image: string; size: string; color: string; quantity: number; price: number }[];
  pricing: { subtotal: number; discount: number; shipping: number; gst: number; total: number };
  paymentMethod: string;
  shippingAddress: { fullName: string; addressLine1: string; city: string; state: string; pincode: string };
}) {
  const resend = getResend();
  const fmt = (p: number) => `₹${(p / 100).toLocaleString("en-IN")}`;

  const itemsHtml = order.items
    .map(
      (i) => `<div class="order-item">
      <img src="${i.image}" alt="${i.name}" />
      <div class="item-details">
        <div class="item-name">${i.name}</div>
        <div class="item-meta">Size: ${i.size} | Color: ${i.color} | Qty: ${i.quantity}</div>
        <div class="item-meta" style="margin-top:4px;color:#C8960C;">${fmt(i.price)}</div>
      </div>
    </div>`
    )
    .join("");

  const content = `<div class="body">
    <span class="badge">Order Confirmed</span>
    <h1 style="margin-top:16px;">Thank you, ${order.customerName}! 🎉</h1>
    <p>Your order <strong>${order.orderNumber}</strong> has been confirmed. We'll get it ready for you!</p>
    <p style="font-size:13px;color:#6B5D4F;">Payment Method: ${order.paymentMethod === "cod" ? "Cash on Delivery" : "Online Payment"}</p>
    
    <h2 style="margin-top:24px;">Order Summary</h2>
    ${itemsHtml}
    
    <div style="margin-top:20px;padding:16px;background:#FDFAF4;">
      <div class="price-row"><span>Subtotal</span><span>${fmt(order.pricing.subtotal)}</span></div>
      ${order.pricing.discount > 0 ? `<div class="price-row" style="color:#2D6A4F;"><span>Discount</span><span>-${fmt(order.pricing.discount)}</span></div>` : ""}
      <div class="price-row"><span>Shipping</span><span>${order.pricing.shipping === 0 ? "FREE" : fmt(order.pricing.shipping)}</span></div>
      <div class="price-row"><span>GST</span><span>${fmt(order.pricing.gst)}</span></div>
      <div class="total-row"><span>Total</span><span>${fmt(order.pricing.total)}</span></div>
    </div>
    
    <h2 style="margin-top:24px;">Shipping To</h2>
    <p style="font-size:14px;">${order.shippingAddress.fullName}<br/>
    ${order.shippingAddress.addressLine1}<br/>
    ${order.shippingAddress.city}, ${order.shippingAddress.state} - ${order.shippingAddress.pincode}</p>
    
    <center style="margin-top:24px;">
      <a href="https://buynyaree.com/account/orders" class="btn">TRACK YOUR ORDER</a>
    </center>
    <p style="font-size:13px;color:#6B5D4F;text-align:center;">Questions? Reply to this email or WhatsApp us at +91 8368989758</p>
  </div>`;

  const bcc = STORE_EMAIL;
  return resend.emails.send({
    from: FROM,
    to: order.email,
    bcc: bcc,
    subject: `Order Confirmed — ${order.orderNumber} | Nyaree`,
    html: baseTemplate(content, `Your order ${order.orderNumber} is confirmed!`),
  });
}

// ─── 3. Shipping Update ────────────────────────────────────────────────────────
export async function sendShippingUpdate(
  email: string,
  name: string,
  orderNumber: string,
  courier: string,
  trackingNumber: string,
  trackingUrl: string,
  estimatedDelivery: string
) {
  const resend = getResend();
  const content = `<div class="body">
    <span class="badge" style="background:#E3F2FD;color:#1565C0;">Shipped 🚚</span>
    <h1 style="margin-top:16px;">Your order is on its way, ${name}!</h1>
    <p>Great news! Your Nyaree order <strong>${orderNumber}</strong> has been shipped and is heading your way.</p>
    
    <div style="background:#F0F7FF;border:1px solid #90CAF9;padding:20px;margin:24px 0;">
      <p style="font-size:12px;letter-spacing:1px;color:#6B5D4F;margin-bottom:4px;">COURIER</p>
      <p style="font-size:18px;margin-bottom:12px;">${courier}</p>
      <p style="font-size:12px;letter-spacing:1px;color:#6B5D4F;margin-bottom:4px;">TRACKING NUMBER</p>
      <p style="font-size:18px;font-family:monospace;letter-spacing:2px;">${trackingNumber}</p>
      ${estimatedDelivery ? `<p style="font-size:13px;color:#6B5D4F;margin-top:12px;">Estimated Delivery: <strong>${estimatedDelivery}</strong></p>` : ""}
    </div>
    
    <center>
      <a href="${trackingUrl}" class="btn">TRACK PACKAGE</a>
    </center>
    <p style="font-size:13px;color:#6B5D4F;text-align:center;">Having trouble? Contact us at +91 8368989758</p>
  </div>`;

  return resend.emails.send({
    from: FROM,
    to: email,
    subject: `Your Nyaree order ${orderNumber} is shipped! 🚚`,
    html: baseTemplate(content, `Tracking: ${trackingNumber}`),
  });
}

// ─── 4. Order Delivered ────────────────────────────────────────────────────────
export async function sendOrderDelivered(
  email: string,
  name: string,
  orderNumber: string,
  productIds: string[]
) {
  const resend = getResend();
  const reviewUrl = `https://buynyaree.com/account/orders?review=${orderNumber}`;
  const content = `<div class="body">
    <span class="badge" style="background:#E8F5E9;color:#1B5E20;">Delivered ✓</span>
    <h1 style="margin-top:16px;">Your order arrived, ${name}! 📦</h1>
    <p>We hope you love your new Nyaree pieces! Your order <strong>${orderNumber}</strong> has been delivered.</p>
    <p>We'd love to hear your thoughts. A quick review helps other women make confident choices.</p>
    <center><a href="${reviewUrl}" class="btn">WRITE A REVIEW</a></center>
    <hr class="divider" />
    <p style="font-size:13px;color:#6B5D4F;">Share your look on Instagram and tag us <strong>@buy_nyaree</strong> — you might get featured! ✨</p>
  </div>`;

  return resend.emails.send({
    from: FROM,
    to: email,
    subject: `Your Nyaree order has arrived! ✨ Share your look`,
    html: baseTemplate(content),
  });
}

// ─── 5. Abandoned Cart ────────────────────────────────────────────────────────
export async function sendAbandonedCart(
  email: string,
  name: string,
  cartItems: { name: string; image: string; price: number }[],
  couponCode?: string
) {
  const resend = getResend();
  const fmt = (p: number) => `₹${(p / 100).toLocaleString("en-IN")}`;
  const itemsHtml = cartItems
    .slice(0, 3)
    .map(
      (i) => `<div style="display:flex;align-items:center;padding:8px 0;border-bottom:1px solid #F0E8D8;">
      <img src="${i.image}" style="width:56px;height:70px;object-fit:cover;margin-right:12px;" />
      <div><div style="font-size:14px;">${i.name}</div><div style="color:#C8960C;font-size:13px;">${fmt(i.price)}</div></div>
    </div>`
    )
    .join("");

  const content = `<div class="body">
    <h1>You left something behind, ${name}... 👀</h1>
    <p>Your cart is missing you! Those beautiful pieces are still waiting.</p>
    ${itemsHtml}
    ${couponCode ? `<div style="background:#FEF9EC;border:1px solid #C8960C;padding:16px;text-align:center;margin:20px 0;">
      <p style="font-size:12px;color:#6B5D4F;">USE CODE FOR EXTRA DISCOUNT</p>
      <p style="font-size:22px;letter-spacing:3px;color:#C8960C;font-weight:bold;">${couponCode}</p>
    </div>` : ""}
    <center><a href="https://buynyaree.com/cart" class="btn">COMPLETE YOUR PURCHASE</a></center>
    <p style="font-size:13px;color:#6B5D4F;text-align:center;">Need help? We're just a message away: +91 8368989758</p>
  </div>`;

  return resend.emails.send({
    from: FROM,
    to: email,
    subject: `${name}, your cart is waiting... 🛍️`,
    html: baseTemplate(content, "Complete your purchase before it's gone"),
  });
}

// ─── 6. Admin: New Enquiry Escalation ─────────────────────────────────────────
export async function sendEnquiryEscalation(
  adminEmail: string,
  enquiryId: string,
  customerName: string,
  subject: string,
  lastMessage: string
) {
  const resend = getResend();
  const content = `<div class="body">
    <span class="badge" style="background:#FFF3E0;color:#E65100;">⚠️ Customer Needs Your Help</span>
    <h1 style="margin-top:16px;">New Enquiry Escalation</h1>
    <p>A customer could not get their answer from the AI assistant and needs your personal attention.</p>
    <div style="background:#FFF8F0;border-left:4px solid #C8960C;padding:16px;margin:20px 0;">
      <p><strong>Customer:</strong> ${customerName}</p>
      <p><strong>Subject:</strong> ${subject}</p>
      <p style="margin-top:12px;font-style:italic;">"${lastMessage}"</p>
    </div>
    <center><a href="https://buynyaree.com/dashboard/enquiries/${enquiryId}" class="btn">REPLY TO CUSTOMER</a></center>
  </div>`;

  return resend.emails.send({
    from: FROM,
    to: adminEmail,
    subject: `⚠️ Customer needs help — ${subject}`,
    html: baseTemplate(content),
  });
}

// ─── 7. Admin: New Order Alert ────────────────────────────────────────────────
export async function sendAdminNewOrder(
  adminEmail: string,
  orderNumber: string,
  total: number,
  customerName: string,
  itemCount: number
) {
  const resend = getResend();
  const fmt = (p: number) => `₹${(p / 100).toLocaleString("en-IN")}`;
  const content = `<div class="body">
    <span class="badge" style="background:#E8F5E9;color:#1B5E20;">💰 New Order!</span>
    <h1 style="margin-top:16px;">New Order — ${orderNumber}</h1>
    <p><strong>Customer:</strong> ${customerName}</p>
    <p><strong>Items:</strong> ${itemCount}</p>
    <p><strong>Total:</strong> ${fmt(total)}</p>
    <center><a href="https://buynyaree.com/dashboard/orders" class="btn">VIEW IN DASHBOARD</a></center>
  </div>`;

  return resend.emails.send({
    from: FROM,
    to: adminEmail,
    subject: `💰 New order ${orderNumber} — ${fmt(total)}`,
    html: baseTemplate(content),
  });
}

// ─── 8. Password Reset ─────────────────────────────────────────────────────────
export async function sendPasswordResetEmail(email: string, name: string, url: string) {
  const resend = getResend();
  const content = `<div class="body">
    <h1>Reset Your Password</h1>
    <p>Hi ${name}, we received a request to reset your Nyaree account password.</p>
    <center><a href="${url}" class="btn">RESET PASSWORD</a></center>
    <p style="font-size:13px;color:#6B5D4F;">This link expires in 1 hour. If you didn't request this, please ignore this email.</p>
  </div>`;

  return resend.emails.send({
    from: FROM,
    to: email,
    subject: "Reset your Nyaree password",
    html: baseTemplate(content),
  });
}

// ─── 9. Email Verification ────────────────────────────────────────────────────
export async function sendVerificationEmail(email: string, name: string, url: string) {
  const resend = getResend();
  const content = `<div class="body">
    <h1>Verify Your Email</h1>
    <p>Hi ${name}, welcome to Nyaree! Please verify your email to complete your account.</p>
    <center><a href="${url}" class="btn">VERIFY EMAIL</a></center>
    <p style="font-size:13px;color:#6B5D4F;">This link expires in 24 hours.</p>
  </div>`;

  return resend.emails.send({
    from: FROM,
    to: email,
    subject: "Verify your Nyaree email address",
    html: baseTemplate(content),
  });
}

// ─── 10. Custom Order Request ─────────────────────────────────────────────────
export async function sendCustomOrderRequest(
  adminEmail: string,
  customerEmail: string,
  customerName: string,
  productName: string,
  instructions: string,
  size: string,
  quantity: number
) {
  const resend = getResend();
  const content = `<div class="body">
    <span class="badge" style="background:#F3E5F5;color:#6A1B9A;">✂️ Custom Order Request</span>
    <h1 style="margin-top:16px;">New Custom Order Request</h1>
    <p><strong>Customer:</strong> ${customerName} (${customerEmail})</p>
    <p><strong>Product:</strong> ${productName}</p>
    <p><strong>Size:</strong> ${size}</p>
    <p><strong>Quantity:</strong> ${quantity}</p>
    <div style="background:#F9F5FF;border-left:4px solid #9C27B0;padding:16px;margin:20px 0;">
      <p><strong>Custom Instructions:</strong></p>
      <p style="font-style:italic;">${instructions}</p>
    </div>
    <center><a href="https://buynyaree.com/dashboard/enquiries" class="btn">VIEW IN DASHBOARD</a></center>
  </div>`;

  await resend.emails.send({
    from: FROM,
    to: adminEmail,
    subject: `✂️ Custom order request — ${productName}`,
    html: baseTemplate(content),
  });

  // Also confirm to customer
  const customerContent = `<div class="body">
    <h1>We received your custom request, ${customerName}!</h1>
    <p>Thank you for your interest in a custom piece from Nyaree. Our team will review your request and reach out within 24-48 hours.</p>
    <div style="background:#FDFAF4;border:1px solid #E8DCC8;padding:16px;margin:20px 0;">
      <p><strong>Your Request:</strong></p>
      <p style="font-style:italic;">${instructions}</p>
    </div>
    <p style="font-size:13px;color:#6B5D4F;">You can also reach us directly at +91 8368989758 or WhatsApp us for faster response.</p>
  </div>`;

  return resend.emails.send({
    from: FROM,
    to: customerEmail,
    subject: "Your custom order request is received — Nyaree",
    html: baseTemplate(customerContent),
  });
}
