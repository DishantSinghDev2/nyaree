"use client";
// app/(store)/checkout/success/page.tsx
import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import ScratchCard from "@/components/ScratchCard";

function SuccessContent() {
  const params = useSearchParams();
  const orderNumber = params.get("order") ?? "";
  
  // Calculate delivery date (5-7 days from now)
  const deliveryStart = new Date();
  deliveryStart.setDate(deliveryStart.getDate() + 5);
  const deliveryEnd = new Date();
  deliveryEnd.setDate(deliveryEnd.getDate() + 7);
  
  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' });
  };
  
  useEffect(() => {
    // Fire confetti on load
    import("canvas-confetti").then(({ default: confetti }) => {
      const colors = ["#4CAF50", "#8BC34A", "#C8960C", "#FFC107"];
      const end = Date.now() + 3000;
      const frame = () => {
        confetti({ particleCount: 3, angle: 60, spread: 55, origin: { x: 0 }, colors });
        confetti({ particleCount: 3, angle: 120, spread: 55, origin: { x: 1 }, colors });
        if (Date.now() < end) requestAnimationFrame(frame);
      };
      frame();
    });
  }, []);

  return (
    <div style={{ minHeight: "80vh", backgroundColor: "#f1f3f6", padding: "40px 16px" }}>
      <div style={{ maxWidth: 600, margin: "0 auto" }}>
        
        {/* Success Card */}
        <div style={{
          backgroundColor: "#fff",
          borderRadius: "var(--radius-sm)",
          padding: "32px 24px",
          textAlign: "center",
          boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
          marginBottom: 16
        }}>
          {/* Using a placeholder for success animation */}
          <div style={{ width: 120, height: 120, margin: "0 auto 16px" }}>
            <img 
              src="/success-animation.gif" 
              alt="Order Placed Animation" 
              style={{ width: "100%", height: "100%", objectFit: "contain", borderRadius: "50%" }} 
              onError={(e) => {
                // Fallback to static icon if gif is missing
                const target = e.target as HTMLImageElement;
                target.onerror = null;
                target.style.display = "none";
                target.parentElement!.innerHTML = '<div style="width: 120px; height: 120px; border-radius: 50%; background: #E8F5E9; border: 4px solid #4CAF50; display: flex; align-items: center; justify-content: center; font-size: 60px; color: #4CAF50; margin: 0 auto;">✓</div>';
              }}
            />
          </div>

          <h1 style={{ fontFamily: "var(--font-display)", fontSize: 28, color: "#212121", marginBottom: 8, fontWeight: 500 }}>
            Order placed, thank you!
          </h1>
          <p style={{ fontSize: 14, color: "#878787", marginBottom: 24 }}>
            Confirmation will be sent to your email and phone number.
          </p>

          {/* Delivery Estimate */}
          <div style={{ 
            backgroundColor: "#F4F8FB", 
            border: "1px solid #E0E0E0", 
            borderRadius: "var(--radius-sm)", 
            padding: "16px 20px", 
            display: "flex", 
            flexDirection: "column",
            alignItems: "center",
            gap: 6
          }}>
            <span style={{ fontSize: 12, textTransform: "uppercase", letterSpacing: 1, color: "#878787", fontWeight: 600 }}>Delivery Expected By</span>
            <span style={{ fontSize: 18, color: "#212121", fontWeight: 600 }}>
              {formatDate(deliveryStart)} - {formatDate(deliveryEnd)}
            </span>
          </div>
        </div>

        {/* Order Details Preview */}
        <div style={{
          backgroundColor: "#fff",
          borderRadius: "var(--radius-sm)",
          padding: "24px",
          boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
          marginBottom: 16,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center"
        }}>
          <div>
            <p style={{ fontSize: 13, color: "#878787", marginBottom: 4 }}>Order Number</p>
            <p style={{ fontSize: 16, color: "#212121", fontWeight: 500 }}>{orderNumber || "Processing..."}</p>
          </div>
          <Link href="/account/orders" style={{ fontSize: 14, color: "var(--color-gold)", fontWeight: 600, textDecoration: "none" }}>
            Track Order &rarr;
          </Link>
        </div>

        {/* Scratch Card Offer */}
        <div style={{
          backgroundColor: "#fff",
          borderRadius: "var(--radius-sm)",
          padding: "32px 24px",
          boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
          textAlign: "center",
          marginBottom: 24
        }}>
          <h2 style={{ fontSize: 18, fontWeight: 500, color: "#212121", marginBottom: 16 }}>A small gift for you! 🎁</h2>
          <ScratchCard code="ORDERAGAIN" />
        </div>

        {/* Actions */}
        <div style={{ display: "flex", justifyContent: "center" }}>
          <Link href="/shop" style={{ 
            backgroundColor: "#2874F0", 
            color: "#fff", 
            padding: "12px 32px", 
            borderRadius: "4px",
            fontSize: 16, 
            fontWeight: 500,
            textDecoration: "none",
            boxShadow: "0 1px 2px 0 rgba(0,0,0,.2)"
          }}>
            Continue Shopping
          </Link>
        </div>

      </div>
    </div>
  );
}

export default function OrderSuccessPage() {
  return (
    <Suspense fallback={<div style={{ minHeight: "70vh", display: "flex", alignItems: "center", justifyContent: "center" }}><div style={{ fontFamily: "var(--font-display)", fontSize: 20, color: "var(--color-gold)" }}>Loading...</div></div>}>
      <SuccessContent />
    </Suspense>
  );
}
