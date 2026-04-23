// app/api/enquiries/[id]/reply/route.ts
import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db/mongoose";
import { EnquiryModel, SiteSettingsModel } from "@/lib/db/models/index";
import { auth } from "@/lib/auth";
import { getRedis } from "@/lib/cache/redis";
import { Resend } from "resend";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user || (session.user as any).role !== "admin") {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await params;
  const { message } = await req.json();
  if (!message?.trim()) return NextResponse.json({ success: false, error: "Message required" }, { status: 400 });

  await connectDB();
  const enquiry = await EnquiryModel.findByIdAndUpdate(
    id,
    {
      $push: { messages: { role: "admin", content: message, timestamp: new Date(), adminId: session.user.id } },
      status: "in_progress",
      readByAdmin: true,
    },
    { new: true }
  ).lean() as any;

  if (!enquiry) return NextResponse.json({ success: false, error: "Enquiry not found" }, { status: 404 });

  // Email the customer if we have their email
  if (enquiry.guestEmail) {
    try {
      const settings = await SiteSettingsModel.findOne({ key: "main" }).lean() as any;
      const resend = new Resend(process.env.RESEND_API_KEY);
      await resend.emails.send({
        from: "Nyaree <noreply@buynyaree>",
        to: enquiry.guestEmail,
        subject: `Re: ${enquiry.subject} — Nyaree Support`,
        html: `<div style="font-family:Georgia,serif;max-width:600px;margin:0 auto;padding:40px 20px;">
          <div style="background:#1A1208;padding:24px;text-align:center;">
            <span style="font-size:24px;letter-spacing:6px;color:#C8960C;">NYA</span><span style="font-size:24px;letter-spacing:6px;color:#fff;">REE</span>
          </div>
          <div style="padding:32px;background:#fff;">
            <h2 style="font-weight:400;margin-bottom:16px;">Reply from Nyaree Team</h2>
            <p style="color:#555;line-height:1.8;">${message}</p>
            <hr style="border:none;border-top:1px solid #eee;margin:24px 0;" />
            <p style="font-size:13px;color:#888;">Your enquiry: ${enquiry.subject}</p>
            <p style="font-size:13px;color:#888;">Questions? WhatsApp: +91 8368989758</p>
          </div>
        </div>`,
      });
    } catch (e) { console.error("Email send error:", e); }
  }

  // Notify SSE listeners about new admin reply (fire-and-forget)
  try {
    const redis = getRedis();
    await redis.set("nyaree:enquiry:pending", JSON.stringify({
      enquiryId: id,
      role: "admin",
      message,
      subject: enquiry.subject,
      timestamp: new Date().toISOString(),
    }), "EX", 30);
    // Also publish to the user's session channel if they're listening
    if (enquiry.sessionId) {
      await redis.set(
        `nyaree:enquiry:reply:${enquiry.sessionId}`,
        JSON.stringify({ role: "admin", content: message, timestamp: new Date().toISOString() }),
        "EX", 86400
      );
    }
  } catch {}

  return NextResponse.json({ success: true });
}
