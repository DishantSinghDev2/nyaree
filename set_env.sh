#!/bin/bash

# Extract vars
MONGODB_URI=$(grep -E '^MONGODB_URI=' .env | cut -d '=' -f2-)
REDIS_URI=$(grep -E '^REDIS_URI=' .env | cut -d '=' -f2-)
PROXY_AUTH_TOKEN=$(openssl rand -hex 32)
PROXY_URL="https://proxy-server-nine-beta.vercel.app"

echo "Setting Vercel Environment Variables..."
cd proxy-server
echo -n "$MONGODB_URI" | vercel env add MONGODB_URI production
echo -n "$REDIS_URI" | vercel env add REDIS_URI production
echo -n "$PROXY_AUTH_TOKEN" | vercel env add PROXY_AUTH_TOKEN production
vercel --prod --yes
cd ..

echo "Setting Cloudflare Worker Secrets..."
echo -n "$PROXY_URL" | npx wrangler secret put DB_PROXY_URL
echo -n "$PROXY_AUTH_TOKEN" | npx wrangler secret put PROXY_AUTH_TOKEN

echo "Environment setup complete!"
