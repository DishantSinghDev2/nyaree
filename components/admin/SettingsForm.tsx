"use client";
// components/admin/SettingsForm.tsx
import { useState, useEffect, useRef } from "react";
import { showToast } from "@/components/ui/Toaster";

const TABS = ["Store","Contact","Shipping","Payments","Notifications","Social","SEO","Advanced"] as const;
type Tab = typeof TABS[number];

export function SettingsForm() {
  const [tab, setTab] = useState<Tab>("Store");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState<Record<string, any>>({});
  const logoRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetch("/api/admin/settings")
      .then((r) => r.json())
      .then((d) => { if (d.success) setSettings(d.data); })
      .finally(() => setLoading(false));
  }, []);

  const set = (key: string, value: any) => setSettings((prev) => ({ ...prev, [key]: value }));

  const save = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/admin/settings", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(settings) });
      const data = await res.json();
      if (data.success) showToast("Settings saved! ✓", "success");
      else showToast(data.error || "Save failed", "error");
    } finally { setSaving(false); }
  };

  const uploadLogo = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const formData = new FormData();
    formData.append("file", file);
    formData.append("folder", "brand");
    const res = await fetch("/api/upload", { method: "POST", body: formData });
    const data = await res.json();
    if (data.success) { set("logoUrl", data.data.url); showToast("Logo uploaded!", "success"); }
  };

  if (loading) return <div className="skeleton" style={{ height: 400, borderRadius: "var(--radius-sm)" }} />;

  const field = (label: string, key: string, type: "text"|"email"|"tel"|"number"|"textarea"|"toggle" = "text", placeholder?: string, hint?: string) => (
    <div key={key}>
      <label className="label">{label}</label>
      {type === "textarea" ? (
        <textarea className="input" value={settings[key] ?? ""} onChange={(e) => set(key, e.target.value)} placeholder={placeholder} rows={3} />
      ) : type === "toggle" ? (
        <label style={{ display: "flex", alignItems: "center", gap: 12, cursor: "pointer" }}>
          <div onClick={() => set(key, !settings[key])} style={{ width: 44, height: 24, borderRadius: 12, background: settings[key] ? "var(--color-gold)" : "var(--color-border)", position: "relative", transition: "background 0.2s", flexShrink: 0 }}>
            <div style={{ position: "absolute", top: 4, left: settings[key] ? 23 : 4, width: 16, height: 16, borderRadius: "50%", background: "#fff", transition: "left 0.2s" }} />
          </div>
          <span style={{ fontSize: 14 }}>{settings[key] ? "Enabled" : "Disabled"}</span>
        </label>
      ) : (
        <input className="input" type={type} value={settings[key] ?? ""} onChange={(e) => set(key, type === "number" ? parseFloat(e.target.value) || 0 : e.target.value)} placeholder={placeholder} />
      )}
      {hint && <p style={{ fontSize: 11, color: "var(--color-ink-light)", marginTop: 4 }}>{hint}</p>}
    </div>
  );

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 32 }}>
        <div>
          <h1 style={{ fontFamily: "var(--font-display)", fontSize: 26, fontWeight: 400 }}>Settings</h1>
          <p style={{ fontSize: 13, color: "var(--color-ink-light)", marginTop: 4 }}>Configure your Nyaree store</p>
        </div>
        <button className={`btn btn-primary ${saving ? "btn-loading" : ""}`} onClick={save} disabled={saving}>
          {saving ? "Saving..." : "Save Changes"}
        </button>
      </div>

      {/* Tab nav */}
      <div style={{ display: "flex", gap: 0, borderBottom: "1px solid var(--color-border)", marginBottom: 32, overflowX: "auto" }}>
        {TABS.map((t) => (
          <button key={t} onClick={() => setTab(t)} style={{ padding: "10px 20px", background: "none", border: "none", borderBottom: tab === t ? "2px solid var(--color-gold)" : "2px solid transparent", color: tab === t ? "var(--color-gold)" : "var(--color-ink-light)", fontSize: 13, fontWeight: 500, cursor: "pointer", whiteSpace: "nowrap", flexShrink: 0 }}>
            {t}
          </button>
        ))}
      </div>

      <div style={{ maxWidth: 640, display: "flex", flexDirection: "column", gap: 24 }}>

        {/* STORE TAB */}
        {tab === "Store" && (
          <>
            <div className="card" style={{ padding: 24, display: "flex", flexDirection: "column", gap: 20 }}>
              <h2 style={{ fontFamily: "var(--font-display)", fontSize: 18 }}>Brand Identity</h2>

              {/* Logo */}
              <div>
                <label className="label">Store Logo</label>
                <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                  {settings.logoUrl ? (
                    <img src={settings.logoUrl} alt="Logo" style={{ height: 48, objectFit: "contain", borderRadius: "var(--radius-sm)", border: "1px solid var(--color-border)", padding: 4 }} />
                  ) : (
                    <div style={{ width: 100, height: 48, background: "var(--color-ivory-dark)", borderRadius: "var(--radius-sm)", border: "1px solid var(--color-border)", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "var(--font-display)", letterSpacing: 3, fontSize: 14 }}>NYAREE</div>
                  )}
                  <button className="btn btn-outline btn-sm" onClick={() => logoRef.current?.click()}>Upload Logo</button>
                  <input ref={logoRef} type="file" accept="image/*" onChange={uploadLogo} style={{ display: "none" }} />
                </div>
                <p style={{ fontSize: 11, color: "var(--color-ink-light)", marginTop: 6 }}>PNG or SVG recommended. Min 200×60px.</p>
              </div>

              {field("Store Name", "storeName", "text", "Nyaree")}
              {field("GST Number", "gstNumber", "text", "27XXXXX0000X1ZX")}
              {field("Announcement Bar Text", "announcementBar", "text", "Free shipping above ₹499 🎉")}
              {field("Announcement Bar", "announcementBarEnabled", "toggle")}
            </div>
          </>
        )}

        {/* CONTACT TAB */}
        {tab === "Contact" && (
          <div className="card" style={{ padding: 24, display: "flex", flexDirection: "column", gap: 20 }}>
            <h2 style={{ fontFamily: "var(--font-display)", fontSize: 18 }}>Contact & Address</h2>
            <div style={{ background: "#FEF9EC", border: "1px solid var(--color-gold)", borderRadius: "var(--radius-sm)", padding: "12px 16px", fontSize: 13 }}>
              ⭐ <strong>Store Email:</strong> All order confirmations, customer messages, and new order alerts will go to this email.
            </div>
            {field("Store Email (receives all notifications)", "storeEmail", "email", "hello@nyaree.in")}
            {field("Store Phone", "storePhone", "tel", "+91 8368989758")}
            {field("Store Address", "storeAddress", "textarea", "Parnala Extended Industrial Area, Bahadurgarh, Haryana, 124507")}
          </div>
        )}

        {/* SHIPPING TAB */}
        {tab === "Shipping" && (
          <div className="card" style={{ padding: 24, display: "flex", flexDirection: "column", gap: 20 }}>
            <h2 style={{ fontFamily: "var(--font-display)", fontSize: 18 }}>Shipping Settings</h2>
            {field("Free Shipping Threshold (₹)", "freeShippingThresholdRupees", "number", "499", "Orders above this amount get free shipping")}
            {field("Standard Shipping Price (₹)", "standardShippingPriceRupees", "number", "49")}
            {field("Express Shipping Enabled", "expressShippingEnabled", "toggle")}
            {settings.expressShippingEnabled && field("Express Shipping Price (₹)", "expressShippingPriceRupees", "number", "99")}
            {field("Return Policy (days)", "returnPolicyDays", "number", "7")}
          </div>
        )}

        {/* PAYMENTS TAB */}
        {tab === "Payments" && (
          <div className="card" style={{ padding: 24, display: "flex", flexDirection: "column", gap: 20 }}>
            <h2 style={{ fontFamily: "var(--font-display)", fontSize: 18 }}>Payment Options</h2>
            {field("Cash on Delivery (COD)", "codEnabled", "toggle")}
            {settings.codEnabled && field("COD Extra Charge (₹)", "codExtraChargeRupees", "number", "0", "Additional charge for COD orders (0 = no extra charge)")}
            {field("Prepaid Discount (%)", "prepaidDiscountPercent", "number", "5", "% discount given on online payments (UPI, Card, etc.)")}
          </div>
        )}

        {/* NOTIFICATIONS TAB */}
        {tab === "Notifications" && (
          <div className="card" style={{ padding: 24, display: "flex", flexDirection: "column", gap: 20 }}>
            <h2 style={{ fontFamily: "var(--font-display)", fontSize: 18 }}>Email Notifications</h2>
            {field("Low Stock Threshold", "lowStockThreshold", "number", "5", "Get alerted when product stock falls below this number")}
            {field("BCC on Order Emails", "orderEmailBcc", "email", "rishika@nyaree.in", "Copy of every order email sent to this address")}
            {field("Reviews Enabled", "reviewsEnabled", "toggle")}
            {field("Blog Enabled", "blogEnabled", "toggle")}
            {field("Social Proof Enabled", "socialProofEnabled", "toggle", undefined, "Show 'X people viewed this' on product pages")}
          </div>
        )}

        {/* SOCIAL TAB */}
        {tab === "Social" && (
          <div className="card" style={{ padding: 24, display: "flex", flexDirection: "column", gap: 20 }}>
            <h2 style={{ fontFamily: "var(--font-display)", fontSize: 18 }}>Social Media Links</h2>
            {field("Instagram Handle", "instagramHandle", "text", "@nyaree.in")}
            {field("Facebook URL", "facebookUrl", "text", "https://facebook.com/nyaree")}
            {field("YouTube URL", "youtubeUrl", "text", "https://youtube.com/@nyaree")}
            {field("Pinterest URL", "pinterestUrl", "text", "https://pinterest.com/nyaree")}
            {field("WhatsApp Number", "whatsappNumber", "tel", "+91 8368989758")}
            <hr className="divider" />
            <h3 style={{ fontFamily: "var(--font-display)", fontSize: 16 }}>Analytics Tracking</h3>
            {field("Google Analytics ID", "googleAnalyticsId", "text", "G-XXXXXXXXXX")}
            {field("Meta (Facebook) Pixel ID", "metaPixelId", "text", "123456789012345")}
          </div>
        )}

        {/* SEO TAB */}
        {tab === "SEO" && (
          <div className="card" style={{ padding: 24, display: "flex", flexDirection: "column", gap: 20 }}>
            <h2 style={{ fontFamily: "var(--font-display)", fontSize: 18 }}>SEO & Discoverability</h2>
            <div style={{ background: "var(--color-ivory-dark)", padding: 16, borderRadius: "var(--radius-sm)", fontSize: 13 }}>
              <p style={{ fontWeight: 500, marginBottom: 8 }}>🔍 Your sitemap is auto-generated at:</p>
              <code style={{ fontSize: 12, background: "var(--color-surface)", padding: "4px 8px", borderRadius: 3 }}>https://nyaree.in/sitemap.xml</code>
              <p style={{ marginTop: 8, color: "var(--color-ink-light)" }}>Submit this URL to Google Search Console for faster indexing.</p>
            </div>
            {field("Custom CSS (advanced)", "customCss", "textarea", "/* Add custom CSS here */")}
          </div>
        )}

        {/* ADVANCED TAB */}
        {tab === "Advanced" && (
          <div className="card" style={{ padding: 24, display: "flex", flexDirection: "column", gap: 20 }}>
            <h2 style={{ fontFamily: "var(--font-display)", fontSize: 18 }}>Advanced Settings</h2>
            {field("Maintenance Mode", "maintenanceMode", "toggle")}
            {settings.maintenanceMode && (
              <div style={{ background: "#FEE2E2", border: "1px solid var(--color-accent-red)", borderRadius: "var(--radius-sm)", padding: "12px 16px", fontSize: 13 }}>
                ⚠️ Store is in maintenance mode. Customers will see a coming-soon page.
              </div>
            )}
            {field("Auto New Arrival Duration (days)", "autoNewArrivalDays", "number", "30", "Products are shown as 'New Arrival' for this many days after upload")}
            <div style={{ borderTop: "1px solid var(--color-border)", paddingTop: 20 }}>
              <h3 style={{ fontFamily: "var(--font-display)", fontSize: 16, marginBottom: 12 }}>Developer Info</h3>
              <div style={{ background: "var(--color-ivory-dark)", padding: 16, borderRadius: "var(--radius-sm)", fontSize: 12 }}>
                <p>Platform: Nyaree v1.0 on Cloudflare Workers</p>
                <p style={{ marginTop: 4 }}>Developed by <a href="https://www.dishis.tech" target="_blank" rel="noopener noreferrer" style={{ color: "var(--color-gold)" }}>DishIs Technologies</a></p>
              </div>
            </div>
          </div>
        )}

        <div style={{ display: "flex", gap: 10 }}>
          <button className={`btn btn-primary ${saving ? "btn-loading" : ""}`} onClick={save} disabled={saving} style={{ flex: 1 }}>
            {saving ? "Saving..." : "Save All Settings"}
          </button>
        </div>
      </div>
    </div>
  );
}
