// lib/db/mongoose.ts
// Proxy-only implementation, no mongoose or ioredis imports

export * from "./models/Product";
export * from "./models/index";

// In Cloudflare Workers, we just return true because the Vercel proxy
// handles the actual connection.
export async function connectDB(): Promise<any> {
  return true;
}

export async function withDB<T>(fn: () => Promise<T>): Promise<T> {
  return fn();
}
