"use client";
// components/store/ProductReviews.tsx — Full Flipkart-style reviews
import { useState, useRef } from "react";
import Image from "next/image";
import { showToast } from "@/components/ui/Toaster";
import { useSession } from "@/lib/auth/client";
import Link from "next/link";

interface Review {
  _id: string; userName: string; userImage?: string;
  rating: number; title?: string; body: string;
  images?: string[]; isVerifiedPurchase: boolean; createdAt: string;
}

interface Props {
  reviews: Review[]; productId: string; productName?: string;
  rating: { average: number; count: number };
  instagramReelUrl?: string;
}

function Stars({ value, size = 16, interactive = false, onChange }: {
  value: number; size?: number; interactive?: boolean; onChange?: (v: number) => void;
}) {
  const [hover, setHover] = useState(0);
  const display = interactive ? (hover || value) : value;
  return (
    <div style={{ display: "flex", gap: 2 }}>
      {[1,2,3,4,5].map(star => (
        <button key={star} type="button" onClick={() => onChange?.(star)}
          onMouseEnter={() => interactive && setHover(star)}
          onMouseLeave={() => interactive && setHover(0)}
          style={{ background: "none", border: "none", padding: 1, cursor: interactive ? "pointer" : "default" }}>
          <svg width={size} height={size} viewBox="0 0 24 24"
            fill={star <= display ? "var(--color-gold)" : "none"}
            stroke="var(--color-gold)" strokeWidth="1.5" style={{ display: "block" }}>
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
          </svg>
        </button>
      ))}
    </div>
  );
}

export function ProductReviews({ reviews, productId, rating, instagramReelUrl }: Props) {
  const { data: session } = useSession();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ rating: 5, title: "", body: "" });
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [lightbox, setLightbox] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const ratingBars = [5,4,3,2,1].map(star => ({
    star,
    count: reviews.filter(r => Math.round(r.rating) === star).length,
    pct: reviews.length > 0
      ? Math.round((reviews.filter(r => Math.round(r.rating) === star).length / reviews.length) * 100) : 0,
  }));

  const uploadImages = async (files: FileList) => {
    if (uploadedImages.length + files.length > 5) { showToast("Maximum 5 images", "error"); return; }
    setUploading(true);
    const uploaded: string[] = [];
    for (const file of Array.from(files)) {
      const fd = new FormData();
      fd.append("file", file); fd.append("folder", "reviews");
      const res = await fetch("/api/upload", { method: "POST", body: fd });
      const data = await res.json();
      if (data.success) uploaded.push(data.data.url);
    }
    setUploadedImages(prev => [...prev, ...uploaded]);
    if (uploaded.length) showToast(`${uploaded.length} photo${uploaded.length > 1 ? "s" : ""} added!`, "success");
    setUploading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.body.trim()) { showToast("Please write your review", "error"); return; }
    setSubmitting(true);
    try {
      const res = await fetch("/api/reviews", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId, ...form, images: uploadedImages }),
      });
      const data = await res.json();
      if (data.success) {
        showToast(
          data.data.isVerifiedPurchase
            ? "Review submitted ✓ Verified Purchase! Appears after admin approval."
            : "Review submitted! Appears after admin approval.",
          "success"
        );
        setShowForm(false); setForm({ rating: 5, title: "", body: "" }); setUploadedImages([]);
      } else showToast(data.error || "Failed to submit", "error");
    } finally { setSubmitting(false); }
  };

  return (
    <div>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 32, flexWrap: "wrap", gap: 12 }}>
        <div>
          <h2 style={{ fontFamily: "var(--font-display)", fontSize: "clamp(1.3rem, 3vw, 1.8rem)", fontWeight: 400, marginBottom: 4 }}>
            Customer Reviews
          </h2>
          {rating.count > 0 && <p style={{ fontSize: 13, color: "var(--color-ink-light)" }}>{rating.count} review{rating.count !== 1 ? "s" : ""}</p>}
        </div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {instagramReelUrl && (
            <a href={instagramReelUrl} target="_blank" rel="noopener noreferrer"
              style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "7px 13px", border: "1px solid #E4405F", borderRadius: "var(--radius-pill)", color: "#E4405F", textDecoration: "none", fontSize: 12, fontWeight: 500 }}>
              <svg width="13" height="13" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
              Watch on @shopnyaree
            </a>
          )}
          {session?.user ? (
            <button className="btn btn-outline btn-sm" onClick={() => setShowForm(!showForm)}>
              {showForm ? "Cancel" : "✏️ Write a Review"}
            </button>
          ) : (
            <Link href="/auth/login"><button className="btn btn-outline btn-sm">Sign In to Review</button></Link>
          )}
        </div>
      </div>

      {/* Rating summary */}
      {rating.count > 0 && (
        <div style={{ display: "grid", gridTemplateColumns: "auto 1fr", gap: 28, marginBottom: 36, alignItems: "center" }}>
          <div style={{ textAlign: "center", minWidth: 90 }}>
            <p style={{ fontFamily: "var(--font-display)", fontSize: 48, fontWeight: 300, lineHeight: 1 }}>{rating.average.toFixed(1)}</p>
            <Stars value={Math.round(rating.average)} size={13} />
            <p style={{ fontSize: 11, color: "var(--color-ink-light)", marginTop: 4 }}>{rating.count} reviews</p>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
            {ratingBars.map(({ star, count, pct }) => (
              <div key={star} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ fontSize: 11, color: "var(--color-ink-light)", width: 10, textAlign: "right", flexShrink: 0 }}>{star}</span>
                <svg width="9" height="9" viewBox="0 0 24 24" fill="var(--color-gold)" style={{ flexShrink: 0 }}><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
                <div style={{ flex: 1, height: 7, background: "var(--color-border)", borderRadius: 3, overflow: "hidden" }}>
                  <div style={{ height: "100%", background: "var(--color-gold)", width: `${pct}%`, transition: "width 0.6s ease", borderRadius: 3 }} />
                </div>
                <span style={{ fontSize: 11, color: "var(--color-ink-light)", width: 16, textAlign: "right", flexShrink: 0 }}>{count}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Write review form */}
      {showForm && (
        <div className="card" style={{ padding: "24px 20px", marginBottom: 32, animation: "fadeInDown 0.2s ease" }}>
          <h3 style={{ fontFamily: "var(--font-display)", fontSize: 18, marginBottom: 4 }}>Your Review</h3>
          <p style={{ fontSize: 12, color: "var(--color-ink-light)", marginBottom: 20 }}>
            All reviews go for approval first. Verified buyers get a special badge automatically.
          </p>
          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <div>
              <label className="label">Rating *</label>
              <Stars value={form.rating} size={26} interactive onChange={v => setForm(f => ({ ...f, rating: v }))} />
            </div>
            <div>
              <label className="label">Title</label>
              <input className="input" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="e.g. Perfect fit, loved the fabric!" maxLength={120} />
            </div>
            <div>
              <label className="label">Review *</label>
              <textarea className="input" value={form.body} onChange={e => setForm(f => ({ ...f, body: e.target.value }))}
                placeholder="Share details about fabric, fit, colour accuracy, quality..." rows={4} required minLength={10} maxLength={2000} />
              <p style={{ fontSize: 11, color: "var(--color-ink-light)", marginTop: 2, textAlign: "right" }}>{form.body.length}/2000</p>
            </div>
            <div>
              <label className="label">Add Photos (max 5)</label>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
                {uploadedImages.map((url, i) => (
                  <div key={i} style={{ position: "relative", flexShrink: 0 }}>
                    <Image src={url} alt="" width={60} height={60} style={{ objectFit: "cover", borderRadius: "var(--radius-sm)", border: "1px solid var(--color-border)" }} />
                    <button type="button" onClick={() => setUploadedImages(p => p.filter((_,idx) => idx !== i))}
                      style={{ position: "absolute", top: -5, right: -5, width: 16, height: 16, borderRadius: "50%", background: "var(--color-accent-red)", color: "#fff", border: "none", fontSize: 9, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>×</button>
                  </div>
                ))}
                {uploadedImages.length < 5 && (
                  <button type="button" onClick={() => fileRef.current?.click()}
                    style={{ width: 60, height: 60, border: "2px dashed var(--color-border)", borderRadius: "var(--radius-sm)", background: "var(--color-ivory-dark)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 2, cursor: "pointer", fontSize: 9, color: "var(--color-ink-light)", flexShrink: 0 }}>
                    {uploading ? <div style={{ width: 14, height: 14, border: "2px solid var(--color-border)", borderTopColor: "var(--color-gold)", borderRadius: "50%", animation: "spin 0.7s linear infinite" }} /> : <>📷<span>Add</span></>}
                  </button>
                )}
                <input ref={fileRef} type="file" accept="image/*" multiple style={{ display: "none" }}
                  onChange={e => e.target.files && uploadImages(e.target.files)} />
              </div>
            </div>
            <div style={{ display: "flex", gap: 10 }}>
              <button type="submit" className={`btn btn-primary ${submitting ? "btn-loading" : ""}`} disabled={submitting || uploading}>
                {submitting ? "Submitting..." : "Submit Review"}
              </button>
              <button type="button" className="btn btn-ghost" onClick={() => setShowForm(false)}>Cancel</button>
            </div>
          </form>
        </div>
      )}

      {/* Review list */}
      {reviews.length === 0 ? (
        <div style={{ textAlign: "center", padding: "40px 0", color: "var(--color-ink-light)" }}>
          <p style={{ fontSize: 32, marginBottom: 10 }}>✍️</p>
          <p style={{ fontSize: 15, marginBottom: 4 }}>No reviews yet</p>
          <p style={{ fontSize: 13, marginBottom: 16 }}>Be the first to share your experience!</p>
          {session?.user
            ? <button className="btn btn-outline btn-sm" onClick={() => setShowForm(true)}>Write a Review</button>
            : <Link href="/auth/login"><button className="btn btn-outline btn-sm">Sign In to Review</button></Link>}
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column" }}>
          {reviews.map((r, idx) => (
            <div key={r._id} style={{ padding: "20px 0", borderBottom: idx < reviews.length - 1 ? "1px solid var(--color-border-light)" : "none" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <div style={{ width: 34, height: 34, borderRadius: "50%", background: "var(--color-gold)", display: "flex", alignItems: "center", justifyContent: "center", color: "#1A1208", fontSize: 13, fontWeight: 700, flexShrink: 0, overflow: "hidden" }}>
                    {r.userImage ? <img src={r.userImage} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : (r.userName?.[0] ?? "U").toUpperCase()}
                  </div>
                  <div>
                    <p style={{ fontSize: 13, fontWeight: 500, lineHeight: 1.3 }}>{r.userName}</p>
                    {r.isVerifiedPurchase && <span className="verified-badge">✓ Verified Purchase</span>}
                  </div>
                </div>
                <p style={{ fontSize: 11, color: "var(--color-ink-light)", flexShrink: 0 }}>
                  {new Date(r.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                </p>
              </div>
              <Stars value={r.rating} size={13} />
              {r.title && <p style={{ fontWeight: 500, marginTop: 7, marginBottom: 2, fontSize: 14 }}>{r.title}</p>}
              <p style={{ fontSize: 14, color: "var(--color-ink-muted)", lineHeight: 1.75, marginTop: r.title ? 0 : 7 }}>{r.body}</p>
              {r.images && r.images.length > 0 && (
                <div className="review-images">
                  {r.images.map((img, i) => (
                    <img key={i} src={img} alt={`Photo ${i+1}`} className="review-image-thumb" onClick={() => setLightbox(img)} />
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Instagram CTA */}
      <div style={{ marginTop: 28, padding: "14px 18px", background: "linear-gradient(135deg,#f09433,#e6683c,#dc2743,#cc2366,#bc1888)", borderRadius: "var(--radius-sm)", display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
        <p style={{ fontSize: 13, color: "#fff", lineHeight: 1.5, flex: 1, minWidth: 200 }}>
          Tag <strong>@shopnyaree</strong> in your Instagram for a chance to be featured! 📸
        </p>
        <a href="https://instagram.com/shopnyaree" target="_blank" rel="noopener noreferrer"
          style={{ flexShrink: 0, background: "rgba(255,255,255,0.2)", border: "1px solid rgba(255,255,255,0.5)", borderRadius: "var(--radius-pill)", padding: "5px 14px", color: "#fff", fontSize: 12, textDecoration: "none", fontWeight: 500, whiteSpace: "nowrap" }}>
          Follow @shopnyaree
        </a>
      </div>

      {/* Lightbox */}
      {lightbox && (
        <div onClick={() => setLightbox(null)} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.9)", zIndex: 9999, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
          <button onClick={() => setLightbox(null)} style={{ position: "absolute", top: 16, right: 16, background: "rgba(255,255,255,0.15)", border: "none", color: "#fff", width: 36, height: 36, borderRadius: "50%", fontSize: 18, cursor: "pointer" }}>×</button>
          <img src={lightbox} alt="Review" style={{ maxWidth: "90vw", maxHeight: "85vh", objectFit: "contain", borderRadius: "var(--radius-sm)" }} onClick={e => e.stopPropagation()} />
        </div>
      )}
    </div>
  );
}
