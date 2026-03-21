// lib/auth/index.ts
// Better Auth v1.4+ with MongoDB adapter — CF Workers compatible
import { betterAuth } from "better-auth";
import { mongodbAdapter } from "better-auth/adapters/mongodb";
import { MongoClient } from "mongodb";

let mongoClient: MongoClient | null = null;

function getMongoClient(): MongoClient {
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error("MONGODB_URI is not set");
  if (!mongoClient) {
    mongoClient = new MongoClient(uri, { tls: true, serverSelectionTimeoutMS: 5000 });
  }
  return mongoClient;
}

export function createAuth() {
  const client = getMongoClient();

  return betterAuth({
    baseURL: process.env.NEXT_PUBLIC_SITE_URL || "https://nyaree.in",
    secret: process.env.BETTER_AUTH_SECRET || "fallback-secret-change-this",

    database: mongodbAdapter(client.db("nyaree")),

    socialProviders: {
      google: {
        clientId: process.env.GOOGLE_CLIENT_ID || "",
        clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
      },
    },

    emailAndPassword: {
      enabled: true,
      sendResetPassword: async ({ user, url }) => {
        const { sendPasswordResetEmail } = await import("../email/resend");
        await sendPasswordResetEmail(user.email, user.name || "there", url);
      },
    },

    emailVerification: {
      sendOnSignUp: true,
      sendVerificationEmail: async ({ user, url }) => {
        const { sendVerificationEmail } = await import("../email/resend");
        await sendVerificationEmail(user.email, user.name || "there", url);
      },
    },

    session: {
      expiresIn: 60 * 60 * 24 * 30, // 30 days
      updateAge: 60 * 60 * 24, // update every 24h
    },

    user: {
      additionalFields: {
        role: {
          type: "string",
          defaultValue: "customer",
          input: false,
        },
        phone: {
          type: "string",
          required: false,
        },
      },
    },

    trustedOrigins: [
      "https://nyaree.in",
      "https://www.nyaree.in",
      "http://localhost:3000",
    ],
  });
}

// Singleton
let authInstance: ReturnType<typeof createAuth> | null = null;
export function getAuth() {
  if (!authInstance) authInstance = createAuth();
  return authInstance;
}

export { getAuth as auth };
