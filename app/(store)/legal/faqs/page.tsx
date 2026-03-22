"use client";
// app/(store)/legal/faqs/page.tsx
import { useState } from "react";
import type { Metadata } from "next";
import Link from "next/link";

const FAQS = [
  {
    category: "Orders & Shipping",
    items: [
      {
        q: "How long does delivery take?",
        a: "Standard delivery takes 5–7 business days across India. Express delivery (2–3 business days) is available at checkout for select pincodes. You'll receive a tracking number by email once your order is dispatched.",
      },
      {
        q: "What is the minimum order for free shipping?",
        a: "Orders above ₹499 qualify for free standard shipping across India. Orders below ₹499 attract a flat shipping charge of ₹49.",
      },
      {
        q: "Can I change or cancel my order?",
        a: "Orders can be modified or cancelled within 2 hours of placing them. After that, the order goes into processing. Please WhatsApp us at +91 8368989758 immediately if you need to make changes.",
      },
      {
        q: "Do you deliver to all parts of India?",
        a: "Yes, we deliver pan-India. For remote pincodes, delivery may take 7–10 business days. Enter your pincode at checkout for an accurate estimate.",
      },
      {
        q: "Do you ship internationally?",
        a: "Not yet! We currently ship only within India. International shipping is on our roadmap — follow us on Instagram for updates.",
      },
    ],
  },
  {
    category: "Returns & Exchange",
    items: [
      {
        q: "What is your return policy?",
        a: "We offer a 7-day easy return policy from the date of delivery. Items must be unworn, unwashed, with all tags attached and in original packaging. Customised orders are not eligible for returns.",
      },
      {
        q: "How do I initiate a return or exchange?",
        a: "WhatsApp us at +91 8368989758 with your order number and reason for return. We'll arrange a pickup from your address within 2–3 business days. Refunds are processed within 5–7 business days after we receive the item.",
      },
      {
        q: "What if I received a damaged or wrong item?",
        a: "We're sorry! Please WhatsApp us with your order number and a photo of the issue within 48 hours of delivery. We'll arrange a replacement or full refund at no cost to you.",
      },
    ],
  },
  {
    category: "Payments",
    items: [
      {
        q: "What payment methods do you accept?",
        a: "We accept UPI (PhonePe, Google Pay, Paytm), credit/debit cards (Visa, Mastercard, RuPay), net banking, and Cash on Delivery (COD). Prepaid orders get a 5% discount.",
      },
      {
        q: "Is Cash on Delivery available?",
        a: "Yes! COD is available for most pincodes. Select 'Cash on Delivery' at checkout. Please note: COD is shown first as our default option.",
      },
      {
        q: "I paid but didn't get an order confirmation. What do I do?",
        a: "Check your spam/junk folder first. If you still don't see it, WhatsApp us with your payment details and we'll sort it out immediately.",
      },
      {
        q: "Is it safe to enter my card details on Nyaree?",
        a: "Absolutely. All payments are processed through Razorpay, a PCI-DSS compliant payment gateway. We never store your card information.",
      },
    ],
  },
  {
    category: "Products & Sizing",
    items: [
      {
        q: "How do I find my correct size?",
        a: "We have a detailed size guide with measurements for all our categories. You can find it at buynyaree.com/size-guide. When in doubt, size up — our fabric has a slight natural give.",
      },
      {
        q: "Do colours look exactly like the photos?",
        a: "We photograph all products in natural light to give you the most accurate colour representation. However, slight variations may occur due to different screen displays. If you're unsure, WhatsApp us for fabric samples.",
      },
      {
        q: "How should I care for my Nyaree products?",
        a: "Detailed care instructions are printed on the label of each garment. In general: hand-wash or gentle machine wash in cold water, do not wring, air-dry in shade, and use a low-heat iron on reverse.",
      },
      {
        q: "Can I get a custom size?",
        a: "Yes! We offer custom-size orders for most of our styles. Fill in the Custom Order form on our website or WhatsApp us with your measurements.",
      },
    ],
  },
];

function FAQItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ borderBottom: "1px solid var(--color-border-light)" }}>
      <button
        onClick={() => setOpen(!open)}
        style={{
          width: "100%", display: "flex", justifyContent: "space-between",
          alignItems: "flex-start", gap: 16, padding: "18px 0",
          background: "none", border: "none", textAlign: "left",
          cursor: "pointer",
        }}
      >
        <span style={{ fontSize: 15, fontWeight: 500, color: "var(--color-ink)", lineHeight: 1.5 }}>{q}</span>
        <span style={{ fontSize: 20, color: "var(--color-gold)", flexShrink: 0, transition: "transform 0.2s", transform: open ? "rotate(45deg)" : "rotate(0deg)" }}>+</span>
      </button>
      {open && (
        <div style={{ paddingBottom: 18, fontSize: 14, color: "var(--color-ink-muted)", lineHeight: 1.8, animation: "fadeInDown 0.15s ease" }}>
          {a}
        </div>
      )}
    </div>
  );
}

export default function FAQsPage() {
  return (
    <div>
      <section style={{ background: "var(--color-ink)", padding: "64px 0 48px", textAlign: "center" }}>
        <div className="container" style={{ maxWidth: 600 }}>
          <p style={{ fontFamily: "var(--font-body)", fontSize: 11, letterSpacing: 4, textTransform: "uppercase", color: "var(--color-gold)", marginBottom: 12 }}>Help Centre</p>
          <h1 style={{ fontFamily: "var(--font-display)", fontSize: "clamp(2rem, 5vw, 3.5rem)", fontWeight: 300, color: "#fff", marginBottom: 12 }}>
            Frequently Asked Questions
          </h1>
          <p style={{ fontSize: 14, color: "rgba(255,255,255,0.6)" }}>
            Everything you need to know about ordering, shipping, and more.
          </p>
        </div>
      </section>

      <div className="container" style={{ maxWidth: 760, padding: "64px 0 80px" }}>
        {FAQS.map((section) => (
          <div key={section.category} style={{ marginBottom: 48 }}>
            <h2 style={{
              fontFamily: "var(--font-display)", fontSize: 22, fontWeight: 400,
              marginBottom: 4, paddingBottom: 12,
              borderBottom: "2px solid var(--color-gold)", display: "inline-block",
            }}>
              {section.category}
            </h2>
            <div>
              {section.items.map((item) => (
                <FAQItem key={item.q} q={item.q} a={item.a} />
              ))}
            </div>
          </div>
        ))}

        {/* Still have questions */}
        <div style={{ background: "var(--color-ink)", borderRadius: "var(--radius-sm)", padding: "32px 36px", textAlign: "center" }}>
          <h3 style={{ fontFamily: "var(--font-display)", fontSize: 22, color: "#fff", fontWeight: 300, marginBottom: 10 }}>
            Still have questions?
          </h3>
          <p style={{ fontSize: 14, color: "rgba(255,255,255,0.6)", marginBottom: 24 }}>
            Our team is happy to help — usually within 1 hour on WhatsApp.
          </p>
          <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
            <a href="https://wa.me/918368989758" target="_blank" rel="noopener noreferrer">
              <button className="btn btn-primary">Chat on WhatsApp</button>
            </a>
            <Link href="/contact">
              <button className="btn btn-outline" style={{ borderColor: "rgba(255,255,255,0.4)", color: "#fff" }}>
                Send a Message
              </button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
