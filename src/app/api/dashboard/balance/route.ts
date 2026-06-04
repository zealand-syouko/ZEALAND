import { NextResponse } from "next/server";
import { requireAdmin } from "@/server/auth/session";
import { getUserBalance } from "@/server/billing";

export async function GET() {
  const session = await requireAdmin(); if (session instanceof NextResponse) return session;
  if (session instanceof NextResponse) return session;
  const balance = await getUserBalance(session.userId!);
  return NextResponse.json({ balance });
}
