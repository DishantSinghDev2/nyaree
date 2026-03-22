// app/(store)/page.tsx
import type { Metadata } from "next";
import { HeroSection } from "@/components/store/HeroSection";
import { CategoryCards } from "@/components/store/CategoryCards";
import { FeaturedProducts } from "@/components/store/FeaturedProducts";
import { CollectionBanner } from "@/components/store/CollectionBanner";
import { BestSellers } from "@/components/store/BestSellers";
import { InstagramFeed } from "@/components/store/InstagramFeed";
import { Testimonials } from "@/components/store/Testimonials";
import { SizeChartBanner } from "@/components/store/SizeChartBanner";
import { NewsletterSection } from "@/components/store/NewsletterSection";
import { USPStrip } from "@/components/store/USPStrip";
import { connectDB } from "@/lib/db/mongoose";
import { ProductModel } from "@/lib/db/models/Product";
import { cacheGet, cacheSet, CK } from "@/lib/cache/redis";
import type { Product } from "@/types";

export const revalidate = 300; // ISR: revalidate every 5 minutes

export const metadata: Metadata = {
  title: "Nyaree — Wear India. Own It. | Kurtis & Tops Online",
  description:
    "Shop handcrafted kurtis and trending tops at Nyaree. Premium Indian women's fashion — free shipping above ₹499. Designed for the modern Indian woman.",
};

async function getFeaturedProducts(): Promise<Product[]> {
  const cached = await cacheGet<Product[]>(CK.featured());
  if (cached) return cached;

  await connectDB();
  const products = await ProductModel.find({ isActive: true, isFeatured: true })
    .limit(8)
    .sort({ createdAt: -1 })
    .lean();

  const result = products.map(serializeProduct);
  await cacheSet(CK.featured(), result, 300);
  return result;
}

async function getNewArrivals(): Promise<Product[]> {
  const cached = await cacheGet<Product[]>(CK.newArrivals());
  if (cached) return cached;

  await connectDB();
  const products = await ProductModel.find({ isActive: true, isNewArrival: true })
    .limit(8)
    .sort({ createdAt: -1 })
    .lean();

  const result = products.map(serializeProduct);
  await cacheSet(CK.newArrivals(), result, 300);
  return result;
}

async function getBestSellers(): Promise<Product[]> {
  const cached = await cacheGet<Product[]>(CK.bestsellers());
  if (cached) return cached;

  await connectDB();
  const products = await ProductModel.find({ isActive: true, isBestSeller: true })
    .limit(6)
    .sort({ totalSold: -1 })
    .lean();

  const result = products.map(serializeProduct);
  await cacheSet(CK.bestsellers(), result, 600);
  return result;
}

// Deep-serialize MongoDB docs - strips ALL ObjectIds/Dates from nested subdocuments
// Fixes "Objects with toJSON methods are not supported" RSC error
function deepSerialize(obj: any): any {
  if (obj === null || obj === undefined) return obj;
  if (Array.isArray(obj)) return obj.map(deepSerialize);
  if (obj instanceof Date) return obj.toISOString();
  if (obj && typeof obj === "object" && obj.constructor?.name === "ObjectId") return obj.toString();
  if (obj && typeof obj === "object" && obj.buffer instanceof ArrayBuffer) return undefined;
  if (typeof obj === "object") {
    const out: any = {};
    for (const k of Object.keys(obj)) {
      if (k === "__v") continue;
      const v = deepSerialize(obj[k]);
      if (v !== undefined) out[k] = v;
    }
    return out;
  }
  return obj;
}

function serializeProduct(p: any): Product {
  return deepSerialize(p) as Product;
}

export default async function HomePage() {
  const [featured, newArrivals, bestSellers] = await Promise.all([
    getFeaturedProducts(),
    getNewArrivals(),
    getBestSellers(),
  ]);

  return (
    <>
      <HeroSection />
      <USPStrip />
      <CategoryCards />
      <FeaturedProducts products={featured} />
      <CollectionBanner
        title="Festive Edit"
        subtitle="Dressed for every celebration"
        href="/collections/festive-edit"
        bg="var(--color-forest)"
        textColor="#fff"
      />
      <BestSellers products={bestSellers} />
      <SizeChartBanner />
      <FeaturedProducts
        products={newArrivals}
        title="New Arrivals"
        subtitle="Fresh every Friday"
        viewAllHref="/collections/new-arrivals"
      />
      <InstagramFeed />
      <Testimonials />
      <NewsletterSection />
    </>
  );
}
