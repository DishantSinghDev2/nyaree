// lib/db/mongoose.ts
// CF Workers: create client per-request (can't share global connections)
import mongoose from "mongoose";

// Re-export all models so they register their schemas
export * from "./models/Product";
export * from "./models/index";

let cachedPromise: Promise<typeof mongoose> | null = null;

export async function connectDB(): Promise<typeof mongoose> {
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error("MONGODB_URI environment variable is not set");

  // In development, cache the connection to avoid multiple connections
  if (process.env.NODE_ENV === "development") {
    if (!cachedPromise) {
      cachedPromise = mongoose.connect(uri, {
        bufferCommands: true,
        maxPoolSize: 10,
        serverSelectionTimeoutMS: 5000,
        socketTimeoutMS: 45000,
        family: 4,
      });
    }
    return cachedPromise;
  }

  // In production (CF Workers): new connection per cold start
  // Workers keep the connection alive within a request context
  if (mongoose.connection.readyState === 1) {
    return mongoose;
  }

  // Cloudflare Workers - Use latest Node.js compatibility features
  // We MUST allow buffering here because Next.js/React sometimes calls models
  // before the async connectDB() has fully established the socket.
  return mongoose.connect(uri, {
    bufferCommands: true, 
    maxPoolSize: 1,       // Low pool size for stateless environment
    serverSelectionTimeoutMS: 10000,
    socketTimeoutMS: 30000,
    family: 4,
    // If URI contains ssl=false, do not force tls: true
    tls: !uri.includes("ssl=false"),
    retryWrites: true,
    connectTimeoutMS: 10000,
  });
}

export async function withDB<T>(fn: () => Promise<T>): Promise<T> {
  await connectDB();
  return fn();
}
