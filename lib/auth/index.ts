// lib/auth/index.ts
// ⚠️  NODE.JS ONLY — do NOT import this in middleware.ts
// This file imports mongodb + bcrypt which require Node.js runtime.
// Middleware must import from lib/auth/config.ts instead.

import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import Credentials from "next-auth/providers/credentials";
import { MongoDBAdapter } from "@auth/mongodb-adapter";
import { MongoClient } from "mongodb";
import bcrypt from "bcryptjs";
import { authConfig } from "./config";

// ─── MongoDB client for adapter (raw MongoClient, not Mongoose) ───────────────
let _clientPromise: Promise<MongoClient>;

function getMongoClientPromise(): Promise<MongoClient> {
  const uri = process.env.MONGODB_URI!;
  if (!uri) throw new Error("MONGODB_URI is not set");

  if (process.env.NODE_ENV === "development") {
    const g = global as typeof global & { _mongoClientPromise?: Promise<MongoClient> };
    if (!g._mongoClientPromise) {
      const client = new MongoClient(uri);
      g._mongoClientPromise = client.connect();
    }
    return g._mongoClientPromise!;
  }

  if (!_clientPromise) {
    const client = new MongoClient(uri, {
      tls: true,
      serverSelectionTimeoutMS: 5000,
    });
    _clientPromise = client.connect();
  }
  return _clientPromise;
}

// ─── Full NextAuth config (Node.js, has MongoDB + bcrypt) ────────────────────
export const { handlers, auth, signIn, signOut } = NextAuth(() => {
  const clientPromise = getMongoClientPromise();

  return {
    // Spread the Edge-safe base config
    ...authConfig,

    // Override providers with the full list (adds Credentials)
    providers: [
      Google({
        clientId: process.env.AUTH_GOOGLE_ID ?? process.env.GOOGLE_CLIENT_ID ?? "",
        clientSecret: process.env.AUTH_GOOGLE_SECRET ?? process.env.GOOGLE_CLIENT_SECRET ?? "",
      }),

      Credentials({
        name: "credentials",
        credentials: {
          email: { label: "Email", type: "email" },
          password: { label: "Password", type: "password" },
        },
        async authorize(credentials) {
          if (!credentials?.email || !credentials?.password) return null;
          try {
            const { connectDB } = await import("@/lib/db/mongoose");
            const { UserModel } = await import("@/lib/db/models/index");
            await connectDB();

            const user = await UserModel.findOne({
              email: (credentials.email as string).toLowerCase(),
            }).select("+passwordHash").lean() as any;

            if (!user?.passwordHash) return null;

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

    // MongoDB adapter handles OAuth account linking
    adapter: MongoDBAdapter(clientPromise, { databaseName: "nyaree" }),

    callbacks: {
      async jwt({ token, user, account }) {
        if (user) {
          token.id = user.id;
          token.role = (user as any).role ?? "customer";
        }
        // On first Google sign-in, fetch role from DB
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

      async session({ session, token }) {
        if (session.user) {
          session.user.id = token.id as string;
          (session.user as any).role = token.role as string;
        }
        return session;
      },
    },

    events: {
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
  };
});

export { auth as getServerSession };
