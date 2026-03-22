// app/(store)/collections/[handle]/page.tsx
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { connectDB } from "@/lib/db/mongoose";
import { CollectionModel, ProductModel } from "@/lib/db/models/index";
import { ProductCard } from "@/components/store/ProductCard";
import Link from "next/link";

export const revalidate = 300;
// Deep-serialize MongoDB docs — strips ObjectIds/Dates from all nested objects
// Prevents "Objects with toJSON methods are not supported" RSC serialization error
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



// Handle virtual collections (new-arrivals, best-sellers, etc.) without DB records
const VIRTUAL_COLLECTIONS: Record<string, { title: string; desc: string; filter: Record<string, unknown> }> = {
  "new-arrivals": { title: "New Arrivals", desc: "Fresh pieces added every Friday", filter: { isNewArrival: true } },
  "best-sellers": { title: "Best Sellers", desc: "Our most-loved pieces", filter: { isBestSeller: true } },
  "sale": { title: "Sale", desc: "Great pieces at even better prices", filter: { "variants.compareAtPrice": { $gt: 0 } } },
  "under-499": { title: "Under ₹499", desc: "Style on a budget", filter: { "variants.price": { $lte: 49900 } } },
  "cotton-kurtis": { title: "Cotton Kurtis", desc: "Breathable everyday comfort", filter: { category: "kurti", fabric: /cotton/i } },
  "summer-pastels": { title: "Summer Pastels", desc: "Light, airy, effortless", filter: { tags: { $in: ["pastel", "summer", "light"] } } },
  "festive-edit": { title: "Festive Edit", desc: "Dressed for every celebration", filter: { occasion: { $in: ["Festive", "Wedding", "Party"] } } },
};

export async function generateMetadata({ params }: { params: Promise<{ handle: string }> }): Promise<Metadata> {
  const { handle } = await params;
  const virtual = VIRTUAL_COLLECTIONS[handle];
  if (virtual) return { title: `${virtual.title} | Nyaree`, description: virtual.desc };

  await connectDB();
  const col = await CollectionModel.findOne({ handle, isActive: true }).lean() as any;
  if (!col) return { title: "Collection | Nyaree" };
  return {
    title: col.seo?.title || `${col.title} | Nyaree`,
    description: col.seo?.description || col.description,
  };
}

export default async function CollectionHandlePage({ params }: { params: Promise<{ handle: string }> }) {
  const { handle } = await params;
  await connectDB();

  let title = "", desc = "", bannerImage = "";
  let products: any[] = [];

  const virtual = VIRTUAL_COLLECTIONS[handle];
  if (virtual) {
    title = virtual.title;
    desc = virtual.desc;
    products = await ProductModel.find({ ...virtual.filter, isActive: true })
      .sort({ createdAt: -1 }).limit(48)
      .select("name slug images variants rating isNewArrival isBestSeller category tags")
      .lean();
  } else {
    const col = await CollectionModel.findOne({ handle, isActive: true })
      .populate("products", "name slug images variants rating isNewArrival isBestSeller category tags")
      .lean() as any;
    if (!col) notFound();
    title = col.title;
    desc = col.description;
    bannerImage = col.bannerImage;
    products = col.products ?? [];
  }

  const serialized = products.map((p: any) => deepSerialize(p));

  return (
    <div>
      {/* Hero */}
      <section style={{
        background: bannerImage ? `url(${bannerImage}) center/cover` : "var(--color-ink)",
        padding: "72px 0",
        position: "relative",
      }}>
        {bannerImage && <div style={{ position: "absolute", inset: 0, background: "rgba(26,18,8,0.55)" }} />}
        <div className="container" style={{ textAlign: "center", position: "relative", zIndex: 1 }}>
          <p style={{ fontFamily: "var(--font-body)", fontSize: 11, letterSpacing: 3, textTransform: "uppercase", color: "var(--color-gold)", marginBottom: 10 }}>Collection</p>
          <h1 style={{ fontFamily: "var(--font-display)", fontSize: "clamp(2rem, 5vw, 3.5rem)", fontWeight: 300, color: "#fff", marginBottom: 10 }}>{title}</h1>
          {desc && <p style={{ fontSize: 14, color: "rgba(255,255,255,0.7)" }}>{desc}</p>}
        </div>
      </section>

      <div className="container" style={{ padding: "48px 0 80px" }}>
        {serialized.length === 0 ? (
          <div style={{ textAlign: "center", padding: "80px 0" }}>
            <p style={{ fontSize: 40, marginBottom: 16 }}>🌸</p>
            <h2 style={{ fontFamily: "var(--font-display)", fontSize: 24, marginBottom: 12 }}>Coming Soon</h2>
            <p style={{ color: "var(--color-ink-light)", marginBottom: 28 }}>This collection is being curated with love</p>
            <Link href="/shop"><button className="btn btn-primary">Browse All Products</button></Link>
          </div>
        ) : (
          <>
            <p style={{ fontSize: 13, color: "var(--color-ink-light)", marginBottom: 28 }}>{serialized.length} product{serialized.length !== 1 ? "s" : ""}</p>
            <div className="product-grid stagger-children">
              {serialized.map((product: any, i: number) => (
                <ProductCard key={product._id} product={product} priority={i < 4} />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
