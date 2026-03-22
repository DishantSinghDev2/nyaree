// lib/cache/redis.ts
// Uses your own deployed Redis via ioredis (standard TCP connection)
// REDIS_URI format: redis://[:password@]host:port  or  rediss://... (TLS)
import Redis from "ioredis";

let client: Redis | null = null;

export function getRedis(): Redis {
  if (!client) {
    const uri = process.env.REDIS_URI || process.env.REDIS_URL;
    if (!uri) throw new Error("REDIS_URI environment variable is not set");

    client = new Redis(uri, {
      // Reconnect on disconnect — up to 10 retries with exponential backoff
      retryStrategy: (times) => {
        if (times > 10) return null; // stop retrying after 10 attempts
        return Math.min(times * 100, 3000);
      },
      // Silent mode — don't crash on connection errors (fail gracefully)
      lazyConnect: false,
      enableOfflineQueue: true,
      connectTimeout: 5000,
      commandTimeout: 3000,
      maxRetriesPerRequest: 2,
    });

    client.on("error", (err) => {
      // Log but don't crash — cache miss is always acceptable
      if (process.env.NODE_ENV !== "production") {
        console.warn("[Redis] Connection error:", err.message);
      }
    });
  }
  return client;
}

// ─── Cache helpers ────────────────────────────────────────────────────────────
export async function cacheGet<T>(key: string): Promise<T | null> {
  try {
    const redis = getRedis();
    const val = await redis.get(key);
    if (val === null) return null;
    return JSON.parse(val) as T;
  } catch {
    return null; // cache miss — always fail silently
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
    // fail silently — cache is best-effort
  }
}

export async function cacheDel(...keys: string[]): Promise<void> {
  if (!keys.length) return;
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
  product: (slug: string) => `nyaree:product:${slug}`,
  productList: (cat: string, page: number) => `nyaree:products:${cat}:${page}`,
  featured: () => `nyaree:products:featured`,
  newArrivals: () => `nyaree:products:new`,
  bestsellers: () => `nyaree:products:best`,
  collection: (handle: string) => `nyaree:col:${handle}`,
  collections: () => `nyaree:cols:all`,
  cart: (userId: string) => `nyaree:cart:${userId}`,
  search: (q: string) => `nyaree:search:${q.toLowerCase().trim().slice(0, 50)}`,
  statsToday: () => `nyaree:stats:today`,
  statsWeek: () => `nyaree:stats:week`,
  statsMonth: () => `nyaree:stats:month`,
  settings: () => `nyaree:settings`,
  rateLimit: (ip: string, action: string) => `nyaree:rl:${action}:${ip}`,
  abandonedCart: (sessionId: string) => `nyaree:abandoned:${sessionId}`,
  chatSession: (sessionId: string) => `nyaree:chat:${sessionId}`,
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

// ─── Chat session (Redis List) ────────────────────────────────────────────────
export async function appendChatMessage(
  sessionId: string,
  message: { role: string; content: string; timestamp: string }
): Promise<void> {
  try {
    const redis = getRedis();
    const key = CK.chatSession(sessionId);
    await redis.rpush(key, JSON.stringify(message));
    await redis.expire(key, 86400); // 24h TTL
  } catch {}
}

export async function getChatHistory(
  sessionId: string
): Promise<{ role: string; content: string }[]> {
  try {
    const redis = getRedis();
    const msgs = await redis.lrange(CK.chatSession(sessionId), 0, -1);
    return msgs.map((m) => {
      try { return JSON.parse(m); } catch { return { role: "user", content: m }; }
    });
  } catch {
    return [];
  }
}

// ─── Analytics buffer (batch write to DB) ────────────────────────────────────
export async function bufferAnalyticsEvent(event: unknown): Promise<void> {
  try {
    const redis = getRedis();
    await redis.rpush(CK.analyticsBuffer(), JSON.stringify(event));
    await redis.ltrim(CK.analyticsBuffer(), -1000, -1); // cap at 1000
  } catch {}
}
