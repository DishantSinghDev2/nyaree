// app/api/ai/analyze-image/route.ts
// Reads a product image and returns complete product metadata
import { NextRequest, NextResponse } from "next/server";
import { analyzeProductImage } from "@/lib/ai/gemini";
import { auth } from "@/lib/auth";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user || (session.user as any).role !== "admin") {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }
  try {
    const contentType = req.headers.get("content-type") ?? "";
    let imageBase64: string;
    let mimeType = "image/jpeg";

    if (contentType.includes("multipart/form-data")) {
      // File upload
      const fd = await req.formData();
      const file = fd.get("image") as File | null;
      if (!file) return NextResponse.json({ success: false, error: "No image provided" }, { status: 400 });
      mimeType = file.type || "image/jpeg";
      const buf = await file.arrayBuffer();
      imageBase64 = Buffer.from(buf).toString("base64");
    } else {
      // JSON with base64 or URL
      const body = await req.json();
      if (body.base64) {
        imageBase64 = body.base64.replace(/^data:[^;]+;base64,/, "");
        mimeType = body.mimeType || "image/jpeg";
      } else if (body.url) {
        // Fetch the image from URL and convert to base64
        const res = await fetch(body.url);
        if (!res.ok) return NextResponse.json({ success: false, error: "Could not fetch image URL" }, { status: 400 });
        mimeType = res.headers.get("content-type") || "image/jpeg";
        const buf = await res.arrayBuffer();
        imageBase64 = Buffer.from(buf).toString("base64");
      } else {
        return NextResponse.json({ success: false, error: "Provide image as file, base64, or URL" }, { status: 400 });
      }
    }

    const analysis = await analyzeProductImage(imageBase64, mimeType);
    return NextResponse.json({ success: true, data: analysis });
  } catch (err: any) {
    console.error("Image analysis error:", err);
    return NextResponse.json({ success: false, error: err.message || "Analysis failed" }, { status: 500 });
  }
}
