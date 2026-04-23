import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db/mongoose";
import { UserModel } from "@/lib/db/models/index";
import { auth } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  await connectDB();
  const user = await UserModel.findById(session.user.id).lean();
  
  if (!user) {
    return NextResponse.json({ success: false, error: "User not found" }, { status: 404 });
  }

  return NextResponse.json({ success: true, data: user.addresses || [] });
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  const address = await req.json();
  
  await connectDB();
  
  // Add the new address to the user's addresses array
  const updatedUser = await UserModel.findByIdAndUpdate(
    session.user.id,
    { $push: { addresses: address } },
    { new: true }
  ).lean();

  return NextResponse.json({ success: true, data: updatedUser?.addresses || [] });
}
