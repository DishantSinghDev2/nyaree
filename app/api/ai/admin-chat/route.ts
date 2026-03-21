// app/api/ai/admin-chat/route.ts
import { NextRequest, NextResponse } from "next/server";
import { adminAssistant } from "@/lib/ai/claude";
import { getAuth } from "@/lib/auth";
import { headers } from "next/headers";

export async function POST(req: NextRequest) {
  const auth = getAuth();
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user || (session.user as any).role !== "admin") {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }
  try {
    const { question, context } = await req.json();
    const reply = await adminAssistant(question, context ?? {});
    return NextResponse.json({ success: true, reply });
  } catch {
    return NextResponse.json({ success: false, error: "AI unavailable", reply: "I'm having trouble. Try again!" }, { status: 500 });
  }
}
