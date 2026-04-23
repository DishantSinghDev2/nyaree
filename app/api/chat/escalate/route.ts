// app/api/chat/escalate/route.ts
import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db/mongoose";
import { EnquiryModel, SiteSettingsModel } from "@/lib/db/models/index";
import { sendEnquiryEscalation } from "@/lib/email/resend";

export async function POST(req: NextRequest) {
  try {
    const { sessionId, guestName, guestEmail } = await req.json();
    if (!sessionId) return NextResponse.json({ success: false, error: "Session ID required" }, { status: 400 });

    await connectDB();
    const enquiry = await EnquiryModel.findOneAndUpdate(
      { sessionId },
      { isEscalated: true, status: "escalated", readByAdmin: false, guestEmail, guestName },
      { new: true }
    );

    if (enquiry) {
      const settings = await SiteSettingsModel.findOne({ key: "main" }).lean() as any;
      const adminEmail = settings?.storeEmail || process.env.ADMIN_EMAIL || "hello@buynyaree";
      const lastMsg = enquiry.messages?.[enquiry.messages.length - 1]?.content ?? "No message";
      sendEnquiryEscalation(adminEmail, enquiry._id.toString(), guestName || "Customer", enquiry.subject, lastMsg).catch(console.error);
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ success: false, error: "Escalation failed" }, { status: 500 });
  }
}
