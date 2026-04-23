// app/(store)/product/[slug]/page.tsx
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { connectDB } from "@/lib/db/mongoose";
import { ProductModel } from "@/lib/db/models/Product";
import { ReviewModel, SiteSettingsModel } from "@/lib/db/models/index";
import { cacheGet, cacheSet, CK } from "@/lib/cache/redis";
import { ProductGallery } from "@/components/store/ProductGallery";
import { ProductInfo } from "@/components/store/ProductInfo";
import { ProductReviews } from "@/components/store/ProductReviews";
import { RelatedProducts } from "@/components/store/RelatedProducts";
import { ProductCollaborations } from "@/components/store/ProductCollaborations";
import Link from "next/link";

export const revalidate = 3600;


// Recursively convert ObjectIds, Dates and Buffers to plain JS values
// Required because RSC can't serialize Mongoose objects (they have toJSON methods)
function deepSerialize(obj: any): any {
  if (obj === null || obj === undefined) return obj;
  if (Array.isArray(obj)) return obj.map(deepSerialize);
  if (obj instanceof Date) return obj.toISOString();
  // ObjectId: has toString() and id buffer
  if (obj && typeof obj === "object" && obj.constructor?.name === "ObjectId") return obj.toString();
  // Buffer/Uint8Array (ObjectId.id)
  if (obj && typeof obj === "object" && (obj instanceof Buffer || (obj.buffer instanceof ArrayBuffer))) return undefined;
  if (typeof obj === "object") {
    const result: any = {};
    for (const key of Object.keys(obj)) {
      if (key === "__v") continue; // skip mongoose version key
      const val = deepSerialize(obj[key]);
      if (val !== undefined) result[key] = val;
    }
    return result;
  }
  return obj;
}

async function getProduct(slug: string) {
  const cached = await cacheGet<any>(CK.product(slug));
  if (cached) return cached;
  await connectDB();
  const p = await ProductModel.findOne({ slug, isActive: true })
    .populate("upsellProducts", "name slug images variants rating isNewArrival isBestSeller")
    .populate("crossSellProducts", "name slug images variants rating isNewArrival isBestSeller")
    .lean();
  if (!p) return null;
  // Deep-serialize: strip ALL ObjectId/Date from nested arrays before passing to RSC
  const serialized = deepSerialize(p);
  await cacheSet(CK.product(slug), serialized, 3600);
  return serialized;
}

async function getSettings() {
  try {
    const cached = await cacheGet<any>(CK.settings());
    if (cached) return cached;
    await connectDB();
    const s = await SiteSettingsModel.findOne({ key: "main" }).lean();
    return s ?? {};
  } catch { return {}; }
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProduct(slug);
  if (!product) return { title: "Product Not Found | Nyaree" };
  return {
    title: product.seo?.title || `${product.name} | Nyaree`,
    description: product.seo?.description || product.shortDescription,
    openGraph: {
      title: product.name,
      description: product.seo?.description || product.shortDescription,
      images: product.images?.filter((i: any) => i.isHero).map((i: any) => i.url) ?? [],
    },
    alternates: { canonical: `https://buynyaree.com/product/${slug}` },
  };
}

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const [product, settings] = await Promise.all([getProduct(slug), getSettings()]);
  if (!product) notFound();

  // Load approved reviews
  await connectDB();
  const rawReviews = await ReviewModel.find({ product: product._id, isApproved: true })
    .sort({ isVerifiedPurchase: -1, createdAt: -1 }).limit(50).lean();
  const serializedReviews = rawReviews.map((r: any) => ({
    ...r, _id: r._id.toString(), product: r.product?.toString(),
    user: r.user?.toString(), orderId: r.orderId?.toString(),
    createdAt: r.createdAt?.toISOString(),
  }));

  // Feature flags from settings
  const showDescriptionBelow = settings.showDescriptionBelowProduct ?? false;
  const showRatingBelowTitle = settings.showRatingBelowTitle ?? true;
  const showReviews = settings.showReviewsOnProductPage ?? true;
  const showRelated = settings.showRelatedProducts ?? true;

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
      url: `https://buynyaree.com/product/${product.slug}`,
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

  const categoryLabel = {
    kurti: "Kurtis", top: "Tops", "coord-set": "Co-ord Sets",
    dupatta: "Dupattas", lehenga: "Lehengas", other: "Products",
  }[product.category as string] ?? "Products";

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      {/* Breadcrumb */}
      <div className="container" style={{ padding: "14px 0 0", fontSize: 12, color: "var(--color-ink-light)", display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
        <Link href="/" style={{ color: "var(--color-ink-light)", textDecoration: "none" }}>Home</Link>
        <span>›</span>
        <Link href={`/shop/${product.category}`} style={{ color: "var(--color-ink-light)", textDecoration: "none" }}>{categoryLabel}</Link>
        <span>›</span>
        <span style={{ color: "var(--color-ink)" }}>{product.name}</span>
      </div>

      {/* Main product layout */}
      <div className="container product-detail-grid">
        <ProductGallery images={product.images ?? []} productName={product.name} videos={product.videos ?? []} />
        <ProductInfo product={product} showRatingBelowTitle={showRatingBelowTitle} />
      </div>

      {/* Description below product (if enabled in settings) */}
      {showDescriptionBelow && product.description && (
        <div className="container" style={{ paddingBottom: 48 }}>
          <div style={{ background: "var(--color-ivory-dark)", borderRadius: "var(--radius-sm)", padding: "28px 32px" }}>
            <h2 style={{ fontFamily: "var(--font-display)", fontSize: 22, fontWeight: 400, marginBottom: 16 }}>
              About This Product
            </h2>
            <div
              className="prose"
              style={{ fontSize: 15, lineHeight: 1.85, color: "var(--color-ink-muted)" }}
              dangerouslySetInnerHTML={{ __html: product.description }}
            />
            {/* Care instructions */}
            {product.careInstructions?.length > 0 && (
              <div style={{ marginTop: 20, paddingTop: 16, borderTop: "1px solid var(--color-border)" }}>
                <p style={{ fontWeight: 500, fontSize: 13, marginBottom: 8, textTransform: "uppercase", letterSpacing: 1 }}>Care Instructions</p>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  {product.careInstructions.map((c: string, i: number) => (
                    <span key={i} style={{ fontSize: 12, background: "var(--color-ivory)", border: "1px solid var(--color-border)", padding: "3px 10px", borderRadius: "var(--radius-pill)" }}>{c}</span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Collaborations */}
      {product.collaborations?.length > 0 && (
        <div className="container" style={{ paddingBottom: 48 }}>
          <ProductCollaborations collaborations={product.collaborations} />
        </div>
      )}

      {/* Reviews */}
      {showReviews && (
        <div id="reviews" className="container" style={{ borderTop: "1px solid var(--color-border)", paddingTop: 56, paddingBottom: 56 }}>
          <ProductReviews
            reviews={serializedReviews}
            productId={product._id}
            rating={product.rating}
            productName={product.name}
          />
        </div>
      )}

      {/* Related products */}
      {showRelated && (product.upsellProducts?.length > 0 || product.crossSellProducts?.length > 0) && (
        <RelatedProducts upsell={product.upsellProducts ?? []} crossSell={product.crossSellProducts ?? []} />
      )}
    </>
  );
}
