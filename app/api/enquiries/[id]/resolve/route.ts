// app/api/enquiries/[id]/resolve/route.ts
import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db/mongoose";
import { EnquiryModel } from "@/lib/db/models/index";
import { auth } from "@/lib/auth";

export async function POST(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user || (session.user as any).role !== "admin") {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await params;
  await connectDB();
  await EnquiryModel.findByIdAndUpdate(id, { status: "resolved", isEscalated: false });
  return NextResponse.json({ success: true });
}
