// app/api/contact/route.ts
import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import { z } from "zod";

const Schema = z.object({
  name: z.string().min(2).max(80),
  email: z.string().email(),
  phone: z.string().optional(),
  subject: z.string().min(2).max(100),
  message: z.string().min(10).max(2000),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = Schema.safeParse(body);
    if (!parsed.success) return NextResponse.json({ success: false, error: parsed.error.issues[0].message }, { status: 400 });

    const { name, email, phone, subject, message } = parsed.data;
    const storeEmail = process.env.STORE_EMAIL || process.env.ADMIN_EMAIL || "hello@shopnyaree";

    const resend = new Resend(process.env.RESEND_API_KEY);
    await resend.emails.send({
      from: "Nyaree Website <noreply@shopnyaree>",
      to: storeEmail,
      replyTo: email,
      subject: `[Contact Form] ${subject} — from ${name}`,
      html: `
        <div style="font-family:Georgia,serif;max-width:600px;margin:0 auto;padding:20px;">
          <div style="background:#1A1208;padding:20px 24px;border-radius:4px 4px 0 0;">
            <span style="font-size:20px;letter-spacing:5px;color:#C8960C;font-family:Georgia,serif">NYA</span>
            <span style="font-size:20px;letter-spacing:5px;color:#fff;font-family:Georgia,serif">REE</span>
            <span style="font-size:11px;color:rgba(255,255,255,0.4);margin-left:12px;text-transform:uppercase;letter-spacing:2px">Contact Form</span>
          </div>
          <div style="border:1px solid #E5E7EB;border-top:none;padding:28px;border-radius:0 0 4px 4px;">
            <table style="width:100%;border-collapse:collapse;font-size:14px;">
              <tr><td style="padding:8px 0;color:#6B7280;width:100px">Name</td><td style="padding:8px 0;font-weight:500">${name}</td></tr>
              <tr><td style="padding:8px 0;color:#6B7280">Email</td><td style="padding:8px 0"><a href="mailto:${email}" style="color:#C8960C">${email}</a></td></tr>
              ${phone ? `<tr><td style="padding:8px 0;color:#6B7280">Phone</td><td style="padding:8px 0"><a href="tel:${phone}" style="color:#C8960C">${phone}</a></td></tr>` : ""}
              <tr><td style="padding:8px 0;color:#6B7280">Subject</td><td style="padding:8px 0">${subject}</td></tr>
            </table>
            <hr style="border:none;border-top:1px solid #E5E7EB;margin:20px 0"/>
            <p style="font-size:13px;color:#6B7280;margin-bottom:8px;text-transform:uppercase;letter-spacing:1px">Message</p>
            <p style="font-size:15px;line-height:1.8;color:#374151">${message.replace(/\n/g, "<br/>")}</p>
            <hr style="border:none;border-top:1px solid #E5E7EB;margin:20px 0"/>
            <p style="font-size:12px;color:#9CA3AF">Reply directly to this email to respond to ${name}.</p>
          </div>
        </div>
      `,
    });

    // Auto-reply to sender
    resend.emails.send({
      from: "Nyaree <hello@shopnyaree>",
      to: email,
      subject: `We received your message — Nyaree`,
      html: `
        <div style="font-family:Georgia,serif;max-width:600px;margin:0 auto;padding:20px;">
          <div style="background:#1A1208;padding:24px;text-align:center;">
            <span style="font-size:24px;letter-spacing:6px;color:#C8960C">NYA</span>
            <span style="font-size:24px;letter-spacing:6px;color:#fff">REE</span>
          </div>
          <div style="padding:32px;background:#fff;border:1px solid #E5E7EB;border-top:none;">
            <h2 style="font-family:Georgia,serif;font-weight:400;margin-bottom:8px">Hi ${name}!</h2>
            <p style="color:#6B7280;margin-bottom:20px;line-height:1.8">Thank you for reaching out. We've received your message about <strong>${subject}</strong> and will get back to you within 24 hours.</p>
            <p style="color:#6B7280;line-height:1.8">For urgent queries, you can also reach us directly on WhatsApp:</p>
            <a href="https://wa.me/918368989758" style="display:inline-block;margin-top:16px;padding:10px 20px;background:#25D366;color:#fff;text-decoration:none;border-radius:4px;font-size:14px">Chat on WhatsApp</a>
          </div>
          <div style="padding:16px;text-align:center;font-size:12px;color:#9CA3AF">
            <p>Nyaree · Parnala Extended Industrial Area, Bahadurgarh, Haryana 124507</p>
            <a href=process.env.NEXT_PUBLIC_SITE_URL ?? "https://buynyaree.com" style="color:#C8960C">buynyaree.com</a>
          </div>
        </div>
      `,
    }).catch(console.error);

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("Contact form error:", err);
    return NextResponse.json({ success: false, error: "Failed to send message" }, { status: 500 });
  }
}
