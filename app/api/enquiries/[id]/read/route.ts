// app/api/enquiries/[id]/read/route.ts
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { connectDB } from "@/lib/db/mongoose";
import { EnquiryModel } from "@/lib/db/models/index";
import { getRedis } from "@/lib/cache/redis";

export async function POST(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user || (session.user as any).role !== "admin") return NextResponse.json({ success: false }, { status: 401 });
  const { id } = await params;
  await connectDB();
  await EnquiryModel.findByIdAndUpdate(id, { readByAdmin: true });
  // Update unread count in Redis
  try {
    const redis = getRedis();
    const count = await EnquiryModel.countDocuments({ readByAdmin: false });
    await redis.set("nyaree:enquiry:unread", count.toString());
  } catch {}
  return NextResponse.json({ success: true });
}
