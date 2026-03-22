// lib/storage/r2.ts
// Cloudflare R2 video storage via Workers binding
// R2 is available in CF Workers via the MEDIA_BUCKET binding (see wrangler.jsonc)
// For local dev, we fall back to DishIs image hosting (images only) or skip video

export interface R2UploadResult {
  key: string;
  url: string;
  size: number;
  contentType: string;
}

// Upload video to R2 via the Workers runtime binding
// Note: This only works in production (CF Workers environment)
// In local dev (Next.js), use getCloudflareContext()
export async function uploadVideoToR2(
  file: File | Blob,
  folder: string = "product-videos",
  filename?: string
): Promise<R2UploadResult> {
  const key = `${folder}/${filename ?? `video-${Date.now()}`}.${getExtension(file.type)}`;

  // In CF Workers: use the R2 binding via getCloudflareContext
  // In dev: this needs the wrangler dev server running with --remote
  try {
    // Dynamic import to avoid breaking in environments without CF bindings
    const { getCloudflareContext } = await import("@opennextjs/cloudflare");
    const ctx = await getCloudflareContext({ async: true });
    const bucket = (ctx.env as any).MEDIA_BUCKET;

    if (!bucket) throw new Error("MEDIA_BUCKET R2 binding not available");

    const arrayBuffer = await file.arrayBuffer();
    await bucket.put(key, arrayBuffer, {
      httpMetadata: { contentType: file.type },
    });

    // R2 public URL (if bucket has public access enabled)
    const accountId = process.env.CF_ACCOUNT_ID ?? "";
    const bucketName = "nyaree-media";
    const url = `https://pub-${accountId}.r2.dev/${key}`;

    return { key, url, size: file.size, contentType: file.type };
  } catch (err: any) {
    throw new Error(`R2 upload failed: ${err.message}`);
  }
}

// Delete a video from R2
export async function deleteVideoFromR2(key: string): Promise<void> {
  try {
    const { getCloudflareContext } = await import("@opennextjs/cloudflare");
    const ctx = await getCloudflareContext({ async: true });
    const bucket = (ctx.env as any).MEDIA_BUCKET;
    if (bucket) await bucket.delete(key);
  } catch {
    // Silent fail for deletes
  }
}

function getExtension(mimeType: string): string {
  const map: Record<string, string> = {
    "video/mp4": "mp4",
    "video/webm": "webm",
    "video/quicktime": "mov",
    "video/x-msvideo": "avi",
  };
  return map[mimeType] ?? "mp4";
}

// Check if video upload is supported (CF Workers env)
export function isVideoUploadSupported(): boolean {
  return typeof process !== "undefined" && !!process.env.CF_PAGES;
}
