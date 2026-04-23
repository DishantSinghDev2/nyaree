// app/(store)/legal/terms/page.tsx
import type { Metadata } from "next";
export const metadata: Metadata = { title: "Terms of Service | Nyaree" };
export default function TermsPage() {
  return (
    <div className="container" style={{ maxWidth: 800, padding: "64px 0 80px" }}>
      <p style={{ fontFamily: "var(--font-body)", fontSize: 11, letterSpacing: 2, textTransform: "uppercase", color: "var(--color-gold)", marginBottom: 12 }}>Legal</p>
      <h1 style={{ fontFamily: "var(--font-display)", fontSize: "clamp(2rem, 4vw, 3rem)", fontWeight: 300, marginBottom: 8 }}>Terms of Service</h1>
      <p style={{ color: "var(--color-ink-light)", fontSize: 13, marginBottom: 48 }}>Last updated: January 2025</p>
      <div className="prose">
        <h2>1. Acceptance of Terms</h2>
        <p>By accessing and using Nyaree (buynyaree.com), you accept and agree to be bound by these Terms of Service. If you do not agree, please do not use our website.</p>

        <h2>2. Products & Descriptions</h2>
        <p>We make every effort to display product colors and images accurately. However, actual colors may vary slightly due to monitor settings. Nyaree reserves the right to limit quantities of products.</p>
        <p>For made-to-order and custom products, descriptions are indicative. Final products may have minor variations in color or finish due to the handcrafted nature of our items.</p>

        <h2>3. Pricing & Payment</h2>
        <ul>
          <li>All prices are in Indian Rupees (₹) and inclusive of GST.</li>
          <li>Prices are subject to change without notice.</li>
          <li>Payment is processed securely via Razorpay (online) or collected at delivery (Cash on Delivery).</li>
          <li>We offer a 5% discount on prepaid orders made via UPI, cards, or netbanking.</li>
        </ul>

        <h2>4. Order Acceptance</h2>
        <p>Your order is an offer to buy. We reserve the right to refuse or cancel any order for reasons including product unavailability, pricing errors, or suspected fraud. You will be notified and fully refunded if we cannot fulfill your order.</p>

        <h2>5. Shipping</h2>
        <p>Please refer to our <a href="/legal/shipping">Shipping Policy</a> for complete details on delivery timelines, charges, and coverage.</p>

        <h2>6. Returns & Refunds</h2>
        <p>Please refer to our <a href="/legal/refund">Refund & Return Policy</a> for complete details.</p>

        <h2>7. Custom & Made-to-Order Items</h2>
        <p>Custom orders are made specifically for you and cannot be returned unless they are defective or significantly different from what was ordered. Please review your custom specifications carefully before placing an order.</p>

        <h2>8. Intellectual Property</h2>
        <p>All content on buynyaree.com including images, text, and designs are the property of Nyaree and protected by copyright law. You may not reproduce or use our content without written permission.</p>

        <h2>9. Limitation of Liability</h2>
        <p>Nyaree shall not be liable for any indirect, incidental, or consequential damages arising from your use of our products or website. Our maximum liability is limited to the amount paid for the specific product in question.</p>

        <h2>10. Governing Law</h2>
        <p>These terms are governed by the laws of India. Any disputes shall be subject to the exclusive jurisdiction of courts in Bahadurgarh, Haryana.</p>

        <h2>11. Contact</h2>
        <p>Questions? Contact us at hello@buynyaree or +91 8368989758.</p>
      </div>
    </div>
  );
}
