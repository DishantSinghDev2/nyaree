#!/bin/bash
PROXY_URL="https://proxy-server-nine-beta.vercel.app"
PROXY_AUTH_TOKEN=$(openssl rand -hex 32)

cd proxy-server
echo -n "$PROXY_AUTH_TOKEN" | vercel env rm PROXY_AUTH_TOKEN production -y
echo -n "$PROXY_AUTH_TOKEN" | vercel env add PROXY_AUTH_TOKEN production
vercel --prod --yes
cd ..

npx wrangler secret delete DB_PROXY_URL || true
npx wrangler secret delete PROXY_AUTH_TOKEN || true
sleep 2
echo "$PROXY_URL" | npx wrangler secret put DB_PROXY_URL
echo "$PROXY_AUTH_TOKEN" | npx wrangler secret put PROXY_AUTH_TOKEN
npm run deploy
