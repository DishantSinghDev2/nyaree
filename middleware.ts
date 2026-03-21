// middleware.ts — Root middleware for Nyaree
// NextAuth v5 beta: use the exported `auth` function as middleware
import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export default auth((req) => {
  const { nextUrl, auth: session } = req as any;
  const pathname = nextUrl.pathname;

  // ── Admin route protection ─────────────────────────────────────────────────
  if (pathname.startsWith("/dashboard")) {
    // Not logged in → redirect to login
    if (!session?.user) {
      return NextResponse.redirect(
        new URL(`/auth/login?next=${encodeURIComponent(pathname)}`, req.url)
      );
    }
    // Logged in but not admin → redirect to home
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
  // Run middleware on these paths (skip static files, api/auth, _next)
  matcher: [
    "/dashboard/:path*",
    "/account/:path*",
    // Exclude API auth routes and static files
    "/((?!api/auth|_next/static|_next/image|favicon.ico|images|icons|manifest.json).*)",
  ],
};
