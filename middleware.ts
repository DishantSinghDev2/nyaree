// middleware.ts
// ⚡ EDGE RUNTIME — imports ONLY from lib/auth/config.ts (no MongoDB, no bcrypt)
// Route protection is done purely via JWT token decode (already in the cookie).
import NextAuth from "next-auth";
import { authConfig } from "@/lib/auth/config";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Create a lightweight NextAuth instance using only the Edge-safe config
// This does NOT connect to MongoDB — it only decodes the JWT cookie
const { auth } = NextAuth(authConfig);

export default auth((req) => {
  const session = (req as any).auth;
  const pathname = req.nextUrl.pathname;

  // ── Admin route protection ─────────────────────────────────────────────────
  if (pathname.startsWith("/dashboard")) {
    if (!session?.user) {
      return NextResponse.redirect(
        new URL(`/auth/login?next=${encodeURIComponent(pathname)}`, req.url)
      );
    }
    if ((session.user as any).role !== "admin") {
      return NextResponse.redirect(new URL("/?error=unauthorized", req.url));
    }
  }

  // ── Account route protection ───────────────────────────────────────────────
  if (pathname.startsWith("/account") && !session?.user) {
    return NextResponse.redirect(
      new URL(`/auth/login?next=${encodeURIComponent(pathname)}`, req.url)
    );
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    // Only run on routes that need protection — skip everything else
    "/dashboard/:path*",
    "/account/:path*",
    // Skip static assets, _next internals, api/auth, favicon
    "/((?!_next/static|_next/image|favicon.ico|icon.png|manifest.json|api/auth|images|icons).*)",
  ],
};
