"use client";
// components/admin/BlogEditor.tsx
import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { showToast } from "@/components/ui/Toaster";

export function BlogEditor({ initial }: { initial?: any }) {
  const router = useRouter();
  const [title, setTitle] = useState(initial?.title ?? "");
  const [slug, setSlug] = useState(initial?.slug ?? "");
  const [excerpt, setExcerpt] = useState(initial?.excerpt ?? "");
  const [content, setContent] = useState(initial?.content ?? "");
  const [coverImage, setCoverImage] = useState(initial?.coverImage ?? "");
  const [tags, setTags] = useState<string[]>(initial?.tags ?? []);
  const [tagInput, setTagInput] = useState("");
  const [seoTitle, setSeoTitle] = useState(initial?.seo?.title ?? "");
  const [seoDesc, setSeoDesc] = useState(initial?.seo?.description ?? "");
  const [status, setStatus] = useState<"draft" | "published">(initial?.status ?? "draft");
  const [saving, setSaving] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [tab, setTab] = useState<"write" | "preview" | "seo">("write");
  const fileRef = useRef<HTMLInputElement>(null);

  const autoSlug = (t: string) => t.toLowerCase().replace(/[^a-z0-9\s-]/g, "").replace(/\s+/g, "-").replace(/-+/g, "-").slice(0, 80);

  const handleTitleChange = (t: string) => {
    setTitle(t);
    if (!initial?.slug) setSlug(autoSlug(t));
    if (!seoTitle) setSeoTitle(`${t} | Nyaree Fashion Blog`);
  };

  const uploadCover = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const formData = new FormData();
    formData.append("file", file);
    formData.append("folder", "blog");
    setSaving(true);
    const res = await fetch("/api/upload", { method: "POST", body: formData });
    const data = await res.json();
    if (data.success) setCoverImage(data.data.url);
    setSaving(false);
  };

  const generateWithAI = async () => {
    if (!title) { showToast("Enter a blog title first", "error"); return; }
    setAiLoading(true);
    try {
      const res = await fetch("/api/ai/blog-outline", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic: title, keywords: tags }),
      });
      const data = await res.json();
      if (data.success) { setContent(data.data.content); showToast("Blog draft generated! ✨", "success"); }
    } finally { setAiLoading(false); }
  };

  const save = async (publish = false) => {
    if (!title.trim()) { showToast("Blog title is required", "error"); return; }
    if (!content.trim()) { showToast("Write some content first", "error"); return; }
    setSaving(true);
    try {
      const wordCount = content.replace(/<[^>]*>/g, "").split(/\s+/).length;
      const readTime = Math.max(1, Math.ceil(wordCount / 200));
      const payload = {
        title, slug: slug || autoSlug(title), excerpt, content, coverImage,
        tags, seo: { title: seoTitle || title, description: seoDesc || excerpt },
        status: publish ? "published" : "draft", readTime,
      };
      const res = await fetch(initial?._id ? `/api/blog/${initial._id}` : "/api/blog", {
        method: initial?._id ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (data.success) {
        showToast(publish ? "Post published! 🎉" : "Draft saved", "success");
        setTimeout(() => router.push("/dashboard/blog"), 800);
      } else showToast(data.error || "Save failed", "error");
    } finally { setSaving(false); }
  };

  return (
    <div>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 32 }}>
        <h1 style={{ fontFamily: "var(--font-display)", fontSize: 26, fontWeight: 400 }}>
          {initial ? "Edit Blog Post" : "New Blog Post"}
        </h1>
        <div style={{ display: "flex", gap: 10 }}>
          <button className="btn btn-outline btn-sm" onClick={() => save(false)} disabled={saving}>Save Draft</button>
          <button className={`btn btn-primary btn-sm ${saving ? "btn-loading" : ""}`} onClick={() => save(true)} disabled={saving}>
            Publish Now
          </button>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 300px", gap: 32 }}>
        {/* Main */}
        <div>
          {/* Title */}
          <input
            value={title}
            onChange={(e) => handleTitleChange(e.target.value)}
            placeholder="Your blog post title..."
            style={{ width: "100%", fontFamily: "var(--font-display)", fontSize: 28, background: "none", border: "none", outline: "none", borderBottom: "2px solid var(--color-border)", paddingBottom: 12, marginBottom: 20, color: "var(--color-ink)" }}
          />

          {/* Slug */}
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 20 }}>
            <span style={{ fontSize: 12, color: "var(--color-ink-light)" }}>buynyaree.com/blog/</span>
            <input className="input" value={slug} onChange={(e) => setSlug(e.target.value)} style={{ flex: 1, fontSize: 12 }} placeholder="url-slug" />
          </div>

          {/* Tabs */}
          <div style={{ display: "flex", gap: 0, borderBottom: "1px solid var(--color-border)", marginBottom: 20 }}>
            {(["write", "preview", "seo"] as const).map((t) => (
              <button key={t} onClick={() => setTab(t)} style={{ padding: "8px 20px", background: "none", border: "none", borderBottom: tab === t ? "2px solid var(--color-gold)" : "2px solid transparent", color: tab === t ? "var(--color-gold)" : "var(--color-ink-light)", fontSize: 13, fontWeight: 500, cursor: "pointer", textTransform: "capitalize" }}>
                {t}
              </button>
            ))}
          </div>

          {/* Write tab */}
          {tab === "write" && (
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                <p className="label" style={{ marginBottom: 0 }}>Content (supports HTML)</p>
                <button className={`btn btn-outline btn-sm ${aiLoading ? "btn-loading" : ""}`} onClick={generateWithAI} disabled={aiLoading} style={{ fontSize: 11 }}>
                  ✨ Generate with AI
                </button>
              </div>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Start writing your blog post here...&#10;&#10;You can use HTML tags: <h2>, <p>, <strong>, <em>, <ul>, <li>, <img>&#10;&#10;Or let AI generate a draft for you!"
                style={{ width: "100%", minHeight: 500, padding: "16px", fontFamily: "monospace", fontSize: 13, lineHeight: 1.8, border: "1px solid var(--color-border)", borderRadius: "var(--radius-sm)", outline: "none", resize: "vertical", background: "var(--color-surface)", color: "var(--color-ink)" }}
              />
              <p style={{ fontSize: 11, color: "var(--color-ink-light)", marginTop: 6 }}>
                Words: {content.replace(/<[^>]*>/g, "").split(/\s+/).filter(Boolean).length} · Est. read time: {Math.max(1, Math.ceil(content.replace(/<[^>]*>/g, "").split(/\s+/).length / 200))} min
              </p>
            </div>
          )}

          {/* Preview tab */}
          {tab === "preview" && (
            <div className="card" style={{ padding: 32 }}>
              {coverImage && <img src={coverImage} alt={title} style={{ width: "100%", aspectRatio: "16/9", objectFit: "cover", borderRadius: "var(--radius-sm)", marginBottom: 24 }} />}
              <h1 style={{ fontFamily: "var(--font-display)", fontSize: 32, fontWeight: 400, marginBottom: 12 }}>{title || "Blog Title"}</h1>
              <p style={{ fontSize: 13, color: "var(--color-ink-light)", marginBottom: 32 }}>By Rishika Singh · {Math.max(1, Math.ceil(content.replace(/<[^>]*>/g, "").split(/\s+/).length / 200))} min read</p>
              <div className="prose" dangerouslySetInnerHTML={{ __html: content || "<p>No content yet...</p>" }} />
            </div>
          )}

          {/* SEO tab */}
          {tab === "seo" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <label className="label">SEO Title</label>
                  <span style={{ fontSize: 11, color: seoTitle.length > 60 ? "var(--color-accent-red)" : "var(--color-ink-light)" }}>{seoTitle.length}/60</span>
                </div>
                <input className="input" value={seoTitle} onChange={(e) => setSeoTitle(e.target.value)} placeholder="SEO title for search engines" />
              </div>
              <div>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <label className="label">Meta Description</label>
                  <span style={{ fontSize: 11, color: seoDesc.length > 160 ? "var(--color-accent-red)" : "var(--color-ink-light)" }}>{seoDesc.length}/160</span>
                </div>
                <textarea className="input" value={seoDesc} onChange={(e) => setSeoDesc(e.target.value)} placeholder="Brief description for search results" rows={3} />
              </div>
              {/* SERP Preview */}
              <div style={{ background: "var(--color-ivory-dark)", padding: 20, borderRadius: "var(--radius-sm)" }}>
                <p style={{ fontSize: 11, color: "var(--color-ink-light)", marginBottom: 8, letterSpacing: 1 }}>GOOGLE PREVIEW</p>
                <p style={{ fontSize: 16, color: "#1A0DAB" }}>{seoTitle || title || "Blog Title"}</p>
                <p style={{ fontSize: 12, color: "#006621" }}>buynyaree.com/blog/{slug || "url-slug"}</p>
                <p style={{ fontSize: 13, color: "#545454" }}>{seoDesc || excerpt || "Blog description..."}</p>
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          {/* Status */}
          <div className="card" style={{ padding: 20 }}>
            <h3 style={{ fontFamily: "var(--font-display)", fontSize: 16, marginBottom: 16 }}>Publish</h3>
            <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
              {(["draft", "published"] as const).map((s) => (
                <button key={s} onClick={() => setStatus(s)} style={{ flex: 1, padding: "8px 0", border: `1px solid ${status === s ? "var(--color-ink)" : "var(--color-border)"}`, background: status === s ? "var(--color-ink)" : "transparent", color: status === s ? "#fff" : "var(--color-ink)", borderRadius: "var(--radius-sm)", fontSize: 12, cursor: "pointer", textTransform: "capitalize" }}>
                  {s}
                </button>
              ))}
            </div>
            <button className={`btn btn-primary btn-full ${saving ? "btn-loading" : ""}`} onClick={() => save(true)} disabled={saving}>
              Publish Now
            </button>
            <button className="btn btn-ghost btn-full" style={{ marginTop: 8, fontSize: 12 }} onClick={() => save(false)} disabled={saving}>
              Save Draft
            </button>
          </div>

          {/* Cover Image */}
          <div className="card" style={{ padding: 20 }}>
            <h3 style={{ fontFamily: "var(--font-display)", fontSize: 16, marginBottom: 16 }}>Cover Image</h3>
            {coverImage ? (
              <div style={{ position: "relative" }}>
                <img src={coverImage} alt="Cover" style={{ width: "100%", aspectRatio: "16/9", objectFit: "cover", borderRadius: "var(--radius-sm)" }} />
                <button onClick={() => setCoverImage("")} style={{ position: "absolute", top: 8, right: 8, background: "rgba(0,0,0,0.6)", border: "none", color: "#fff", borderRadius: "50%", width: 28, height: 28, cursor: "pointer" }}>×</button>
              </div>
            ) : (
              <div onClick={() => fileRef.current?.click()} style={{ border: "2px dashed var(--color-border)", borderRadius: "var(--radius-sm)", padding: "28px 16px", textAlign: "center", cursor: "pointer" }}>
                <p style={{ fontSize: 24, marginBottom: 4 }}>🖼️</p>
                <p style={{ fontSize: 12, color: "var(--color-ink-light)" }}>Click to upload cover image</p>
              </div>
            )}
            <input ref={fileRef} type="file" accept="image/*" onChange={uploadCover} style={{ display: "none" }} />
          </div>

          {/* Excerpt */}
          <div className="card" style={{ padding: 20 }}>
            <h3 style={{ fontFamily: "var(--font-display)", fontSize: 16, marginBottom: 12 }}>Excerpt</h3>
            <textarea className="input" value={excerpt} onChange={(e) => setExcerpt(e.target.value)} placeholder="Short preview text shown in blog listing..." rows={3} />
          </div>

          {/* Tags */}
          <div className="card" style={{ padding: 20 }}>
            <h3 style={{ fontFamily: "var(--font-display)", fontSize: 16, marginBottom: 12 }}>Tags</h3>
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 8 }}>
              {tags.map((t) => (
                <span key={t} style={{ padding: "4px 10px", background: "var(--color-ivory-dark)", borderRadius: "var(--radius-pill)", fontSize: 12, display: "flex", gap: 5, alignItems: "center" }}>
                  {t}
                  <button onClick={() => setTags((prev) => prev.filter((x) => x !== t))} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 14, lineHeight: 1 }}>×</button>
                </span>
              ))}
            </div>
            <input className="input" value={tagInput} onChange={(e) => setTagInput(e.target.value)} placeholder="Add tag, press Enter"
              onKeyDown={(e) => { if (e.key === "Enter" && tagInput.trim()) { setTags((prev) => [...new Set([...prev, tagInput.trim().toLowerCase()])]); setTagInput(""); } }}
              style={{ fontSize: 13 }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
