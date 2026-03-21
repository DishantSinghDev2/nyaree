"use client";
// app/(store)/auth/login/page.tsx
import { useState, Suspense } from "react";
import { signIn } from "next-auth/react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get("next") ?? "/";
  const error = searchParams.get("error");

  const [mode, setMode] = useState<"login" | "register">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [formError, setFormError] = useState("");

  const handleGoogle = async () => {
    setGoogleLoading(true);
    await signIn("google", { callbackUrl: next });
  };

  const handleCredentials = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");
    setLoading(true);

    if (mode === "register") {
      // Register: call our own API, then sign in
      try {
        const res = await fetch("/api/auth/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name, email, password }),
        });
        const data = await res.json();
        if (!data.success) { setFormError(data.error || "Registration failed"); setLoading(false); return; }
        // Sign in after register
        const result = await signIn("credentials", { email, password, redirect: false });
        if (result?.error) { setFormError("Login after registration failed"); setLoading(false); return; }
        router.push(next);
      } catch { setFormError("Something went wrong"); setLoading(false); }
      return;
    }

    // Login
    const result = await signIn("credentials", { email, password, redirect: false });
    if (result?.error) {
      setFormError("Invalid email or password");
      setLoading(false);
      return;
    }
    router.push(next);
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "var(--color-ivory)", padding: "40px 20px" }}>
      <div style={{ width: "100%", maxWidth: 420 }}>
        {/* Logo */}
        <Link href="/" style={{ display: "block", textAlign: "center", fontFamily: "var(--font-display)", fontSize: 30, letterSpacing: 6, color: "var(--color-ink)", textDecoration: "none", marginBottom: 40 }}>
          NYA<span style={{ color: "var(--color-gold)" }}>REE</span>
        </Link>

        <div className="card" style={{ padding: "40px 36px" }}>
          {/* Mode toggle */}
          <div style={{ display: "flex", borderBottom: "2px solid var(--color-border)", marginBottom: 28 }}>
            {(["login", "register"] as const).map((m) => (
              <button key={m} onClick={() => setMode(m)} style={{
                flex: 1, padding: "10px 0", background: "none", border: "none",
                borderBottom: mode === m ? "2px solid var(--color-gold)" : "2px solid transparent",
                marginBottom: -2, fontFamily: "var(--font-body)", fontSize: 13, fontWeight: 500,
                color: mode === m ? "var(--color-gold)" : "var(--color-ink-light)",
                cursor: "pointer", textTransform: "capitalize", transition: "all 0.15s",
              }}>
                {m === "login" ? "Sign In" : "Create Account"}
              </button>
            ))}
          </div>

          {/* Error from URL (e.g. OAuth error) */}
          {error && (
            <div style={{ background: "#FEE2E2", border: "1px solid var(--color-accent-red)", borderRadius: "var(--radius-sm)", padding: "10px 14px", fontSize: 13, color: "var(--color-accent-red)", marginBottom: 20 }}>
              {error === "OAuthSignin" ? "Sign-in failed. Please try again." :
               error === "OAuthCallback" ? "Google sign-in failed. Please try again." :
               error === "Callback" ? "Authentication error. Please try again." :
               "Sign-in failed. Please try again."}
            </div>
          )}

          {/* Form error */}
          {formError && (
            <div style={{ background: "#FEE2E2", border: "1px solid var(--color-accent-red)", borderRadius: "var(--radius-sm)", padding: "10px 14px", fontSize: 13, color: "var(--color-accent-red)", marginBottom: 20 }}>
              {formError}
            </div>
          )}

          {/* Google Sign In */}
          <button
            onClick={handleGoogle}
            disabled={googleLoading}
            className={`btn btn-outline btn-full ${googleLoading ? "btn-loading" : ""}`}
            style={{ gap: 10, marginBottom: 20, fontSize: 13 }}
          >
            {!googleLoading && (
              <svg width="18" height="18" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
            )}
            Continue with Google
          </button>

          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
            <div style={{ flex: 1, height: 1, background: "var(--color-border)" }} />
            <span style={{ fontSize: 12, color: "var(--color-ink-light)" }}>or</span>
            <div style={{ flex: 1, height: 1, background: "var(--color-border)" }} />
          </div>

          {/* Credentials form */}
          <form onSubmit={handleCredentials} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {mode === "register" && (
              <div>
                <label className="label">Full Name</label>
                <input className="input" type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Priya Sharma" required={mode === "register"} />
              </div>
            )}
            <div>
              <label className="label">Email Address</label>
              <input className="input" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" required />
            </div>
            <div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <label className="label">Password</label>
                {mode === "login" && (
                  <Link href="/auth/forgot-password" style={{ fontSize: 11, color: "var(--color-gold)", textDecoration: "none" }}>
                    Forgot password?
                  </Link>
                )}
              </div>
              <input className="input" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder={mode === "register" ? "Min 8 characters" : "Your password"} required minLength={mode === "register" ? 8 : 1} />
            </div>
            <button type="submit" className={`btn btn-primary btn-full ${loading ? "btn-loading" : ""}`} disabled={loading} style={{ marginTop: 4 }}>
              {loading ? "Please wait..." : mode === "login" ? "Sign In" : "Create Account"}
            </button>
          </form>
        </div>

        <p style={{ textAlign: "center", marginTop: 20, fontSize: 12, color: "var(--color-ink-light)" }}>
          By continuing, you agree to our{" "}
          <Link href="/legal/terms" style={{ color: "var(--color-gold)" }}>Terms</Link> and{" "}
          <Link href="/legal/privacy-policy" style={{ color: "var(--color-gold)" }}>Privacy Policy</Link>
        </p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}><div className="animate-spin" style={{ width: 32, height: 32, border: "2px solid var(--color-border)", borderTopColor: "var(--color-gold)", borderRadius: "50%" }} /></div>}>
      <LoginForm />
    </Suspense>
  );
}
