// lib/auth/config.ts
// ⚡ EDGE-SAFE — NO Node.js modules, NO MongoDB, NO bcrypt
// This file is imported by middleware.ts (runs in Edge Runtime)
// It only uses JWT decode to read the session token — zero DB calls.

import type { NextAuthConfig } from "next-auth";
import Google from "next-auth/providers/google";

// Minimal config with no Node.js dependencies
// The full config (with MongoDB adapter + Credentials) lives in lib/auth/index.ts
export const authConfig: NextAuthConfig = {
  providers: [
    // Google is listed here so NextAuth knows about it in Edge context
    // (needed for the OAuth redirect flow)
    Google({
      clientId: process.env.AUTH_GOOGLE_ID ?? process.env.GOOGLE_CLIENT_ID ?? "",
      clientSecret: process.env.AUTH_GOOGLE_SECRET ?? process.env.GOOGLE_CLIENT_SECRET ?? "",
    }),
  ],

  session: { strategy: "jwt" },

  pages: {
    signIn: "/auth/login",
    error: "/auth/error",
  },

  callbacks: {
    // In Edge middleware we only need the JWT callback to read role from token
    // No DB access — role is already encoded in the JWT at sign-in time
    authorized({ auth }) {
      // This is called by the middleware wrapper — return true to allow
      // Route-level checks are done in middleware.ts directly
      return true;
    },

    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = (user as any).role ?? "customer";
      }
      return token;
    },

    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        (session.user as any).role = token.role as string;
      }
      return session;
    },
  },

  secret: process.env.AUTH_SECRET ?? process.env.NEXTAUTH_SECRET ?? (
    // Dev fallback — in production this will throw (AUTH_SECRET must be set)
    process.env.NODE_ENV === "development"
      ? "dev-secret-change-this-in-production"
      : undefined
  ),
  trustHost: true,
};
