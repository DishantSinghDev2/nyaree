// app/api/ai/generate-image/route.ts
// Generates a product image using Imagen 4, uploads to DishIs, returns URL
import { NextRequest, NextResponse } from "next/server";
import { generateProductImage } from "@/lib/ai/gemini";
import { uploadImageBase64 } from "@/lib/storage/dishis-image";
import { auth } from "@/lib/auth";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user || (session.user as any).role !== "admin") {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }
  try {
    const { prompt } = await req.json();
    if (!prompt?.trim()) return NextResponse.json({ success: false, error: "Prompt required" }, { status: 400 });

    // Generate with Imagen 4
    const base64 = await generateProductImage(prompt);

    // Upload to DishIs CDN
    const result = await uploadImageBase64(
      `data:image/png;base64,${base64}`,
      `ai-product-${Date.now()}`,
      "ai-generated"
    );

    return NextResponse.json({ success: true, data: { url: result.url, publicId: result.id } });
  } catch (err: any) {
    console.error("Image generation error:", err);
    return NextResponse.json({ success: false, error: err.message || "Generation failed" }, { status: 500 });
  }
}
