// app/api/admin/setup/route.ts — One-time admin promotion endpoint
import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db/mongoose";
import { UserModel } from "@/lib/db/models/index";
import { auth } from "@/lib/auth";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.email) {
    return NextResponse.json({ success: false, error: "Sign in at /auth/login first, then call this endpoint." }, { status: 401 });
  }

  const token = req.headers.get("x-setup-token");
  const validToken = process.env.ADMIN_SETUP_TOKEN;
  if (!validToken) return NextResponse.json({ success: false, error: "Set ADMIN_SETUP_TOKEN in .env.local first" }, { status: 503 });
  if (token !== validToken) return NextResponse.json({ success: false, error: "Invalid token" }, { status: 403 });

  await connectDB();
  const user = await UserModel.findOneAndUpdate(
    { email: session.user.email.toLowerCase() },
    { $set: { role: "admin" } },
    { new: true }
  ).lean() as any;

  if (!user) return NextResponse.json({ success: false, error: `${session.user.email} not in DB. Sign in via the website first, then retry.` }, { status: 404 });

  return NextResponse.json({
    success: true,
    message: `✅ ${user.email} is now admin! Sign out and sign back in.`,
    data: { email: user.email, role: user.role },
  });
}

export async function GET() {
  const session = await auth();
  return NextResponse.json({
    instructions: [
      "Step 1: Add ADMIN_SETUP_TOKEN=any_secret_here to .env.local",
      "Step 2: Sign in at http://localhost:3000/auth/login",
      "Step 3: curl -X POST http://localhost:3000/api/admin/setup -H 'x-setup-token: any_secret_here'",
      "Step 4: Sign out and sign back in — you're now admin!",
    ],
    currentUser: session?.user?.email ?? "Not signed in",
    currentRole: (session?.user as any)?.role ?? "none",
  });
}
