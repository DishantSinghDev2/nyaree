// app/(store)/page.tsx
import { Suspense } from "react";
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
import { FeaturedCollaborations } from "@/components/store/FeaturedCollaborations";
import { connectDB } from "@/lib/db/mongoose";
import { ProductModel } from "@/lib/db/models/Product";
import { SiteSettingsModel } from "@/lib/db/models/index";
import { cacheGet, cacheSet, CK } from "@/lib/cache/redis";
import type { Product } from "@/types";

export const revalidate = 300; // ISR: revalidate every 5 minutes

export const metadata: Metadata = {
  title: "Nyaree — Wear India. Own It. | Kurtis & Tops Online",
  description:
    "Shop handcrafted kurtis and trending tops at Nyaree. Premium Indian women's fashion — free shipping above ₹499. Designed for the modern Indian woman.",
};

const DEFAULT_SLIDES = [
  { id: "d1", headline: "Wear India. Own It.", subheadline: "Handcrafted kurtis & trending tops for the modern Indian woman", imageUrl: "", bgColor: "#1A1208", bgGradient: "linear-gradient(135deg,#1A1208 0%,#2D1E0A 50%,#1A1208 100%)", accentColor: "#C8960C", cta1Label: "Shop Kurtis", cta1Href: "/shop/kurti", cta2Label: "Shop Tops", cta2Href: "/shop/top", isActive: true, position: 0 },
  { id: "d2", headline: "New Arrivals Every Friday.", subheadline: "Fresh drops — limited quantities, crafted with care", imageUrl: "", bgColor: "#2D4A3E", bgGradient: "linear-gradient(135deg,#2D4A3E 0%,#1A3028 100%)", accentColor: "#F0C060", cta1Label: "New Arrivals", cta1Href: "/collections/new-arrivals", cta2Label: "Shop All", cta2Href: "/shop/all", isActive: true, position: 1 },
  { id: "d3", headline: "Festive Season Awaits.", subheadline: "Curated picks for every celebration — from pujas to parties", imageUrl: "", bgColor: "#3D1515", bgGradient: "linear-gradient(135deg,#3D1515 0%,#2A0D0D 100%)", accentColor: "#E85D04", cta1Label: "Festive Edit", cta1Href: "/collections/festive-edit", cta2Label: "Under ₹499", cta2Href: "/collections/under-499", isActive: true, position: 2 },
];

async function getHeroSlides() {
  const cached = await cacheGet<any[]>("nyaree:hero:slides");
  if (cached) return cached;
  await connectDB();
  const s = await SiteSettingsModel.findOne({ key: "main" }).select("heroSlides").lean() as any;
  const slides = (s?.heroSlides ?? []).filter((sl: any) => sl.isActive);
  const result = slides.length > 0 ? slides : DEFAULT_SLIDES;
  const serialized = deepSerialize(result);
  await cacheSet("nyaree:hero:slides", serialized, 300);
  return serialized;
}

async function getFeaturedProducts(): Promise<Product[]> {
  const cached = await cacheGet<Product[]>(CK.featured());
  if (cached) return cached;
  await connectDB();
  const products = await ProductModel.find({ isActive: true, isFeatured: true }).limit(8).sort({ createdAt: -1 }).lean();
  const result = products.map(serializeProduct);
  await cacheSet(CK.featured(), result, 300);
  return result;
}

async function getNewArrivals(): Promise<Product[]> {
  const cached = await cacheGet<Product[]>(CK.newArrivals());
  if (cached) return cached;
  await connectDB();
  const products = await ProductModel.find({ isActive: true, isNewArrival: true }).limit(8).sort({ createdAt: -1 }).lean();
  const result = products.map(serializeProduct);
  await cacheSet(CK.newArrivals(), result, 300);
  return result;
}

async function getBestSellers(): Promise<Product[]> {
  const cached = await cacheGet<Product[]>(CK.bestsellers());
  if (cached) return cached;
  await connectDB();
  const products = await ProductModel.find({ isActive: true, isBestSeller: true }).limit(6).sort({ totalSold: -1 }).lean();
  const result = products.map(serializeProduct);
  await cacheSet(CK.bestsellers(), result, 600);
  return result;
}

async function getCollaborations(): Promise<Product[]> {
  const cached = await cacheGet<Product[]>("featured_collabs");
  if (cached) return cached;
  await connectDB();
  const products = await ProductModel.find({ isActive: true, "collaborations.isFeaturedOnHome": true }).sort({ createdAt: -1 }).lean();
  const result = products.map(serializeProduct);
  await cacheSet("featured_collabs", result, 600);
  return result;
}

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

// Suspense-wrapped section components
async function FeaturedProductsSection() {
  const products = await getFeaturedProducts();
  return <FeaturedProducts products={products} />;
}

async function BestSellersSection() {
  const products = await getBestSellers();
  return <BestSellers products={products} />;
}

async function CollabsSection() {
  const products = await getCollaborations();
  return <FeaturedCollaborations products={products} />;
}

async function NewArrivalsSection() {
  const products = await getNewArrivals();
  return (
    <FeaturedProducts
      products={products}
      title="New Arrivals"
      subtitle="Fresh every Friday"
      viewAllHref="/collections/new-arrivals"
    />
  );
}

function LoadingGrid() {
  return (
    <div className="container" style={{ padding: "60px 0" }}>
      <div style={{ display: "flex", gap: 16, overflowX: "auto" }}>
        {[1,2,3,4].map(i => (
          <div key={i} style={{ width: 280, height: 400, background: "var(--color-ivory-dark)", borderRadius: "var(--radius-sm)", flexShrink: 0, animation: "pulse 1.5s infinite" }} />
        ))}
      </div>
    </div>
  );
}

export default async function HomePage() {
  // Only await the hero slides before FCP. The rest load in background.
  const heroSlides = await getHeroSlides();

  return (
    <>
      <HeroSection initialSlides={heroSlides} />
      <USPStrip />
      <CategoryCards />
      
      <Suspense fallback={<LoadingGrid />}>
        <FeaturedProductsSection />
      </Suspense>

      <CollectionBanner
        title="Festive Edit"
        subtitle="Dressed for every celebration"
        href="/collections/festive-edit"
        bg="var(--color-forest)"
        textColor="#fff"
      />

      <Suspense fallback={<LoadingGrid />}>
        <BestSellersSection />
      </Suspense>

      <Suspense fallback={<LoadingGrid />}>
        <CollabsSection />
      </Suspense>

      <SizeChartBanner />

      <Suspense fallback={<LoadingGrid />}>
        <NewArrivalsSection />
      </Suspense>

      <InstagramFeed />
      <Testimonials />
      <NewsletterSection />
    </>
  );
}
