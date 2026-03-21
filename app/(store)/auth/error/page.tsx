// app/(store)/auth/error/page.tsx
import Link from "next/link";
import type { Metadata } from "next";
export const metadata: Metadata = { title: "Auth Error | Nyaree" };

export default function AuthErrorPage() {
  return (
    <div style={{ minHeight: "70vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "40px 20px" }}>
      <div style={{ textAlign: "center", maxWidth: 400 }}>
        <p style={{ fontSize: 48, marginBottom: 16 }}>🔐</p>
        <h1 style={{ fontFamily: "var(--font-display)", fontSize: 28, fontWeight: 400, marginBottom: 12 }}>
          Sign In Failed
        </h1>
        <p style={{ fontSize: 14, color: "var(--color-ink-light)", marginBottom: 28 }}>
          Something went wrong during sign in. This may happen if your account was created differently, or if you cancelled the sign-in.
        </p>
        <Link href="/auth/login">
          <button className="btn btn-primary">Try Again</button>
        </Link>
        <p style={{ marginTop: 20, fontSize: 13, color: "var(--color-ink-light)" }}>
          Need help? <a href="https://wa.me/918368989758" style={{ color: "var(--color-gold)" }}>WhatsApp us</a>
        </p>
      </div>
    </div>
  );
}
