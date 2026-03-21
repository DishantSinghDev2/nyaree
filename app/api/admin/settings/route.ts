import { auth } from "@/lib/auth";
// app/api/admin/settings/route.ts
import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db/mongoose";
import { SiteSettingsModel } from "@/lib/db/models/index";


import { cacheDel, CK } from "@/lib/cache/redis";

async function requireAdmin() {
  const session = await auth();
  if (!session?.user || (session.user as any).role !== "admin") return null;
  return session.user;
}

export async function GET() {
  const user = await requireAdmin();
  if (!user) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  await connectDB();
  let settings = await SiteSettingsModel.findOne({ key: "main" }).lean();
  if (!settings) settings = await SiteSettingsModel.create({ key: "main" });
  return NextResponse.json({ success: true, data: settings });
}

export async function PUT(req: NextRequest) {
  const user = await requireAdmin();
  if (!user) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  try {
    const body = await req.json();
    await connectDB();
    const settings = await SiteSettingsModel.findOneAndUpdate(
      { key: "main" },
      { $set: body },
      { new: true, upsert: true }
    );
    await cacheDel(CK.settings());
    return NextResponse.json({ success: true, data: settings });
  } catch {
    return NextResponse.json({ success: false, error: "Failed to save settings" }, { status: 500 });
  }
}
