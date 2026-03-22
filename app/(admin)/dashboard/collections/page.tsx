"use client";
// app/(admin)/dashboard/collections/page.tsx
import { useState, useEffect, useRef } from "react";
import { showToast } from "@/components/ui/Toaster";
import Link from "next/link";
import Image from "next/image";

export default function CollectionsPage() {
  const [collections, setCollections] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const imgRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState({
    title: "", description: "", bannerImage: "", isActive: true, sortOrder: 0,
    seoTitle: "", seoDesc: "",
  });

  const load = () => {
    fetch("/api/collections").then(r => r.json()).then(d => {
      if (d.success) setCollections(d.data);
    }).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);
  const set = (k: string, v: any) => setForm(f => ({ ...f, [k]: v }));

  const uploadBanner = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; if (!file) return;
    const fd = new FormData(); fd.append("file", file); fd.append("folder", "collections");
    const res = await fetch("/api/upload", { method: "POST", body: fd });
    const d = await res.json();
    if (d.success) { set("bannerImage", d.data.url); showToast("Image uploaded!", "success"); }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title) { showToast("Title is required", "error"); return; }
    setSaving(true);
    try {
      const res = await fetch("/api/collections", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: form.title, description: form.description, bannerImage: form.bannerImage, isActive: form.isActive, sortOrder: form.sortOrder, seo: { title: form.seoTitle || form.title, description: form.seoDesc } }),
      });
      const data = await res.json();
      if (data.success) {
        showToast("Collection created! 🎉", "success");
        setShowForm(false);
        setForm({ title: "", description: "", bannerImage: "", isActive: true, sortOrder: 0, seoTitle: "", seoDesc: "" });
        load();
      } else { showToast(data.error || "Failed", "error"); }
    } finally { setSaving(false); }
  };

  const VIRTUAL = [
    { title: "New Arrivals", handle: "new-arrivals", icon: "✨" },
    { title: "Best Sellers", handle: "best-sellers", icon: "🏆" },
    { title: "Sale", handle: "sale", icon: "🔖" },
    { title: "Under ₹499", handle: "under-499", icon: "💛" },
    { title: "Festive Edit", handle: "festive-edit", icon: "🎉" },
    { title: "Summer Pastels", handle: "summer-pastels", icon: "🌸" },
  ];

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 32 }}>
        <div>
          <h1 style={{ fontFamily: "var(--font-display)", fontSize: 26, fontWeight: 400 }}>Collections</h1>
          <p style={{ fontSize: 13, color: "var(--color-ink-light)", marginTop: 4 }}>Curate product groups for your store</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>
          {showForm ? "Cancel" : "+ New Collection"}
        </button>
      </div>

      {/* Virtual collections info */}
      <div style={{ marginBottom: 24, padding: "16px 20px", background: "#EDE9FE", border: "1px solid #C4B5FD", borderRadius: "var(--radius-sm)", fontSize: 13 }}>
        🪄 <strong>Smart Collections</strong> — These are automatically populated and always available on your store:
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 10 }}>
          {VIRTUAL.map(v => (
            <Link key={v.handle} href={`/collections/${v.handle}`} target="_blank">
              <span style={{ background: "rgba(255,255,255,0.7)", padding: "4px 12px", borderRadius: "var(--radius-pill)", fontSize: 12, display: "inline-flex", alignItems: "center", gap: 4 }}>
                {v.icon} {v.title}
              </span>
            </Link>
          ))}
        </div>
      </div>

      {/* Create form */}
      {showForm && (
        <div className="card" style={{ padding: 28, marginBottom: 28, animation: "fadeInDown 0.2s ease" }}>
          <h2 style={{ fontFamily: "var(--font-display)", fontSize: 20, marginBottom: 20 }}>New Collection</h2>
          <form onSubmit={handleCreate} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
              <div>
                <label className="label">Collection Title *</label>
                <input className="input" value={form.title} onChange={e => set("title", e.target.value)} placeholder="e.g. Festive Edit 2025" required />
              </div>
              <div>
                <label className="label">Sort Order (lower = first)</label>
                <input className="input" type="number" value={form.sortOrder} onChange={e => set("sortOrder", parseInt(e.target.value) || 0)} />
              </div>
              <div style={{ gridColumn: "1/-1" }}>
                <label className="label">Description</label>
                <textarea className="input" value={form.description} onChange={e => set("description", e.target.value)} placeholder="Brief description shown on collection page..." rows={2} />
              </div>
            </div>

            {/* Banner image */}
            <div>
              <label className="label">Banner Image</label>
              {form.bannerImage ? (
                <div style={{ position: "relative", width: "100%", height: 160, borderRadius: "var(--radius-sm)", overflow: "hidden", marginBottom: 8 }}>
                  <Image src={form.bannerImage} alt="Banner" fill style={{ objectFit: "cover" }}
              sizes="(max-width: 860px) 100vw, 50vw"
            />
                  <button type="button" onClick={() => set("bannerImage", "")} style={{ position: "absolute", top: 8, right: 8, background: "rgba(0,0,0,0.6)", border: "none", color: "#fff", borderRadius: "50%", width: 28, height: 28 }}>×</button>
                </div>
              ) : (
                <div onClick={() => imgRef.current?.click()} style={{ border: "2px dashed var(--color-border)", borderRadius: "var(--radius-sm)", padding: "32px 0", textAlign: "center", cursor: "pointer" }}>
                  <p style={{ fontSize: 13, color: "var(--color-ink-light)" }}>Click to upload banner image</p>
                </div>
              )}
              <input ref={imgRef} type="file" accept="image/*" onChange={uploadBanner} style={{ display: "none" }} />
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div onClick={() => set("isActive", !form.isActive)} style={{ width: 44, height: 24, borderRadius: 12, background: form.isActive ? "var(--color-gold)" : "var(--color-border)", position: "relative", cursor: "pointer" }}>
                <div style={{ position: "absolute", top: 4, left: form.isActive ? 23 : 4, width: 16, height: 16, borderRadius: "50%", background: "#fff", transition: "left 0.2s" }} />
              </div>
              <span style={{ fontSize: 14 }}>Active (visible on store)</span>
            </div>

            <div style={{ display: "flex", gap: 10 }}>
              <button type="submit" className={`btn btn-primary ${saving ? "btn-loading" : ""}`} disabled={saving}>
                {saving ? "Creating..." : "Create Collection"}
              </button>
              <button type="button" className="btn btn-ghost" onClick={() => setShowForm(false)}>Cancel</button>
            </div>
          </form>
        </div>
      )}

      {/* Collections list */}
      {loading ? (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 16 }}>
          {[1,2,3].map(i => <div key={i} className="skeleton" style={{ height: 120, borderRadius: "var(--radius-sm)" }} />)}
        </div>
      ) : collections.length === 0 ? (
        <div className="card" style={{ padding: 48, textAlign: "center" }}>
          <p style={{ fontSize: 36, marginBottom: 12 }}>🗂️</p>
          <h2 style={{ fontFamily: "var(--font-display)", fontSize: 20, marginBottom: 8 }}>No custom collections yet</h2>
          <p style={{ color: "var(--color-ink-light)", marginBottom: 20 }}>The smart collections above are always live. Create custom ones to group products by theme.</p>
          <button className="btn btn-primary" onClick={() => setShowForm(true)}>Create Collection</button>
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px,1fr))", gap: 16 }}>
          {collections.map((c) => (
            <div key={c._id} className="card" style={{ overflow: "hidden" }}>
              {c.bannerImage && (
                <div style={{ height: 120, position: "relative" }}>
                  <Image src={c.bannerImage} alt={c.title} fill style={{ objectFit: "cover" }}
              sizes="(max-width: 860px) 100vw, 50vw"
            />
                </div>
              )}
              <div style={{ padding: "16px 18px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <h3 style={{ fontFamily: "var(--font-display)", fontSize: 17 }}>{c.title}</h3>
                  <span className={`status-pill ${c.isActive ? "status-delivered" : "status-cancelled"}`} style={{ flexShrink: 0 }}>
                    {c.isActive ? "Active" : "Hidden"}
                  </span>
                </div>
                {c.description && <p style={{ fontSize: 12, color: "var(--color-ink-light)", marginTop: 4 }}>{c.description}</p>}
                <div style={{ display: "flex", gap: 10, marginTop: 12 }}>
                  <Link href={`/collections/${c.handle}`} target="_blank" style={{ fontSize: 12, color: "var(--color-gold)", textDecoration: "none" }}>View →</Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
