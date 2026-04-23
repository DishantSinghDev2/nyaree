import mongoose, { Schema, model, models } from "mongoose";

// ─── Order ───────────────────────────────────────────────────────────────────
const OrderSchema = new Schema(
  {
    orderNumber: { type: String, unique: true, required: true },
    userId: { type: Schema.Types.ObjectId, ref: "User", sparse: true },
    guestEmail: String,
    items: [
      {
        product: { type: Schema.Types.ObjectId, ref: "Product" },
        variant: { size: String, color: String, colorHex: String },
        name: String,
        image: String,
        price: Number,
        quantity: Number,
        total: Number,
        customInstructions: String,
      },
    ],
    shippingAddress: {
      fullName: String,
      phone: String,
      addressLine1: String,
      addressLine2: String,
      city: String,
      state: String,
      pincode: String,
      country: { type: String, default: "India" },
    },
    pricing: {
      subtotal: Number,
      discount: { type: Number, default: 0 },
      discountCode: String,
      shipping: { type: Number, default: 0 },
      gst: { type: Number, default: 0 },
      total: Number,
      prepaidDiscount: { type: Number, default: 0 },
    },
    payment: {
      method: { type: String, enum: ["razorpay", "cod"], required: true },
      razorpayOrderId: String,
      razorpayPaymentId: String,
      razorpaySignature: String,
      status: {
        type: String,
        enum: ["pending", "paid", "failed", "refunded"],
        default: "pending",
      },
    },
    status: {
      type: String,
      enum: ["pending", "confirmed", "processing", "shipped", "delivered", "cancelled", "returned", "refunded"],
      default: "pending",
    },
    tracking: {
      courier: String,
      trackingNumber: String,
      trackingUrl: String,
      estimatedDelivery: Date,
    },
    timeline: [{ status: String, timestamp: Date, note: String }],
    notes: String,
    enquiries: [{ type: Schema.Types.ObjectId, ref: "Enquiry" }],
    abandonedEmailSent: { type: Boolean, default: false },
  },
  { timestamps: true }
);
OrderSchema.index({ userId: 1, createdAt: -1 });
OrderSchema.index({ status: 1, createdAt: -1 });
OrderSchema.index({ "payment.razorpayOrderId": 1 });
export const OrderModel = models.Order || model("Order", OrderSchema);

// ─── User ────────────────────────────────────────────────────────────────────
const UserSchema = new Schema(
  {
    email: { type: String, unique: true, required: true, lowercase: true },
    name: String,
    image: String,
    role: { type: String, enum: ["customer", "admin"], default: "customer" },
    phone: String,
    addresses: [
      {
        fullName: String,
        phone: String,
        addressLine1: String,
        addressLine2: String,
        city: String,
        state: String,
        pincode: String,
        country: { type: String, default: "India" },
      },
    ],
    defaultAddressIndex: { type: Number, default: 0 },
    wishlist: [{ type: Schema.Types.ObjectId, ref: "Product" }],
    totalOrders: { type: Number, default: 0 },
    totalSpent: { type: Number, default: 0 },
    emailVerified: { type: Boolean, default: false },
    googleId: String,
    lastLoginAt: Date,
    // For credentials (email+password) login
    passwordHash: { type: String, select: false }, // select:false = not returned by default
  },
  { timestamps: true }
);
UserSchema.index({ role: 1 });
export const UserModel = models.User || model("User", UserSchema);

// ─── Blog ────────────────────────────────────────────────────────────────────
const BlogSchema = new Schema(
  {
    title: { type: String, required: true },
    slug: { type: String, required: true, unique: true, lowercase: true },
    excerpt: String,
    content: { type: String, default: "" },
    coverImage: String,
    author: { type: String, default: "Rishika Singh" },
    tags: [String],
    status: { type: String, enum: ["draft", "published"], default: "draft" },
    seo: { title: String, description: String },
    readTime: { type: Number, default: 5 },
    views: { type: Number, default: 0 },
    publishedAt: Date,
  },
  { timestamps: true }
);
BlogSchema.index({ status: 1, publishedAt: -1 });
BlogSchema.index({ tags: 1 });
export const BlogModel = models.Blog || model("Blog", BlogSchema);

// ─── Collection ───────────────────────────────────────────────────────────────
const CollectionSchema = new Schema(
  {
    title: { type: String, required: true },
    handle: { type: String, required: true, unique: true, lowercase: true },
    description: String,
    bannerImage: String,
    products: [{ type: Schema.Types.ObjectId, ref: "Product" }],
    isActive: { type: Boolean, default: true },
    sortOrder: { type: Number, default: 0 },
    seo: { title: String, description: String },
  },
  { timestamps: true }
);
CollectionSchema.index({ isActive: 1, sortOrder: 1 });
export const CollectionModel = models.Collection || model("Collection", CollectionSchema);

// ─── Discount ─────────────────────────────────────────────────────────────────
const DiscountSchema = new Schema(
  {
    code: { type: String, required: true, unique: true, uppercase: true },
    type: {
      type: String,
      enum: ["percent", "fixed", "free_shipping", "bxgy"],
      required: true,
    },
    value: { type: Number, required: true },
    minOrderAmount: { type: Number, default: 0 },
    maxDiscount: Number,
    usageLimit: { type: Number, default: 0 }, // 0 = unlimited
    usageCount: { type: Number, default: 0 },
    perUserLimit: { type: Number, default: 1 },
    isActive: { type: Boolean, default: true },
    applicableTo: { type: String, enum: ["all", "category", "product"], default: "all" },
    customerEligibility: { type: String, enum: ["all", "returning"], default: "all" },
    categories: [String],
    products: [{ type: Schema.Types.ObjectId, ref: "Product" }],
    usedBy: [String], // user IDs
    startsAt: { type: Date, default: Date.now },
    expiresAt: Date,
  },
  { timestamps: true }
);
DiscountSchema.index({ isActive: 1, expiresAt: 1 });
export const DiscountModel = models.Discount || model("Discount", DiscountSchema);

// ─── Review ───────────────────────────────────────────────────────────────────
const ReviewSchema = new Schema(
  {
    product: { type: Schema.Types.ObjectId, ref: "Product", required: true },
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    orderId: { type: Schema.Types.ObjectId, ref: "Order" },
    userName: String,
    userImage: String,
    rating: { type: Number, required: true, min: 1, max: 5 },
    title: String,
    body: { type: String, required: true },
    images: [String],
    isVerifiedPurchase: { type: Boolean, default: false },
    isApproved: { type: Boolean, default: false },
  },
  { timestamps: true }
);
ReviewSchema.index({ product: 1, isApproved: 1 });
ReviewSchema.index({ user: 1 });
export const ReviewModel = models.Review || model("Review", ReviewSchema);

// ─── Enquiry / Chat ───────────────────────────────────────────────────────────
const EnquirySchema = new Schema(
  {
    sessionId: { type: String, required: true },
    userId: { type: Schema.Types.ObjectId, ref: "User", sparse: true },
    guestEmail: String,
    guestName: String,
    productId: { type: Schema.Types.ObjectId, ref: "Product", sparse: true },
    orderId: { type: Schema.Types.ObjectId, ref: "Order", sparse: true },
    subject: { type: String, default: "Product Enquiry" },
    status: {
      type: String,
      enum: ["open", "in_progress", "resolved", "escalated"],
      default: "open",
    },
    messages: [
      {
        role: { type: String, enum: ["user", "ai", "admin"], required: true },
        content: { type: String, required: true },
        timestamp: { type: Date, default: Date.now },
        adminId: { type: Schema.Types.ObjectId, ref: "User", sparse: true },
      },
    ],
    isEscalated: { type: Boolean, default: false },
    assignedTo: { type: Schema.Types.ObjectId, ref: "User", sparse: true },
    readByAdmin: { type: Boolean, default: false },
  },
  { timestamps: true }
);
EnquirySchema.index({ sessionId: 1 });
EnquirySchema.index({ status: 1, createdAt: -1 });
EnquirySchema.index({ isEscalated: 1 });
export const EnquiryModel = models.Enquiry || model("Enquiry", EnquirySchema);

// ─── Analytics Event ──────────────────────────────────────────────────────────
const AnalyticsEventSchema = new Schema({
  type: { type: String, required: true },
  sessionId: String,
  userId: String,
  path: String,
  referrer: String,
  meta: Schema.Types.Mixed,
  timestamp: { type: Date, default: Date.now },
  country: String,
  device: { type: String, enum: ["mobile", "tablet", "desktop"] },
  browser: String,
  ip: String,
});
AnalyticsEventSchema.index({ type: 1, timestamp: -1 });
AnalyticsEventSchema.index({ sessionId: 1 });
AnalyticsEventSchema.index({ path: 1, timestamp: -1 });
// TTL: auto-delete events older than 90 days to save storage
AnalyticsEventSchema.index({ timestamp: 1 }, { expireAfterSeconds: 7776000 });
export const AnalyticsModel = models.AnalyticsEvent || model("AnalyticsEvent", AnalyticsEventSchema);

// ─── Site Settings ────────────────────────────────────────────────────────────
const SiteSettingsSchema = new Schema(
  {
    key: { type: String, default: "main", unique: true },
    storeName: { type: String, default: "Nyaree" },
    storeEmail: { type: String, default: "" },
    storePhone: { type: String, default: "+91 8368989758" },
    storeAddress: {
      type: String,
      default: "Parnala Extended Industrial Area, Bahadurgarh, Haryana, 124507",
    },
    logoUrl: { type: String, default: "" },
    faviconUrl: { type: String, default: "" },
    currency: { type: String, default: "INR" },
    gstNumber: { type: String, default: "" },
    freeShippingThreshold: { type: Number, default: 49900 }, // ₹499 in paise
    standardShippingPrice: { type: Number, default: 4900 }, // ₹49
    expressShippingPrice: { type: Number, default: 9900 }, // ₹99
    expressShippingEnabled: { type: Boolean, default: false },
    codEnabled: { type: Boolean, default: true },
    codExtraCharge: { type: Number, default: 0 },
    prepaidDiscountPercent: { type: Number, default: 5 },
    instagramHandle: { type: String, default: "" },
    facebookUrl: { type: String, default: "" },
    youtubeUrl: { type: String, default: "" },
    pinterestUrl: { type: String, default: "" },
    whatsappNumber: { type: String, default: "+91 8368989758" },
    metaPixelId: { type: String, default: "" },
    googleAnalyticsId: { type: String, default: "" },
    announcementBar: { type: String, default: "Free shipping on orders above ₹499 🎉" },
    announcementBarEnabled: { type: Boolean, default: true },
    maintenanceMode: { type: Boolean, default: false },
    lowStockThreshold: { type: Number, default: 5 },
    autoNewArrivalDays: { type: Number, default: 30 },
    orderEmailBcc: { type: String, default: "" },
    socialProofEnabled: { type: Boolean, default: true },
    reviewsEnabled: { type: Boolean, default: true },
    blogEnabled: { type: Boolean, default: true },
    sizeChartGlobal: { type: String, default: "" }, // global size chart image URL
    returnPolicyDays: { type: Number, default: 7 },
    returnShippingCharge: { type: String, default: "Fixed shipping charge for returns" },
    exchangeCharge: { type: String, default: "Charges according to size or new customizations made" },
    customCss: { type: String, default: "" },


    // ─── Hero Carousel Banners (admin-configurable) ───────────────────────────
    heroSlides: [{
      id: { type: String, required: true },
      headline: { type: String, default: "" },
      subheadline: { type: String, default: "" },
      imageUrl: { type: String, default: "" },       // uploaded image (optional)
      bgColor: { type: String, default: "#1A1208" }, // fallback gradient color
      bgGradient: { type: String, default: "" },
      accentColor: { type: String, default: "#C8960C" },
      cta1Label: { type: String, default: "Shop Now" },
      cta1Href: { type: String, default: "/shop" },
      cta2Label: { type: String, default: "" },
      cta2Href: { type: String, default: "" },
      isActive: { type: Boolean, default: true },
      position: { type: Number, default: 0 },
    }],

    // ─── Product Page Display Settings ───────────────────────────────────────
    showDescriptionBelowProduct: { type: Boolean, default: false },  // Show full description below fold (above reviews)
    showRatingBelowTitle: { type: Boolean, default: true },           // Flipkart-style stars below product title
    showReviewsOnProductPage: { type: Boolean, default: true },       // Toggle review section
    showRelatedProducts: { type: Boolean, default: true },            // Show upsell/cross-sell
    showSizeChartInProduct: { type: Boolean, default: true },         // Size chart in product page
    productDescriptionExpanded: { type: Boolean, default: false },   // Start description expanded

    // ─── Storefront Features ──────────────────────────────────────────────────
    liveStockEnabled: { type: Boolean, default: true },               // "Only X left" warning
    wishlistEnabled: { type: Boolean, default: true },
    couponBoxInCart: { type: Boolean, default: true },
    expressDeliveryEnabled: { type: Boolean, default: false },
    
    // ─── Post-Purchase ─────────────────────────────────────────────────────────
    postPurchaseCouponEnabled: { type: Boolean, default: true },      // Show coupon on success page
    postPurchaseCouponCode: { type: String, default: "" },           // Specific code to show (empty = auto-find)

    // ─── Chat & Support ────────────────────────────────────────────────────────
    chatWidgetEnabled: { type: Boolean, default: true },
    whatsappBubbleEnabled: { type: Boolean, default: true },
    chatWidgetPosition: { type: String, default: "right" },
  },
  { timestamps: true }
);
export const SiteSettingsModel = models.SiteSettings || model("SiteSettings", SiteSettingsSchema);

// ─── Newsletter ───────────────────────────────────────────────────────────────
const NewsletterSchema = new Schema(
  {
    email: { type: String, required: true, unique: true, lowercase: true },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);
export const NewsletterModel = models.Newsletter || model("Newsletter", NewsletterSchema);

// Re-export ProductModel from Product.ts for convenience
export { ProductModel } from "./Product";
