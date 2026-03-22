"use client";
// app/(admin)/dashboard/hero-slides/page.tsx
// Admin editor for homepage hero carousel banners
import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { showToast } from "@/components/ui/Toaster";
import { nanoid } from "nanoid";

interface Slide {
  id: string; headline: string; subheadline: string;
  imageUrl: string; bgColor: string; bgGradient: string; accentColor: string;
  cta1Label: string; cta1Href: string; cta2Label: string; cta2Href: string;
  isActive: boolean; position: number;
}

const EMPTY_SLIDE = (): Slide => ({
  id: nanoid(6), headline: "New Banner", subheadline: "", imageUrl: "",
  bgColor: "#1A1208", bgGradient: "linear-gradient(135deg,#1A1208,#2D1E0A)",
  accentColor: "#C8960C", cta1Label: "Shop Now", cta1Href: "/shop",
  cta2Label: "", cta2Href: "", isActive: true, position: 0,
});

export default function HeroSlidesPage() {
  const [slides, setSlides] = useState<Slide[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [selected, setSelected] = useState(0);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetch("/api/admin/hero-slides")
      .then(r => r.json())
      .then(d => {
        if (d.success) setSlides(d.data.length ? d.data : [EMPTY_SLIDE()]);
        setLoading(false);
      });
  }, []);

  const save = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/admin/hero-slides", {
        method: "PUT", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slides }),
      });
      const d = await res.json();
      if (d.success) showToast("✅ Banners saved & live!", "success");
      else showToast(d.error || "Save failed", "error");
    } finally { setSaving(false); }
  };

  const uploadImage = async (file: File) => {
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file); fd.append("folder", "hero");
      const res = await fetch("/api/upload", { method: "POST", body: fd });
      const d = await res.json();
      if (d.success) {
        updateSlide(selected, { imageUrl: d.data.url });
        showToast("Image uploaded!", "success");
      } else showToast("Upload failed", "error");
    } finally { setUploading(false); }
  };

  const updateSlide = (idx: number, patch: Partial<Slide>) =>
    setSlides(prev => prev.map((s, i) => i === idx ? { ...s, ...patch } : s));

  const addSlide = () => {
    const ns = EMPTY_SLIDE();
    setSlides(prev => [...prev, { ...ns, position: prev.length }]);
    setSelected(slides.length);
  };

  const deleteSlide = (idx: number) => {
    if (slides.length === 1) { showToast("Need at least 1 banner", "error"); return; }
    setSlides(prev => prev.filter((_, i) => i !== idx));
    setSelected(Math.max(0, idx - 1));
  };

  const moveSlide = (idx: number, dir: -1 | 1) => {
    const to = idx + dir;
    if (to < 0 || to >= slides.length) return;
    setSlides(prev => {
      const next = [...prev];
      [next[idx], next[to]] = [next[to], next[idx]];
      return next.map((s, i) => ({ ...s, position: i }));
    });
    setSelected(to);
  };

  const slide = slides[selected];

  if (loading) return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }}>
      {[1,2,3].map(i => <div key={i} className="skeleton" style={{ height: 120, borderRadius: "var(--radius-sm)" }} />)}
    </div>
  );

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 28 }}>
        <div>
          <h1 style={{ fontFamily: "var(--font-display)", fontSize: 24, fontWeight: 400 }}>Hero Banners</h1>
          <p style={{ fontSize: 13, color: "var(--color-ink-light)", marginTop: 4 }}>
            Edit homepage carousel slides. Changes go live instantly after saving.
          </p>
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <button className="btn btn-outline btn-sm" onClick={addSlide}>+ Add Banner</button>
          <button className={`btn btn-primary ${saving ? "btn-loading" : ""}`} onClick={save} disabled={saving}>
            {saving ? "Saving..." : "Save & Publish"}
          </button>
        </div>
      </div>

      <div className="admin-order-grid">
        {/* Left: slide list */}
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <p style={{ fontSize: 11, letterSpacing: 1, textTransform: "uppercase", color: "var(--color-ink-light)", marginBottom: 4 }}>
            Slides ({slides.length})
          </p>
          {slides.map((s, i) => (
            <div key={s.id}
              onClick={() => setSelected(i)}
              style={{
                padding: "12px 16px", borderRadius: "var(--radius-sm)", cursor: "pointer",
                border: i === selected ? "2px solid var(--color-gold)" : "2px solid var(--color-border)",
                background: i === selected ? "#FEF9EC" : "var(--color-surface)",
                display: "flex", alignItems: "center", gap: 12,
              }}
            >
              {/* Mini preview */}
              <div style={{ width: 48, height: 36, borderRadius: 3, background: s.bgGradient || s.bgColor, flexShrink: 0, overflow: "hidden", position: "relative" }}>
                {s.imageUrl && <Image src={s.imageUrl} alt="" fill style={{ objectFit: "cover", opacity: 0.7 }} sizes="48px" />}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontSize: 13, fontWeight: 500, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{s.headline || "Untitled"}</p>
                <p style={{ fontSize: 11, color: "var(--color-ink-light)" }}>{s.isActive ? "Active" : "Hidden"}</p>
              </div>
              <div style={{ display: "flex", gap: 4 }}>
                <button onClick={e => { e.stopPropagation(); moveSlide(i, -1); }} disabled={i === 0}
                  style={{ background: "none", border: "none", cursor: "pointer", opacity: i === 0 ? 0.3 : 1, fontSize: 14 }}>↑</button>
                <button onClick={e => { e.stopPropagation(); moveSlide(i, 1); }} disabled={i === slides.length - 1}
                  style={{ background: "none", border: "none", cursor: "pointer", opacity: i === slides.length - 1 ? 0.3 : 1, fontSize: 14 }}>↓</button>
                <button onClick={e => { e.stopPropagation(); deleteSlide(i); }}
                  style={{ background: "none", border: "none", cursor: "pointer", color: "var(--color-accent-red)", fontSize: 16 }}>×</button>
              </div>
            </div>
          ))}
        </div>

        {/* Right: slide editor */}
        {slide && (
          <div className="card" style={{ padding: 28 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
              <h2 style={{ fontFamily: "var(--font-display)", fontSize: 18 }}>Edit Slide {selected + 1}</h2>
              <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }}>
                <input type="checkbox" checked={slide.isActive} onChange={e => updateSlide(selected, { isActive: e.target.checked })} />
                <span style={{ fontSize: 13 }}>Active</span>
              </label>
            </div>

            {/* Live preview */}
            <div style={{
              borderRadius: "var(--radius-sm)", overflow: "hidden", marginBottom: 24,
              background: slide.bgGradient || slide.bgColor, padding: "24px 28px",
              minHeight: 120, position: "relative",
            }}>
              {slide.imageUrl && (
                <div style={{ position: "absolute", inset: 0 }}>
                  <Image src={slide.imageUrl} alt="" fill style={{ objectFit: "cover", opacity: 0.4 }} sizes="(max-width: 860px) 100vw, 600px" />
                </div>
              )}
              <div style={{ position: "relative", zIndex: 1 }}>
                <p style={{ fontSize: "clamp(16px,3vw,24px)", fontFamily: "var(--font-display)", color: "#fff", fontWeight: 300 }}>
                  {slide.headline || "Your headline here"}
                </p>
                {slide.subheadline && <p style={{ fontSize: 13, color: "rgba(255,255,255,0.7)", marginTop: 6 }}>{slide.subheadline}</p>}
                <div style={{ display: "flex", gap: 10, marginTop: 14 }}>
                  {slide.cta1Label && <span style={{ background: slide.accentColor, color: "#1A1208", padding: "6px 16px", borderRadius: 3, fontSize: 11, fontWeight: 600 }}>{slide.cta1Label}</span>}
                  {slide.cta2Label && <span style={{ border: "1px solid rgba(255,255,255,0.4)", color: "#fff", padding: "6px 16px", borderRadius: 3, fontSize: 11 }}>{slide.cta2Label}</span>}
                </div>
              </div>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {/* Image upload */}
              <div>
                <label className="label">Background Image (optional)</label>
                <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                  {slide.imageUrl ? (
                    <div style={{ position: "relative", width: 80, height: 56, flexShrink: 0 }}>
                      <Image src={slide.imageUrl} alt="" fill style={{ objectFit: "cover", borderRadius: "var(--radius-sm)" }} sizes="80px" />
                    </div>
                  ) : null}
                  <button className={`btn btn-outline btn-sm ${uploading ? "btn-loading" : ""}`}
                    onClick={() => fileRef.current?.click()} disabled={uploading}>
                    {uploading ? "Uploading..." : slide.imageUrl ? "Change Image" : "Upload Image"}
                  </button>
                  {slide.imageUrl && (
                    <button className="btn btn-ghost btn-sm" style={{ color: "var(--color-accent-red)" }}
                      onClick={() => updateSlide(selected, { imageUrl: "" })}>Remove</button>
                  )}
                  <input ref={fileRef} type="file" accept="image/*" style={{ display: "none" }}
                    onChange={e => e.target.files?.[0] && uploadImage(e.target.files[0])} />
                </div>
                <p style={{ fontSize: 11, color: "var(--color-ink-light)", marginTop: 4 }}>
                  Recommended: 1920×1080px JPG/WebP. Leave empty to use gradient background.
                </p>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div style={{ gridColumn: "1/-1" }}>
                  <label className="label">Headline *</label>
                  <input className="input" value={slide.headline} onChange={e => updateSlide(selected, { headline: e.target.value })} placeholder="Wear India. Own It." />
                  <p style={{ fontSize: 11, color: "var(--color-ink-light)", marginTop: 2 }}>Add line break with Enter — second line shows in accent colour</p>
                </div>
                <div style={{ gridColumn: "1/-1" }}>
                  <label className="label">Subheadline</label>
                  <input className="input" value={slide.subheadline} onChange={e => updateSlide(selected, { subheadline: e.target.value })} placeholder="Handcrafted kurtis..." />
                </div>
                <div>
                  <label className="label">Background Color</label>
                  <div style={{ display: "flex", gap: 8 }}>
                    <input type="color" value={slide.bgColor} onChange={e => updateSlide(selected, { bgColor: e.target.value })} style={{ width: 40, height: 38, border: "1px solid var(--color-border)", borderRadius: 4, padding: 2, cursor: "pointer" }} />
                    <input className="input" value={slide.bgGradient} onChange={e => updateSlide(selected, { bgGradient: e.target.value })} placeholder="linear-gradient(135deg, ...)" style={{ flex: 1, fontSize: 12 }} />
                  </div>
                </div>
                <div>
                  <label className="label">Accent Color</label>
                  <div style={{ display: "flex", gap: 8 }}>
                    <input type="color" value={slide.accentColor} onChange={e => updateSlide(selected, { accentColor: e.target.value })} style={{ width: 40, height: 38, border: "1px solid var(--color-border)", borderRadius: 4, padding: 2, cursor: "pointer" }} />
                    <input className="input" value={slide.accentColor} onChange={e => updateSlide(selected, { accentColor: e.target.value })} style={{ flex: 1 }} />
                  </div>
                </div>
                <div>
                  <label className="label">Button 1 Label</label>
                  <input className="input" value={slide.cta1Label} onChange={e => updateSlide(selected, { cta1Label: e.target.value })} placeholder="Shop Kurtis" />
                </div>
                <div>
                  <label className="label">Button 1 Link</label>
                  <input className="input" value={slide.cta1Href} onChange={e => updateSlide(selected, { cta1Href: e.target.value })} placeholder="/shop/kurti" />
                </div>
                <div>
                  <label className="label">Button 2 Label (optional)</label>
                  <input className="input" value={slide.cta2Label} onChange={e => updateSlide(selected, { cta2Label: e.target.value })} placeholder="View All" />
                </div>
                <div>
                  <label className="label">Button 2 Link</label>
                  <input className="input" value={slide.cta2Href} onChange={e => updateSlide(selected, { cta2Href: e.target.value })} placeholder="/shop/all" />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
