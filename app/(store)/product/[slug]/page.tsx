// app/(store)/product/[slug]/page.tsx
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { connectDB } from "@/lib/db/mongoose";
import { ProductModel } from "@/lib/db/models/Product";
import { ReviewModel } from "@/lib/db/models/index";
import { cacheGet, cacheSet, CK } from "@/lib/cache/redis";
import { ProductGallery } from "@/components/store/ProductGallery";
import { ProductInfo } from "@/components/store/ProductInfo";
import { ProductReviews } from "@/components/store/ProductReviews";
import { RelatedProducts } from "@/components/store/RelatedProducts";

export const revalidate = 3600;

async function getProduct(slug: string) {
  const cached = await cacheGet<any>(CK.product(slug));
  if (cached) return cached;
  await connectDB();
  const p = await ProductModel.findOne({ slug, isActive: true })
    .populate("upsellProducts", "name slug images variants rating isNewArrival isBestSeller")
    .populate("crossSellProducts", "name slug images variants rating isNewArrival isBestSeller")
    .lean();
  if (!p) return null;
  const serialized = {
    ...p,
    _id: (p as any)._id.toString(),
    collections: ((p as any).collections ?? []).map((c: any) => c.toString()),
    upsellProducts: ((p as any).upsellProducts ?? []).map((u: any) => ({ ...u, _id: u._id?.toString() })),
    crossSellProducts: ((p as any).crossSellProducts ?? []).map((u: any) => ({ ...u, _id: u._id?.toString() })),
    bundleWith: ((p as any).bundleWith ?? []).map((u: any) => u.toString()),
    createdAt: (p as any).createdAt?.toISOString() ?? "",
    updatedAt: (p as any).updatedAt?.toISOString() ?? "",
  };
  await cacheSet(CK.product(slug), serialized, 3600);
  // Increment view count async (no await — fire and forget)
  ProductModel.findOneAndUpdate({ slug }, { $inc: { viewCount: 1 } }).exec().catch(() => {});
  return serialized;
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProduct(slug);
  if (!product) return { title: "Product Not Found | Nyaree" };
  const minV = product.variants?.[0];
  return {
    title: product.seo?.title || `${product.name} | Nyaree`,
    description: product.seo?.description || product.shortDescription,
    keywords: product.seo?.keywords?.join(", "),
    openGraph: {
      title: product.seo?.title || product.name,
      description: product.seo?.description || product.shortDescription,
      images: [{ url: product.seo?.ogImage || product.images?.[0]?.url || "", width: 1200, height: 630 }],
      type: "website",
    },
    other: {
      "product:price:amount": minV ? String(minV.price / 100) : "",
      "product:price:currency": "INR",
    },
  };
}

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = await getProduct(slug);
  if (!product) notFound();

  // Fetch reviews separately
  await connectDB();
  const reviews = await ReviewModel.find({ product: product._id, isApproved: true })
    .sort({ createdAt: -1 })
    .limit(20)
    .lean();

  const serializedReviews = reviews.map((r: any) => ({
    ...r,
    _id: r._id.toString(),
    product: r.product?.toString(),
    user: r.user?.toString(),
    orderId: r.orderId?.toString(),
    createdAt: r.createdAt?.toISOString(),
  }));

  // JSON-LD Product schema
  const minV = product.variants?.[0];
  const totalStock = product.variants?.reduce((s: number, v: any) => s + v.stock, 0) ?? 0;
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    image: product.images?.map((i: any) => i.url),
    description: product.shortDescription,
    brand: { "@type": "Brand", name: "Nyaree" },
    sku: product.sku,
    offers: {
      "@type": "Offer",
      url: `https://nyaree.in/product/${product.slug}`,
      priceCurrency: "INR",
      price: minV ? minV.price / 100 : 0,
      availability: totalStock > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
      seller: { "@type": "Organization", name: "Nyaree" },
    },
    aggregateRating: product.rating.count > 0 ? {
      "@type": "AggregateRating",
      ratingValue: product.rating.average,
      reviewCount: product.rating.count,
    } : undefined,
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      {/* Breadcrumb */}
      <div className="container" style={{ padding: "16px 0", fontSize: 12, color: "var(--color-ink-light)" }}>
        <span>Home</span> <span style={{ margin: "0 8px" }}>›</span>
        <span>{product.category}</span> <span style={{ margin: "0 8px" }}>›</span>
        <span style={{ color: "var(--color-ink)" }}>{product.name}</span>
      </div>

      {/* Main layout */}
      <div className="container" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 64, paddingBottom: 80, alignItems: "start" }}>
        <ProductGallery images={product.images} productName={product.name} />
        <ProductInfo product={product} />
      </div>

      {/* Reviews */}
      <div className="container" style={{ borderTop: "1px solid var(--color-border)", paddingTop: 64, paddingBottom: 64 }}>
        <ProductReviews reviews={serializedReviews} productId={product._id} rating={product.rating} />
      </div>

      {/* Upsell / Related */}
      {(product.upsellProducts?.length > 0 || product.crossSellProducts?.length > 0) && (
        <RelatedProducts
          upsell={product.upsellProducts}
          crossSell={product.crossSellProducts}
        />
      )}
    </>
  );
}
