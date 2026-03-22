# Deploying DB Proxy on Vercel

Since Cloudflare Workers can sometimes have issues with direct long-running TCP connections (MongoDB/Redis) and cold starts, this proxy server acts as a middleman on Vercel's Serverless environment, which has native support for these libraries.

## 1. Deploy Proxy to Vercel

1.  Open your terminal and `cd` into the `proxy-server` directory:
    ```bash
    cd proxy-server
    ```
2.  Initialize a new git repo and push to a **new private GitHub repository**:
    ```bash
    git init
    git add .
    git commit -m "initial commit"
    # Follow GitHub's instructions to push to a new repo
    ```
3.  Connect the repository to **Vercel**:
    *   Go to [vercel.com/new](https://vercel.com/new)
    *   Import your `nyaree-db-proxy` repository.
4.  **Environment Variables** in Vercel:
    *   `MONGODB_URI`: (Your full MongoDB connection string)
    *   `REDIS_URI`: (Your Upstash/Redis connection string)
    *   `PROXY_AUTH_TOKEN`: (Generate a secure random string, e.g., `openssl rand -base64 32`)

## 2. Update Cloudflare Worker (Main App)

1.  Add these to your Cloudflare Secrets/Environment (`wrangler secret put` or `.dev.vars`):
    *   `DB_PROXY_URL`: `https://your-proxy-app.vercel.app`
    *   `PROXY_AUTH_TOKEN`: (Same token you set in Vercel)

2.  The `lib/db/mongoose.ts` and `lib/cache/redis.ts` in the main app will now automatically detect `DB_PROXY_URL` and route requests through Vercel when running in production.

---
**Note:** This setup provides stable, authenticated access to your databases without Cloudflare's strict connection limits.
