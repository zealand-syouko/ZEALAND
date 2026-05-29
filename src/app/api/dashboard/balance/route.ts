import { NextResponse } from "next/server";
import { requireAdmin } from "@/server/auth/session";
import { getUserBalance } from "@/server/billing";

export async function GET() {
  const session = await requireAdmin();
  const balance = await getUserBalance(session.userId!);
  return NextResponse.json({ balance });
}
