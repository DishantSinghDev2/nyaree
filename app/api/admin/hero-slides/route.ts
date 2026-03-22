// app/api/admin/hero-slides/route.ts
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { connectDB } from "@/lib/db/mongoose";
import { SiteSettingsModel } from "@/lib/db/models/index";
import { getRedis } from "@/lib/cache/redis";
import { nanoid } from "nanoid";

async function requireAdmin() {
  const session = await auth();
  if (!session?.user || (session.user as any).role !== "admin") return null;
  return session.user;
}

export async function GET() {
  const user = await requireAdmin();
  if (!user) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  await connectDB();
  const s = await SiteSettingsModel.findOne({ key: "main" }).select("heroSlides").lean() as any;
  return NextResponse.json({ success: true, data: s?.heroSlides ?? [] });
}

export async function PUT(req: NextRequest) {
  const user = await requireAdmin();
  if (!user) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  const { slides } = await req.json();
  if (!Array.isArray(slides)) return NextResponse.json({ success: false, error: "slides must be array" }, { status: 400 });
  const normalized = slides.map((s: any, i: number) => ({ ...s, id: s.id ?? nanoid(6), position: i }));
  await connectDB();
  await SiteSettingsModel.findOneAndUpdate({ key: "main" }, { $set: { heroSlides: normalized } }, { upsert: true });
  try { await getRedis().del("nyaree:hero:slides"); } catch {}
  return NextResponse.json({ success: true, data: normalized });
}
