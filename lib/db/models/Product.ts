import mongoose, { Schema, model, models } from "mongoose";

const ProductImageSchema = new Schema({
  url: { type: String, required: true },
  publicId: String,
  alt: String,
  position: { type: Number, default: 0 },
  isHero: { type: Boolean, default: false },
});

const ProductVariantSchema = new Schema({
  id: { type: String, required: true },
  size: { type: String, required: true },
  color: { type: String, required: true },
  colorHex: { type: String, default: "#000000" },
  stock: { type: Number, default: 0, min: 0 },
  sku: String,
  price: { type: Number, required: true }, // paise
  compareAtPrice: { type: Number, default: 0 },
  costPrice: { type: Number, default: 0 },
  weight: { type: Number, default: 200 }, // grams
});

const CustomFieldSchema = new Schema({
  label: String,
  value: String,
  type: { type: String, enum: ["text", "select", "boolean", "number"], default: "text" },
});

// Product video stored in Cloudflare R2
const ProductVideoSchema = new Schema({
  url: { type: String, required: true },      // CF R2 public URL or signed URL
  r2Key: { type: String, required: true },    // R2 object key for deletion
  title: { type: String, default: "" },
  duration: { type: Number, default: 0 },     // seconds
  thumbnailUrl: { type: String, default: "" },
  position: { type: Number, default: 0 },
});

const ProductSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true },
    sku: { type: String, unique: true, sparse: true },
    category: {
      type: String,
      enum: ["kurti", "top", "coord-set", "dupatta", "lehenga", "other"],
      required: true,
    },
    subcategory: String,
    description: { type: String, default: "" },
    shortDescription: { type: String, default: "" },
    images: [ProductImageSchema],
    videos: [ProductVideoSchema],           // CF R2 product videos
    variants: [ProductVariantSchema],
    fabric: String,
    occasion: [String],
    pattern: String,
    fit: String,
    workType: String,
    careInstructions: [String],
    customFields: [CustomFieldSchema],
    allowCustomization: { type: Boolean, default: false },
    customizationNote: String,
    sizeChartImages: [String],
    seo: {
      title: String,
      description: String,
      keywords: [String],
      ogImage: String,
    },
    tags: [String],
    collections: [{ type: Schema.Types.ObjectId, ref: "Collection" }],
    rating: {
      average: { type: Number, default: 0 },
      count: { type: Number, default: 0 },
    },
    isActive: { type: Boolean, default: false },
    isFeatured: { type: Boolean, default: false },
    isNewArrival: { type: Boolean, default: true },
    isBestSeller: { type: Boolean, default: false },
    isCustomOrder: { type: Boolean, default: false },
    minimumOrderQuantity: { type: Number, default: 1 },
    leadTimeDays: { type: Number, default: 0 },
    upsellProducts: [{ type: Schema.Types.ObjectId, ref: "Product" }],
    crossSellProducts: [{ type: Schema.Types.ObjectId, ref: "Product" }],
    bundleWith: [{ type: Schema.Types.ObjectId, ref: "Product" }],
    bundleDiscount: { type: Number, default: 0 },
    totalSold: { type: Number, default: 0 },
    viewCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

// Indexes for speed
ProductSchema.index({ category: 1, isActive: 1 });
ProductSchema.index({ tags: 1 });
ProductSchema.index({ isFeatured: 1, isActive: 1 });
ProductSchema.index({ isNewArrival: 1, isActive: 1 });
ProductSchema.index({ isBestSeller: 1, isActive: 1 });
ProductSchema.index({ createdAt: -1 });
ProductSchema.index({ name: "text", tags: "text", description: "text" });

export const ProductModel = models.Product || model("Product", ProductSchema);
