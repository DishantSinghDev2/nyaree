"use client";
// app/(admin)/dashboard/reviews/page.tsx
import { useState, useEffect } from "react";
import Image from "next/image";
import { showToast } from "@/components/ui/Toaster";

interface Review {
  _id: string; userName: string; userImage?: string;
  rating: number; title?: string; body: string;
  images?: string[]; isVerifiedPurchase: boolean;
  isApproved: boolean; createdAt: string;
  product?: { name: string; slug: string };
}

const STARS = "★★★★★";
function Stars({ n }: { n: number }) {
  return <span style={{ color: "var(--color-gold)", fontSize: 13 }}>{STARS.slice(0, Math.round(n))}<span style={{ color: "var(--color-border)", fontSize: 13 }}>{STARS.slice(Math.round(n))}</span></span>;
}

export default function ReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"pending" | "approved" | "all">("pending");
  const [saving, setSaving] = useState<string | null>(null);
  const [editing, setEditing] = useState<{ id: string; body: string; title: string } | null>(null);
  const [lightbox, setLightbox] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/reviews?status=${filter}`);
      const data = await res.json();
      if (data.success) setReviews(data.data);
    } finally { setLoading(false); }
  };

  useEffect(() => { load(); }, [filter]);

  const update = async (id: string, patch: Partial<Review>) => {
    setSaving(id);
    try {
      const res = await fetch(`/api/reviews/${id}`, {
        method: "PUT", headers: { "Content-Type": "application/json" },
        body: JSON.stringify(patch),
      });
      const data = await res.json();
      if (data.success) {
        showToast(patch.isApproved ? "✅ Review approved & published!" : "Review updated", "success");
        load();
      } else showToast(data.error || "Failed", "error");
    } finally { setSaving(null); }
  };

  const deleteReview = async (id: string) => {
    if (!confirm("Delete this review permanently?")) return;
    setSaving(id);
    try {
      await fetch(`/api/reviews/${id}`, { method: "DELETE" });
      showToast("Review deleted", "success");
      load();
    } finally { setSaving(null); }
  };

  const saveEdit = async () => {
    if (!editing) return;
    await update(editing.id, { body: editing.body, title: editing.title });
    setEditing(null);
  };

  const pending = reviews.filter(r => !r.isApproved).length;
  const approved = reviews.filter(r => r.isApproved).length;

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 32 }}>
        <div>
          <h1 style={{ fontFamily: "var(--font-display)", fontSize: 26, fontWeight: 400 }}>Product Reviews</h1>
          <p style={{ fontSize: 13, color: "var(--color-ink-light)", marginTop: 4 }}>
            Approve, edit, or delete customer reviews before they go live
          </p>
        </div>
        {pending > 0 && (
          <span style={{ background: "var(--color-accent-red)", color: "#fff", padding: "4px 12px", borderRadius: "var(--radius-pill)", fontSize: 12, fontWeight: 600 }}>
            {pending} pending
          </span>
        )}
      </div>

      {/* Filter tabs */}
      <div style={{ display: "flex", gap: 0, borderBottom: "1px solid var(--color-border)", marginBottom: 24 }}>
        {([["pending", `Pending (${pending})`], ["approved", `Approved (${approved})`], ["all", "All"]] as const).map(([val, label]) => (
          <button key={val} onClick={() => setFilter(val)} style={{
            padding: "10px 20px", background: "none", border: "none",
            borderBottom: filter === val ? "2px solid var(--color-gold)" : "2px solid transparent",
            color: filter === val ? "var(--color-gold)" : "var(--color-ink-light)",
            fontSize: 13, fontWeight: filter === val ? 500 : 400, cursor: "pointer", transition: "all 0.15s",
          }}>{label}</button>
        ))}
      </div>

      {loading ? (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {[1,2,3].map(i => <div key={i} className="skeleton" style={{ height: 120, borderRadius: "var(--radius-sm)" }} />)}
        </div>
      ) : reviews.length === 0 ? (
        <div className="card" style={{ padding: 48, textAlign: "center" }}>
          <p style={{ fontSize: 36, marginBottom: 12 }}>⭐</p>
          <h2 style={{ fontFamily: "var(--font-display)", fontSize: 20, marginBottom: 8 }}>
            {filter === "pending" ? "No pending reviews!" : "No reviews found"}
          </h2>
          <p style={{ color: "var(--color-ink-light)", fontSize: 14 }}>
            {filter === "pending" ? "All reviews are up to date 🎉" : "Reviews will appear here once customers submit them"}
          </p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {reviews.map(r => (
            <div key={r._id} className="card" style={{ padding: "20px 24px", borderLeft: r.isApproved ? "3px solid var(--color-success)" : "3px solid var(--color-gold)" }}>
              {editing?.id === r._id ? (
                /* Edit mode */
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <p style={{ fontWeight: 500, fontSize: 14 }}>Editing review by {r.userName}</p>
                    <Stars n={r.rating} />
                  </div>
                  <div>
                    <label className="label">Title</label>
                    <input className="input" value={editing.title} onChange={e => setEditing(ed => ed ? { ...ed, title: e.target.value } : ed)} />
                  </div>
                  <div>
                    <label className="label">Review Body</label>
                    <textarea className="input" value={editing.body} onChange={e => setEditing(ed => ed ? { ...ed, body: e.target.value } : ed)} rows={4} style={{ resize: "vertical" }} />
                  </div>
                  <div style={{ display: "flex", gap: 8 }}>
                    <button className={`btn btn-primary btn-sm ${saving === r._id ? "btn-loading" : ""}`} onClick={saveEdit} disabled={!!saving}>Save</button>
                    <button className="btn btn-ghost btn-sm" onClick={() => setEditing(null)}>Cancel</button>
                  </div>
                </div>
              ) : (
                /* View mode */
                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10, gap: 12 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <div style={{ width: 32, height: 32, borderRadius: "50%", background: "var(--color-gold)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700, color: "#1A1208", flexShrink: 0, overflow: "hidden" }}>
                        {r.userImage ? <img src={r.userImage} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : (r.userName?.[0] ?? "?").toUpperCase()}
                      </div>
                      <div>
                        <p style={{ fontSize: 13, fontWeight: 500 }}>{r.userName}</p>
                        <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                          <Stars n={r.rating} />
                          {r.isVerifiedPurchase && <span className="verified-badge">✓ Verified</span>}
                          <span className={`status-pill ${r.isApproved ? "status-delivered" : "status-pending"}`} style={{ fontSize: 10 }}>
                            {r.isApproved ? "Published" : "Pending"}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div style={{ display: "flex", gap: 6, flexWrap: "wrap", flexShrink: 0 }}>
                      {!r.isApproved && (
                        <button className={`btn btn-primary btn-sm ${saving === r._id ? "btn-loading" : ""}`}
                          onClick={() => update(r._id, { isApproved: true })} disabled={saving === r._id}>
                          ✓ Approve
                        </button>
                      )}
                      {r.isApproved && (
                        <button className="btn btn-outline btn-sm" onClick={() => update(r._id, { isApproved: false })} disabled={saving === r._id}>
                          Unpublish
                        </button>
                      )}
                      <button className="btn btn-ghost btn-sm" onClick={() => setEditing({ id: r._id, body: r.body, title: r.title ?? "" })}>
                        Edit
                      </button>
                      <button className="btn btn-ghost btn-sm" style={{ color: "var(--color-accent-red)" }}
                        onClick={() => deleteReview(r._id)} disabled={saving === r._id}>
                        Delete
                      </button>
                    </div>
                  </div>

                  {r.product && (
                    <p style={{ fontSize: 11, color: "var(--color-ink-light)", marginBottom: 8 }}>
                      Product: <a href={`/product/${r.product.slug}`} target="_blank" style={{ color: "var(--color-gold)" }}>{r.product.name}</a>
                    </p>
                  )}

                  {r.title && <p style={{ fontWeight: 500, fontSize: 14, marginBottom: 4 }}>{r.title}</p>}
                  <p style={{ fontSize: 14, color: "var(--color-ink-muted)", lineHeight: 1.7 }}>{r.body}</p>

                  {r.images && r.images.length > 0 && (
                    <div style={{ display: "flex", gap: 8, marginTop: 10, flexWrap: "wrap" }}>
                      {r.images.map((img, i) => (
                        <img key={i} src={img} alt="" style={{ width: 56, height: 56, objectFit: "cover", borderRadius: "var(--radius-sm)", border: "1px solid var(--color-border)", cursor: "pointer" }}
                          onClick={() => setLightbox(img)} />
                      ))}
                    </div>
                  )}

                  <p style={{ fontSize: 11, color: "var(--color-ink-light)", marginTop: 10 }}>
                    Submitted {new Date(r.createdAt).toLocaleString("en-IN", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {lightbox && (
        <div onClick={() => setLightbox(null)} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.9)", zIndex: 9999, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <button onClick={() => setLightbox(null)} style={{ position: "absolute", top: 16, right: 16, background: "rgba(255,255,255,0.15)", border: "none", color: "#fff", width: 36, height: 36, borderRadius: "50%", fontSize: 18, cursor: "pointer" }}>×</button>
          <img src={lightbox} alt="Review" style={{ maxWidth: "85vw", maxHeight: "85vh", objectFit: "contain" }} onClick={e => e.stopPropagation()} />
        </div>
      )}
    </div>
  );
}
