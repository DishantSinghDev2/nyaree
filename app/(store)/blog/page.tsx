// app/(store)/blog/page.tsx
import type { Metadata } from "next";
import { connectDB } from "@/lib/db/mongoose";
import { BlogModel } from "@/lib/db/models/index";
import Link from "next/link";
import Image from "next/image";

export const revalidate = 600;
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


export const metadata: Metadata = {
  title: "Style Blog | Fashion Tips & Trends | Nyaree",
  description: "Discover fashion tips, styling guides, and trend reports from the Nyaree blog. Your guide to Indian women's fashion.",
};

export default async function BlogPage() {
  await connectDB();
  const blogs = await BlogModel.find({ status: "published" }).sort({ publishedAt: -1 }).limit(20).lean();

  return (
    <div>
      {/* Hero */}
      <section style={{ background: "var(--color-ink)", padding: "64px 0 48px" }}>
        <div className="container" style={{ textAlign: "center" }}>
          <p style={{ fontFamily: "var(--font-body)", fontSize: 11, letterSpacing: 3, textTransform: "uppercase", color: "var(--color-gold)", marginBottom: 8 }}>Nyaree Journal</p>
          <h1 style={{ fontFamily: "var(--font-display)", fontSize: "clamp(2rem, 5vw, 3.5rem)", fontWeight: 300, color: "#fff" }}>Style & Stories</h1>
          <p style={{ fontSize: 14, color: "rgba(255,255,255,0.6)", marginTop: 8 }}>Fashion tips, trend guides, and styling inspiration</p>
        </div>
      </section>

      <div className="container" style={{ padding: "48px 0 80px" }}>
        {blogs.length === 0 ? (
          <div style={{ textAlign: "center", padding: "80px 0" }}>
            <p style={{ fontSize: 40, marginBottom: 16 }}>✍️</p>
            <h2 style={{ fontFamily: "var(--font-display)", fontSize: 24, marginBottom: 8 }}>Coming Soon</h2>
            <p style={{ color: "var(--color-ink-light)" }}>Our style journal is being crafted with love. Check back soon!</p>
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 32 }}>
            {blogs.map((blog: any) => (
              <Link key={blog._id.toString()} href={`/blog/${blog.slug}`} style={{ textDecoration: "none" }}>
                <article className="card card-lift">
                  {blog.coverImage && (
                    <div style={{ aspectRatio: "16/9", position: "relative", overflow: "hidden" }}>
                      <Image src={blog.coverImage} alt={blog.title} fill style={{ objectFit: "cover", transition: "transform 0.4s ease" }}

                     
              sizes="(max-width: 860px) 100vw, 50vw"
            />
                    </div>
                  )}
                  <div style={{ padding: "20px 20px 24px" }}>
                    {blog.tags?.[0] && (
                      <span className="badge badge-outline" style={{ marginBottom: 10, display: "inline-flex" }}>{blog.tags[0]}</span>
                    )}
                    <h2 style={{ fontFamily: "var(--font-display)", fontSize: 20, fontWeight: 400, marginBottom: 8, color: "var(--color-ink)", lineHeight: 1.3 }}>{blog.title}</h2>
                    <p style={{ fontSize: 13, color: "var(--color-ink-light)", marginBottom: 16, lineHeight: 1.6, display: "-webkit-box", WebkitLineClamp: 3, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{blog.excerpt}</p>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <span style={{ fontSize: 12, color: "var(--color-ink-light)" }}>
                        {blog.publishedAt ? new Date(blog.publishedAt).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" }) : ""}
                      </span>
                      <span style={{ fontSize: 12, color: "var(--color-ink-light)" }}>{blog.readTime ?? 5} min read</span>
                    </div>
                  </div>
                </article>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
