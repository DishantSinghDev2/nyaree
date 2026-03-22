// app/(store)/legal/privacy-policy/page.tsx
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy | Nyaree",
  description: "Nyaree's privacy policy — how we collect, use, and protect your personal information.",
};

export default function PrivacyPolicyPage() {
  return (
    <div className="container" style={{ maxWidth: 800, padding: "64px 0 80px" }}>
      <p style={{ fontFamily: "var(--font-body)", fontSize: 11, letterSpacing: 2, textTransform: "uppercase", color: "var(--color-gold)", marginBottom: 12 }}>Legal</p>
      <h1 style={{ fontFamily: "var(--font-display)", fontSize: "clamp(2rem, 4vw, 3rem)", fontWeight: 300, marginBottom: 8 }}>Privacy Policy</h1>
      <p style={{ color: "var(--color-ink-light)", fontSize: 13, marginBottom: 48 }}>Last updated: January 2025</p>

      <div className="prose">
        <h2>1. Information We Collect</h2>
        <p>When you shop at Nyaree (buynyaree.com), we collect information you provide directly to us:</p>
        <ul>
          <li><strong>Account information:</strong> Name, email address, and phone number when you create an account or place an order.</li>
          <li><strong>Order information:</strong> Shipping address, payment details (processed securely by Razorpay — we never store card data), and order history.</li>
          <li><strong>Communications:</strong> Messages you send via our chat widget, email, or WhatsApp.</li>
          <li><strong>Usage data:</strong> Pages visited, products viewed, and interactions with our website (used to improve your shopping experience).</li>
        </ul>

        <h2>2. How We Use Your Information</h2>
        <p>We use the information we collect to:</p>
        <ul>
          <li>Process and fulfill your orders</li>
          <li>Send order confirmations, shipping updates, and delivery notifications</li>
          <li>Provide customer support and respond to your enquiries</li>
          <li>Send promotional emails (you may unsubscribe at any time)</li>
          <li>Improve our website and product offerings</li>
          <li>Comply with legal obligations</li>
        </ul>

        <h2>3. Information Sharing</h2>
        <p>We do not sell, trade, or rent your personal information to third parties. We share your information only with:</p>
        <ul>
          <li><strong>Payment processors:</strong> Razorpay processes payments securely. They have their own privacy policy.</li>
          <li><strong>Shipping partners:</strong> We share your name and address with courier services to deliver your orders.</li>
          <li><strong>Email service:</strong> We use Resend to send transactional emails.</li>
          <li><strong>Legal requirements:</strong> If required by law or to protect our rights.</li>
        </ul>

        <h2>4. Data Security</h2>
        <p>We implement industry-standard security measures to protect your information, including SSL/TLS encryption for all data transmission. Payment information is processed by Razorpay using PCI-DSS compliant systems — we never store your payment card details.</p>

        <h2>5. Cookies</h2>
        <p>We use cookies to maintain your session, remember your cart, and provide a personalized experience. You may disable cookies in your browser settings, but some features may not work correctly.</p>

        <h2>6. Your Rights</h2>
        <p>You have the right to:</p>
        <ul>
          <li>Access the personal information we hold about you</li>
          <li>Request correction of inaccurate information</li>
          <li>Request deletion of your account and associated data</li>
          <li>Opt out of marketing communications</li>
        </ul>
        <p>To exercise these rights, contact us at hello@shopnyaree or +91 8368989758.</p>

        <h2>7. Children's Privacy</h2>
        <p>Our website is not directed at children under 13. We do not knowingly collect personal information from children under 13.</p>

        <h2>8. Changes to This Policy</h2>
        <p>We may update this Privacy Policy from time to time. We will notify you of significant changes by email or by posting a notice on our website.</p>

        <h2>9. Contact Us</h2>
        <p>If you have questions about this Privacy Policy, contact us:</p>
        <p><strong>Nyaree</strong><br />
        Parnala Extended Industrial Area, Bahadurgarh, Haryana — 124507<br />
        Email: hello@shopnyaree<br />
        Phone: +91 8368989758</p>
      </div>
    </div>
  );
}
