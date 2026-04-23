// app/(admin)/dashboard/blog/page.tsx
import type { Metadata } from "next";
import { connectDB } from "@/lib/db/mongoose";
import { BlogModel } from "@/lib/db/models/index";
import Link from "next/link";
import Image from "next/image";

export const metadata: Metadata = { title: "Blog | Nyaree Admin" };
export const revalidate = 0;

export default async function AdminBlogPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const sp = await searchParams;
  await connectDB();

  const filter: any = {};
  if (sp.status === "published") filter.status = "published";
  if (sp.status === "draft") filter.status = "draft";

  const blogs = await BlogModel.find(filter)
    .select("title slug status coverImage publishedAt readTime views _id createdAt")
    .sort({ createdAt: -1 })
    .limit(50)
    .lean();

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 32 }}>
        <div>
          <h1 style={{ fontFamily: "var(--font-display)", fontSize: 26, fontWeight: 400 }}>Blog</h1>
          <p style={{ fontSize: 13, color: "var(--color-ink-light)", marginTop: 4 }}>
            {blogs.length} post{blogs.length !== 1 ? "s" : ""}
          </p>
        </div>
        <Link href="/dashboard/blog/new">
          <button className="btn btn-primary">+ New Post</button>
        </Link>
      </div>

      {/* Filter tabs */}
      <div style={{ display: "flex", gap: 0, borderBottom: "1px solid var(--color-border)", marginBottom: 24 }}>
        {["all", "published", "draft"].map((s) => (
          <Link key={s} href={`/dashboard/blog${s !== "all" ? `?status=${s}` : ""}`}>
            <button
              style={{
                padding: "10px 20px", background: "none", border: "none",
                borderBottom: (sp.status ?? "all") === s ? "2px solid var(--color-gold)" : "2px solid transparent",
                color: (sp.status ?? "all") === s ? "var(--color-gold)" : "var(--color-ink-light)",
                fontSize: 13, fontWeight: 500, cursor: "pointer", textTransform: "capitalize",
              }}
            >
              {s}
            </button>
          </Link>
        ))}
      </div>

      {blogs.length === 0 ? (
        <div style={{ textAlign: "center", padding: "80px 0" }}>
          <p style={{ fontSize: 40, marginBottom: 16 }}>✍️</p>
          <h2 style={{ fontFamily: "var(--font-display)", fontSize: 24, marginBottom: 12 }}>No posts yet</h2>
          <p style={{ color: "var(--color-ink-light)", marginBottom: 24 }}>
            Share your fashion expertise with the world
          </p>
          <Link href="/dashboard/blog/new">
            <button className="btn btn-primary">Write First Post</button>
          </Link>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {blogs.map((blog: any) => (
            <div
              key={blog._id.toString()}
              className="card"
              style={{ padding: "16px 20px", display: "flex", gap: 16, alignItems: "center" }}
            >
              {/* Cover thumbnail */}
              {blog.coverImage ? (
                <div style={{ width: 72, height: 48, position: "relative", borderRadius: "var(--radius-sm)", overflow: "hidden", flexShrink: 0 }}>
                  <Image src={blog.coverImage} alt={blog.title} fill style={{ objectFit: "cover" }}
              sizes="(max-width: 860px) 100vw, 50vw"
            />
                </div>
              ) : (
                <div style={{ width: 72, height: 48, background: "var(--color-ivory-dark)", borderRadius: "var(--radius-sm)", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24 }}>
                  ✍️
                </div>
              )}

              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
                  <h3 style={{ fontFamily: "var(--font-display)", fontSize: 16, fontWeight: 400, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {blog.title}
                  </h3>
                  <span
                    style={{
                      fontSize: 10, padding: "2px 8px", borderRadius: "var(--radius-pill)", flexShrink: 0,
                      background: blog.status === "published" ? "#D1FAE5" : "#FEF3C7",
                      color: blog.status === "published" ? "#065F46" : "#92400E",
                    }}
                  >
                    {blog.status}
                  </span>
                </div>
                <p style={{ fontSize: 12, color: "var(--color-ink-light)" }}>
                  {blog.publishedAt
                    ? new Date(blog.publishedAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })
                    : "Draft"
                  } · {blog.readTime ?? 5} min read · {blog.views ?? 0} views
                </p>
              </div>

              <div style={{ display: "flex", gap: 12, flexShrink: 0 }}>
                <Link href={`/blog/${blog.slug}`} target="_blank" style={{ fontSize: 12, color: "var(--color-ink-light)", textDecoration: "none" }}>
                  View
                </Link>
                <Link href={`/dashboard/blog/${blog._id.toString()}/edit`} style={{ fontSize: 12, color: "var(--color-gold)", textDecoration: "none" }}>
                  Edit
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
