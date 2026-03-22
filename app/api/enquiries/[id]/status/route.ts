// app/api/enquiries/[id]/status/route.ts
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { connectDB } from "@/lib/db/mongoose";
import { EnquiryModel } from "@/lib/db/models/index";

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user || (session.user as any).role !== "admin") return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  const { status } = await req.json();
  await connectDB();
  await EnquiryModel.findByIdAndUpdate(id, { status });
  return NextResponse.json({ success: true });
}
