// app/(admin)/dashboard/blog/[id]/edit/page.tsx
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { connectDB } from "@/lib/db/mongoose";
import { BlogModel } from "@/lib/db/models/index";
import { BlogEditor } from "@/components/admin/BlogEditor";

export const metadata: Metadata = { title: "Edit Blog Post | Nyaree Admin" };

export default async function EditBlogPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await connectDB();
  const blog = await BlogModel.findById(id).lean() as any;
  if (!blog) notFound();

  const serialized = {
    ...blog,
    _id: blog._id.toString(),
    createdAt: blog.createdAt?.toISOString(),
    updatedAt: blog.updatedAt?.toISOString(),
    publishedAt: blog.publishedAt?.toISOString(),
  };

  return <BlogEditor initial={serialized} />;
}
