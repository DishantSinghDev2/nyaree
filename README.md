# Nyaree — Complete E-Commerce Platform
### Next.js 15 · NextAuth v5 · MongoDB · Upstash Redis · Razorpay · Cloudflare Workers

> **Founder:** Rishika Singh · +91 8368989758  
> **Domain:** nyaree.in  
> **Address:** Parnala Extended Industrial Area, Bahadurgarh, Haryana 124507  
> **Developed by:** [DishIs Technologies](https://www.dishis.tech)

---

## Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Copy env file and fill in your values
cp .env.example .dev.vars

# 3. Run local dev server
npm run dev
# → http://localhost:3000

# 4. Deploy to Cloudflare Workers
npm run deploy
```

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 15.3.1 (App Router) |
| Auth | NextAuth v5 beta (5.0.0-beta.25) |
| Database | MongoDB + Mongoose |
| Cache/Speed | Upstash Redis (HTTP-based, CF Workers compatible) |
| Payments | Razorpay (UPI, Cards, COD) |
| Emails | Resend |
| Images | Cloudinary |
| AI | Anthropic Claude (sonnet-4) |
| Deployment | Cloudflare Workers via @opennextjs/cloudflare |
| Styling | Tailwind CSS + 100% custom components (no UI library) |

---

## All 123 Source Files

### Store Pages (Customer-Facing)
```
/ ........................... Homepage (hero, featured, collections)
/shop/[category] ............ Product listing with filters + sorting
/product/[slug] ............. Product detail page
/cart ....................... Shopping cart
/checkout ................... Streamlined checkout (COD first)
/checkout/success ........... Order confirmation + confetti
/search ..................... Full-text product search
/collections ................ All collections
/collections/[handle] ....... Collection detail
/blog ....................... Style journal
/blog/[slug] ................ Blog post
/account .................... Customer dashboard
/account/orders ............. Order history
/account/orders/[id] ........ Order detail + tracking
/account/wishlist ........... Saved products
/account/profile ............ Profile settings
/track-order ................ Guest order tracking
/auth/login ................. Sign in / Register
/auth/error ................. Auth error page
/legal/privacy-policy ....... Privacy policy
/legal/terms ................ Terms of service
/legal/refund ............... Refund & returns
/legal/shipping ............. Shipping policy
```

### Admin Dashboard (Shopify-grade)
```
/dashboard .................. KPIs, revenue chart, recent orders, AI chat
/dashboard/products ......... Product list with filters
/dashboard/products/new ..... Add new product
/dashboard/products/[id]/edit Edit product
/dashboard/orders ........... All orders with status tabs
/dashboard/orders/[id] ...... Order detail + status update + tracking
/dashboard/customers ........ Customer list
/dashboard/blog ............. Blog post list
/dashboard/blog/new ......... Write new post
/dashboard/blog/[id]/edit ... Edit post
/dashboard/collections ...... Manage collections
/dashboard/discounts ........ Create/manage coupon codes
/dashboard/analytics ........ Full analytics dashboard
/dashboard/enquiries ........ Customer chat inbox (reply as admin)
/dashboard/settings ......... Full store configuration
```

### API Routes (30 endpoints)
```
POST /api/auth/register ........... Create account
GET/POST /api/auth/[...nextauth] .. NextAuth handler
GET/POST /api/products ............ List/create products
GET/PUT/DELETE /api/products/[id] . Single product
GET/POST /api/orders .............. List/create orders
GET/PUT /api/orders/[id] .......... Single order (admin updates)
GET /api/orders/track ............. Guest order tracking
POST /api/payment/create-order .... Razorpay order creation
POST /api/payment/verify .......... Payment verification + webhook
GET /api/search ................... Full-text product search
GET/POST /api/blog ................ Blog CRUD
GET/PUT/DELETE /api/blog/[id] ..... Single blog post
GET/POST /api/collections ......... Collections
GET/POST /api/discounts ........... Discount codes
POST /api/coupons/validate ........ Validate coupon at checkout
POST /api/chat .................... AI chatbot for product enquiries
POST /api/chat/escalate ........... Escalate chat to human
GET /api/enquiries ................ Admin inbox
POST /api/enquiries/[id]/reply .... Admin reply (emails customer)
POST /api/enquiries/[id]/resolve .. Mark enquiry resolved
GET/POST /api/reviews ............. Product reviews
POST /api/upload .................. Image upload to Cloudinary
POST /api/newsletter .............. Newsletter signup
GET/PUT /api/admin/settings ....... Store settings
PUT /api/account/profile .......... Update user profile
POST /api/analytics ............... Track events (non-blocking)
GET /api/analytics ................ Analytics data (admin)
POST /api/ai/generate-description . AI product description
POST /api/ai/admin-chat ........... AI admin assistant
POST /api/ai/blog-outline ......... AI blog content
```

---

## Deployment: Step by Step

### Step 1 — Prerequisites

Create accounts at:
- [MongoDB Atlas](https://mongodb.com/atlas) (free M0 cluster)
- [Upstash](https://upstash.com) (free Redis, select Mumbai region)
- [Resend](https://resend.com) (free tier)
- [Razorpay](https://razorpay.com) (test mode free)
- [Cloudinary](https://cloudinary.com) (free tier)
- [Anthropic](https://console.anthropic.com) (paid)
- [Google Cloud Console](https://console.cloud.google.com) (OAuth, free)

### Step 2 — MongoDB Atlas Setup

1. Create free M0 cluster
2. **Network Access** → Add `0.0.0.0/0` (required for Cloudflare Workers)
3. **Database Access** → Create user with password
4. **Connect** → Copy connection string

### Step 3 — Upstash Redis

1. Create Redis database, select **Asia Pacific (ap-southeast-1)** or Mumbai
2. Copy **REST URL** and **REST Token** from dashboard

### Step 4 — Google OAuth

1. Google Cloud Console → **APIs & Services** → **Credentials**
2. Create OAuth 2.0 Client → Web Application
3. Authorized redirect URIs:
   - `http://localhost:3000/api/auth/callback/google`
   - `https://nyaree.in/api/auth/callback/google`

### Step 5 — Cloudflare Setup

```bash
# Install and login
npm install -g wrangler
wrangler login

# Create KV namespaces (copy the IDs into wrangler.jsonc)
wrangler kv namespace create "NEXT_CACHE_WORKERS_KV"
wrangler kv namespace create "SESSION_KV"
wrangler kv namespace create "RATE_LIMIT_KV"

# Create R2 buckets
wrangler r2 bucket create nyaree-media
wrangler r2 bucket create nyaree-cache
```

Update `wrangler.jsonc` with the KV IDs from above.

### Step 6 — Set Production Secrets

```bash
wrangler secret put MONGODB_URI
wrangler secret put UPSTASH_REDIS_REST_URL
wrangler secret put UPSTASH_REDIS_REST_TOKEN
wrangler secret put AUTH_SECRET          # openssl rand -hex 32
wrangler secret put NEXTAUTH_SECRET      # same value as AUTH_SECRET
wrangler secret put AUTH_GOOGLE_ID
wrangler secret put AUTH_GOOGLE_SECRET
wrangler secret put GOOGLE_CLIENT_ID     # same as AUTH_GOOGLE_ID
wrangler secret put GOOGLE_CLIENT_SECRET # same as AUTH_GOOGLE_SECRET
wrangler secret put RESEND_API_KEY
wrangler secret put RAZORPAY_KEY_ID
wrangler secret put RAZORPAY_KEY_SECRET
wrangler secret put CLOUDINARY_CLOUD_NAME
wrangler secret put CLOUDINARY_API_KEY
wrangler secret put CLOUDINARY_API_SECRET
wrangler secret put ANTHROPIC_API_KEY
wrangler secret put ADMIN_EMAIL
wrangler secret put STORE_EMAIL
```

### Step 7 — Local Development

```bash
cp .env.example .dev.vars
# Edit .dev.vars with real values

npm run dev
# → http://localhost:3000
```

### Step 8 — Build & Deploy

```bash
npm run build          # Verify no build errors first
npm run preview        # Test locally with CF Workers runtime
npm run deploy         # Deploy to production
```

### Step 9 — First-Time Admin Setup

After deploying, grant yourself admin access:

```javascript
// In MongoDB Atlas → Browse Collections → nyaree.users
// Find your user document and update:
db.users.updateOne(
  { email: "rishika@youremail.com" },
  { $set: { role: "admin" } }
)
```

Then visit `https://nyaree.in/dashboard` — you're in!

### Step 10 — Configure Store Settings

1. Go to `/dashboard/settings`
2. Set **Store Email** (all order notifications go here)
3. Upload your **logo**
4. Add **GST number**
5. Configure **social media links**
6. Set **prepaid discount** (default 5%)

### Step 11 — Go Live Checklist

```
□ MongoDB Atlas: IP whitelist 0.0.0.0/0
□ Resend: domain nyaree.in verified (DNS records in Cloudflare)
□ Razorpay: KYC complete, switched to live keys
□ Google OAuth: nyaree.in added to authorized origins
□ wrangler.jsonc: all KV IDs filled in
□ All secrets set via wrangler secret put
□ Admin role set in MongoDB for Rishika's account
□ Store settings configured in dashboard
□ Test order placed end-to-end
□ Google Search Console: submit https://nyaree.in/sitemap.xml
```

---

## Key Features Summary

### For Customers
- 🛍️ Shop kurtis, tops, co-ord sets with filters
- 🔍 Full-text search with instant results
- ♥ Wishlist (persisted across devices when logged in)
- 🛒 Smooth cart with free shipping progress bar
- 💳 COD (shown first) + 5% off for prepaid
- 📱 Mobile-first PWA with bottom navigation
- 💬 AI chatbot for product questions
- 📦 Order tracking without login needed
- ✍️ Write product reviews
- 📰 Style blog with search-engine-optimized posts

### For Rishika (Admin Dashboard)
- 📊 Revenue charts, KPI cards, daily stats
- 📦 Add products: AI writes description + SEO for you
- 🏷️ Drag-drop image upload, color picker, stock management
- 📋 Update order status → automatically emails customer
- 🎫 Create discount codes (%, fixed amount, free shipping)
- 🗂️ Curate product collections for homepage
- ✍️ Blog editor with AI content generation
- 💬 Customer enquiries inbox — reply directly
- ⚙️ Settings: email, COD, shipping, social links, logo — all from the dashboard

### Technical Highlights
- ⚡ Redis caching on all hot paths (product pages, search, categories)
- 🔒 NextAuth v5 with Google OAuth + email/password
- 📊 Non-blocking analytics (never slows down the page)
- 🌐 Deployed on Cloudflare Workers Edge (global CDN)
- 🗺️ Auto-generated sitemap at `/sitemap.xml`
- 📧 10 branded email templates (order confirm, shipped, delivered, etc.)

---

## Environment Variables Reference

| Variable | Required | Description |
|---|---|---|
| `MONGODB_URI` | ✅ | MongoDB Atlas connection string |
| `UPSTASH_REDIS_REST_URL` | ✅ | Upstash Redis REST URL |
| `UPSTASH_REDIS_REST_TOKEN` | ✅ | Upstash Redis token |
| `AUTH_SECRET` | ✅ | Random 32-char secret for NextAuth |
| `NEXTAUTH_SECRET` | ✅ | Same as AUTH_SECRET (fallback) |
| `AUTH_GOOGLE_ID` | ✅ | Google OAuth Client ID |
| `AUTH_GOOGLE_SECRET` | ✅ | Google OAuth Client Secret |
| `RESEND_API_KEY` | ✅ | Resend API key for emails |
| `RAZORPAY_KEY_ID` | ✅ | Razorpay Key ID |
| `RAZORPAY_KEY_SECRET` | ✅ | Razorpay Key Secret |
| `CLOUDINARY_CLOUD_NAME` | ✅ | Cloudinary cloud name |
| `CLOUDINARY_API_KEY` | ✅ | Cloudinary API key |
| `CLOUDINARY_API_SECRET` | ✅ | Cloudinary API secret |
| `ANTHROPIC_API_KEY` | ✅ | Claude AI API key |
| `ADMIN_EMAIL` | ✅ | Rishika's email (gets admin role) |
| `STORE_EMAIL` | ✅ | Store email (receives all orders) |
| `NEXT_PUBLIC_RAZORPAY_KEY_ID` | ✅ | Razorpay public key (browser-safe) |
| `NEXT_PUBLIC_SITE_URL` | ✅ | `https://nyaree.in` |

---

*Nyaree — Wear India. Own It.*  
*Developed by [DishIs Technologies](https://www.dishis.tech)*
