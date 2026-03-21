// app/api/newsletter/route.ts
import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db/mongoose";
import { NewsletterModel } from "@/lib/db/models/index";
import { sendWelcomeEmail } from "@/lib/email/resend";
import { nanoid } from "nanoid";

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ success: false, error: "Invalid email" }, { status: 400 });
    }
    await connectDB();
    const existing = await NewsletterModel.findOne({ email: email.toLowerCase() });
    if (existing) return NextResponse.json({ success: true, message: "Already subscribed!" });

    await NewsletterModel.create({ email: email.toLowerCase() });

    // Generate welcome coupon code
    const coupon = "WELCOME10";
    sendWelcomeEmail(email, email.split("@")[0], coupon).catch(console.error);

    return NextResponse.json({ success: true, message: "Subscribed! Check your email for a gift 🎁" });
  } catch {
    return NextResponse.json({ success: false, error: "Subscription failed" }, { status: 500 });
  }
}
