import express, { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import Redis from 'ioredis';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const auth = (req: Request, res: Response, next: NextFunction) => {
  const token = req.headers['x-proxy-token'];
  if (!token || token !== process.env.PROXY_AUTH_TOKEN) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }
  next();
};

let cachedMongoose: typeof mongoose | null = null;
async function connectDB() {
  if (cachedMongoose) return cachedMongoose;
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error("MONGODB_URI missing");
  cachedMongoose = await mongoose.connect(uri, {
    // bufferCommands: false,
  });
  return cachedMongoose;
}

const redisUri = process.env.REDIS_URI;
let redis: Redis | null = null;

if (redisUri) {
  redis = new Redis(redisUri);
  redis.on('error', (err) => console.error('[ioredis] Error:', err.message));
} else {
  console.warn("⚠️ REDIS_URI is missing in environment variables. Cache endpoints will fail.");
}

// Register all schemas for population/refs to work properly
import '../models/Product';
import '../models/index';

app.post('/api/db/:model/chain', auth, async (req: Request, res: Response) => {
  try {
    await connectDB();
    const model = req.params.model as string;
    const { chain = [] } = req.body;
    
    const Model = mongoose.models[model];
    if (!Model) {
      res.status(400).json({ success: false, error: `Model ${model} not found` });
      return;
    }

    let query: any = Model;
    for (const step of chain) {
      if (typeof query[step.method] === 'function') {
        query = query[step.method](...step.args);
      } else {
        throw new Error(`Method ${step.method} not found on query`);
      }
    }
    
    const result = await query;
    res.json({ success: true, data: result });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Cache Endpoints
app.get('/api/cache/:key', auth, async (req: Request, res: Response) => {
  try {
    if (!redis) throw new Error("REDIS_URI missing in proxy server env");
    const key = req.params.key as string;
    const val = await redis.get(key);
    res.json({ success: true, data: val ? JSON.parse(val) : null });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post('/api/cache', auth, async (req: Request, res: Response) => {
  try {
    if (!redis) throw new Error("REDIS_URI missing in proxy server env");
    const { key, value, ttl } = req.body;
    if (ttl) {
      await redis.setex(key, ttl, JSON.stringify(value));
    } else {
      await redis.set(key, JSON.stringify(value));
    }
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post('/api/cache/del', auth, async (req: Request, res: Response) => {
  try {
    if (!redis) throw new Error("REDIS_URI missing in proxy server env");
    const { keys } = req.body;
    if (keys && keys.length) await redis.del(...keys);
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post('/api/cache/incr', auth, async (req: Request, res: Response) => {
  try {
    if (!redis) throw new Error("REDIS_URI missing in proxy server env");
    const { key, ttl } = req.body;
    const val = await redis.incr(key);
    if (val === 1 && ttl) await redis.expire(key, ttl);
    res.json({ success: true, data: val });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post('/api/cache/rpush', auth, async (req: Request, res: Response) => {
  try {
    if (!redis) throw new Error("REDIS_URI missing in proxy server env");
    const { key, item } = req.body;
    await redis.rpush(key, item);
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post('/api/cache/lrange', auth, async (req: Request, res: Response) => {
  try {
    if (!redis) throw new Error("REDIS_URI missing in proxy server env");
    const { key, start, end } = req.body;
    const data = await redis.lrange(key, start, end);
    res.json({ success: true, data });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.get('/api/cache/llen', auth, async (req: Request, res: Response) => {
  try {
    if (!redis) throw new Error("REDIS_URI missing in proxy server env");
    const key = req.query.key as string;
    const data = await redis.llen(key);
    res.json({ success: true, data });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.get('/api/health', (req: Request, res: Response) => res.send('OK'));

export default app;
