// lib/storage/dishis-image.ts
// DishIs Technologies Image Hosting API
// Docs: https://image.dishis.tech/docs
// API: https://upload-images-hosting-get-url.p.rapidapi.com/upload
// Uses Cloudflare CDN + KV + R2 for ultra-fast delivery
// Images served at: https://i.dishis.tech/i/{id}

const RAPIDAPI_HOST = "upload-images-hosting-get-url.p.rapidapi.com";
const UPLOAD_URL = `https://${RAPIDAPI_HOST}/upload`;

function getApiKey(): string {
  const key = process.env.DISHIS_IMAGE_API_KEY;
  if (!key) throw new Error("DISHIS_IMAGE_API_KEY environment variable is not set");
  return key;
}

export interface DishisUploadResult {
  id: string;
  url: string;           // CDN URL: https://i.dishis.tech/i/{id}
  displayUrl: string;    // Display URL: https://i.api.dishis.tech/i/{id}
  deleteUrl: string;     // Secure delete URL
  width: string;
  height: string;
  size: string;
  title: string;
  publicId: string;      // Alias for id — for compatibility with existing code
}

// ─── Upload from File (Buffer / ArrayBuffer) ──────────────────────────────────
export async function uploadImageFile(
  file: File | Blob,
  name?: string,
  folder?: string
): Promise<DishisUploadResult> {
  const formData = new FormData();
  formData.append("image", file);
  // Build a clean filename: folder/name or just name
  const filename = folder ? `nyaree-${folder}-${name ?? "image"}` : `nyaree-${name ?? "image"}`;
  formData.append("name", filename);
  formData.append("expiration", "0"); // 0 = never expire

  const res = await fetch(UPLOAD_URL, {
    method: "POST",
    headers: { "x-rapidapi-key": getApiKey() },
    body: formData,
  });

  if (!res.ok) {
    const err = await res.text().catch(() => `HTTP ${res.status}`);
    throw new Error(`DishIs image upload failed (${res.status}): ${err}`);
  }

  const data = await res.json();
  if (!data.success) throw new Error(`DishIs upload error: ${JSON.stringify(data)}`);

  return {
    id: data.data.id,
    url: data.data.url,
    displayUrl: data.data.display_url,
    deleteUrl: data.data.delete_url,
    width: data.data.width,
    height: data.data.height,
    size: data.data.size,
    title: data.data.title,
    publicId: data.data.id, // alias
  };
}

// ─── Upload from Base64 / Data URI ────────────────────────────────────────────
export async function uploadImageBase64(
  base64OrDataUri: string,
  name?: string,
  folder?: string
): Promise<DishisUploadResult> {
  // Convert base64/data-uri to a Blob, then upload as file
  let mimeType = "image/jpeg";
  let base64Data = base64OrDataUri;

  if (base64OrDataUri.startsWith("data:")) {
    const match = base64OrDataUri.match(/^data:([^;]+);base64,(.+)$/);
    if (match) {
      mimeType = match[1];
      base64Data = match[2];
    }
  }

  // Decode base64 → Uint8Array → Blob
  const binary = atob(base64Data);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  const blob = new Blob([bytes], { type: mimeType });

  return uploadImageFile(blob, name ?? `image-${Date.now()}`, folder);
}

// ─── Upload from Remote URL ───────────────────────────────────────────────────
export async function uploadImageUrl(
  remoteUrl: string,
  name?: string,
  folder?: string
): Promise<DishisUploadResult> {
  const filename = folder ? `nyaree-${folder}-${name ?? "image"}` : `nyaree-${name ?? "image"}`;

  const res = await fetch(UPLOAD_URL, {
    method: "POST",
    headers: {
      "x-rapidapi-key": getApiKey(),
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      image: remoteUrl,
      name: filename,
      expiration: 0,
    }),
  });

  if (!res.ok) {
    const err = await res.text().catch(() => `HTTP ${res.status}`);
    throw new Error(`DishIs URL upload failed (${res.status}): ${err}`);
  }

  const data = await res.json();
  if (!data.success) throw new Error(`DishIs upload error: ${JSON.stringify(data)}`);

  return {
    id: data.data.id,
    url: data.data.url,
    displayUrl: data.data.display_url,
    deleteUrl: data.data.delete_url,
    width: data.data.width,
    height: data.data.height,
    size: data.data.size,
    title: data.data.title,
    publicId: data.data.id,
  };
}

// ─── Delete an image ──────────────────────────────────────────────────────────
export async function deleteImage(deleteUrl: string): Promise<void> {
  if (!deleteUrl) return;
  try {
    await fetch(deleteUrl, { method: "GET" }); // DishIs uses GET for delete
  } catch {
    // Ignore delete errors — image might already be gone
  }
}

// ─── Get CDN URL from id ──────────────────────────────────────────────────────
export function getImageUrl(id: string): string {
  return `https://i.dishis.tech/i/${id}`;
}

// ─── Backwards-compat: matches the old Cloudinary uploadImage signature ───────
// folder param is used for naming; publicId param ignored
export async function uploadImage(
  base64Data: string,
  folder: string,
  _publicId?: string
): Promise<{ url: string; publicId: string; width: number; height: number }> {
  const result = await uploadImageBase64(base64Data, `img-${Date.now()}`, folder);
  return {
    url: result.url,
    publicId: result.id,
    width: parseInt(result.width) || 0,
    height: parseInt(result.height) || 0,
  };
}

// ─── Noop: no signed upload for DishIs (upload is server-side only) ───────────
export async function getUploadSignature(_folder: string): Promise<never> {
  throw new Error(
    "Direct browser uploads are not supported with DishIs Image API. Use /api/upload instead."
  );
}

// ─── URL optimisation ─────────────────────────────────────────────────────────
// DishIs serves images via CF CDN — already optimised.
// This function is a no-op shim for compatibility.
export function optimizeImageUrl(url: string, _w?: number, _h?: number): string {
  return url;
}
