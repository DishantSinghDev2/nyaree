// lib/cache/redis.ts
// Using Upstash Redis (HTTP-based, CF Workers compatible)
// Your own Redis: wrap with Upstash REST adapter OR use ioredis with Hyperdrive
import { Redis } from "@upstash/redis";

let client: Redis | null = null;

export function getRedis(): Redis {
  if (!client) {
    client = new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL || process.env.REDIS_URL || "",
      token: process.env.UPSTASH_REDIS_REST_TOKEN || "",
    });
  }
  return client;
}

// ─── Cache helpers ────────────────────────────────────────────────────────────
export async function cacheGet<T>(key: string): Promise<T | null> {
  try {
    const redis = getRedis();
    const val = await redis.get<T>(key);
    return val;
  } catch {
    return null;
  }
}

export async function cacheSet(
  key: string,
  value: unknown,
  ttlSeconds = 300
): Promise<void> {
  try {
    const redis = getRedis();
    await redis.setex(key, ttlSeconds, JSON.stringify(value));
  } catch {
    // fail silently — cache miss is ok
  }
}

export async function cacheDel(...keys: string[]): Promise<void> {
  try {
    const redis = getRedis();
    await redis.del(...keys);
  } catch {}
}

export async function cacheIncr(key: string, ttl = 60): Promise<number> {
  try {
    const redis = getRedis();
    const val = await redis.incr(key);
    if (val === 1) await redis.expire(key, ttl);
    return val;
  } catch {
    return 0;
  }
}

// ─── Key namespaces ───────────────────────────────────────────────────────────
export const CK = {
  // Products
  product: (slug: string) => `nyaree:product:${slug}`,
  productList: (cat: string, page: number) => `nyaree:products:${cat}:${page}`,
  featured: () => `nyaree:products:featured`,
  newArrivals: () => `nyaree:products:new`,
  bestsellers: () => `nyaree:products:best`,

  // Collections
  collection: (handle: string) => `nyaree:col:${handle}`,
  collections: () => `nyaree:cols:all`,

  // Cart (user-specific)
  cart: (userId: string) => `nyaree:cart:${userId}`,

  // Search
  search: (q: string) => `nyaree:search:${q.toLowerCase().trim().slice(0, 50)}`,

  // Admin stats
  statsToday: () => `nyaree:stats:today`,
  statsWeek: () => `nyaree:stats:week`,
  statsMonth: () => `nyaree:stats:month`,

  // Settings
  settings: () => `nyaree:settings`,

  // Rate limiting
  rateLimit: (ip: string, action: string) => `nyaree:rl:${action}:${ip}`,

  // Abandoned cart tracking
  abandonedCart: (sessionId: string) => `nyaree:abandoned:${sessionId}`,

  // Chat sessions
  chatSession: (sessionId: string) => `nyaree:chat:${sessionId}`,

  // Analytics buffer
  analyticsBuffer: () => `nyaree:analytics:buffer`,
} as const;

// ─── Rate limiter ─────────────────────────────────────────────────────────────
export async function rateLimit(
  ip: string,
  action: string,
  max: number,
  windowSeconds: number
): Promise<{ allowed: boolean; remaining: number }> {
  const key = CK.rateLimit(ip, action);
  const count = await cacheIncr(key, windowSeconds);
  return { allowed: count <= max, remaining: Math.max(0, max - count) };
}

// ─── Session store for chat (using Redis lists) ───────────────────────────────
export async function appendChatMessage(
  sessionId: string,
  message: { role: string; content: string; timestamp: string }
): Promise<void> {
  const redis = getRedis();
  const key = CK.chatSession(sessionId);
  await redis.rpush(key, JSON.stringify(message));
  await redis.expire(key, 86400); // 24h TTL
}

export async function getChatHistory(sessionId: string): Promise<{ role: string; content: string }[]> {
  try {
    const redis = getRedis();
    const msgs = await redis.lrange(CK.chatSession(sessionId), 0, -1);
    return msgs.map((m) => {
      try { return JSON.parse(m as string); } catch { return { role: "user", content: m }; }
    });
  } catch {
    return [];
  }
}

// ─── Analytics buffer (batch-write to DB) ─────────────────────────────────────
export async function bufferAnalyticsEvent(event: unknown): Promise<void> {
  try {
    const redis = getRedis();
    await redis.rpush(CK.analyticsBuffer(), JSON.stringify(event));
    // Keep buffer bounded
    await redis.ltrim(CK.analyticsBuffer(), -1000, -1);
  } catch {}
}
