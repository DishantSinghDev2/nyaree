// app/api/account/profile/route.ts
import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db/mongoose";
import { UserModel } from "@/lib/db/models/index";
import { auth } from "@/lib/auth";

export async function PUT(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  const { name, phone } = await req.json();
  await connectDB();
  await UserModel.findByIdAndUpdate(session.user.id, { $set: { name, phone } });
  return NextResponse.json({ success: true });
}
