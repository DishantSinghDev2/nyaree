// app/(store)/blog/[slug]/page.tsx
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { connectDB } from "@/lib/db/mongoose";
import { BlogModel } from "@/lib/db/models/index";
import Image from "next/image";
import Link from "next/link";

export const revalidate = 3600;
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



export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  await connectDB();
  const blog = await BlogModel.findOne({ slug, status: "published" }).lean() as any;
  if (!blog) return { title: "Post Not Found | Nyaree" };
  return {
    title: blog.seo?.title || `${blog.title} | Nyaree Blog`,
    description: blog.seo?.description || blog.excerpt,
    openGraph: { title: blog.title, description: blog.excerpt, images: blog.coverImage ? [blog.coverImage] : [] },
    alternates: { canonical: `https://buynyaree.com/blog/${slug}` },
  };
}

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  await connectDB();

  const blog = await BlogModel.findOneAndUpdate(
    { slug, status: "published" },
    { $inc: { views: 1 } },
    { new: true }
  ).lean() as any;

  if (!blog) notFound();

  // Related posts
  const related = await BlogModel.find({
    status: "published",
    _id: { $ne: blog._id },
    tags: { $in: blog.tags ?? [] },
  }).limit(3).select("title slug excerpt coverImage publishedAt readTime").lean();

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: blog.title,
    image: blog.coverImage,
    author: { "@type": "Person", name: blog.author ?? "Rishika Singh" },
    publisher: { "@type": "Organization", name: "Nyaree", logo: "https://buynyaree.com/logo.png" },
    datePublished: blog.publishedAt?.toISOString(),
    dateModified: blog.updatedAt?.toISOString(),
    description: blog.excerpt,
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <article style={{ maxWidth: 780, margin: "0 auto", padding: "64px 20px 80px" }}>
        {/* Back */}
        <Link href="/blog" style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 13, color: "var(--color-ink-light)", textDecoration: "none", marginBottom: 32 }}>
          ← Back to Blog
        </Link>

        {/* Tags */}
        {blog.tags?.length > 0 && (
          <div style={{ display: "flex", gap: 8, marginBottom: 16, flexWrap: "wrap" }}>
            {blog.tags.map((tag: string) => (
              <span key={tag} className="badge badge-outline" style={{ textTransform: "capitalize" }}>{tag}</span>
            ))}
          </div>
        )}

        {/* Title */}
        <h1 style={{ fontFamily: "var(--font-display)", fontSize: "clamp(2rem, 5vw, 3rem)", fontWeight: 300, lineHeight: 1.15, marginBottom: 20 }}>{blog.title}</h1>

        {/* Meta */}
        <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 40, flexWrap: "wrap" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 36, height: 36, borderRadius: "50%", background: "var(--color-gold)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 600, fontSize: 14 }}>R</div>
            <div>
              <p style={{ fontSize: 13, fontWeight: 500 }}>{blog.author ?? "Rishika Singh"}</p>
              <p style={{ fontSize: 11, color: "var(--color-ink-light)" }}>Founder, Nyaree</p>
            </div>
          </div>
          <span style={{ color: "var(--color-border)", fontSize: 18 }}>·</span>
          <p style={{ fontSize: 13, color: "var(--color-ink-light)" }}>
            {blog.publishedAt ? new Date(blog.publishedAt).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" }) : ""}
          </p>
          <span style={{ color: "var(--color-border)", fontSize: 18 }}>·</span>
          <p style={{ fontSize: 13, color: "var(--color-ink-light)" }}>{blog.readTime ?? 5} min read</p>
        </div>

        {/* Cover image */}
        {blog.coverImage && (
          <div style={{ aspectRatio: "16/9", position: "relative", borderRadius: "var(--radius-sm)", overflow: "hidden", marginBottom: 48 }}>
            <Image src={blog.coverImage} alt={blog.title} fill priority style={{ objectFit: "cover" }}
              sizes="(max-width: 860px) 100vw, 50vw"
            />
          </div>
        )}

        {/* Content */}
        <div className="prose" style={{ fontSize: 16, lineHeight: 1.85 }} dangerouslySetInnerHTML={{ __html: blog.content }} />

        {/* Share */}
        <div style={{ borderTop: "1px solid var(--color-border)", marginTop: 48, paddingTop: 32 }}>
          <p style={{ fontSize: 13, color: "var(--color-ink-light)", marginBottom: 12 }}>Share this post:</p>
          <div style={{ display: "flex", gap: 10 }}>
            {[
              { label: "WhatsApp", href: `https://wa.me/?text=${encodeURIComponent(`${blog.title} — https://buynyaree.com/blog/${blog.slug}`)}`, color: "#25D366" },
              { label: "Instagram", href: "https://instagram.com/buynyaree", color: "#E4405F" },
            ].map((s) => (
              <a key={s.label} href={s.href} target="_blank" rel="noopener noreferrer" style={{ fontSize: 12, color: s.color, border: `1px solid ${s.color}`, borderRadius: "var(--radius-pill)", padding: "5px 14px", textDecoration: "none" }}>
                {s.label}
              </a>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div style={{ background: "var(--color-ink)", borderRadius: "var(--radius-sm)", padding: "32px 36px", marginTop: 48, textAlign: "center" }}>
          <h3 style={{ fontFamily: "var(--font-display)", fontSize: 24, color: "#fff", fontWeight: 300, marginBottom: 10 }}>Ready to elevate your wardrobe?</h3>
          <p style={{ fontSize: 14, color: "rgba(255,255,255,0.6)", marginBottom: 24 }}>Explore our handcrafted collection of kurtis and trending tops</p>
          <Link href="/shop"><button className="btn btn-primary">Shop Now</button></Link>
        </div>
      </article>

      {/* Related Posts */}
      {related.length > 0 && (
        <div style={{ background: "var(--color-ivory-dark)", padding: "64px 0" }}>
          <div className="container" style={{ maxWidth: 1000 }}>
            <h2 style={{ fontFamily: "var(--font-display)", fontSize: 28, fontWeight: 300, textAlign: "center", marginBottom: 40 }}>More from the Journal</h2>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 24 }}>
              {related.map((r: any) => (
                <Link key={r._id?.toString()} href={`/blog/${r.slug}`} style={{ textDecoration: "none" }}>
                  <div className="card card-lift">
                    {r.coverImage && (
                      <div style={{ aspectRatio: "16/9", position: "relative", overflow: "hidden" }}>
                        <Image src={r.coverImage} alt={r.title} fill style={{ objectFit: "cover" }}
              sizes="(max-width: 860px) 100vw, 50vw"
            />
                      </div>
                    )}
                    <div style={{ padding: "16px 18px 20px" }}>
                      <h3 style={{ fontFamily: "var(--font-display)", fontSize: 18, fontWeight: 400, marginBottom: 8, lineHeight: 1.3 }}>{r.title}</h3>
                      <p style={{ fontSize: 13, color: "var(--color-ink-light)", lineHeight: 1.5, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{r.excerpt}</p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
