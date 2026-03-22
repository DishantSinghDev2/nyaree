// app/api/store/settings/route.ts — public store settings (feature flags)
import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db/mongoose";
import { SiteSettingsModel } from "@/lib/db/models/index";
import { cacheGet, cacheSet, CK } from "@/lib/cache/redis";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = req.nextUrl;
    const fields = searchParams.get("fields")?.split(",") ?? null;

    const cached = await cacheGet<any>(CK.settings());
    let settings = cached;
    if (!settings) {
      await connectDB();
      settings = await SiteSettingsModel.findOne({ key: "main" }).lean();
      if (!settings) settings = {};
      await cacheSet(CK.settings(), settings, 300);
    }

    // Return only requested fields if specified
    if (fields) {
      const filtered: Record<string, unknown> = {};
      for (const f of fields) {
        filtered[f] = (settings as any)[f] ?? null;
      }
      return NextResponse.json({ success: true, data: filtered });
    }

    return NextResponse.json({ success: true, data: settings });
  } catch {
    return NextResponse.json({ success: false, error: "Failed to load settings" }, { status: 500 });
  }
}
