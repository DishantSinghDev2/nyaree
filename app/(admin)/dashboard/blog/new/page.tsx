// app/(admin)/dashboard/blog/new/page.tsx
import type { Metadata } from "next";
import { BlogEditor } from "@/components/admin/BlogEditor";
export const metadata: Metadata = { title: "New Blog Post | Nyaree Admin" };
export default function NewBlogPage() { return <BlogEditor />; }
