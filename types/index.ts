// types/index.ts — All shared TypeScript types for Nyaree

import type { Fetcher, KVNamespace, R2Bucket } from "@cloudflare/workers-types";

// ─── Cloudflare Bindings ─────────────────────────────────────────────────────
export interface CloudflareEnv {
  ASSETS: Fetcher;
  NEXT_CACHE_WORKERS_KV: KVNamespace;
  SESSION_KV: KVNamespace;
  RATE_LIMIT_KV: KVNamespace;
  MEDIA_BUCKET: R2Bucket;
  NEXT_INC_CACHE_R2_BUCKET: R2Bucket;

  // Secrets (set via wrangler secret put)
  MONGODB_URI: string;
  REDIS_URI: string;           // Your deployed Redis URI (redis://:pass@host:port)
  AUTH_SECRET: string;  // NextAuth v5 secret
  NEXTAUTH_SECRET: string;
  GOOGLE_CLIENT_ID: string;
  GOOGLE_CLIENT_SECRET: string;
  RESEND_API_KEY: string;
  RAZORPAY_KEY_ID: string;
  RAZORPAY_KEY_SECRET: string;
  DISHIS_IMAGE_API_KEY: string;   // RapidAPI key for DishIs image hosting
  GEMINI_API_KEY: string;         // Google AI Studio API key for Gemini
  ADMIN_EMAIL: string;
  STORE_EMAIL: string;
  ADMIN_SETUP_TOKEN?: string;

  // Public vars
  NEXT_PUBLIC_SITE_URL: string;
  NEXT_PUBLIC_SITE_NAME: string;
  NEXT_PUBLIC_RAZORPAY_KEY_ID: string;
}

// ─── Product ──────────────────────────────────────────────────────────────────
export type ProductStatus = "active" | "draft" | "archived";
export type ProductCategory = "kurti" | "top" | "coord-set" | "dupatta" | "lehenga" | "other";

export interface ProductVariant {
  id: string;
  size: string;
  color: string;
  colorHex: string;
  stock: number;
  sku: string;
  price: number; // in paise
  compareAtPrice: number;
  costPrice: number;
  weight: number; // grams
}

export interface ProductImage {
  url: string;
  publicId: string;
  alt: string;
  position: number;
  isHero: boolean;
}

export interface ProductCustomField {
  label: string;
  value: string;
  type: "text" | "select" | "boolean" | "number";
}

export interface Product {
  _id: string;
  name: string;
  slug: string;
  sku: string;
  category: ProductCategory;
  subcategory: string;
  description: string;
  shortDescription: string;
  images: ProductImage[];
  variants: ProductVariant[];
  fabric: string;
  occasion: string[];
  pattern: string;
  fit: string;
  workType: string;
  careInstructions: string[];
  customFields: ProductCustomField[];
  allowCustomization: boolean;
  customizationNote: string;
  sizeChartImages: string[];
  seo: {
    title: string;
    description: string;
    keywords: string[];
    ogImage: string;
  };
  tags: string[];
  collections: string[];
  rating: { average: number; count: number };
  isActive: boolean;
  isFeatured: boolean;
  isNewArrival: boolean;
  isBestSeller: boolean;
  isCustomOrder: boolean;
  minimumOrderQuantity: number;
  leadTimeDays: number;
  upsellProducts: string[];
  crossSellProducts: string[];
  bundleWith: string[];
  bundleDiscount: number;
  totalSold: number;
  viewCount: number;
  createdAt: string;
  updatedAt: string;
}

// ─── Cart ────────────────────────────────────────────────────────────────────
export interface CartItem {
  productId: string;
  variantId: string;
  name: string;
  slug: string;
  image: string;
  size: string;
  color: string;
  colorHex: string;
  price: number;
  compareAtPrice: number;
  quantity: number;
  customInstructions?: string;
  isCustomOrder?: boolean;
}

export interface Cart {
  items: CartItem[];
  couponCode?: string;
  couponDiscount?: number;
  couponType?: "percent" | "fixed" | "free_shipping";
}

// ─── Order ───────────────────────────────────────────────────────────────────
export type OrderStatus = "pending" | "confirmed" | "processing" | "shipped" | "delivered" | "cancelled" | "returned" | "refunded";
export type PaymentMethod = "razorpay" | "cod";
export type PaymentStatus = "pending" | "paid" | "failed" | "refunded";

export interface ShippingAddress {
  fullName: string;
  phone: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  pincode: string;
  country: "India";
}

export interface Order {
  _id: string;
  orderNumber: string;
  userId?: string;
  guestEmail?: string;
  items: {
    product: string;
    variant: { size: string; color: string; colorHex: string };
    name: string;
    image: string;
    price: number;
    quantity: number;
    total: number;
    customInstructions?: string;
  }[];
  shippingAddress: ShippingAddress;
  pricing: {
    subtotal: number;
    discount: number;
    discountCode?: string;
    shipping: number;
    gst: number;
    total: number;
    prepaidDiscount: number;
  };
  payment: {
    method: PaymentMethod;
    razorpayOrderId?: string;
    razorpayPaymentId?: string;
    status: PaymentStatus;
  };
  status: OrderStatus;
  tracking?: {
    courier: string;
    trackingNumber: string;
    trackingUrl: string;
    estimatedDelivery?: string;
  };
  timeline: { status: string; timestamp: string; note?: string }[];
  notes?: string;
  enquiries: string[];
  createdAt: string;
  updatedAt: string;
}

// ─── User ────────────────────────────────────────────────────────────────────
export type UserRole = "customer" | "admin";

export interface User {
  _id: string;
  email: string;
  name: string;
  image?: string;
  role: UserRole;
  phone?: string;
  addresses: ShippingAddress[];
  defaultAddressIndex: number;
  wishlist: string[];
  totalOrders: number;
  totalSpent: number;
  createdAt: string;
}

// ─── Blog ────────────────────────────────────────────────────────────────────
export type BlogStatus = "draft" | "published";

export interface Blog {
  _id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  coverImage: string;
  author: string;
  tags: string[];
  status: BlogStatus;
  seo: { title: string; description: string };
  readTime: number;
  views: number;
  createdAt: string;
  updatedAt: string;
  publishedAt?: string;
}

// ─── Discount / Coupon ───────────────────────────────────────────────────────
export type DiscountType = "percent" | "fixed" | "free_shipping" | "bxgy";

export interface Discount {
  _id: string;
  code: string;
  type: DiscountType;
  value: number;
  minOrderAmount: number;
  maxDiscount?: number;
  usageLimit: number;
  usageCount: number;
  perUserLimit: number;
  isActive: boolean;
  applicableTo: "all" | "category" | "product";
  categories?: string[];
  products?: string[];
  startsAt: string;
  expiresAt?: string;
}

// ─── Collection ───────────────────────────────────────────────────────────────
export interface Collection {
  _id: string;
  title: string;
  handle: string;
  description: string;
  bannerImage: string;
  products: string[];
  isActive: boolean;
  sortOrder: number;
  seo: { title: string; description: string };
}

// ─── Review ──────────────────────────────────────────────────────────────────
export interface Review {
  _id: string;
  product: string;
  user: string;
  userName: string;
  userImage?: string;
  rating: number;
  title: string;
  body: string;
  images: string[];
  isVerifiedPurchase: boolean;
  isApproved: boolean;
  createdAt: string;
}

// ─── Enquiry / Chat ──────────────────────────────────────────────────────────
export type EnquiryStatus = "open" | "in_progress" | "resolved" | "escalated";

export interface Enquiry {
  _id: string;
  sessionId: string;
  userId?: string;
  guestEmail?: string;
  guestName?: string;
  productId?: string;
  orderId?: string;
  subject: string;
  status: EnquiryStatus;
  messages: {
    role: "user" | "ai" | "admin";
    content: string;
    timestamp: string;
    adminId?: string;
  }[];
  isEscalated: boolean;
  assignedTo?: string;
  createdAt: string;
  updatedAt: string;
}

// ─── Analytics ───────────────────────────────────────────────────────────────
export interface AnalyticsEvent {
  type:
    | "page_view"
    | "product_view"
    | "add_to_cart"
    | "remove_from_cart"
    | "checkout_start"
    | "checkout_address"
    | "checkout_payment"
    | "order_placed"
    | "search"
    | "click"
    | "scroll_depth"
    | "wishlist_add"
    | "coupon_apply"
    | "enquiry_start"
    | "enquiry_escalate";
  sessionId: string;
  userId?: string;
  path: string;
  referrer?: string;
  meta?: Record<string, string | number | boolean>;
  timestamp: string;
  country?: string;
  device?: "mobile" | "tablet" | "desktop";
  browser?: string;
}

// ─── Site Settings ───────────────────────────────────────────────────────────
export interface SiteSettings {
  storeName: string;
  storeEmail: string; // where all order/contact emails go
  storePhone: string;
  storeAddress: string;
  logoUrl: string;
  faviconUrl: string;
  currency: "INR";
  gstNumber: string;
  freeShippingThreshold: number;
  standardShippingPrice: number;
  expressShippingPrice: number;
  expressShippingEnabled: boolean;
  codEnabled: boolean;
  codExtraCharge: number;
  prepaidDiscountPercent: number; // default 5
  instagramHandle: string;
  facebookUrl: string;
  youtubeUrl: string;
  pinterestUrl: string;
  whatsappNumber: string;
  metaPixelId: string;
  googleAnalyticsId: string;
  announcementBar: string;
  announcementBarEnabled: boolean;
  maintenanceMode: boolean;
  lowStockThreshold: number;
  autoNewArrivalDays: number;
  orderEmailBcc: string;
  socialProofEnabled: boolean;
  reviewsEnabled: boolean;
  blogEnabled: boolean;
}

// ─── API Responses ───────────────────────────────────────────────────────────
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}
