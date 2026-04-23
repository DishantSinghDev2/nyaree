"use client";
// app/(store)/checkout/page.tsx
import { trackEvent } from "@/hooks/useAnalytics";
import { useState, useEffect, useRef } from "react";
import { useCartStore } from "@/lib/store/cart";
import { useRouter } from "next/navigation";
import { showToast } from "@/components/ui/Toaster";
import Image from "next/image";
import dynamic from "next/dynamic";

const MapPicker = dynamic(() => import("@/components/MapPicker"), { 
  ssr: false, 
  loading: () => <div className="skeleton" style={{ height: 250, width: "100%", borderRadius: "var(--radius-sm)", marginBottom: 12 }} /> 
});

const INDIA_STATES = ["Andhra Pradesh","Arunachal Pradesh","Assam","Bihar","Chhattisgarh","Goa","Gujarat","Haryana","Himachal Pradesh","Jharkhand","Karnataka","Kerala","Madhya Pradesh","Maharashtra","Manipur","Meghalaya","Mizoram","Nagaland","Odisha","Punjab","Rajasthan","Sikkim","Tamil Nadu","Telangana","Tripura","Uttar Pradesh","Uttarakhand","West Bengal","Delhi","Chandigarh","Jammu & Kashmir","Ladakh","Puducherry","Lakshadweep","Andaman & Nicobar","Dadra & Nagar Haveli","Daman & Diu"];

export default function CheckoutPage() {
  const { items, subtotal, clearCart } = useCartStore();
  const router = useRouter();

  const [isSuccess, setIsSuccess] = useState(false);

  // Redirect to cart if empty
  useEffect(() => {
    if (items.length === 0 && !isSuccess) router.replace("/cart");
  }, [items.length, router, isSuccess]);

  // Track checkout start once on mount
  useEffect(() => {
    if (items.length > 0) {
      trackEvent("checkout_start", { itemCount: items.length });
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (document.querySelector('script[src*="razorpay"]')) return;
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    document.body.appendChild(script);
    return () => { script.remove(); };
  }, []);
  const [step, setStep] = useState<"address" | "payment">("address");
  const [loading, setLoading] = useState(false);
  const [couponCode, setCouponCode] = useState("");
  const [couponApplied, setCouponApplied] = useState<any>(null);
  const [couponLoading, setCouponLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<"cod" | "razorpay">("cod");

  const addressFired = useRef(false);
  const paymentFired = useRef(false);

  const trackAddressOnce = () => {
    if (!addressFired.current) {
      trackEvent("checkout_address");
      addressFired.current = true;
    }
  };

  const trackPaymentOnce = () => {
    if (!paymentFired.current) {
      trackEvent("checkout_payment");
      paymentFired.current = true;
    }
  };

  const [address, setAddress] = useState({
    fullName: "", phone: "", email: "",
    addressLine1: "", addressLine2: "", city: "", state: "Haryana", pincode: "",
  });

  useEffect(() => {
    if (!addressFired.current && (address.fullName || address.phone || address.email || address.addressLine1 || address.pincode)) {
      trackEvent("checkout_address");
      addressFired.current = true;
    }
  }, [address.fullName, address.phone, address.email, address.addressLine1, address.pincode]);

  const sub = subtotal();
  const FREE_SHIPPING = 49900;
  const discount = couponApplied
    ? couponApplied.type === "percent" ? Math.round(sub * couponApplied.value / 100)
    : couponApplied.type === "fixed" ? couponApplied.value : 0
    : 0;
  const afterDiscount = sub - discount;
  const prepaidDiscount = paymentMethod === "razorpay" ? Math.round(afterDiscount * 5 / 100) : 0;
  const afterPrepaid = afterDiscount - prepaidDiscount;
  const shipping = couponApplied?.type === "free_shipping" || afterPrepaid >= FREE_SHIPPING ? 0 : 4900;
  const gst = Math.round(afterPrepaid * 5 / 105);
  const total = afterPrepaid + shipping;
  const fmt = (p: number) => `₹${(p / 100).toLocaleString("en-IN")}`;

  useEffect(() => {
    if (items.length === 0 && !isSuccess) router.push("/cart");
  }, [items, router, isSuccess]);

  const handlePincodeBlur = async () => {
    if (address.pincode.length !== 6) return;
    try {
      const res = await fetch(`https://api.postalpincode.in/pincode/${address.pincode}`);
      const data = await res.json();
      if (data[0]?.Status === "Success") {
        const po = data[0].PostOffice[0];
        setAddress((a) => ({ ...a, city: po.District, state: po.State }));
      }
    } catch {}
  };

  const applyCoupon = async () => {
    if (!couponCode.trim()) return;
    setCouponLoading(true);
    try {
      const res = await fetch("/api/coupons/validate", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ code: couponCode, subtotal: sub }) });
      const data = await res.json();
      if (data.success) { setCouponApplied(data.data); showToast("Coupon applied! 🎉", "success"); }
      else showToast(data.error || "Invalid coupon", "error");
    } finally { setCouponLoading(false); }
  };

  const placeOrder = async () => {
    trackPaymentOnce();
    
    // Validate address
    const required = ["fullName", "phone", "email", "addressLine1", "city", "state", "pincode"] as const;
    for (const field of required) {
      if (!address[field]) { showToast(`Please fill in ${field.replace(/([A-Z])/g, " $1").toLowerCase()}`, "error"); return; }
    }
    if (!/^\d{10}$/.test(address.phone)) { showToast("Enter a valid 10-digit phone number", "error"); return; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(address.email)) { showToast("Enter a valid email address", "error"); return; }
    if (!/^\d{6}$/.test(address.pincode)) { showToast("Enter a valid 6-digit pincode", "error"); return; }

    setLoading(true);
    try {
      if (paymentMethod === "cod") {
        const res = await fetch("/api/orders", {
          method: "POST", headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ items, shippingAddress: address, pricing: { subtotal: sub, discount, prepaidDiscount, shipping, gst, total }, payment: { method: "cod" }, couponCode: couponApplied?.code }),
        });
        const data = await res.json();
        if (data.success) { 
          trackEvent("order_placed", { orderId: data.data.orderNumber, total, method: "cod" });
          setIsSuccess(true); 
          clearCart(); 
          router.push(`/checkout/success?order=${data.data.orderNumber}`); 
        }
        else showToast(data.error || "Order failed", "error");
      } else {
        // Razorpay
        const createRes = await fetch("/api/payment/create-order", {
          method: "POST", headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ amount: total, items, shippingAddress: address, pricing: { subtotal: sub, discount, prepaidDiscount, shipping, gst, total }, couponCode: couponApplied?.code }),
        });
        const resJson = await createRes.json();
        
        if (!resJson.success || !resJson.data?.key) {
          showToast(resJson.error || "Payment configuration error. Please contact support.", "error");
          setLoading(false);
          return;
        }
        
        const rzpOrder = resJson.data;

        const options = {
          key: rzpOrder.key,
          amount: total, currency: "INR",
          name: "Nyaree", description: "Fashion Order",
          order_id: rzpOrder.razorpayOrderId,
          prefill: { name: address.fullName, email: address.email, contact: `+91${address.phone}` },
          theme: { color: "#C8960C" },
          handler: async (response: any) => {
            const verifyRes = await fetch("/api/payment/verify", {
              method: "POST", headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ ...response, internalOrderId: rzpOrder.orderId }),
            });
            const verifyData = await verifyRes.json();
            if (verifyData.success) { 
              trackEvent("order_placed", { orderId: verifyData.data.orderNumber, total, method: "razorpay" });
              setIsSuccess(true); 
              clearCart(); 
              router.push(`/checkout/success?order=${verifyData.data.orderNumber}`); 
            }
            else showToast("Payment verification failed. Contact support.", "error");
          },
        };
        const Razorpay = (window as any).Razorpay;
        if (!Razorpay) { showToast("Payment gateway not loaded. Please refresh.", "error"); return; }
        new Razorpay(options).open();
      }
    } catch { showToast("Something went wrong. Please try again.", "error"); }
    finally { setLoading(false); }
  };

  if (items.length === 0) return null;

  return (
    <>
      <div className="container checkout-grid" style={{ padding: "40px 0 80px" }}>

        {/* Left: Form */}
        <div>
          <h1 style={{ fontFamily: "var(--font-display)", fontSize: 32, marginBottom: 32 }}>Checkout</h1>

          {/* Contact */}
          <section style={{ marginBottom: 32 }}>
            <h2 style={{ fontFamily: "var(--font-display)", fontSize: 20, marginBottom: 20 }}>Contact</h2>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <div style={{ gridColumn: "1/-1" }}>
                <label className="label">Email Address *</label>
                <input className="input" type="email" value={address.email} onChange={(e) => setAddress((a) => ({ ...a, email: e.target.value }))} placeholder="you@example.com" />
              </div>
              <div>
                <label className="label">Full Name *</label>
                <input className="input" value={address.fullName} onChange={(e) => setAddress((a) => ({ ...a, fullName: e.target.value }))} placeholder="Priya Sharma" />
              </div>
              <div>
                <label className="label">Phone Number *</label>
                <div style={{ display: "flex" }}>
                  <span style={{ padding: "12px 12px", background: "var(--color-ivory-dark)", border: "1px solid var(--color-border)", borderRight: "none", borderRadius: "var(--radius-sm) 0 0 var(--radius-sm)", fontSize: 14, color: "var(--color-ink-light)" }}>+91</span>
                  <input className="input" value={address.phone} onChange={(e) => setAddress((a) => ({ ...a, phone: e.target.value.replace(/\D/g, "").slice(0, 10) }))} placeholder="9876543210" style={{ borderRadius: "0 var(--radius-sm) var(--radius-sm) 0" }} />
                </div>
              </div>
            </div>
          </section>

          {/* Shipping Address */}
          <section style={{ marginBottom: 32 }}>
            <h2 style={{ fontFamily: "var(--font-display)", fontSize: 20, marginBottom: 20 }}>Delivery Address</h2>
            
            <div style={{ marginBottom: 20 }}>
              <MapPicker onLocationSelect={(loc) => {
                setAddress(a => ({
                  ...a,
                  addressLine1: loc.address || a.addressLine1,
                  city: loc.city || a.city,
                  state: loc.state || a.state,
                  pincode: loc.pincode || a.pincode,
                }));
              }} />
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <div style={{ gridColumn: "1/-1" }}>
                <label className="label">Address Line 1 *</label>
                <input className="input" value={address.addressLine1} onChange={(e) => setAddress((a) => ({ ...a, addressLine1: e.target.value }))} placeholder="House/Flat No, Street, Area" />
              </div>
              <div style={{ gridColumn: "1/-1" }}>
                <label className="label">Address Line 2 (optional)</label>
                <input className="input" value={address.addressLine2} onChange={(e) => setAddress((a) => ({ ...a, addressLine2: e.target.value }))} placeholder="Landmark, Colony" />
              </div>
              <div>
                <label className="label">Pincode *</label>
                <input className="input" value={address.pincode} onChange={(e) => setAddress((a) => ({ ...a, pincode: e.target.value.replace(/\D/g, "").slice(0, 6) }))} onBlur={handlePincodeBlur} placeholder="110001" maxLength={6} />
              </div>
              <div>
                <label className="label">City *</label>
                <input className="input" value={address.city} onChange={(e) => setAddress((a) => ({ ...a, city: e.target.value }))} placeholder="New Delhi" />
              </div>
              <div style={{ gridColumn: "1/-1" }}>
                <label className="label">State *</label>
                <select className="input" value={address.state} onChange={(e) => setAddress((a) => ({ ...a, state: e.target.value }))}>
                  {INDIA_STATES.map((s) => <option key={s}>{s}</option>)}
                </select>
              </div>
            </div>
          </section>

          {/* Payment Method */}
          <section style={{ marginBottom: 32 }}>
            <h2 style={{ fontFamily: "var(--font-display)", fontSize: 20, marginBottom: 20 }}>Payment Method</h2>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {/* COD - shown FIRST as per requirement */}
              <label style={{
                display: "flex", alignItems: "flex-start", gap: 12, padding: 16,
                border: `2px solid ${paymentMethod === "cod" ? "var(--color-ink)" : "var(--color-border)"}`,
                borderRadius: "var(--radius-sm)", cursor: "pointer",
                background: paymentMethod === "cod" ? "var(--color-ivory-dark)" : "transparent",
              }}>
                <input type="radio" name="payment" value="cod" checked={paymentMethod === "cod"} onChange={() => { setPaymentMethod("cod"); trackPaymentOnce(); }} style={{ marginTop: 2 }} />
                <div>
                  <p style={{ fontWeight: 500, fontSize: 14, marginBottom: 2 }}>💵 Cash on Delivery</p>
                  <p style={{ fontSize: 12, color: "var(--color-ink-light)" }}>Pay when your order arrives. Available across India.</p>
                </div>
              </label>

              {/* Prepaid */}
              <label style={{
                display: "flex", alignItems: "flex-start", gap: 12, padding: 16,
                border: `2px solid ${paymentMethod === "razorpay" ? "var(--color-gold)" : "var(--color-border)"}`,
                borderRadius: "var(--radius-sm)", cursor: "pointer",
                background: paymentMethod === "razorpay" ? "#FEF9EC" : "transparent",
              }}>
                <input type="radio" name="payment" value="razorpay" checked={paymentMethod === "razorpay"} onChange={() => { setPaymentMethod("razorpay"); trackPaymentOnce(); }} style={{ marginTop: 2 }} />
                <div>
                  <p style={{ fontWeight: 500, fontSize: 14, marginBottom: 2 }}>
                    💳 Online Payment (UPI, Card, Netbanking)
                    <span style={{ marginLeft: 8, background: "var(--color-gold)", color: "#fff", fontSize: 10, padding: "2px 8px", borderRadius: "var(--radius-pill)" }}>SAVE 5%</span>
                  </p>
                  <p style={{ fontSize: 12, color: "var(--color-ink-light)" }}>Pay securely via Razorpay. Get 5% instant discount on prepaid orders.</p>
                  <div style={{ display: "flex", gap: 6, marginTop: 8, flexWrap: "wrap" }}>
                    {["UPI", "PhonePe", "GPay", "Paytm", "Visa", "Mastercard", "Netbanking", "EMI"].map((m) => (
                      <span key={m} style={{ fontSize: 10, background: "var(--color-ivory-dark)", border: "1px solid var(--color-border)", padding: "2px 7px", borderRadius: 2 }}>{m}</span>
                    ))}
                  </div>
                </div>
              </label>
            </div>
          </section>

          <button
            className={`btn btn-primary btn-full btn-lg ${loading ? "btn-loading" : ""}`}
            onClick={placeOrder}
            disabled={loading}
          >
            {loading ? "Processing..." : paymentMethod === "cod" ? `Place Order — ${fmt(total)}` : `Pay Securely — ${fmt(total)}`}
          </button>
          <p style={{ fontSize: 11, color: "var(--color-ink-light)", textAlign: "center", marginTop: 12 }}>
            By placing this order, you agree to our <a href="/legal/terms" style={{ color: "var(--color-gold)" }}>Terms of Service</a> and <a href="/legal/privacy-policy" style={{ color: "var(--color-gold)" }}>Privacy Policy</a>.
          </p>
        </div>

        {/* Right: Order summary */}
        <div style={{ position: "sticky", top: 80 }}>
          <div className="card" style={{ padding: 24 }}>
            <h2 style={{ fontFamily: "var(--font-display)", fontSize: 20, marginBottom: 20 }}>Order Summary</h2>

            {/* Items */}
            <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 20 }}>
              {items.map((item) => (
                <div key={`${item.productId}-${item.variantId}`} style={{ display: "flex", gap: 12, alignItems: "center" }}>
                  <div style={{ width: 56, height: 72, position: "relative", background: "var(--color-ivory-dark)", borderRadius: "var(--radius-sm)", overflow: "hidden", flexShrink: 0 }}>
                    {item.image && <Image src={item.image} alt={item.name} fill style={{ objectFit: "cover" }}
              sizes="(max-width: 860px) 100vw, 50vw"
            />}
                    <span style={{ position: "absolute", top: 0, right: 0, background: "var(--color-ink)", color: "#fff", fontSize: 10, width: 18, height: 18, display: "flex", alignItems: "center", justifyContent: "center", borderRadius: "0 0 0 4px" }}>{item.quantity}</span>
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontSize: 13, color: "var(--color-ink)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{item.name}</p>
                    <p style={{ fontSize: 11, color: "var(--color-ink-light)" }}>{item.size} · {item.color}</p>
                  </div>
                  <p className="price" style={{ fontSize: 13, flexShrink: 0 }}>{fmt(item.price * item.quantity)}</p>
                </div>
              ))}
            </div>

            <hr className="divider" />

            {/* Coupon */}
            <div style={{ marginBottom: 16 }}>
              {couponApplied ? (
                <div style={{ background: "#E8F5E9", padding: "8px 12px", borderRadius: "var(--radius-sm)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontSize: 13, color: "var(--color-success)" }}>✓ {couponApplied.code} applied</span>
                  <button onClick={() => setCouponApplied(null)} style={{ fontSize: 12, background: "none", border: "none", color: "var(--color-ink-light)", textDecoration: "underline" }}>Remove</button>
                </div>
              ) : (
                <div style={{ display: "flex", gap: 8 }}>
                  <input className="input" value={couponCode} onChange={(e) => setCouponCode(e.target.value.toUpperCase())} placeholder="Coupon code" style={{ flex: 1 }} onKeyDown={(e) => e.key === "Enter" && applyCoupon()} />
                  <button className="btn btn-outline btn-sm" onClick={applyCoupon} disabled={couponLoading}>{couponLoading ? "..." : "Apply"}</button>
                </div>
              )}
            </div>

            {/* Pricing */}
            <div style={{ display: "flex", flexDirection: "column", gap: 8, fontSize: 13 }}>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: "var(--color-ink-light)" }}>Subtotal</span>
                <span>{fmt(sub)}</span>
              </div>
              {discount > 0 && (
                <div style={{ display: "flex", justifyContent: "space-between", color: "var(--color-success)" }}>
                  <span>Coupon Discount</span>
                  <span>−{fmt(discount)}</span>
                </div>
              )}
              {prepaidDiscount > 0 && (
                <div style={{ display: "flex", justifyContent: "space-between", color: "var(--color-gold)" }}>
                  <span>Prepaid Discount (5%)</span>
                  <span>−{fmt(prepaidDiscount)}</span>
                </div>
              )}
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: "var(--color-ink-light)" }}>Shipping</span>
                <span style={{ color: shipping === 0 ? "var(--color-success)" : "" }}>{shipping === 0 ? "FREE" : fmt(shipping)}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", color: "var(--color-ink-light)" }}>
                <span>GST (included)</span>
                <span>{fmt(gst)}</span>
              </div>
              <hr className="divider" style={{ margin: "4px 0" }} />
              <div style={{ display: "flex", justifyContent: "space-between", fontFamily: "var(--font-display)", fontSize: 18 }}>
                <span>Total</span>
                <span className="price">{fmt(total)}</span>
              </div>
            </div>

            <div style={{ marginTop: 16, padding: "10px 14px", background: "var(--color-ivory-dark)", borderRadius: "var(--radius-sm)", fontSize: 12, color: "var(--color-ink-light)" }}>
              🔒 Secured by Razorpay · 256-bit SSL encryption
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
