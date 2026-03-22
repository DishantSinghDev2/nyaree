"use client";
// components/admin/ProductForm.tsx — Full product add/edit form
import { useState, useRef } from "react";
import Image from "next/image";
import { showToast } from "@/components/ui/Toaster";
import { useRouter } from "next/navigation";
import { nanoid } from "nanoid";

interface Variant { id: string; size: string; color: string; colorHex: string; stock: number; price: number; compareAtPrice: number; costPrice: number; weight: number; }
interface ProductImg { url: string; publicId: string; alt: string; position: number; isHero: boolean; }

const SIZES = ["XS","S","M","L","XL","XXL","3XL","Free Size","Custom"];
const OCCASIONS = ["Casual","Festive","Office","Party","Wedding","Daily Wear","College","Lounge"];
const FABRICS = ["Pure Cotton","Cotton Blend","Rayon","Georgette","Silk","Chiffon","Linen","Crepe","Polyester","Modal","Viscose","Custom"];
const PATTERNS = ["Solid","Printed","Floral","Geometric","Abstract","Striped","Checked","Bandhani","Tie-Dye","Embroidered","Custom"];

export function ProductForm({ initial }: { initial?: any }) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [tab, setTab] = useState<"basic"|"pricing"|"images"|"seo"|"advanced">("basic");

  // Form state
  const [name, setName] = useState(initial?.name ?? "");
  const [category, setCategory] = useState(initial?.category ?? "kurti");
  const [subcategory, setSubcategory] = useState(initial?.subcategory ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [shortDescription, setShortDescription] = useState(initial?.shortDescription ?? "");
  const [fabric, setFabric] = useState(initial?.fabric ?? "");
  const [occasion, setOccasion] = useState<string[]>(initial?.occasion ?? []);
  const [pattern, setPattern] = useState(initial?.pattern ?? "");
  const [fit, setFit] = useState(initial?.fit ?? "Regular");
  const [workType, setWorkType] = useState(initial?.workType ?? "");
  const [careInstructions, setCareInstructions] = useState<string[]>(initial?.careInstructions ?? ["Machine wash cold","Do not bleach","Iron on medium heat"]);
  const [tags, setTags] = useState<string[]>(initial?.tags ?? []);
  const [tagInput, setTagInput] = useState("");
  const [allowCustomization, setAllowCustomization] = useState(initial?.allowCustomization ?? false);
  const [customizationNote, setCustomizationNote] = useState(initial?.customizationNote ?? "");
  const [leadTimeDays, setLeadTimeDays] = useState(initial?.leadTimeDays ?? 0);
  const [isActive, setIsActive] = useState(initial?.isActive ?? false);
  const [isFeatured, setIsFeatured] = useState(initial?.isFeatured ?? false);
  const [isNewArrival, setIsNewArrival] = useState(initial?.isNewArrival ?? true);
  const [isBestSeller, setIsBestSeller] = useState(initial?.isBestSeller ?? false);
  const [isCustomOrder, setIsCustomOrder] = useState(initial?.isCustomOrder ?? false);
  const [images, setImages] = useState<ProductImg[]>(initial?.images ?? []);
  const [videos, setVideos] = useState<any[]>(initial?.videos ?? []);
  const [videoUploading, setVideoUploading] = useState(false);
  const [dragOverIdx, setDragOverIdx] = useState<number | null>(null);
  const [dragIdx, setDragIdx] = useState<number | null>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);
  const [variants, setVariants] = useState<Variant[]>(
    initial?.variants ?? [{ id: nanoid(6), size: "M", color: "Black", colorHex: "#000000", stock: 10, price: 49900, compareAtPrice: 0, costPrice: 0, weight: 200 }]
  );
  const [seoTitle, setSeoTitle] = useState(initial?.seo?.title ?? "");
  const [seoDesc, setSeoDesc] = useState(initial?.seo?.description ?? "");
  const [seoKeywords, setSeoKeywords] = useState<string[]>(initial?.seo?.keywords ?? []);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fmt = (p: number) => `₹${(p / 100).toLocaleString("en-IN")}`;
  const profitMargin = (v: Variant) => v.costPrice > 0 ? Math.round(((v.price - v.costPrice) / v.price) * 100) : null;

  // Upload image
  const uploadImage = async (file: File): Promise<ProductImg | null> => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("folder", "products");
    const res = await fetch("/api/upload", { method: "POST", body: formData });
    const data = await res.json();
    if (!data.success) return null;
    return { url: data.data.url, publicId: data.data.publicId, alt: name || file.name, position: images.length, isHero: images.length === 0 };
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    if (!files.length) return;
    setSaving(true);
    const uploaded = await Promise.all(files.map(uploadImage));
    const valid = uploaded.filter(Boolean) as ProductImg[];
    setImages((prev) => [...prev, ...valid]);
    setSaving(false);
    showToast(`${valid.length} image${valid.length !== 1 ? "s" : ""} uploaded`, "success");
  };

  const generateDescription = async () => {
    if (!name) { showToast("Enter a product name first", "error"); return; }
    setAiLoading(true);
    try {
      const res = await fetch("/api/ai/generate-description", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, category, fabric, color: variants[0]?.color ?? "", pattern, occasion, fit, price: variants[0]?.price ?? 0 }),
      });
      const data = await res.json();
      if (data.success) { setDescription(data.data.description); showToast("Description generated!", "success"); }
    } finally { setAiLoading(false); }
  };

  const generateSEO = async () => {
    if (!name) { showToast("Enter a product name first", "error"); return; }
    setAiLoading(true);
    try {
      const res = await fetch("/api/ai/generate-description", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, category, price: variants[0]?.price ?? 0, description: description.slice(0, 200) }),
      });
      const data = await res.json();
      if (data.success?.seoTitle) { setSeoTitle(data.data.title); setSeoDesc(data.data.description); setSeoKeywords(data.data.keywords); showToast("SEO generated!", "success"); }
    } finally { setAiLoading(false); }
  };

  const addVariant = () => {
    setVariants((prev) => [...prev, { id: nanoid(6), size: "M", color: "New Color", colorHex: "#888888", stock: 5, price: 49900, compareAtPrice: 0, costPrice: 0, weight: 200 }]);
  };

  const updateVariant = (id: string, field: keyof Variant, value: any) => {
    setVariants((prev) => prev.map((v) => v.id === id ? { ...v, [field]: value } : v));
  };

  const handleSave = async (active = isActive) => {
    if (!name.trim()) { showToast("Product name is required", "error"); return; }
    if (variants.length === 0) { showToast("Add at least one variant", "error"); return; }
    setSaving(true);
    try {
      const payload = {
        name, category, subcategory, description, shortDescription, fabric, occasion, pattern, fit, workType,
        careInstructions, tags, allowCustomization, customizationNote, leadTimeDays,
        isActive: active, isFeatured, isNewArrival, isBestSeller, isCustomOrder,
        images: images.map((img, i) => ({ ...img, position: i })),
        videos,
        variants,
        seo: { title: seoTitle, description: seoDesc, keywords: seoKeywords, ogImage: images.find((i) => i.isHero)?.url ?? "" },
      };
      const res = await fetch(initial?._id ? `/api/products/${initial._id}` : "/api/products", {
        method: initial?._id ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (data.success) {
        showToast(active ? "Product published! 🎉" : "Draft saved", "success");
        setTimeout(() => router.push("/dashboard/products"), 800);
      } else {
        showToast(data.error || "Failed to save", "error");
      }
    } finally { setSaving(false); }
  };

  const TABS = [
    { id: "basic", label: "Basic Info" }, { id: "pricing", label: "Variants & Pricing" },
    { id: "images", label: "Images" }, { id: "seo", label: "SEO" }, { id: "advanced", label: "Advanced" },
  ];

  return (
    <div>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 32 }}>
        <div>
          <h1 style={{ fontFamily: "var(--font-display)", fontSize: 26, fontWeight: 400 }}>
            {initial ? "Edit Product" : "Add New Product"}
          </h1>
          {name && <p style={{ fontSize: 13, color: "var(--color-ink-light)", marginTop: 4 }}>{name}</p>}
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <button className="btn btn-outline btn-sm" onClick={() => handleSave(false)} disabled={saving}>Save Draft</button>
          <button className={`btn btn-primary btn-sm ${saving ? "btn-loading" : ""}`} onClick={() => handleSave(true)} disabled={saving}>
            {saving ? "Saving..." : initial?.isActive ? "Update" : "Publish Product"}
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", gap: 0, borderBottom: "1px solid var(--color-border)", marginBottom: 32 }}>
        {TABS.map((t) => (
          <button key={t.id} onClick={() => setTab(t.id as any)} style={{
            padding: "10px 20px", background: "none", border: "none",
            borderBottom: tab === t.id ? "2px solid var(--color-gold)" : "2px solid transparent",
            color: tab === t.id ? "var(--color-gold)" : "var(--color-ink-light)",
            fontSize: 13, fontWeight: 500, cursor: "pointer", transition: "all 0.15s",
          }}>{t.label}</button>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 320px", gap: 32 }}>
        {/* Main content */}
        <div>

          {/* BASIC INFO TAB */}
          {tab === "basic" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
              <div>
                <label className="label">Product Name *</label>
                <input className="input" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Ananya Floral Print Kurti" style={{ fontSize: 16 }} />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                <div>
                  <label className="label">Category *</label>
                  <select className="input" value={category} onChange={(e) => setCategory(e.target.value)}>
                    <option value="kurti">Kurti</option>
                    <option value="top">Top</option>
                    <option value="coord-set">Co-ord Set</option>
                    <option value="dupatta">Dupatta</option>
                    <option value="lehenga">Lehenga</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="label">Subcategory</label>
                  <input className="input" value={subcategory} onChange={(e) => setSubcategory(e.target.value)} placeholder="e.g. Printed Kurti, Crop Top" />
                </div>
              </div>

              <div>
                <label className="label">Short Description (shown in cards)</label>
                <textarea className="input" value={shortDescription} onChange={(e) => setShortDescription(e.target.value)} placeholder="1-2 sentences about this product..." rows={2} />
              </div>

              <div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                  <label className="label" style={{ marginBottom: 0 }}>Full Description</label>
                  <button className={`btn btn-outline btn-sm ${aiLoading ? "btn-loading" : ""}`} onClick={generateDescription} disabled={aiLoading} style={{ fontSize: 11 }}>
                    ✨ Generate with AI
                  </button>
                </div>
                <textarea className="input" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Detailed product description..." rows={8} style={{ fontFamily: "var(--font-body)" }} />
                <p style={{ fontSize: 11, color: "var(--color-ink-light)", marginTop: 4 }}>Supports HTML. Use AI to generate a professional description.</p>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16 }}>
                <div>
                  <label className="label">Fabric</label>
                  <select className="input" value={fabric} onChange={(e) => setFabric(e.target.value)}>
                    <option value="">Select fabric</option>
                    {FABRICS.map((f) => <option key={f} value={f}>{f}</option>)}
                  </select>
                </div>
                <div>
                  <label className="label">Pattern</label>
                  <select className="input" value={pattern} onChange={(e) => setPattern(e.target.value)}>
                    <option value="">Select pattern</option>
                    {PATTERNS.map((p) => <option key={p} value={p}>{p}</option>)}
                  </select>
                </div>
                <div>
                  <label className="label">Fit</label>
                  <select className="input" value={fit} onChange={(e) => setFit(e.target.value)}>
                    {["Regular","Slim","Relaxed","A-Line","Straight","Flared","Oversized"].map((f) => <option key={f}>{f}</option>)}
                  </select>
                </div>
              </div>

              <div>
                <label className="label">Occasion (select all that apply)</label>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  {OCCASIONS.map((o) => (
                    <button key={o} type="button" onClick={() => setOccasion((prev) => prev.includes(o) ? prev.filter((x) => x !== o) : [...prev, o])} style={{ padding: "6px 14px", borderRadius: "var(--radius-pill)", border: `1px solid ${occasion.includes(o) ? "var(--color-gold)" : "var(--color-border)"}`, background: occasion.includes(o) ? "var(--color-gold)" : "transparent", color: occasion.includes(o) ? "#fff" : "var(--color-ink)", fontSize: 12, cursor: "pointer" }}>
                      {o}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="label">Tags</label>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 8 }}>
                  {tags.map((tag) => (
                    <span key={tag} style={{ padding: "4px 12px", background: "var(--color-ivory-dark)", borderRadius: "var(--radius-pill)", fontSize: 12, display: "flex", alignItems: "center", gap: 6 }}>
                      {tag}
                      <button onClick={() => setTags((t) => t.filter((x) => x !== tag))} style={{ background: "none", border: "none", fontSize: 14, lineHeight: 1, cursor: "pointer", color: "var(--color-ink-light)" }}>×</button>
                    </span>
                  ))}
                </div>
                <div style={{ display: "flex", gap: 8 }}>
                  <input className="input" value={tagInput} onChange={(e) => setTagInput(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter" && tagInput.trim()) { setTags((t) => [...new Set([...t, tagInput.trim().toLowerCase()])]); setTagInput(""); } }} placeholder="Type a tag and press Enter" style={{ flex: 1 }} />
                </div>
              </div>
            </div>
          )}

          {/* VARIANTS & PRICING TAB */}
          {tab === "pricing" && (
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                <h3 style={{ fontFamily: "var(--font-display)", fontSize: 18 }}>Variants & Pricing</h3>
                <button className="btn btn-outline btn-sm" onClick={addVariant}>+ Add Variant</button>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                {variants.map((v, i) => (
                  <div key={v.id} className="card" style={{ padding: 20 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                      <h4 style={{ fontFamily: "var(--font-body)", fontSize: 14, fontWeight: 500 }}>Variant {i + 1}</h4>
                      {variants.length > 1 && (
                        <button onClick={() => setVariants((prev) => prev.filter((x) => x.id !== v.id))} style={{ background: "none", border: "none", color: "var(--color-accent-red)", fontSize: 12, cursor: "pointer" }}>Remove</button>
                      )}
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12 }}>
                      <div>
                        <label className="label">Size</label>
                        <select className="input" value={v.size} onChange={(e) => updateVariant(v.id, "size", e.target.value)}>
                          {SIZES.map((s) => <option key={s}>{s}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className="label">Color Name</label>
                        <input className="input" value={v.color} onChange={(e) => updateVariant(v.id, "color", e.target.value)} placeholder="e.g. Ivory White" />
                      </div>
                      <div>
                        <label className="label">Color (hex)</label>
                        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                          <input type="color" value={v.colorHex} onChange={(e) => updateVariant(v.id, "colorHex", e.target.value)} style={{ width: 40, height: 38, border: "1px solid var(--color-border)", borderRadius: "var(--radius-sm)", padding: 2 }} />
                          <input className="input" value={v.colorHex} onChange={(e) => updateVariant(v.id, "colorHex", e.target.value)} placeholder="#000000" style={{ flex: 1 }} />
                        </div>
                      </div>
                      <div>
                        <label className="label">Stock (units)</label>
                        <input className="input" type="number" min={0} value={v.stock} onChange={(e) => updateVariant(v.id, "stock", parseInt(e.target.value) || 0)} />
                      </div>
                      <div>
                        <label className="label">Selling Price (₹)</label>
                        <input className="input" type="number" min={0} value={v.price / 100} onChange={(e) => updateVariant(v.id, "price", Math.round(parseFloat(e.target.value) * 100) || 0)} placeholder="499" />
                      </div>
                      <div>
                        <label className="label">Compare Price (₹) <span style={{ fontWeight: 400, color: "var(--color-ink-light)" }}>(crossed-out MRP)</span></label>
                        <input className="input" type="number" min={0} value={v.compareAtPrice / 100 || ""} onChange={(e) => updateVariant(v.id, "compareAtPrice", Math.round(parseFloat(e.target.value) * 100) || 0)} placeholder="799" />
                      </div>
                      <div>
                        <label className="label">Your Cost (₹) <span style={{ fontWeight: 400, color: "var(--color-ink-light)" }}>(hidden)</span></label>
                        <input className="input" type="number" min={0} value={v.costPrice / 100 || ""} onChange={(e) => updateVariant(v.id, "costPrice", Math.round(parseFloat(e.target.value) * 100) || 0)} placeholder="200" />
                      </div>
                      <div>
                        <label className="label">Weight (grams)</label>
                        <input className="input" type="number" min={0} value={v.weight} onChange={(e) => updateVariant(v.id, "weight", parseInt(e.target.value) || 200)} />
                      </div>
                    </div>
                    {profitMargin(v) !== null && (
                      <div style={{ marginTop: 12, padding: "8px 12px", background: profitMargin(v)! >= 30 ? "#E8F5E9" : "#FEF3C7", borderRadius: "var(--radius-sm)", fontSize: 12 }}>
                        Profit Margin: <strong style={{ color: profitMargin(v)! >= 30 ? "var(--color-success)" : "var(--color-warning)" }}>{profitMargin(v)}%</strong>
                        {profitMargin(v)! < 30 && " — Consider increasing price for better margins"}
                      </div>
                    )}
                  </div>
                ))}
              </div>

              <div style={{ marginTop: 24, padding: 20 }} className="card">
                <h3 style={{ fontFamily: "var(--font-display)", fontSize: 18, marginBottom: 16 }}>Customization</h3>
                <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
                  <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }}>
                    <input type="checkbox" checked={allowCustomization} onChange={(e) => setAllowCustomization(e.target.checked)} />
                    <span style={{ fontSize: 14 }}>Allow customers to submit custom instructions</span>
                  </label>
                </div>
                {allowCustomization && (
                  <div>
                    <label className="label">Custom instruction placeholder text</label>
                    <textarea className="input" value={customizationNote} onChange={(e) => setCustomizationNote(e.target.value)} placeholder="e.g. Enter your measurements: Chest, Waist, Hip, and any color preferences..." rows={3} />
                    <div style={{ marginTop: 12 }}>
                      <label className="label">Lead time (days to dispatch custom orders)</label>
                      <input className="input" type="number" min={0} value={leadTimeDays} onChange={(e) => setLeadTimeDays(parseInt(e.target.value) || 0)} style={{ maxWidth: 120 }} />
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* IMAGES TAB */}
          {tab === "images" && (
            <div>
              {/* ── Image Upload Drop Zone ── */}
              <div
                style={{ border: "2px dashed var(--color-border)", borderRadius: "var(--radius-sm)", padding: 32, textAlign: "center", cursor: "pointer", marginBottom: 20, transition: "all 0.2s" }}
                onClick={() => fileInputRef.current?.click()}
                onDragOver={(e) => { e.preventDefault(); (e.currentTarget as HTMLElement).style.borderColor = "var(--color-gold)"; (e.currentTarget as HTMLElement).style.background = "rgba(200,150,12,0.04)"; }}
                onDragLeave={(e) => { (e.currentTarget as HTMLElement).style.borderColor = "var(--color-border)"; (e.currentTarget as HTMLElement).style.background = ""; }}
                onDrop={async (e) => {
                  e.preventDefault();
                  const files = Array.from(e.dataTransfer.files).filter((f) => f.type.startsWith("image/"));
                  if (files.length) { const fakeEvent = { target: { files } } as any; await handleImageUpload(fakeEvent); }
                  (e.currentTarget as HTMLElement).style.borderColor = "var(--color-border)";
                  (e.currentTarget as HTMLElement).style.background = "";
                }}
              >
                <p style={{ fontSize: 28, marginBottom: 6 }}>📸</p>
                <p style={{ fontSize: 14, fontWeight: 500 }}>Drop images here or click to upload</p>
                <p style={{ fontSize: 12, color: "var(--color-ink-light)", marginTop: 3 }}>JPG, PNG, WebP · Max 10 MB · Multiple OK</p>
                <input ref={fileInputRef} type="file" accept="image/*" multiple onChange={handleImageUpload} style={{ display: "none" }} />
              </div>

              {images.length > 0 && (
                <>
                  <p style={{ fontSize: 12, color: "var(--color-ink-light)", marginBottom: 10 }}>
                    💡 <strong>Drag cards</strong> to reorder · First image is shown first in gallery · Set Hero for the card thumbnail
                  </p>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(110px, 1fr))", gap: 10 }}>
                    {images.map((img, i) => (
                      <div
                        key={img.url + i}
                        draggable
                        onDragStart={() => setDragIdx(i)}
                        onDragOver={(e) => { e.preventDefault(); setDragOverIdx(i); }}
                        onDragLeave={() => setDragOverIdx(null)}
                        onDrop={(e) => {
                          e.preventDefault();
                          if (dragIdx === null || dragIdx === i) { setDragOverIdx(null); setDragIdx(null); return; }
                          const reordered = [...images];
                          const [moved] = reordered.splice(dragIdx, 1);
                          reordered.splice(i, 0, moved);
                          setImages(reordered.map((img, pos) => ({ ...img, position: pos })));
                          setDragOverIdx(null); setDragIdx(null);
                        }}
                        onDragEnd={() => { setDragIdx(null); setDragOverIdx(null); }}
                        style={{
                          position: "relative", aspectRatio: "3/4",
                          background: "var(--color-ivory-dark)",
                          borderRadius: "var(--radius-sm)", overflow: "hidden",
                          border: img.isHero ? "2px solid var(--color-gold)" : dragOverIdx === i ? "2px dashed var(--color-gold)" : "2px solid transparent",
                          cursor: "grab", opacity: dragIdx === i ? 0.5 : 1,
                          transition: "opacity 0.15s, border-color 0.15s",
                        }}
                      >
                        <Image src={img.url} alt={img.alt || "Product"} fill style={{ objectFit: "cover", pointerEvents: "none" }}
              sizes="(max-width: 860px) 100vw, 50vw"
            />
                        
                        {/* Position badge */}
                        <span style={{ position: "absolute", top: 4, left: 4, background: "rgba(0,0,0,0.6)", color: "#fff", fontSize: 9, width: 18, height: 18, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700 }}>
                          {i + 1}
                        </span>

                        {img.isHero && (
                          <span style={{ position: "absolute", top: 4, right: 4, background: "var(--color-gold)", color: "#fff", fontSize: 8, padding: "1px 5px", borderRadius: "var(--radius-pill)", fontWeight: 700 }}>HERO</span>
                        )}

                        {/* Drag handle */}
                        <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)", opacity: 0.4, pointerEvents: "none" }}>
                          <svg width="16" height="16" fill="white" viewBox="0 0 24 24"><path d="M8 6h2v2H8zm0 4h2v2H8zm0 4h2v2H8zm6-8h2v2h-2zm0 4h2v2h-2zm0 4h2v2h-2z"/></svg>
                        </div>

                        <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, background: "rgba(0,0,0,0.65)", padding: "5px 4px", display: "flex", gap: 3 }}>
                          <button
                            onClick={() => setImages((prev) => prev.map((x, j) => ({ ...x, isHero: j === i })))}
                            style={{ flex: 1, background: img.isHero ? "var(--color-gold)" : "rgba(255,255,255,0.15)", border: "none", color: "#fff", fontSize: 9, borderRadius: 2, padding: "3px 0", cursor: "pointer" }}
                          >{img.isHero ? "✓ Hero" : "Hero"}</button>
                          <button
                            onClick={() => setImages((prev) => prev.filter((_, j) => j !== i))}
                            style={{ background: "rgba(192,57,43,0.85)", border: "none", color: "#fff", fontSize: 10, borderRadius: 2, padding: "3px 7px", cursor: "pointer" }}
                          >✕</button>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}

              {/* ── Video Upload ── */}
              <div style={{ marginTop: 28, paddingTop: 24, borderTop: "1px solid var(--color-border)" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                  <div>
                    <h3 style={{ fontFamily: "var(--font-display)", fontSize: 16 }}>Product Videos</h3>
                    <p style={{ fontSize: 12, color: "var(--color-ink-light)", marginTop: 2 }}>
                      Stored in Cloudflare R2 · MP4, WebM, MOV · Max 500 MB
                    </p>
                  </div>
                  <button
                    type="button"
                    className={`btn btn-outline btn-sm ${videoUploading ? "btn-loading" : ""}`}
                    onClick={() => videoInputRef.current?.click()}
                    disabled={videoUploading}
                    style={{ fontSize: 12 }}
                  >
                    {videoUploading ? "Uploading..." : "🎬 Add Video"}
                  </button>
                  <input
                    ref={videoInputRef}
                    type="file"
                    accept="video/mp4,video/webm,video/quicktime,video/x-msvideo"
                    style={{ display: "none" }}
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      setVideoUploading(true);
                      try {
                        const fd = new FormData();
                        fd.append("file", file);
                        fd.append("productId", initial?._id ?? "new");
                        fd.append("title", file.name.replace(/\.[^.]+$/, ""));
                        const res = await fetch("/api/upload/video", { method: "POST", body: fd });
                        const data = await res.json();
                        if (data.success) {
                          setVideos(prev => [...prev, data.data]);
                          showToast("Video uploaded to Cloudflare R2! 🎬", "success");
                        } else {
                          showToast(data.error || "Video upload failed", "error");
                        }
                      } catch { showToast("Upload failed", "error"); }
                      finally { setVideoUploading(false); }
                    }}
                  />
                </div>

                {videos.length === 0 ? (
                  <div style={{ background: "var(--color-ivory-dark)", borderRadius: "var(--radius-sm)", padding: "20px", textAlign: "center", fontSize: 13, color: "var(--color-ink-light)" }}>
                    No videos yet. Videos help customers see the product in motion.
                  </div>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                    {videos.map((video, i) => (
                      <div key={i} style={{ display: "flex", gap: 12, alignItems: "center", padding: "10px 14px", background: "var(--color-ivory-dark)", borderRadius: "var(--radius-sm)" }}>
                        <span style={{ fontSize: 24, flexShrink: 0 }}>🎬</span>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <p style={{ fontSize: 13, fontWeight: 500, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{video.title || `Video ${i + 1}`}</p>
                          <p style={{ fontSize: 11, color: "var(--color-ink-light)" }}>CF R2 · {video.r2Key}</p>
                        </div>
                        <a href={video.url} target="_blank" rel="noopener noreferrer" style={{ fontSize: 11, color: "var(--color-gold)" }}>Preview</a>
                        <button
                          type="button"
                          onClick={async () => {
                            if (!confirm("Delete this video?")) return;
                            await fetch("/api/upload/video", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ r2Key: video.r2Key }) });
                            setVideos(prev => prev.filter((_, j) => j !== i));
                            showToast("Video deleted", "success");
                          }}
                          style={{ background: "none", border: "none", color: "var(--color-accent-red)", fontSize: 16, cursor: "pointer", flexShrink: 0 }}
                        >✕</button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* SEO TAB */}
          {tab === "seo" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <h3 style={{ fontFamily: "var(--font-display)", fontSize: 18 }}>SEO Settings</h3>
                <button className={`btn btn-outline btn-sm ${aiLoading ? "btn-loading" : ""}`} onClick={generateSEO} disabled={aiLoading} style={{ fontSize: 11 }}>
                  ✨ Generate with AI
                </button>
              </div>
              <div>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <label className="label">SEO Title</label>
                  <span style={{ fontSize: 11, color: seoTitle.length > 60 ? "var(--color-accent-red)" : "var(--color-ink-light)" }}>{seoTitle.length}/60</span>
                </div>
                <input className="input" value={seoTitle} onChange={(e) => setSeoTitle(e.target.value)} placeholder="SEO-optimized page title" maxLength={70} />
              </div>
              <div>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <label className="label">Meta Description</label>
                  <span style={{ fontSize: 11, color: seoDesc.length > 160 ? "var(--color-accent-red)" : "var(--color-ink-light)" }}>{seoDesc.length}/160</span>
                </div>
                <textarea className="input" value={seoDesc} onChange={(e) => setSeoDesc(e.target.value)} placeholder="Compelling description for search results..." rows={3} maxLength={180} />
              </div>
              <div>
                <label className="label">Keywords</label>
                <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 8 }}>
                  {seoKeywords.map((kw) => (
                    <span key={kw} style={{ padding: "4px 12px", background: "var(--color-ivory-dark)", borderRadius: "var(--radius-pill)", fontSize: 12, display: "flex", gap: 6, alignItems: "center" }}>
                      {kw}<button onClick={() => setSeoKeywords((k) => k.filter((x) => x !== kw))} style={{ background: "none", border: "none", fontSize: 14, lineHeight: 1 }}>×</button>
                    </span>
                  ))}
                </div>
                <input className="input" placeholder="Add keyword and press Enter" onKeyDown={(e) => { if (e.key === "Enter") { const val = (e.target as HTMLInputElement).value.trim(); if (val) { setSeoKeywords((k) => [...new Set([...k, val])]); (e.target as HTMLInputElement).value = ""; } } }} />
              </div>
              {/* Preview */}
              <div style={{ background: "var(--color-ivory-dark)", padding: 20, borderRadius: "var(--radius-sm)" }}>
                <p style={{ fontSize: 12, color: "var(--color-ink-light)", marginBottom: 8, letterSpacing: 1, textTransform: "uppercase" }}>Search Preview</p>
                <p style={{ fontSize: 16, color: "#1A0DAB", marginBottom: 4 }}>{seoTitle || name || "Product Name"}</p>
                <p style={{ fontSize: 12, color: "#006621", marginBottom: 4 }}>buynyaree.com/product/{name.toLowerCase().replace(/\s+/g, "-") || "product-slug"}</p>
                <p style={{ fontSize: 13, color: "#545454", lineHeight: 1.4 }}>{seoDesc || "Product description will appear here..."}</p>
              </div>
            </div>
          )}

          {/* ADVANCED TAB */}
          {tab === "advanced" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
              <div className="card" style={{ padding: 20 }}>
                <h3 style={{ fontFamily: "var(--font-display)", fontSize: 18, marginBottom: 16 }}>Visibility & Labels</h3>
                {[
                  { label: "Active (visible on store)", value: isActive, set: setIsActive },
                  { label: "Featured (shown on homepage)", value: isFeatured, set: setIsFeatured },
                  { label: "New Arrival badge", value: isNewArrival, set: setIsNewArrival },
                  { label: "Best Seller badge", value: isBestSeller, set: setIsBestSeller },
                  { label: "Custom Order product", value: isCustomOrder, set: setIsCustomOrder },
                ].map((item) => (
                  <label key={item.label} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 0", borderBottom: "1px solid var(--color-border-light)", cursor: "pointer" }}>
                    <div
                      onClick={() => item.set(!item.value)}
                      style={{ width: 40, height: 22, borderRadius: 11, background: item.value ? "var(--color-gold)" : "var(--color-border)", position: "relative", transition: "background 0.2s", flexShrink: 0 }}
                    >
                      <div style={{ position: "absolute", top: 3, left: item.value ? 21 : 3, width: 16, height: 16, borderRadius: "50%", background: "#fff", transition: "left 0.2s" }} />
                    </div>
                    <span style={{ fontSize: 14 }}>{item.label}</span>
                  </label>
                ))}
              </div>

              <div className="card" style={{ padding: 20 }}>
                <h3 style={{ fontFamily: "var(--font-display)", fontSize: 18, marginBottom: 12 }}>Care Instructions</h3>
                {careInstructions.map((c, i) => (
                  <div key={i} style={{ display: "flex", gap: 8, marginBottom: 8 }}>
                    <input className="input" value={c} onChange={(e) => setCareInstructions((prev) => prev.map((x, j) => j === i ? e.target.value : x))} style={{ flex: 1 }} />
                    <button onClick={() => setCareInstructions((prev) => prev.filter((_, j) => j !== i))} style={{ background: "none", border: "1px solid var(--color-border)", borderRadius: "var(--radius-sm)", padding: "0 12px", color: "var(--color-accent-red)" }}>✕</button>
                  </div>
                ))}
                <button className="btn btn-ghost btn-sm" onClick={() => setCareInstructions((prev) => [...prev, ""])} style={{ marginTop: 4 }}>+ Add instruction</button>
              </div>
            </div>
          )}
        </div>

        {/* Right sidebar: Status card */}
        <div>
          <div className="card" style={{ padding: 20, position: "sticky", top: 80 }}>
            <h3 style={{ fontFamily: "var(--font-display)", fontSize: 18, marginBottom: 16 }}>Status</h3>
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: "flex", alignItems: "center", gap: 12, cursor: "pointer" }}>
                <div onClick={() => setIsActive(!isActive)} style={{ width: 44, height: 24, borderRadius: 12, background: isActive ? "var(--color-gold)" : "var(--color-border)", position: "relative", transition: "background 0.2s", flexShrink: 0 }}>
                  <div style={{ position: "absolute", top: 4, left: isActive ? 23 : 4, width: 16, height: 16, borderRadius: "50%", background: "#fff", transition: "left 0.2s" }} />
                </div>
                <div>
                  <p style={{ fontSize: 14, fontWeight: 500 }}>{isActive ? "Active" : "Draft"}</p>
                  <p style={{ fontSize: 11, color: "var(--color-ink-light)" }}>{isActive ? "Visible on store" : "Hidden from customers"}</p>
                </div>
              </label>
            </div>
            {variants[0]?.price > 0 && (
              <div style={{ background: "var(--color-ivory-dark)", padding: 12, borderRadius: "var(--radius-sm)", marginBottom: 16 }}>
                <p style={{ fontSize: 11, color: "var(--color-ink-light)", marginBottom: 4 }}>Starting price</p>
                <p style={{ fontFamily: "var(--font-display)", fontSize: 20, color: "var(--color-ink)" }}>₹{(variants[0].price / 100).toLocaleString("en-IN")}</p>
                {variants[0].compareAtPrice > 0 && <p style={{ fontSize: 12, textDecoration: "line-through", color: "var(--color-ink-light)" }}>₹{(variants[0].compareAtPrice / 100).toLocaleString("en-IN")}</p>}
              </div>
            )}
            <div style={{ fontSize: 12, color: "var(--color-ink-light)", display: "flex", flexDirection: "column", gap: 4 }}>
              <p>✓ {variants.length} variant{variants.length !== 1 ? "s" : ""}</p>
              <p>✓ {images.length} image{images.length !== 1 ? "s" : ""}</p>
              <p>✓ {tags.length} tag{tags.length !== 1 ? "s" : ""}</p>
              {seoTitle && <p>✓ SEO configured</p>}
            </div>
            <div style={{ marginTop: 20, display: "flex", flexDirection: "column", gap: 8 }}>
              <button className={`btn btn-primary btn-full ${saving ? "btn-loading" : ""}`} onClick={() => handleSave(true)} disabled={saving}>
                {saving ? "Saving..." : "Publish Product"}
              </button>
              <button className="btn btn-outline btn-full" onClick={() => handleSave(false)} disabled={saving}>
                Save as Draft
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
