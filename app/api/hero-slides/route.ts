// app/api/hero-slides/route.ts — Public, heavily cached
import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db/mongoose";
import { SiteSettingsModel } from "@/lib/db/models/index";
import { getRedis } from "@/lib/cache/redis";

const CACHE_KEY = "nyaree:hero:slides";
const DEFAULT_SLIDES = [
  { id: "d1", headline: "Wear India. Own It.", subheadline: "Handcrafted kurtis & trending tops for the modern Indian woman", imageUrl: "", bgColor: "#1A1208", bgGradient: "linear-gradient(135deg,#1A1208 0%,#2D1E0A 50%,#1A1208 100%)", accentColor: "#C8960C", cta1Label: "Shop Kurtis", cta1Href: "/shop/kurti", cta2Label: "Shop Tops", cta2Href: "/shop/top", isActive: true, position: 0 },
  { id: "d2", headline: "New Arrivals Every Friday.", subheadline: "Fresh drops — limited quantities, crafted with care", imageUrl: "", bgColor: "#2D4A3E", bgGradient: "linear-gradient(135deg,#2D4A3E 0%,#1A3028 100%)", accentColor: "#F0C060", cta1Label: "New Arrivals", cta1Href: "/collections/new-arrivals", cta2Label: "Shop All", cta2Href: "/shop/all", isActive: true, position: 1 },
  { id: "d3", headline: "Festive Season Awaits.", subheadline: "Curated picks for every celebration — from pujas to parties", imageUrl: "", bgColor: "#3D1515", bgGradient: "linear-gradient(135deg,#3D1515 0%,#2A0D0D 100%)", accentColor: "#E85D04", cta1Label: "Festive Edit", cta1Href: "/collections/festive-edit", cta2Label: "Under ₹499", cta2Href: "/collections/under-499", isActive: true, position: 2 },
];

export const revalidate = 0; // Always fresh, but we use Redis cache manually

export async function GET() {
  try {
    const redis = getRedis();
    const cached = await redis.get(CACHE_KEY);
    if (cached) {
      return NextResponse.json({ success: true, data: JSON.parse(cached as string) }, {
        headers: { "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600" }
      });
    }
    await connectDB();
    const s = await SiteSettingsModel.findOne({ key: "main" }).select("heroSlides").lean() as any;
    const slides = (s?.heroSlides ?? []).filter((sl: any) => sl.isActive);
    const result = slides.length > 0 ? slides : DEFAULT_SLIDES;
    await redis.set(CACHE_KEY, JSON.stringify(result), "EX", 300);
    return NextResponse.json({ success: true, data: result }, {
      headers: { "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600" }
    });
  } catch {
    return NextResponse.json({ success: true, data: DEFAULT_SLIDES });
  }
}
