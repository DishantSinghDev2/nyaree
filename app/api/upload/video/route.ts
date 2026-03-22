// app/api/upload/video/route.ts
// Video upload to Cloudflare R2 — served via CF CDN
// R2 binding: MEDIA_BUCKET (configured in wrangler.jsonc)
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { rateLimit } from "@/lib/cache/redis";

async function requireAdmin() {
  const session = await auth();
  if (!session?.user || (session.user as any).role !== "admin") return null;
  return session.user;
}

export async function POST(req: NextRequest) {
  const user = await requireAdmin();
  if (!user) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });

  const ip = req.headers.get("cf-connecting-ip") ?? "unknown";
  const { allowed } = await rateLimit(ip, "video-upload", 10, 3600); // 10 videos/hr
  if (!allowed) return NextResponse.json({ success: false, error: "Upload limit reached (10/hr)" }, { status: 429 });

  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const productId = formData.get("productId") as string ?? "general";
    const title = formData.get("title") as string ?? "";

    if (!file) return NextResponse.json({ success: false, error: "No file provided" }, { status: 400 });

    const allowedTypes = ["video/mp4", "video/webm", "video/quicktime", "video/x-msvideo"];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ success: false, error: "Only MP4, WebM, MOV, AVI allowed" }, { status: 400 });
    }

    // 500 MB max
    if (file.size > 500 * 1024 * 1024) {
      return NextResponse.json({ success: false, error: "Video too large. Maximum 500 MB." }, { status: 413 });
    }

    // Build R2 key
    const ext = file.name.split(".").pop() ?? "mp4";
    const timestamp = Date.now();
    const r2Key = `products/${productId}/videos/${timestamp}.${ext}`;

    // Access R2 via CF Workers binding
    // In Next.js + OpenNext CF, getCloudflareContext() gives access to env bindings
    const { getCloudflareContext } = await import("@opennextjs/cloudflare");
    const { env } = await getCloudflareContext({ async: true });
    const bucket = (env as any).MEDIA_BUCKET;

    if (!bucket) {
      return NextResponse.json({
        success: false,
        error: "R2 bucket not configured. Set MEDIA_BUCKET binding in wrangler.jsonc",
      }, { status: 503 });
    }

    // Upload to R2
    const arrayBuffer = await file.arrayBuffer();
    await bucket.put(r2Key, arrayBuffer, {
      httpMetadata: {
        contentType: file.type,
        cacheControl: "public, max-age=31536000", // 1 year
      },
      customMetadata: {
        productId,
        title,
        uploadedBy: user.id ?? "",
        originalName: file.name,
      },
    });

    // Public URL — requires R2 public bucket or custom domain
    // Pattern: https://pub-{account}.r2.dev/{key} OR custom domain
    const r2PublicDomain = process.env.R2_PUBLIC_DOMAIN ?? `https://media.buynyaree.com`;
    const url = `${r2PublicDomain}/${r2Key}`;

    return NextResponse.json({
      success: true,
      data: {
        url,
        r2Key,
        title,
        duration: 0, // Frontend can detect duration after upload
        thumbnailUrl: "",
        position: 0,
      },
    });
  } catch (err: any) {
    console.error("R2 video upload error:", err);
    return NextResponse.json({ success: false, error: err.message ?? "Upload failed" }, { status: 500 });
  }
}

// DELETE — remove video from R2
export async function DELETE(req: NextRequest) {
  const user = await requireAdmin();
  if (!user) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });

  try {
    const { r2Key } = await req.json();
    if (!r2Key) return NextResponse.json({ success: false, error: "r2Key required" }, { status: 400 });

    const { getCloudflareContext } = await import("@opennextjs/cloudflare");
    const { env } = await getCloudflareContext({ async: true });
    const bucket = (env as any).MEDIA_BUCKET;

    if (bucket) await bucket.delete(r2Key);
    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
