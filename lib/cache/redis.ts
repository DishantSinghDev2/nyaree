// lib/cache/redis.ts
// Proxy-only implementation, no ioredis imports in CF Worker

async function proxyCacheGet(key: string) {
  const PROXY_URL = process.env.DB_PROXY_URL;
  const PROXY_TOKEN = process.env.PROXY_AUTH_TOKEN;
  if (!PROXY_URL) return null;

  try {
    const res = await fetch(`${PROXY_URL}/api/cache/${encodeURIComponent(key)}`, {
      headers: { 'x-proxy-token': PROXY_TOKEN || '' },
      cache: 'no-store'
    });
    const data = await res.json();
    return data.data;
  } catch (e) {
    return null;
  }
}

async function proxyCacheSet(key: string, value: any, ttl?: number) {
  const PROXY_URL = process.env.DB_PROXY_URL;
  const PROXY_TOKEN = process.env.PROXY_AUTH_TOKEN;
  if (!PROXY_URL) return;

  try {
    await fetch(`${PROXY_URL}/api/cache`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-proxy-token': PROXY_TOKEN || ''
      },
      body: JSON.stringify({ key, value, ttl }),
      cache: 'no-store'
    });
  } catch (e) {
    // Ignore cache errors
  }
}

async function proxyCacheDel(keys: string[]) {
  const PROXY_URL = process.env.DB_PROXY_URL;
  const PROXY_TOKEN = process.env.PROXY_AUTH_TOKEN;
  if (!PROXY_URL) return;

  try {
    await fetch(`${PROXY_URL}/api/cache/del`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-proxy-token': PROXY_TOKEN || ''
      },
      body: JSON.stringify({ keys }),
      cache: 'no-store'
    });
  } catch (e) {}
}

async function proxyCacheIncr(key: string, ttl: number) {
  const PROXY_URL = process.env.DB_PROXY_URL;
  const PROXY_TOKEN = process.env.PROXY_AUTH_TOKEN;
  if (!PROXY_URL) return 0;

  try {
    const res = await fetch(`${PROXY_URL}/api/cache/incr`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-proxy-token': PROXY_TOKEN || ''
      },
      body: JSON.stringify({ key, ttl }),
      cache: 'no-store'
    });
    const data = await res.json();
    return data.data || 0;
  } catch (e) {
    return 0;
  }
}

async function proxyCacheRpush(key: string, item: string) {
  const PROXY_URL = process.env.DB_PROXY_URL;
  const PROXY_TOKEN = process.env.PROXY_AUTH_TOKEN;
  if (!PROXY_URL) return;

  try {
    await fetch(`${PROXY_URL}/api/cache/rpush`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-proxy-token': PROXY_TOKEN || ''
      },
      body: JSON.stringify({ key, item }),
      cache: 'no-store'
    });
  } catch (e) {}
}

async function proxyCacheLrange(key: string, start: number, end: number) {
  const PROXY_URL = process.env.DB_PROXY_URL;
  const PROXY_TOKEN = process.env.PROXY_AUTH_TOKEN;
  if (!PROXY_URL) return [];

  try {
    const res = await fetch(`${PROXY_URL}/api/cache/lrange`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-proxy-token': PROXY_TOKEN || ''
      },
      body: JSON.stringify({ key, start, end }),
      cache: 'no-store'
    });
    const data = await res.json();
    return data.data || [];
  } catch (e) {
    return [];
  }
}

async function proxyCacheLlen(key: string) {
  const PROXY_URL = process.env.DB_PROXY_URL;
  const PROXY_TOKEN = process.env.PROXY_AUTH_TOKEN;
  if (!PROXY_URL) return 0;

  try {
    const res = await fetch(`${PROXY_URL}/api/cache/llen?key=${encodeURIComponent(key)}`, {
      headers: { 'x-proxy-token': PROXY_TOKEN || '' },
      cache: 'no-store'
    });
    const data = await res.json();
    return data.data || 0;
  } catch (e) {
    return 0;
  }
}

class FakeRedisClient {
  async get(key: string) {
    return await proxyCacheGet(key);
  }
  async set(key: string, value: any, px?: string, ttl?: number) {
    if (px && ttl) {
      await proxyCacheSet(key, value, ttl);
    } else {
      await proxyCacheSet(key, value);
    }
  }
  async setex(key: string, ttl: number, value: any) {
    await proxyCacheSet(key, value, ttl);
  }
  async del(...keys: string[]) {
    await proxyCacheDel(keys);
  }
  async incr(key: string) {
    return await proxyCacheIncr(key, 0);
  }
  async expire(key: string, ttl: number) {
    // Already handled implicitly by incr or setex, or we can ignore
  }
  async rpush(key: string, item: string) {
    await proxyCacheRpush(key, item);
  }
  async ltrim(key: string, start: number, end: number) {
    // we can ignore ltrim for now as proxy doesn't handle it yet,
    // or add it if needed
  }
  async lrange(key: string, start: number, end: number) {
    return await proxyCacheLrange(key, start, end);
  }
  async llen(key: string) {
    return await proxyCacheLlen(key);
  }
  on(event: string, cb: any) {}
}

let client: FakeRedisClient | null = null;
export function getRedis(): FakeRedisClient {
  if (!client) {
    client = new FakeRedisClient();
  }
  return client;
}

// ─── Cache helpers ────────────────────────────────────────────────────────────
export async function cacheGet<T>(key: string): Promise<T | null> {
  return await proxyCacheGet(key);
}

export async function cacheSet(
  key: string,
  value: unknown,
  ttlSeconds = 300
): Promise<void> {
  await proxyCacheSet(key, value, ttlSeconds);
}

export async function cacheDel(...keys: string[]): Promise<void> {
  if (!keys.length) return;
  await proxyCacheDel(keys);
}

export async function cacheIncr(key: string, ttl = 60): Promise<number> {
  return await proxyCacheIncr(key, ttl);
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
  const key = CK.chatSession(sessionId);
  await proxyCacheRpush(key, JSON.stringify(message));
}

export async function getChatHistory(
  sessionId: string
): Promise<{ role: string; content: string }[]> {
  const msgs = await proxyCacheLrange(CK.chatSession(sessionId), 0, -1);
  return msgs.map((m: any) => {
    try { return JSON.parse(m); } catch { return { role: "user", content: m }; }
  });
}

// ─── Analytics buffer (batch write to DB) ────────────────────────────────────
export async function bufferAnalyticsEvent(event: unknown): Promise<void> {
  await proxyCacheRpush(CK.analyticsBuffer(), JSON.stringify(event));
}
