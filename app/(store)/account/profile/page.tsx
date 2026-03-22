"use client";
// app/(store)/account/profile/page.tsx
import { useState } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { showToast } from "@/components/ui/Toaster";
import { useRouter } from "next/navigation";

export default function ProfilePage() {
  const router = useRouter();
  const { data: session, update } = useSession();
  const [name, setName] = useState(session?.user?.name ?? "");
  const [phone, setPhone] = useState("");
  const [saving, setSaving] = useState(false);

  if (!session?.user) {
    router.push("/auth/login?next=/account/profile"); return null;
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch("/api/account/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, phone }),
      });
      const data = await res.json();
      if (data.success) {
        await update({ name });
        showToast("Profile updated!", "success");
      } else {
        showToast(data.error || "Update failed", "error");
      }
    } finally { setSaving(false); }
  };

  return (
    <div className="container" style={{ maxWidth: 560, padding: "48px 0 80px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 40 }}>
        <Link href="/account" style={{ color: "var(--color-ink-light)", textDecoration: "none", fontSize: 13 }}>← Account</Link>
        <h1 style={{ fontFamily: "var(--font-display)", fontSize: "clamp(1.5rem, 3vw, 2rem)", fontWeight: 300 }}>My Profile</h1>
      </div>

      <div className="card" style={{ padding: 32 }}>
        {/* Avatar */}
        <div style={{ display: "flex", alignItems: "center", gap: 20, marginBottom: 32, paddingBottom: 24, borderBottom: "1px solid var(--color-border)" }}>
          <div style={{ width: 64, height: 64, borderRadius: "50%", background: "var(--color-gold)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28, color: "#fff", fontWeight: 600, flexShrink: 0, overflow: "hidden" }}>
            {session.user.image
              ? <img src={session.user.image} alt="avatar" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              : (session.user.name?.[0] ?? "U").toUpperCase()
            }
          </div>
          <div>
            <p style={{ fontFamily: "var(--font-display)", fontSize: 20 }}>{session.user.name ?? "Customer"}</p>
            <p style={{ fontSize: 13, color: "var(--color-ink-light)" }}>{session.user.email}</p>
            <p style={{ fontSize: 12, color: "var(--color-gold)", marginTop: 4, textTransform: "capitalize" }}>
              {(session.user as any).role} account
            </p>
          </div>
        </div>

        <form onSubmit={handleSave} style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          <div>
            <label className="label">Full Name</label>
            <input className="input" value={name} onChange={e => setName(e.target.value)} placeholder="Your name" />
          </div>
          <div>
            <label className="label">Email Address</label>
            <input className="input" value={session.user.email ?? ""} disabled style={{ opacity: 0.6 }} />
            <p style={{ fontSize: 11, color: "var(--color-ink-light)", marginTop: 3 }}>Email cannot be changed</p>
          </div>
          <div>
            <label className="label">Phone Number</label>
            <div style={{ display: "flex" }}>
              <span style={{ padding: "12px 12px", background: "var(--color-ivory-dark)", border: "1px solid var(--color-border)", borderRight: "none", borderRadius: "var(--radius-sm) 0 0 var(--radius-sm)", fontSize: 14, color: "var(--color-ink-light)" }}>+91</span>
              <input className="input" value={phone} onChange={e => setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))} placeholder="10-digit mobile number" style={{ borderRadius: "0 var(--radius-sm) var(--radius-sm) 0" }} />
            </div>
          </div>
          <button type="submit" className={`btn btn-primary ${saving ? "btn-loading" : ""}`} disabled={saving}>
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </form>
      </div>

      <div className="card" style={{ padding: 24, marginTop: 20 }}>
        <h3 style={{ fontFamily: "var(--font-display)", fontSize: 18, marginBottom: 16 }}>Quick Links</h3>
        <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
          {[
            { href: "/account/orders", label: "My Orders", icon: "📦" },
            { href: "/account/wishlist", label: "Wishlist", icon: "♥" },
            { href: "/track-order", label: "Track an Order", icon: "🚚" },
          ].map(item => (
            <Link key={item.href} href={item.href} style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 0", borderBottom: "1px solid var(--color-border-light)", textDecoration: "none", color: "var(--color-ink)" }}>
              <span style={{ fontSize: 18, width: 28, textAlign: "center" }}>{item.icon}</span>
              <span style={{ fontSize: 14 }}>{item.label}</span>
              <span style={{ marginLeft: "auto", color: "var(--color-ink-light)", fontSize: 16 }}>›</span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
