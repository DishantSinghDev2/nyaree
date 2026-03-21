"use client";
// app/(admin)/dashboard/discounts/page.tsx
import { useState, useEffect } from "react";
import { showToast } from "@/components/ui/Toaster";
import { nanoid } from "nanoid";

interface Discount {
  _id: string; code: string; type: string; value: number;
  minOrderAmount: number; usageCount: number; usageLimit: number;
  isActive: boolean; expiresAt?: string; startsAt: string;
}

export default function DiscountsPage() {
  const [discounts, setDiscounts] = useState<Discount[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    code: "", type: "percent", value: 10,
    minOrderAmount: 0, maxDiscount: 0, usageLimit: 0,
    perUserLimit: 1, isActive: true,
    applicableTo: "all", expiresAt: "", startsAt: "",
  });

  const load = () => {
    fetch("/api/discounts").then(r => r.json()).then(d => {
      if (d.success) setDiscounts(d.data);
    }).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const fmt = (p: number) => `₹${(p / 100).toLocaleString("en-IN")}`;
  const set = (k: string, v: any) => setForm(f => ({ ...f, [k]: v }));

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        ...form,
        value: form.type === "percent" ? form.value : form.value * 100,
        minOrderAmount: form.minOrderAmount * 100,
        maxDiscount: form.maxDiscount > 0 ? form.maxDiscount * 100 : undefined,
        code: form.code || nanoid(8).toUpperCase(),
        expiresAt: form.expiresAt || undefined,
        startsAt: form.startsAt || new Date().toISOString(),
      };
      const res = await fetch("/api/discounts", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (data.success) {
        showToast(`Coupon "${data.data.code}" created! 🎉`, "success");
        setShowForm(false);
        setForm({ code: "", type: "percent", value: 10, minOrderAmount: 0, maxDiscount: 0, usageLimit: 0, perUserLimit: 1, isActive: true, applicableTo: "all", expiresAt: "", startsAt: "" });
        load();
      } else { showToast(data.error || "Failed", "error"); }
    } finally { setSaving(false); }
  };

  const toggleActive = async (id: string, current: boolean) => {
    // For demo — would need a PATCH endpoint
    showToast("Toggle coming soon", "info");
  };

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 32 }}>
        <div>
          <h1 style={{ fontFamily: "var(--font-display)", fontSize: 26, fontWeight: 400 }}>Discounts & Coupons</h1>
          <p style={{ fontSize: 13, color: "var(--color-ink-light)", marginTop: 4 }}>Create and manage discount codes for your customers</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>
          {showForm ? "Cancel" : "+ Create Coupon"}
        </button>
      </div>

      {/* Create form */}
      {showForm && (
        <div className="card" style={{ padding: 28, marginBottom: 28, animation: "fadeInDown 0.2s ease" }}>
          <h2 style={{ fontFamily: "var(--font-display)", fontSize: 20, marginBottom: 24 }}>New Discount Code</h2>
          <form onSubmit={handleCreate}>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }}>
              <div>
                <label className="label">Coupon Code</label>
                <input className="input" value={form.code} onChange={e => set("code", e.target.value.toUpperCase())} placeholder="Auto-generated if empty" />
                <p style={{ fontSize: 11, color: "var(--color-ink-light)", marginTop: 3 }}>Leave blank to auto-generate</p>
              </div>
              <div>
                <label className="label">Discount Type</label>
                <select className="input" value={form.type} onChange={e => set("type", e.target.value)}>
                  <option value="percent">Percentage (%)</option>
                  <option value="fixed">Fixed Amount (₹)</option>
                  <option value="free_shipping">Free Shipping</option>
                </select>
              </div>
              {form.type !== "free_shipping" && (
                <div>
                  <label className="label">Value ({form.type === "percent" ? "%" : "₹"})</label>
                  <input className="input" type="number" min={1} max={form.type === "percent" ? 100 : undefined} value={form.value} onChange={e => set("value", parseFloat(e.target.value) || 0)} />
                </div>
              )}
              <div>
                <label className="label">Minimum Order (₹)</label>
                <input className="input" type="number" min={0} value={form.minOrderAmount} onChange={e => set("minOrderAmount", parseFloat(e.target.value) || 0)} placeholder="0 = no minimum" />
              </div>
              {form.type === "percent" && (
                <div>
                  <label className="label">Max Discount (₹)</label>
                  <input className="input" type="number" min={0} value={form.maxDiscount} onChange={e => set("maxDiscount", parseFloat(e.target.value) || 0)} placeholder="0 = no cap" />
                </div>
              )}
              <div>
                <label className="label">Total Usage Limit</label>
                <input className="input" type="number" min={0} value={form.usageLimit} onChange={e => set("usageLimit", parseInt(e.target.value) || 0)} placeholder="0 = unlimited" />
              </div>
              <div>
                <label className="label">Per Customer Limit</label>
                <input className="input" type="number" min={1} value={form.perUserLimit} onChange={e => set("perUserLimit", parseInt(e.target.value) || 1)} />
              </div>
              <div>
                <label className="label">Expires On (optional)</label>
                <input className="input" type="datetime-local" value={form.expiresAt} onChange={e => set("expiresAt", e.target.value)} />
              </div>
              <div>
                <label className="label">Starts On (optional)</label>
                <input className="input" type="datetime-local" value={form.startsAt} onChange={e => set("startsAt", e.target.value)} />
              </div>
            </div>

            {/* Preview */}
            <div style={{ marginTop: 20, background: "var(--color-ivory-dark)", padding: "14px 18px", borderRadius: "var(--radius-sm)", fontSize: 13 }}>
              <strong>Preview:</strong> Code <code style={{ background: "var(--color-surface)", padding: "1px 6px", borderRadius: 3 }}>{form.code || "XXXXXXXX"}</code> gives{" "}
              {form.type === "percent" ? `${form.value}% off` : form.type === "fixed" ? `₹${form.value} off` : "free shipping"}
              {form.minOrderAmount > 0 ? ` on orders above ₹${form.minOrderAmount}` : ""}
              {form.usageLimit > 0 ? `, max ${form.usageLimit} uses` : ""}
            </div>

            <div style={{ display: "flex", gap: 10, marginTop: 20 }}>
              <button type="submit" className={`btn btn-primary ${saving ? "btn-loading" : ""}`} disabled={saving}>
                {saving ? "Creating..." : "Create Coupon"}
              </button>
              <button type="button" className="btn btn-ghost" onClick={() => setShowForm(false)}>Cancel</button>
            </div>
          </form>
        </div>
      )}

      {/* Discount list */}
      {loading ? (
        <div className="skeleton" style={{ height: 200, borderRadius: "var(--radius-sm)" }} />
      ) : discounts.length === 0 ? (
        <div className="card" style={{ padding: 48, textAlign: "center" }}>
          <p style={{ fontSize: 36, marginBottom: 12 }}>🎫</p>
          <h2 style={{ fontFamily: "var(--font-display)", fontSize: 20, marginBottom: 8 }}>No coupons yet</h2>
          <p style={{ color: "var(--color-ink-light)", marginBottom: 20 }}>Create your first discount code to reward your customers</p>
          <button className="btn btn-primary" onClick={() => setShowForm(true)}>Create First Coupon</button>
        </div>
      ) : (
        <div className="card">
          <div className="table-wrap">
            <table>
              <thead>
                <tr><th>Code</th><th>Type</th><th>Value</th><th>Min Order</th><th>Used</th><th>Expires</th><th>Status</th></tr>
              </thead>
              <tbody>
                {discounts.map((d) => (
                  <tr key={d._id}>
                    <td>
                      <code style={{ background: "var(--color-ivory-dark)", padding: "3px 10px", borderRadius: 3, fontSize: 13, fontWeight: 600, letterSpacing: 1 }}>{d.code}</code>
                    </td>
                    <td style={{ fontSize: 13, textTransform: "capitalize" }}>{d.type.replace("_", " ")}</td>
                    <td className="price" style={{ fontSize: 13 }}>
                      {d.type === "percent" ? `${d.value}%` : d.type === "fixed" ? fmt(d.value) : "Free Ship"}
                    </td>
                    <td style={{ fontSize: 13 }}>{d.minOrderAmount > 0 ? fmt(d.minOrderAmount) : "—"}</td>
                    <td style={{ fontSize: 13 }}>
                      {d.usageCount} {d.usageLimit > 0 ? `/ ${d.usageLimit}` : ""}
                    </td>
                    <td style={{ fontSize: 12, color: "var(--color-ink-light)" }}>
                      {d.expiresAt ? new Date(d.expiresAt).toLocaleDateString("en-IN") : "Never"}
                    </td>
                    <td>
                      <span className={`status-pill ${d.isActive ? "status-delivered" : "status-cancelled"}`}>
                        {d.isActive ? "Active" : "Inactive"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Built-in discounts note */}
      <div style={{ marginTop: 24, padding: "16px 20px", background: "#FEF9EC", border: "1px solid var(--color-gold)", borderRadius: "var(--radius-sm)", fontSize: 13 }}>
        💡 <strong>Auto-applied discounts:</strong> 5% prepaid discount is automatically applied at checkout for all online payments. Configure it in <a href="/dashboard/settings" style={{ color: "var(--color-gold)" }}>Settings → Payments</a>.
      </div>
    </div>
  );
}
