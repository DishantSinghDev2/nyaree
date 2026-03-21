// app/api/auth/register/route.ts
import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db/mongoose";
import { UserModel } from "@/lib/db/models/index";
import bcrypt from "bcryptjs";
import { z } from "zod";

const RegisterSchema = z.object({
  name: z.string().min(2).max(80),
  email: z.string().email().toLowerCase(),
  password: z.string().min(8).max(100),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = RegisterSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ success: false, error: parsed.error.issues[0].message }, { status: 400 });
    }
    const { name, email, password } = parsed.data;

    await connectDB();

    const existing = await UserModel.findOne({ email });
    if (existing) {
      return NextResponse.json({ success: false, error: "An account with this email already exists" }, { status: 409 });
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const user = await UserModel.create({
      name, email, passwordHash,
      role: "customer",
      emailVerified: false,
    });

    return NextResponse.json({
      success: true,
      data: { id: user._id.toString(), email: user.email, name: user.name },
    }, { status: 201 });
  } catch (err) {
    console.error("Register error:", err);
    return NextResponse.json({ success: false, error: "Registration failed" }, { status: 500 });
  }
}
