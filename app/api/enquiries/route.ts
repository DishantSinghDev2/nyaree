// app/api/enquiries/route.ts
import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db/mongoose";
import { EnquiryModel } from "@/lib/db/models/index";
import { auth } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user || (session.user as any).role !== "admin") {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }
  await connectDB();
  const { searchParams } = req.nextUrl;
  const status = searchParams.get("status");
  const filter: any = {};
  if (status && status !== "all") {
    if (status === "escalated") filter.isEscalated = true;
    else filter.status = status;
  }
  const enquiries = await EnquiryModel.find(filter).sort({ updatedAt: -1 }).limit(100).lean();
  return NextResponse.json({
    success: true,
    data: enquiries.map((e: any) => ({ ...e, _id: e._id.toString(), createdAt: e.createdAt?.toISOString(), updatedAt: e.updatedAt?.toISOString() })),
  });
}
