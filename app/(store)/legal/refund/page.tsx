// app/(store)/legal/refund/page.tsx
import type { Metadata } from "next";
export const metadata: Metadata = { title: "Refund & Return Policy | Nyaree" };
export default function RefundPage() {
  return (
    <div className="container" style={{ maxWidth: 800, padding: "64px 0 80px" }}>
      <p style={{ fontFamily: "var(--font-body)", fontSize: 11, letterSpacing: 2, textTransform: "uppercase", color: "var(--color-gold)", marginBottom: 12 }}>Legal</p>
      <h1 style={{ fontFamily: "var(--font-display)", fontSize: "clamp(2rem, 4vw, 3rem)", fontWeight: 300, marginBottom: 8 }}>Refund & Return Policy</h1>
      <p style={{ color: "var(--color-ink-light)", fontSize: 13, marginBottom: 48 }}>Last updated: January 2025</p>
      <div className="prose">
        <h2>Our Promise</h2>
        <p>We want you to love everything you buy from Nyaree. If you're not completely happy, we're here to make it right.</p>

        <h2>Return Window</h2>
        <p>We accept returns within <strong>7 days of delivery</strong> for regular products. Items must be unworn, unwashed, with original tags attached, and in original packaging.</p>

        <h2>Eligible for Return</h2>
        <ul>
          <li>Defective or damaged products</li>
          <li>Wrong product delivered</li>
          <li>Product significantly different from the description</li>
          <li>Size issues (for standard sized products)</li>
        </ul>

        <h2>Not Eligible for Return</h2>
        <ul>
          <li>Custom or made-to-order products (unless defective)</li>
          <li>Products that have been worn, washed, or altered</li>
          <li>Products without original tags or packaging</li>
          <li>Products purchased during clearance/final sale</li>
          <li>Intimates or accessories for hygiene reasons</li>
        </ul>

        <h2>How to Initiate a Return</h2>
        <ol>
          <li>WhatsApp or call us at <strong>+91 8368989758</strong> within 7 days of delivery</li>
          <li>Share your order number and photos of the product</li>
          <li>We will arrange a reverse pickup (where available) or ask you to self-ship</li>
          <li>Once we receive and inspect the returned item, we process the refund</li>
        </ol>

        <h2>Refund Timeline</h2>
        <ul>
          <li><strong>Online payments (Razorpay):</strong> 5-7 business days to original payment method</li>
          <li><strong>Cash on Delivery:</strong> Bank transfer within 7-10 business days (we'll ask for your account details)</li>
          <li><strong>Store credit:</strong> Instant, if you prefer</li>
        </ul>

        <h2>Exchange Policy</h2>
        <p>We offer size exchanges on regular products (subject to availability). Contact us within 7 days of delivery to request an exchange.</p>

        <h2>Damaged in Transit</h2>
        <p>If your order arrives damaged, take photos immediately and contact us within 48 hours. We will send a replacement or issue a full refund at no cost to you.</p>

        <h2>Contact Us</h2>
        <p>WhatsApp: +91 8368989758 | Email: hello@nyaree.in</p>
        <p>We respond within 24 hours on business days.</p>
      </div>
    </div>
  );
}
