// lib/auth/index.ts
// NextAuth v5 beta (5.0.0-beta.25) — App Router, CF Workers compatible
// Uses JWT strategy (no DB sessions) + MongoDB adapter for storing accounts/users
// Auth.js v5 pattern: export { auth, handlers, signIn, signOut } from one file

import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import Credentials from "next-auth/providers/credentials";
import { MongoDBAdapter } from "@auth/mongodb-adapter";
import { MongoClient } from "mongodb";
import bcrypt from "bcryptjs";
import type { NextAuthConfig } from "next-auth";

// ─── MongoDB client (singleton for adapter) ──────────────────────────────────
// Note: Auth adapter needs a raw MongoClient (not Mongoose)
let _client: MongoClient;
let _clientPromise: Promise<MongoClient>;

function getMongoClientPromise(): Promise<MongoClient> {
  const uri = process.env.MONGODB_URI!;
  if (!uri) throw new Error("MONGODB_URI is not set");

  if (process.env.NODE_ENV === "development") {
    // In dev, reuse across hot-reloads
    const g = global as typeof global & { _mongoClientPromise?: Promise<MongoClient> };
    if (!g._mongoClientPromise) {
      _client = new MongoClient(uri);
      g._mongoClientPromise = _client.connect();
    }
    return g._mongoClientPromise;
  }

  // Production / CF Workers: new per cold start
  if (!_clientPromise) {
    _client = new MongoClient(uri, { tls: true, serverSelectionTimeoutMS: 5000 });
    _clientPromise = _client.connect();
  }
  return _clientPromise;
}

// ─── NextAuth v5 config ───────────────────────────────────────────────────────
export const authConfig: NextAuthConfig = {
  // JWT strategy works great with CF Workers (no extra DB roundtrip per request)
  session: { strategy: "jwt" },

  // Auth.js v5: secret comes from AUTH_SECRET env var automatically
  // But we also support NEXTAUTH_SECRET for backward compat
  secret: process.env.AUTH_SECRET ?? process.env.NEXTAUTH_SECRET,

  pages: {
    signIn: "/auth/login",
    error: "/auth/error",
    verifyRequest: "/auth/verify",
  },

  providers: [
    // ── Google OAuth ──────────────────────────────────────────────────────────
    Google({
      clientId: process.env.AUTH_GOOGLE_ID ?? process.env.GOOGLE_CLIENT_ID ?? "",
      clientSecret: process.env.AUTH_GOOGLE_SECRET ?? process.env.GOOGLE_CLIENT_SECRET ?? "",
    }),

    // ── Email + Password (Credentials) ────────────────────────────────────────
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        try {
          // Lazy import mongoose to avoid edge runtime issues
          const { connectDB } = await import("@/lib/db/mongoose");
          const { UserModel } = await import("@/lib/db/models/index");
          await connectDB();

          const user = await UserModel.findOne({
            email: (credentials.email as string).toLowerCase(),
          }).select("+passwordHash").lean() as any;

          if (!user || !user.passwordHash) return null;

          const valid = await bcrypt.compare(
            credentials.password as string,
            user.passwordHash
          );
          if (!valid) return null;

          return {
            id: user._id.toString(),
            email: user.email,
            name: user.name,
            image: user.image,
            role: user.role ?? "customer",
          };
        } catch (err) {
          console.error("Auth credentials error:", err);
          return null;
        }
      },
    }),
  ],

  callbacks: {
    // Inject role + id into JWT token
    async jwt({ token, user, account }) {
      if (user) {
        token.id = user.id;
        token.role = (user as any).role ?? "customer";
      }
      // On first Google sign-in, sync role from DB
      if (account?.provider === "google" && token.email) {
        try {
          const { connectDB } = await import("@/lib/db/mongoose");
          const { UserModel } = await import("@/lib/db/models/index");
          await connectDB();
          const dbUser = await UserModel.findOne({ email: token.email }).lean() as any;
          if (dbUser) {
            token.id = dbUser._id.toString();
            token.role = dbUser.role ?? "customer";
          }
        } catch {}
      }
      return token;
    },

    // Expose id + role on session.user
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        (session.user as any).role = token.role as string;
      }
      return session;
    },
  },

  events: {
    // After first Google sign-in: upsert user in our users collection
    async signIn({ user, account }) {
      if (account?.provider === "google" && user.email) {
        try {
          const { connectDB } = await import("@/lib/db/mongoose");
          const { UserModel } = await import("@/lib/db/models/index");
          await connectDB();
          await UserModel.findOneAndUpdate(
            { email: user.email.toLowerCase() },
            {
              $setOnInsert: {
                email: user.email.toLowerCase(),
                name: user.name,
                image: user.image,
                role: "customer",
                emailVerified: true,
              },
            },
            { upsert: true, new: true }
          );
        } catch {}
      }
    },
  },

  trustHost: true,
};

// ─── Create NextAuth instance ─────────────────────────────────────────────────
// We use JWT sessions so the MongoDB adapter is only needed for OAuth account
// linking (not session storage). This keeps CF Workers happy.
let clientPromise: Promise<MongoClient>;

export const { handlers, auth, signIn, signOut } = NextAuth(() => {
  // Lazy-init MongoDB adapter so it doesn't run at module load time
  clientPromise = getMongoClientPromise();
  return {
    ...authConfig,
    adapter: MongoDBAdapter(clientPromise, { databaseName: "nyaree" }),
  };
});

// Helper: get session in server components / route handlers (v5 pattern)
export { auth as getServerSession };

