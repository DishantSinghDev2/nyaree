// app/(store)/shop/[category]/page.tsx
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { connectDB } from "@/lib/db/mongoose";
import { ProductModel } from "@/lib/db/models/Product";
import { cacheGet, cacheSet, CK } from "@/lib/cache/redis";
import { ShopGrid } from "@/components/store/ShopGrid";

export const revalidate = 120;
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



const CATEGORY_META: Record<string, { title: string; description: string; heading: string; sub: string }> = {
  kurti: {
    title: "Buy Kurtis Online | Cotton, Printed, Embroidered Kurtis | Nyaree",
    description: "Explore Nyaree's handcrafted kurti collection. Cotton, printed, embroidered — perfect for every occasion. Free shipping above ₹499.",
    heading: "Kurtis",
    sub: "Timeless classics, crafted for you",
  },
  top: {
    title: "Trendy Tops for Women | Buy Tops Online | Nyaree",
    description: "Shop women's tops at Nyaree — crop tops, shirt collars, floral and more. Designed for the modern Indian woman.",
    heading: "Tops",
    sub: "Modern styles for every mood",
  },
  "coord-set": {
    title: "Co-ord Sets for Women | Matching Sets Online | Nyaree",
    description: "Effortlessly stylish co-ord sets at Nyaree. Matching tops and bottoms for a put-together look every time.",
    heading: "Co-ord Sets",
    sub: "Effortless style, perfectly matched",
  },
  dupatta: {
    title: "Dupattas Online | Shop Ethnic Dupattas | Nyaree",
    description: "Complete your look with Nyaree's handcrafted dupattas. Silk, chiffon, cotton — every fabric, every occasion.",
    heading: "Dupattas",
    sub: "The perfect finishing touch",
  },
  lehenga: {
    title: "Lehengas Online | Festive Lehengas | Nyaree",
    description: "Stunning lehengas for weddings, festivals, and celebrations at Nyaree.",
    heading: "Lehengas",
    sub: "For life's biggest celebrations",
  },
};

export async function generateMetadata({ params }: { params: Promise<{ category: string }> }): Promise<Metadata> {
  const { category } = await params;
  const meta = CATEGORY_META[category];
  if (!meta) return { title: "Shop | Nyaree" };
  return {
    title: meta.title,
    description: meta.description,
    openGraph: { title: meta.title, description: meta.description },
    alternates: { canonical: `https://buynyaree.com/shop/${category}` },
  };
}

async function getProducts(category: string, page = 1, limit = 24) {
  const cacheKey = CK.productList(category, page);
  const cached = await cacheGet(cacheKey);
  if (cached) return cached;

  await connectDB();
  const filter: any = { isActive: true };
  if (category !== "all") filter.category = category;

  const [items, total] = await Promise.all([
    ProductModel.find(filter)
      .sort({ isFeatured: -1, isNewArrival: -1, createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .select("name slug images variants rating isNewArrival isBestSeller isFeatured category tags fabric")
      .lean(),
    ProductModel.countDocuments(filter),
  ]);

  const result = {
    items: items.map((p: any) => deepSerialize(p)),
    total, page, limit, hasMore: page * limit < total,
  };
  await cacheSet(cacheKey, result, 120);
  return result;
}

export default async function CategoryPage({ params, searchParams }: {
  params: Promise<{ category: string }>;
  searchParams: Promise<{ page?: string; sort?: string; size?: string; color?: string; fabric?: string; maxPrice?: string }>;
}) {
  const { category } = await params;
  const sp = await searchParams;
  const validCategories = ["all", ...Object.keys(CATEGORY_META)];
  if (!validCategories.includes(category)) notFound();

  const page = parseInt(sp.page ?? "1");
  const data = await getProducts(category, page) as any;
  const meta = CATEGORY_META[category] ?? { heading: "All Products", sub: "Browse our full collection" };

  // JSON-LD ItemList
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: meta.heading,
    numberOfItems: data.total,
    itemListElement: data.items.slice(0, 10).map((p: any, i: number) => ({
      "@type": "ListItem",
      position: i + 1,
      url: `https://buynyaree.com/product/${p.slug}`,
      name: p.name,
    })),
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      {/* Category Hero */}
      <section style={{ background: "var(--color-ink)", padding: "48px 0", marginBottom: 0 }}>
        <div className="container" style={{ textAlign: "center" }}>
          <p style={{ fontFamily: "var(--font-body)", fontSize: 11, letterSpacing: 3, textTransform: "uppercase", color: "var(--color-gold)", marginBottom: 8 }}>
            Nyaree Collection
          </p>
          <h1 style={{ fontFamily: "var(--font-display)", fontSize: "clamp(2rem, 5vw, 3.5rem)", fontWeight: 300, color: "#fff", marginBottom: 8 }}>
            {meta.heading}
          </h1>
          <p style={{ fontSize: 14, color: "rgba(255,255,255,0.6)" }}>{meta.sub}</p>
        </div>
      </section>

      <ShopGrid initialData={data} category={category} searchParams={sp} />
    </>
  );
}
