"use client";
// components/store/ProductReviews.tsx
import { useState } from "react";
import { showToast } from "@/components/ui/Toaster";

interface Review {
  _id: string;
  userName: string;
  userImage?: string;
  rating: number;
  title: string;
  body: string;
  images?: string[];
  isVerifiedPurchase: boolean;
  createdAt: string;
}

interface Props {
  reviews: Review[];
  productId: string;
  rating: { average: number; count: number };
}

export function ProductReviews({ reviews, productId, rating }: Props) {
  const [showForm, setShowForm] = useState(false);
  const [newReview, setNewReview] = useState({ rating: 5, title: "", body: "" });
  const [submitting, setSubmitting] = useState(false);

  const ratingBars = [5, 4, 3, 2, 1].map((star) => ({
    star,
    count: reviews.filter((r) => Math.round(r.rating) === star).length,
    pct: reviews.length > 0
      ? Math.round((reviews.filter((r) => Math.round(r.rating) === star).length / reviews.length) * 100)
      : 0,
  }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newReview.body.trim()) { showToast("Please write your review", "error"); return; }
    setSubmitting(true);
    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId, ...newReview }),
      });
      const data = await res.json();
      if (data.success) {
        showToast("Review submitted! It will appear after approval.", "success");
        setShowForm(false);
        setNewReview({ rating: 5, title: "", body: "" });
      } else {
        showToast(data.error || "Failed to submit", "error");
      }
    } finally { setSubmitting(false); }
  };

  const StarRating = ({ value, onChange }: { value: number; onChange?: (v: number) => void }) => (
    <div style={{ display: "flex", gap: 4 }}>
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => onChange?.(star)}
          style={{ background: "none", border: "none", padding: 0, cursor: onChange ? "pointer" : "default" }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24"
            fill={star <= value ? "var(--color-gold)" : "none"}
            stroke="var(--color-gold)" strokeWidth="1.5">
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
          </svg>
        </button>
      ))}
    </div>
  );

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 40 }}>
        <div>
          <h2 style={{ fontFamily: "var(--font-display)", fontSize: "clamp(1.5rem, 3vw, 2rem)", fontWeight: 400, marginBottom: 4 }}>
            Customer Reviews
          </h2>
          {rating.count > 0 && (
            <p style={{ fontSize: 14, color: "var(--color-ink-light)" }}>
              Based on {rating.count} review{rating.count !== 1 ? "s" : ""}
            </p>
          )}
        </div>
        <button className="btn btn-outline btn-sm" onClick={() => setShowForm(!showForm)}>
          Write a Review
        </button>
      </div>

      {/* Rating summary */}
      {rating.count > 0 && (
        <div style={{ display: "grid", gridTemplateColumns: "auto 1fr", gap: 40, marginBottom: 48, alignItems: "center" }}>
          <div style={{ textAlign: "center" }}>
            <p style={{ fontFamily: "var(--font-display)", fontSize: 56, fontWeight: 300, lineHeight: 1, color: "var(--color-ink)" }}>
              {rating.average.toFixed(1)}
            </p>
            <StarRating value={Math.round(rating.average)} />
            <p style={{ fontSize: 12, color: "var(--color-ink-light)", marginTop: 6 }}>
              {rating.count} review{rating.count !== 1 ? "s" : ""}
            </p>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {ratingBars.map(({ star, count, pct }) => (
              <div key={star} style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <span style={{ fontSize: 12, color: "var(--color-ink-light)", width: 16, flexShrink: 0 }}>{star}</span>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="var(--color-gold)" stroke="none" style={{ flexShrink: 0 }}>
                  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                </svg>
                <div style={{ flex: 1, height: 8, background: "var(--color-border)", borderRadius: 4 }}>
                  <div style={{ height: "100%", borderRadius: 4, background: "var(--color-gold)", width: `${pct}%`, transition: "width 0.5s ease" }} />
                </div>
                <span style={{ fontSize: 12, color: "var(--color-ink-light)", width: 28, textAlign: "right", flexShrink: 0 }}>
                  {count}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Write review form */}
      {showForm && (
        <div className="card" style={{ padding: 32, marginBottom: 40, animation: "fadeInDown 0.2s ease" }}>
          <h3 style={{ fontFamily: "var(--font-display)", fontSize: 20, marginBottom: 24 }}>Write Your Review</h3>
          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div>
              <label className="label">Your Rating</label>
              <StarRating value={newReview.rating} onChange={(v) => setNewReview((r) => ({ ...r, rating: v }))} />
            </div>
            <div>
              <label className="label">Review Title</label>
              <input
                className="input"
                value={newReview.title}
                onChange={(e) => setNewReview((r) => ({ ...r, title: e.target.value }))}
                placeholder="Summarise your experience..."
              />
            </div>
            <div>
              <label className="label">Your Review *</label>
              <textarea
                className="input"
                value={newReview.body}
                onChange={(e) => setNewReview((r) => ({ ...r, body: e.target.value }))}
                placeholder="Tell others about the fabric, fit, colour accuracy..."
                rows={4}
                required
              />
            </div>
            <div style={{ display: "flex", gap: 10 }}>
              <button type="submit" className={`btn btn-primary ${submitting ? "btn-loading" : ""}`} disabled={submitting}>
                {submitting ? "Submitting..." : "Submit Review"}
              </button>
              <button type="button" className="btn btn-ghost" onClick={() => setShowForm(false)}>Cancel</button>
            </div>
          </form>
        </div>
      )}

      {/* Review list */}
      {reviews.length === 0 ? (
        <div style={{ textAlign: "center", padding: "48px 0", color: "var(--color-ink-light)" }}>
          <p style={{ fontSize: 32, marginBottom: 12 }}>✍️</p>
          <p style={{ fontSize: 16, marginBottom: 6 }}>No reviews yet</p>
          <p style={{ fontSize: 13 }}>Be the first to share your experience!</p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
          {reviews.map((review) => (
            <div key={review._id} style={{ borderBottom: "1px solid var(--color-border-light)", paddingBottom: 28 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <div style={{ width: 36, height: 36, borderRadius: "50%", background: "var(--color-gold)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 14, fontWeight: 600, flexShrink: 0 }}>
                    {review.userName?.[0]?.toUpperCase() ?? "U"}
                  </div>
                  <div>
                    <p style={{ fontWeight: 500, fontSize: 14 }}>{review.userName}</p>
                    {review.isVerifiedPurchase && (
                      <span style={{ fontSize: 11, color: "var(--color-success)", background: "#E8F5E9", padding: "1px 8px", borderRadius: "var(--radius-pill)" }}>
                        ✓ Verified Purchase
                      </span>
                    )}
                  </div>
                </div>
                <p style={{ fontSize: 12, color: "var(--color-ink-light)" }}>
                  {new Date(review.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}
                </p>
              </div>
              <StarRating value={review.rating} />
              {review.title && (
                <p style={{ fontWeight: 500, marginTop: 10, marginBottom: 4, fontSize: 15 }}>{review.title}</p>
              )}
              <p style={{ fontSize: 14, color: "var(--color-ink-muted)", lineHeight: 1.7, marginTop: review.title ? 0 : 10 }}>
                {review.body}
              </p>
              {review.images && review.images.length > 0 && (
                <div style={{ display: "flex", gap: 8, marginTop: 12, flexWrap: "wrap" }}>
                  {review.images.map((img, i) => (
                    <img key={i} src={img} alt={`Review photo ${i + 1}`} style={{ width: 72, height: 72, objectFit: "cover", borderRadius: "var(--radius-sm)", border: "1px solid var(--color-border)" }} />
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
