// app/(store)/legal/shipping/page.tsx
import type { Metadata } from "next";
export const metadata: Metadata = { title: "Shipping Policy | Nyaree" };
export default function ShippingPage() {
  return (
    <div className="container" style={{ maxWidth: 800, padding: "64px 0 80px" }}>
      <p style={{ fontFamily: "var(--font-body)", fontSize: 11, letterSpacing: 2, textTransform: "uppercase", color: "var(--color-gold)", marginBottom: 12 }}>Legal</p>
      <h1 style={{ fontFamily: "var(--font-display)", fontSize: "clamp(2rem, 4vw, 3rem)", fontWeight: 300, marginBottom: 8 }}>Shipping Policy</h1>
      <p style={{ color: "var(--color-ink-light)", fontSize: 13, marginBottom: 48 }}>Last updated: January 2025</p>
      <div className="prose">
        <h2>Shipping Coverage</h2>
        <p>We ship across all of India — every state, every city, every pincode. If you're in India, we can reach you.</p>

        <h2>Shipping Charges</h2>
        <ul>
          <li><strong>Free shipping</strong> on all orders above ₹499</li>
          <li><strong>₹49</strong> for orders below ₹499</li>
          <li><strong>₹99</strong> for express delivery (2-3 days, where available)</li>
        </ul>

        <h2>Delivery Timelines</h2>
        <ul>
          <li><strong>Standard delivery:</strong> 5-7 business days after dispatch</li>
          <li><strong>Express delivery:</strong> 2-3 business days (available in select cities)</li>
          <li><strong>Custom / made-to-order:</strong> 7-14 days (depends on the lead time shown on the product page)</li>
          <li>Remote areas (North-East, Ladakh, island territories) may take 2-3 additional days</li>
        </ul>

        <h2>Processing Time</h2>
        <p>Orders are processed and dispatched within <strong>1-2 business days</strong> of payment confirmation. You'll receive a shipping confirmation email with tracking details once dispatched.</p>

        <h2>Order Tracking</h2>
        <p>Once your order is dispatched, you'll receive an SMS and email with your tracking number and courier details. You can track your order at <a href="/track-order">buynyaree.com/track-order</a>.</p>

        <h2>COD (Cash on Delivery)</h2>
        <p>Cash on Delivery is available across India. Please keep the exact amount ready at the time of delivery. Our delivery partner cannot provide change.</p>

        <h2>Failed Delivery</h2>
        <p>If a delivery attempt fails, the courier will try 2 more times. If all attempts fail, the package will be returned to us. We'll contact you to reship (at shipping cost) or issue a refund (excluding COD orders).</p>

        <h2>Shipping Delays</h2>
        <p>During peak seasons (Diwali, Dussehra, New Year), deliveries may take 2-3 additional days. We appreciate your patience.</p>

        <h2>Address Changes</h2>
        <p>If you need to change your delivery address, contact us within 12 hours of placing your order at +91 8368989758. After dispatch, address changes may not be possible.</p>

        <h2>Contact</h2>
        <p>Shipping questions? WhatsApp or call: <strong>+91 8368989758</strong> | Email: hello@shopnyaree</p>
      </div>
    </div>
  );
}
