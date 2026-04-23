// app/api/blog/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db/mongoose";
import { BlogModel } from "@/lib/db/models/index";
import { auth } from "@/lib/auth";

async function requireAdmin() {
  const session = await auth();
  if (!session?.user || (session.user as any).role !== "admin") return null;
  return session.user;
}

export async function GET(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await connectDB();
  const blog = await BlogModel.findById(id).lean() as any;
  if (!blog) return NextResponse.json({ success: false, error: "Not found" }, { status: 404 });
  return NextResponse.json({ success: true, data: { ...blog, _id: blog._id.toString() } });
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await requireAdmin();
  if (!user) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  try {
    const body = await req.json();
    if (body.status === "published") body.publishedAt = new Date();
    const blog = await BlogModel.findByIdAndUpdate(id, { $set: body }, { new: true }).lean() as any;
    if (!blog) return NextResponse.json({ success: false, error: "Not found" }, { status: 404 });
    
    if (blog.status === "published") {
      const { revalidatePath } = require("next/cache");
      revalidatePath("/blog");
      revalidatePath(`/blog/${blog.slug}`);
    }

    return NextResponse.json({ success: true, data: { _id: blog._id.toString(), slug: blog.slug } });
  } catch {
    return NextResponse.json({ success: false, error: "Update failed" }, { status: 500 });
  }
}

export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await requireAdmin();
  if (!user) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  await connectDB();
  await BlogModel.findByIdAndDelete(id);
  return NextResponse.json({ success: true });
}
