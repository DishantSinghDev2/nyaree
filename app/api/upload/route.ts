// app/api/upload/route.ts
// Image upload using DishIs Technologies Image Hosting
// API: https://upload-images-hosting-get-url.p.rapidapi.com/upload
// CDN: Cloudflare + R2 + KV — fastest possible delivery
import { NextRequest, NextResponse } from "next/server";
import { uploadImageFile, uploadImageUrl } from "@/lib/storage/dishis-image";
import { auth } from "@/lib/auth";
import { rateLimit } from "@/lib/cache/redis";

async function requireAdmin() {
  const session = await auth();
  if (!session?.user || (session.user as any).role !== "admin") return null;
  return session.user;
}

// POST /api/upload
// Accepts: multipart/form-data with "file" field, OR JSON { "url": "..." }
// Returns: { success: true, data: { url, publicId, width, height } }
export async function POST(req: NextRequest) {
  const user = await requireAdmin();
  if (!user) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });

  // Rate limit: 50 uploads/min per admin
  const ip = req.headers.get("cf-connecting-ip") ?? req.headers.get("x-forwarded-for") ?? "unknown";
  const { allowed } = await rateLimit(ip, "upload", 50, 60);
  if (!allowed) return NextResponse.json({ success: false, error: "Too many uploads. Please wait a moment." }, { status: 429 });

  try {
    const contentType = req.headers.get("content-type") ?? "";

    if (contentType.includes("multipart/form-data")) {
      // ── File upload ───────────────────────────────────────────────────────
      const formData = await req.formData();
      const file = formData.get("file") as File | null;
      const folder = (formData.get("folder") as string | null) ?? "products";
      const name = (formData.get("name") as string | null) ?? file?.name ?? "image";

      if (!file) {
        return NextResponse.json({ success: false, error: "No file provided" }, { status: 400 });
      }

      // Validate type
      const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp", "image/avif", "image/gif", "image/svg+xml"];
      if (!allowedTypes.includes(file.type)) {
        return NextResponse.json({ success: false, error: `File type ${file.type} not supported. Use: JPEG, PNG, WebP, AVIF, GIF, SVG.` }, { status: 400 });
      }

      // 10 MB limit
      if (file.size > 10 * 1024 * 1024) {
        return NextResponse.json({ success: false, error: "File too large. Maximum 10 MB." }, { status: 413 });
      }

      const result = await uploadImageFile(file, name, folder);

      return NextResponse.json({
        success: true,
        data: {
          url: result.url,
          publicId: result.id,
          deleteUrl: result.deleteUrl,
          width: parseInt(result.width) || 0,
          height: parseInt(result.height) || 0,
        },
      });

    } else {
      // ── JSON body (remote URL upload) ─────────────────────────────────────
      const body = await req.json();
      const { url, name, folder } = body;

      if (!url) {
        return NextResponse.json({ success: false, error: "No URL provided" }, { status: 400 });
      }

      const result = await uploadImageUrl(url, name ?? "image", folder ?? "products");

      return NextResponse.json({
        success: true,
        data: {
          url: result.url,
          publicId: result.id,
          deleteUrl: result.deleteUrl,
          width: parseInt(result.width) || 0,
          height: parseInt(result.height) || 0,
        },
      });
    }
  } catch (err: any) {
    console.error("DishIs upload error:", err);
    return NextResponse.json({ success: false, error: err.message || "Upload failed" }, { status: 500 });
  }
}

// GET /api/upload — Not supported (DishIs has no signed-upload flow)
export async function GET() {
  return NextResponse.json(
    { success: false, error: "Direct browser uploads not available. Use POST /api/upload from server." },
    { status: 405 }
  );
}
