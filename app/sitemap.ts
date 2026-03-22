// app/sitemap.ts — Auto-generated XML sitemap
import type { MetadataRoute } from "next";
import { connectDB } from "@/lib/db/mongoose";
import { ProductModel } from "@/lib/db/models/Product";
import { BlogModel, CollectionModel } from "@/lib/db/models/index";

const BASE = "https://buynyaree.com";

// Static pages with their priorities and change frequencies
const STATIC_PAGES: MetadataRoute.Sitemap = [
  { url: BASE, lastModified: new Date(), changeFrequency: "daily", priority: 1.0 },
  { url: `${BASE}/shop`, lastModified: new Date(), changeFrequency: "daily", priority: 0.9 },
  { url: `${BASE}/shop/all`, lastModified: new Date(), changeFrequency: "daily", priority: 0.9 },
  { url: `${BASE}/shop/kurti`, lastModified: new Date(), changeFrequency: "daily", priority: 0.9 },
  { url: `${BASE}/shop/top`, lastModified: new Date(), changeFrequency: "daily", priority: 0.9 },
  { url: `${BASE}/shop/coord-set`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.8 },
  { url: `${BASE}/collections`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.8 },
  { url: `${BASE}/collections/new-arrivals`, lastModified: new Date(), changeFrequency: "daily", priority: 0.85 },
  { url: `${BASE}/collections/best-sellers`, lastModified: new Date(), changeFrequency: "daily", priority: 0.85 },
  { url: `${BASE}/collections/festive-edit`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.8 },
  { url: `${BASE}/collections/sale`, lastModified: new Date(), changeFrequency: "daily", priority: 0.85 },
  { url: `${BASE}/blog`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.7 },
  { url: `${BASE}/about`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.6 },
  { url: `${BASE}/contact`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.6 },
  { url: `${BASE}/size-guide`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.6 },
  { url: `${BASE}/custom-order`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.5 },
  { url: `${BASE}/track-order`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.4 },
  { url: `${BASE}/legal/privacy-policy`, lastModified: new Date(), changeFrequency: "yearly", priority: 0.3 },
  { url: `${BASE}/legal/terms`, lastModified: new Date(), changeFrequency: "yearly", priority: 0.3 },
  { url: `${BASE}/legal/refund`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.4 },
  { url: `${BASE}/legal/shipping`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.4 },
  { url: `${BASE}/legal/faqs`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.5 },
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  try {
    await connectDB();

    const [products, blogs, collections] = await Promise.allSettled([
      ProductModel.find({ isActive: true })
        .select("slug updatedAt")
        .sort({ updatedAt: -1 })
        .limit(1000)
        .lean(),
      BlogModel.find({ status: "published" })
        .select("slug publishedAt updatedAt")
        .sort({ publishedAt: -1 })
        .limit(500)
        .lean(),
      CollectionModel.find({ isActive: true })
        .select("handle updatedAt")
        .lean(),
    ]);

    const productUrls: MetadataRoute.Sitemap =
      products.status === "fulfilled"
        ? (products.value as any[]).map((p) => ({
            url: `${BASE}/product/${p.slug}`,
            lastModified: p.updatedAt ?? new Date(),
            changeFrequency: "weekly" as const,
            priority: 0.8,
          }))
        : [];

    const blogUrls: MetadataRoute.Sitemap =
      blogs.status === "fulfilled"
        ? (blogs.value as any[]).map((b) => ({
            url: `${BASE}/blog/${b.slug}`,
            lastModified: b.updatedAt ?? b.publishedAt ?? new Date(),
            changeFrequency: "monthly" as const,
            priority: 0.6,
          }))
        : [];

    const collectionUrls: MetadataRoute.Sitemap =
      collections.status === "fulfilled"
        ? (collections.value as any[]).map((c) => ({
            url: `${BASE}/collections/${c.handle}`,
            lastModified: c.updatedAt ?? new Date(),
            changeFrequency: "weekly" as const,
            priority: 0.7,
          }))
        : [];

    return [...STATIC_PAGES, ...productUrls, ...blogUrls, ...collectionUrls];
  } catch {
    // If DB fails, return static pages only (never crash sitemap)
    return STATIC_PAGES;
  }
}
