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

  return mongoose.connect(uri, {
    bufferCommands: true,
    maxPoolSize: 5,
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 30000,
    family: 4,
    // tls: true, // removed to avoid mismatch with MONGODB_URI ssl=false
  });
}

export async function withDB<T>(fn: () => Promise<T>): Promise<T> {
  await connectDB();
  return fn();
}
