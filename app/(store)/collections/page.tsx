// app/(store)/collections/page.tsx
import type { Metadata } from "next";
import { connectDB } from "@/lib/db/mongoose";
import { CollectionModel } from "@/lib/db/models/index";
import Link from "next/link";
import Image from "next/image";

export const revalidate = 600;
export const metadata: Metadata = {
  title: "Collections | Nyaree",
  description: "Explore Nyaree's curated collections — Festive Edit, Summer Pastels, Best Sellers and more.",
};

export default async function CollectionsPage() {
  await connectDB();
  const collections = await CollectionModel.find({ isActive: true }).sort({ sortOrder: 1 }).lean();

  const defaults = [
    { title: "New Arrivals", handle: "new-arrivals", desc: "Fresh every Friday", emoji: "✨" },
    { title: "Best Sellers", handle: "best-sellers", desc: "Loved by thousands", emoji: "🏆" },
    { title: "Festive Edit", handle: "festive-edit", desc: "Dressed for every celebration", emoji: "🎉" },
    { title: "Under ₹499", handle: "under-499", desc: "Style on a budget", emoji: "💛" },
    { title: "Cotton Kurtis", handle: "cotton-kurtis", desc: "Breathable everyday comfort", emoji: "🌿" },
    { title: "Summer Pastels", handle: "summer-pastels", desc: "Light, airy, effortless", emoji: "🌸" },
  ];

  const allCollections = collections.length > 0
    ? collections
    : defaults.map((d, i) => ({ ...d, _id: String(i), bannerImage: "", isActive: true }));

  return (
    <div>
      <section style={{ background: "var(--color-ink)", padding: "64px 0 48px" }}>
        <div className="container" style={{ textAlign: "center" }}>
          <p style={{ fontFamily: "var(--font-body)", fontSize: 11, letterSpacing: 3, textTransform: "uppercase", color: "var(--color-gold)", marginBottom: 8 }}>Curated For You</p>
          <h1 style={{ fontFamily: "var(--font-display)", fontSize: "clamp(2rem, 5vw, 3.5rem)", fontWeight: 300, color: "#fff" }}>Collections</h1>
          <p style={{ fontSize: 14, color: "rgba(255,255,255,0.6)", marginTop: 8 }}>Handpicked edits for every mood and moment</p>
        </div>
      </section>

      <div className="container" style={{ padding: "48px 0 80px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 24 }}>
          {allCollections.map((col: any) => (
            <Link key={col._id?.toString() ?? col.handle} href={`/collections/${col.handle}`} style={{ textDecoration: "none" }}>
              <article className="card card-lift" style={{ overflow: "hidden" }}>
                <div style={{ aspectRatio: "4/3", position: "relative", background: "var(--color-ivory-dark)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  {col.bannerImage ? (
                    <Image src={col.bannerImage} alt={col.title} fill style={{ objectFit: "cover" }} />
                  ) : (
                    <span style={{ fontSize: 48 }}>{col.emoji ?? "🌸"}</span>
                  )}
                  <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(26,18,8,0.7) 0%, transparent 50%)" }} />
                  <div style={{ position: "absolute", bottom: 20, left: 20, right: 20 }}>
                    <h2 style={{ fontFamily: "var(--font-display)", fontSize: 22, color: "#fff", fontWeight: 300, marginBottom: 4 }}>{col.title}</h2>
                    {col.desc && <p style={{ fontSize: 13, color: "rgba(255,255,255,0.7)" }}>{col.desc}</p>}
                  </div>
                </div>
              </article>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
