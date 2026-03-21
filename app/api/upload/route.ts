// app/api/upload/route.ts
import { NextRequest, NextResponse } from "next/server";
import { uploadImage, getUploadSignature } from "@/lib/storage/cloudinary";
import { getAuth } from "@/lib/auth";
import { headers } from "next/headers";

async function requireAdmin() {
  const auth = getAuth();
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user || (session.user as any).role !== "admin") return null;
  return session.user;
}

export async function POST(req: NextRequest) {
  const user = await requireAdmin();
  if (!user) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });

  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;
    const folder = formData.get("folder") as string ?? "products";

    if (!file) return NextResponse.json({ success: false, error: "No file provided" }, { status: 400 });

    // Convert File to base64
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const base64 = `data:${file.type};base64,${buffer.toString("base64")}`;

    const result = await uploadImage(base64, folder);
    return NextResponse.json({ success: true, data: result });
  } catch (err) {
    console.error("Upload error:", err);
    return NextResponse.json({ success: false, error: "Upload failed" }, { status: 500 });
  }
}

// GET - get signed upload params for direct browser upload
export async function GET(req: NextRequest) {
  const user = await requireAdmin();
  if (!user) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });

  const { searchParams } = req.nextUrl;
  const folder = searchParams.get("folder") ?? "products";
  const signature = await getUploadSignature(folder);
  return NextResponse.json({ success: true, data: signature });
}
