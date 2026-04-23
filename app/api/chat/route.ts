// app/api/chat/route.ts
import { NextRequest, NextResponse } from "next/server";
import { chatWithCustomer } from "@/lib/ai/claude";
import { connectDB } from "@/lib/db/mongoose";
import { EnquiryModel, ProductModel, SiteSettingsModel } from "@/lib/db/models/index";
import { appendChatMessage, getChatHistory, rateLimit } from "@/lib/cache/redis";
import { sendEnquiryEscalation } from "@/lib/email/resend";

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get("cf-connecting-ip") ?? req.headers.get("x-forwarded-for") ?? "unknown";
    const { allowed } = await rateLimit(ip, "chat", 30, 60);
    if (!allowed) return NextResponse.json({ success: false, error: "Too many messages. Please wait." }, { status: 429 });

    const body = await req.json();
    const { sessionId, message, guestName, guestEmail, productId, messages } = body;

    if (!message?.trim() || !sessionId) return NextResponse.json({ success: false, error: "Invalid request" }, { status: 400 });

    await connectDB();

    // Fetch product context if productId provided
    let productContext: any = {};
    if (productId) {
      const product = await ProductModel.findById(productId).select("name description fabric variants allowCustomization customizationNote").lean() as any;
      if (product) {
        productContext = {
          productName: product.name,
          productDescription: product.description?.slice(0, 500),
          productFabric: product.fabric,
          productPrice: product.variants?.[0]?.price,
          availableSizes: [...new Set(product.variants?.map((v: any) => v.size))] as string[],
          allowCustomization: product.allowCustomization,
        };
      }
    }

    const settings = await SiteSettingsModel.findOne({ key: "main" }).lean() as any;
    productContext.storePhone = settings?.whatsappNumber || "+91 8368989758";

    // Build message history for AI
    const historyMessages = (messages ?? [])
      .filter((m: any) => m.role === "user" || m.role === "assistant")
      .slice(-10) // Last 10 messages for context window
      .map((m: any) => ({ role: m.role as "user" | "assistant", content: m.content }));

    const { reply, shouldEscalate } = await chatWithCustomer(historyMessages, productContext);

    // Save to Redis session
    await appendChatMessage(sessionId, { role: "user", content: message, timestamp: new Date().toISOString() });
    await appendChatMessage(sessionId, { role: "ai", content: reply, timestamp: new Date().toISOString() });

    // Upsert enquiry in DB
    let enquiry = await EnquiryModel.findOne({ sessionId });
    if (!enquiry) {
      enquiry = await EnquiryModel.create({
        sessionId, guestEmail, guestName,
        productId: productId ?? undefined,
        subject: productContext.productName ? `Enquiry: ${productContext.productName}` : "Product Enquiry",
        status: "open",
        messages: [],
      });
    }

    await EnquiryModel.findByIdAndUpdate(enquiry._id, {
      $push: {
        messages: {
          $each: [
            { role: "user", content: message, timestamp: new Date() },
            { role: "ai", content: reply, timestamp: new Date() },
          ],
        },
      },
      updatedAt: new Date(),
    });

    // Auto-escalate if AI decides
    if (shouldEscalate) {
      await EnquiryModel.findByIdAndUpdate(enquiry._id, {
        isEscalated: true, status: "escalated", readByAdmin: false,
      });
      const storeEmail = settings?.storeEmail || "hello@buynyaree.com";
      sendEnquiryEscalation(storeEmail, enquiry._id.toString(), guestName || "Customer", productContext.productName || "Product Enquiry", message).catch(console.error);
    }

    return NextResponse.json({ success: true, reply, escalated: shouldEscalate });
  } catch (err) {
    console.error("Chat error:", err);
    return NextResponse.json({ success: false, error: "Chat unavailable", reply: "I'm having trouble right now. Please WhatsApp us at +91 8368989758!" }, { status: 500 });
  }
}
