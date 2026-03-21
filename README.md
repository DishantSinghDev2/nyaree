# Nyaree — Full-Stack E-Commerce on Cloudflare Workers

> Premium Indian Women's Fashion | Next.js 15 + Cloudflare Workers + MongoDB + Redis + Razorpay + AI

**Founder:** Rishika Singh · +91 8368989758  
**Address:** Parnala Extended Industrial Area, Bahadurgarh, Haryana, 124507  
**Domain:** nyaree.in  
**Developed by:** [DishIs Technologies](https://www.dishis.tech)

---

## ✅ Feature Checklist

### 🛍️ Customer Store
- [x] Homepage with animated hero, category cards, featured products
- [x] Shop pages with filters (size, color, fabric, price) & sorting
- [x] Product detail page with image gallery, size guide, variants
- [x] AI chatbot for product enquiries (with human escalation)
- [x] Wishlist (persisted in browser + DB when logged in)
- [x] Cart drawer with free-shipping progress bar
- [x] Streamlined 3-step checkout (COD first, then prepaid with 5% discount)
- [x] Razorpay integration (UPI, Card, Netbanking, EMI)
- [x] Custom order / personalization support per product
- [x] Order tracking page
- [x] Blog / style journal
- [x] Newsletter with 10% welcome coupon
- [x] Size chart (global + per-product)
- [x] Instagram feed section
- [x] Legal pages (Privacy, Terms, Refund, Shipping)
- [x] Mobile-first responsive design + PWA-ready
- [x] Custom cursor (desktop)
- [x] SEO: metadata, JSON-LD, sitemap, robots.txt

### 🔐 Auth (Better Auth v1)
- [x] Google OAuth (one-click sign in)
- [x] Email + Password with verification
- [x] Passwordless magic link via email (Resend)
- [x] Session management with role-based access (admin / customer)
- [x] CF Workers compatible (HTTP-based sessions)

### 📦 Admin Dashboard (Shopify-grade)
- [x] Dashboard with revenue KPIs, charts, recent orders
- [x] AI assistant chat for store insights
- [x] Product management: add/edit/delete with full form
  - Images drag-and-drop (Cloudinary)
  - Variants with size, color picker, stock, pricing, margins
  - AI description generator
  - AI SEO title + meta generator
  - Custom fields (any attribute)
  - Customization on/off per product
  - Lead time for made-to-order
- [x] Orders: list, detail, status update, tracking, notes, refund
- [x] Customers: list, spend, order history
- [x] Collections: curated product groups
- [x] Discounts: % / fixed / free shipping / BXGY coupons
- [x] Blog editor with AI content generation + publish
- [x] Analytics: funnel, device, top pages, top products, conversion rate
- [x] Enquiries inbox: chat messages from customers, escalated threads
- [x] Settings: store email, COD toggle, prepaid discount, shipping, social links, logo upload, maintenance mode

### 📧 Emails (Resend)
- [x] Welcome email with coupon
- [x] Order confirmation (customer + admin BCC)
- [x] Shipping notification with tracking link
- [x] Delivery confirmation + review request
- [x] Abandoned cart reminder
- [x] Enquiry escalation alert to admin
- [x] Password reset
- [x] Email verification
- [x] Custom order request (customer + admin)

### 📊 Analytics
- [x] Zero-latency event tracking (Redis buffer, non-blocking)
- [x] Page views, product views, add-to-cart, checkout funnel, orders
- [x] Device breakdown, top pages, top products
- [x] Checkout conversion funnel visualization
- [x] Events auto-expire after 90 days (MongoDB TTL index)

### ⚡ Performance (Cloudflare Workers)
- [x] ISR via Cloudflare KV (`@opennextjs/cloudflare`)
- [x] Redis caching for all hot paths (product pages, categories, search)
- [x] MongoDB with TLS on CF Workers (native support)
- [x] Rate limiting via Redis
- [x] Cloudinary CDN for images (WebP/AVIF auto-format)
- [x] No external UI lib dependencies — all custom components

---

## 🔧 Prerequisites

Before deploying, you need accounts at:

| Service | Purpose | Free Tier? |
|---|---|---|
| [Cloudflare](https://cloudflare.com) | Workers, KV, R2, Domain | ✅ Yes |
| [MongoDB Atlas](https://mongodb.com/atlas) | Database | ✅ Yes (M0) |
| [Upstash](https://upstash.com) | Redis (HTTP-based for CF Workers) | ✅ Yes |
| [Resend](https://resend.com) | Transactional emails | ✅ Yes |
| [Razorpay](https://razorpay.com) | Payments | ✅ Test mode |
| [Cloudinary](https://cloudinary.com) | Image storage & CDN | ✅ Yes |
| [Anthropic](https://anthropic.com) | Claude AI for descriptions | 💳 Paid |
| [Google Cloud](https://console.cloud.google.com) | OAuth | ✅ Free |

---

## 🚀 Deployment Guide (Step by Step)

### Step 1 — Clone & Install

```bash
git clone https://github.com/YOUR_ORG/nyaree.git
cd nyaree
npm install
```

---

### Step 2 — Set Up MongoDB Atlas

1. Create a free cluster at [mongodb.com/atlas](https://mongodb.com/atlas)
2. Click **Database Access** → Add a database user with password
3. Click **Network Access** → Add IP `0.0.0.0/0` (allow all — required for CF Workers)
4. Click **Connect** → **Drivers** → Copy your connection string:
   ```
   mongodb+srv://USERNAME:PASSWORD@cluster0.xxxxx.mongodb.net/nyaree?retryWrites=true&w=majority
   ```
5. Create Atlas Search index on `products` collection:
   - Go to **Search** tab → Create Search Index → JSON editor
   - Use default config, index name: `default`

---

### Step 3 — Set Up Upstash Redis

1. Go to [upstash.com](https://upstash.com) → Create database → Select **Redis**
2. Choose region: **Asia Pacific (Mumbai)** for lowest latency in India
3. Copy **REST URL** and **REST Token** from the dashboard

---

### Step 4 — Set Up Resend

1. Sign up at [resend.com](https://resend.com)
2. Add your domain `nyaree.in` → Follow DNS verification steps in Cloudflare
3. Create an API key → Copy it
4. Add a sender: `noreply@nyaree.in`

---

### Step 5 — Set Up Cloudinary

1. Sign up at [cloudinary.com](https://cloudinary.com)
2. Dashboard → Copy **Cloud Name**, **API Key**, **API Secret**

---

### Step 6 — Set Up Razorpay

1. Sign up at [razorpay.com](https://razorpay.com)
2. Go to **Settings** → **API Keys** → Generate key pair
3. For testing: use `rzp_test_` keys. For live: complete KYC and use `rzp_live_` keys

---

### Step 7 — Set Up Google OAuth

1. Go to [console.cloud.google.com](https://console.cloud.google.com)
2. Create a new project → **APIs & Services** → **Credentials**
3. Create **OAuth 2.0 Client ID** (Web application)
4. Add authorized redirect URIs:
   - `http://localhost:3000/api/auth/callback/google`
   - `https://nyaree.in/api/auth/callback/google`
5. Copy Client ID and Client Secret

---

### Step 8 — Configure Cloudflare

#### 8a. Install Wrangler
```bash
npm install -g wrangler
wrangler login
```

#### 8b. Create KV Namespaces
```bash
# ISR cache (required by @opennextjs/cloudflare)
wrangler kv namespace create "NEXT_CACHE_WORKERS_KV"
# → Copy the id: "xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"

# Session cache
wrangler kv namespace create "SESSION_KV"
# → Copy the id

# Rate limiting
wrangler kv namespace create "RATE_LIMIT_KV"
# → Copy the id
```

Update `wrangler.jsonc` with your real KV IDs:
```jsonc
"kv_namespaces": [
  { "binding": "NEXT_CACHE_WORKERS_KV", "id": "YOUR_CACHE_KV_ID" },
  { "binding": "SESSION_KV", "id": "YOUR_SESSION_KV_ID" },
  { "binding": "RATE_LIMIT_KV", "id": "YOUR_RATELIMIT_KV_ID" }
]
```

#### 8c. Create R2 Buckets
```bash
wrangler r2 bucket create nyaree-media
wrangler r2 bucket create nyaree-cache
```

#### 8d. Add Your Domain
1. Go to Cloudflare dashboard → **Workers & Pages** → After deploy, add custom domain `nyaree.in`
2. Or via CLI after deploy: `wrangler deploy --routes nyaree.in/*`

---

### Step 9 — Set Secrets

Run these commands to set production secrets (never stored in code):

```bash
wrangler secret put MONGODB_URI
# Paste: mongodb+srv://user:pass@cluster.mongodb.net/nyaree?...

wrangler secret put UPSTASH_REDIS_REST_URL
# Paste: https://xxx.upstash.io

wrangler secret put UPSTASH_REDIS_REST_TOKEN
# Paste: your token

wrangler secret put BETTER_AUTH_SECRET
# Paste: (generate with: openssl rand -hex 32)

wrangler secret put GOOGLE_CLIENT_ID
wrangler secret put GOOGLE_CLIENT_SECRET

wrangler secret put RESEND_API_KEY
wrangler secret put RAZORPAY_KEY_ID
wrangler secret put RAZORPAY_KEY_SECRET

wrangler secret put CLOUDINARY_CLOUD_NAME
wrangler secret put CLOUDINARY_API_KEY
wrangler secret put CLOUDINARY_API_SECRET

wrangler secret put ANTHROPIC_API_KEY
wrangler secret put ADMIN_EMAIL
# Paste: rishika@nyaree.in (or whichever Gmail you use)

wrangler secret put STORE_EMAIL
# Paste: hello@nyaree.in
```

---

### Step 10 — Local Development

```bash
# Copy example secrets file
cp .dev.vars.example .dev.vars
# Edit .dev.vars with your real values (this file is .gitignored)

# Start local dev server
npm run dev
```

The site runs at `http://localhost:3000`

---

### Step 11 — Build & Deploy

```bash
# Build for Cloudflare Workers
npm run build

# Preview locally (uses real CF Workers runtime)
npm run preview

# Deploy to production
npm run deploy
```

After deploy, visit your Workers URL (e.g. `nyaree.workers.dev`) or your custom domain.

---

### Step 12 — First-Time Setup

After deploying:

1. **Make yourself admin:**  
   Sign in at `https://nyaree.in/auth/login` with your Google account  
   Then in MongoDB Atlas, find your user document and set `role: "admin"`  
   ```js
   // In MongoDB Atlas Query Editor:
   db.users.updateOne(
     { email: "rishika@youremail.com" },
     { $set: { role: "admin" } }
   )
   ```

2. **Access admin dashboard:** `https://nyaree.in/dashboard`

3. **Add your first product:** Dashboard → Products → Add Product

4. **Configure store settings:** Dashboard → Settings  
   - Set store email (where all orders go)
   - Upload logo
   - Set GST number
   - Configure social media links

5. **Submit sitemap to Google:**  
   Go to [Google Search Console](https://search.google.com/search-console)  
   Submit: `https://nyaree.in/sitemap.xml`

---

## 📁 Project Structure

```
nyaree/
├── app/
│   ├── (store)/              # Customer-facing pages
│   │   ├── page.tsx          # Homepage
│   │   ├── shop/[category]/  # Category listing
│   │   ├── product/[slug]/   # Product detail
│   │   ├── cart/             # Cart page
│   │   ├── checkout/         # Checkout + success
│   │   ├── account/          # Customer account
│   │   ├── blog/             # Blog listing + posts
│   │   ├── collections/      # Curated collections
│   │   ├── search/           # Search results
│   │   └── legal/            # Privacy, Terms, Refund, Shipping
│   ├── (admin)/              # Admin dashboard (role-protected)
│   │   ├── dashboard/        # Main dashboard
│   │   ├── products/         # Product management
│   │   ├── orders/           # Order management
│   │   ├── customers/        # Customer list
│   │   ├── blog/             # Blog editor
│   │   ├── discounts/        # Coupons
│   │   ├── analytics/        # Analytics dashboard
│   │   ├── enquiries/        # Customer chat inbox
│   │   └── settings/         # Store settings
│   ├── api/                  # API routes
│   │   ├── auth/             # Better Auth handler
│   │   ├── products/         # Product CRUD
│   │   ├── orders/           # Order management
│   │   ├── payment/          # Razorpay create + verify
│   │   ├── chat/             # AI chatbot + escalation
│   │   ├── ai/               # Description, SEO, blog AI
│   │   ├── analytics/        # Event tracking
│   │   ├── search/           # Full-text search
│   │   ├── upload/           # Cloudinary image upload
│   │   ├── coupons/          # Coupon validation
│   │   └── newsletter/       # Newsletter signup
│   ├── layout.tsx            # Root layout + SEO
│   ├── sitemap.ts            # Auto-generated sitemap
│   └── robots.ts             # robots.txt
├── components/
│   ├── store/                # All customer-facing components
│   └── admin/                # All admin dashboard components
├── lib/
│   ├── db/                   # MongoDB connection + all models
│   ├── auth/                 # Better Auth config + client
│   ├── cache/                # Redis (Upstash) + cache helpers
│   ├── email/                # Resend email templates
│   ├── ai/                   # Claude AI helpers
│   ├── payments/             # Razorpay helpers
│   └── storage/              # Cloudinary helpers
├── hooks/
│   └── useAnalytics.ts       # Client-side event tracking
├── types/
│   └── index.ts              # All TypeScript types
├── styles/
│   └── globals.css           # Full design system (no Tailwind components)
├── public/
│   └── manifest.json         # PWA manifest
├── wrangler.jsonc            # Cloudflare Workers config
├── open-next.config.ts       # OpenNext CF adapter config
└── next.config.ts            # Next.js config
```

---

## 🔑 Environment Variables Reference

| Variable | Description | Where to get |
|---|---|---|
| `MONGODB_URI` | MongoDB connection string | Atlas dashboard |
| `UPSTASH_REDIS_REST_URL` | Upstash Redis REST URL | Upstash dashboard |
| `UPSTASH_REDIS_REST_TOKEN` | Upstash Redis token | Upstash dashboard |
| `BETTER_AUTH_SECRET` | Random 32-char string | `openssl rand -hex 32` |
| `GOOGLE_CLIENT_ID` | Google OAuth client ID | Google Cloud Console |
| `GOOGLE_CLIENT_SECRET` | Google OAuth secret | Google Cloud Console |
| `RESEND_API_KEY` | Resend API key | Resend dashboard |
| `RAZORPAY_KEY_ID` | Razorpay key ID | Razorpay dashboard |
| `RAZORPAY_KEY_SECRET` | Razorpay secret | Razorpay dashboard |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary cloud name | Cloudinary dashboard |
| `CLOUDINARY_API_KEY` | Cloudinary API key | Cloudinary dashboard |
| `CLOUDINARY_API_SECRET` | Cloudinary API secret | Cloudinary dashboard |
| `ANTHROPIC_API_KEY` | Claude API key | Anthropic console |
| `ADMIN_EMAIL` | Admin's email (gets admin role) | Your email |
| `STORE_EMAIL` | Store contact email | Your choice |
| `NEXT_PUBLIC_RAZORPAY_KEY_ID` | Razorpay public key | Razorpay dashboard |
| `NEXT_PUBLIC_SITE_URL` | Your domain | `https://nyaree.in` |

---

## 🐛 Troubleshooting

**MongoDB connection timeout on CF Workers?**  
Ensure `0.0.0.0/0` is added to MongoDB Atlas Network Access. CF Workers don't have a fixed IP.

**Razorpay payment window not opening?**  
Check that `NEXT_PUBLIC_RAZORPAY_KEY_ID` is set in `wrangler.jsonc` vars section (not as secret — it's public).

**Images not uploading?**  
Verify Cloudinary credentials. Check `npm run dev` logs for upload errors.

**Better Auth / Google OAuth redirect error?**  
Ensure your redirect URI `https://nyaree.in/api/auth/callback/google` is added in Google Cloud Console.

**Admin dashboard showing "Unauthorized"?**  
Set your user's role to `admin` in MongoDB (see Step 12 above).

**KV cache not working?**  
Run `wrangler kv namespace list` to confirm namespaces exist and IDs match `wrangler.jsonc`.

---

## 📞 Support

Built by **DishIs Technologies** — [www.dishis.tech](https://www.dishis.tech)

For technical support, contact the development team.  
For store support: Rishika Singh, +91 8368989758, hello@nyaree.in
