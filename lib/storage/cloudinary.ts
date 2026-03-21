// lib/storage/cloudinary.ts
import { v2 as cloudinary } from "cloudinary";

export function initCloudinary() {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true,
  });
  return cloudinary;
}

export async function uploadImage(
  base64Data: string,
  folder: string,
  publicId?: string
): Promise<{ url: string; publicId: string; width: number; height: number }> {
  const cld = initCloudinary();
  const result = await cld.uploader.upload(base64Data, {
    folder: `nyaree/${folder}`,
    public_id: publicId,
    overwrite: true,
    quality: "auto",
    fetch_format: "auto",
    transformation: [{ quality: "auto:best", fetch_format: "auto" }],
  });

  return {
    url: result.secure_url,
    publicId: result.public_id,
    width: result.width,
    height: result.height,
  };
}

export async function deleteImage(publicId: string): Promise<void> {
  const cld = initCloudinary();
  await cld.uploader.destroy(publicId);
}

export function optimizeImageUrl(
  url: string,
  width: number,
  height?: number,
  quality = "auto"
): string {
  // Transform Cloudinary URL for optimal delivery
  const transformation = height
    ? `c_fill,w_${width},h_${height},q_${quality},f_auto`
    : `c_limit,w_${width},q_${quality},f_auto`;

  return url.replace("/upload/", `/upload/${transformation}/`);
}

// Generate signed upload preset for direct browser uploads
export async function getUploadSignature(folder: string): Promise<{
  signature: string;
  timestamp: number;
  apiKey: string;
  cloudName: string;
}> {
  const cld = initCloudinary();
  const timestamp = Math.round(Date.now() / 1000);
  const params = {
    timestamp,
    folder: `nyaree/${folder}`,
    quality: "auto",
  };
  const signature = cld.utils.api_sign_request(
    params,
    process.env.CLOUDINARY_API_SECRET || ""
  );

  return {
    signature,
    timestamp,
    apiKey: process.env.CLOUDINARY_API_KEY || "",
    cloudName: process.env.CLOUDINARY_CLOUD_NAME || "",
  };
}
