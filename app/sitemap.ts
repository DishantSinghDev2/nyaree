// app/sitemap.ts
import { MetadataRoute } from "next";
import { connectDB } from "@/lib/db/mongoose";
import { ProductModel } from "@/lib/db/models/Product";
import { BlogModel, CollectionModel } from "@/lib/db/models/index";

export const revalidate = 3600; // Regenerate every hour

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = "https://nyaree.in";

  // Static pages
  const staticPages: MetadataRoute.Sitemap = [
    { url: baseUrl, lastModified: new Date(), changeFrequency: "daily", priority: 1.0 },
    { url: `${baseUrl}/shop`, lastModified: new Date(), changeFrequency: "daily", priority: 0.9 },
    { url: `${baseUrl}/shop/kurti`, lastModified: new Date(), changeFrequency: "daily", priority: 0.9 },
    { url: `${baseUrl}/shop/top`, lastModified: new Date(), changeFrequency: "daily", priority: 0.9 },
    { url: `${baseUrl}/shop/coord-set`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.8 },
    { url: `${baseUrl}/collections`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.8 },
    { url: `${baseUrl}/blog`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.7 },
    { url: `${baseUrl}/track-order`, lastModified: new Date(), changeFrequency: "yearly", priority: 0.5 },
    { url: `${baseUrl}/legal/privacy-policy`, lastModified: new Date(), changeFrequency: "yearly", priority: 0.3 },
    { url: `${baseUrl}/legal/terms`, lastModified: new Date(), changeFrequency: "yearly", priority: 0.3 },
    { url: `${baseUrl}/legal/refund`, lastModified: new Date(), changeFrequency: "yearly", priority: 0.4 },
    { url: `${baseUrl}/legal/shipping`, lastModified: new Date(), changeFrequency: "yearly", priority: 0.4 },
  ];

  try {
    await connectDB();
    const [products, blogs, collections] = await Promise.all([
      ProductModel.find({ isActive: true }, "slug updatedAt").lean(),
      BlogModel.find({ status: "published" }, "slug updatedAt").lean(),
      CollectionModel.find({ isActive: true }, "handle updatedAt").lean(),
    ]);

    const productPages: MetadataRoute.Sitemap = products.map((p: any) => ({
      url: `${baseUrl}/product/${p.slug}`,
      lastModified: p.updatedAt ?? new Date(),
      changeFrequency: "weekly",
      priority: 0.8,
    }));

    const blogPages: MetadataRoute.Sitemap = blogs.map((b: any) => ({
      url: `${baseUrl}/blog/${b.slug}`,
      lastModified: b.updatedAt ?? new Date(),
      changeFrequency: "monthly",
      priority: 0.6,
    }));

    const collectionPages: MetadataRoute.Sitemap = collections.map((c: any) => ({
      url: `${baseUrl}/collections/${c.handle}`,
      lastModified: c.updatedAt ?? new Date(),
      changeFrequency: "weekly",
      priority: 0.7,
    }));

    return [...staticPages, ...productPages, ...blogPages, ...collectionPages];
  } catch {
    return staticPages;
  }
}
