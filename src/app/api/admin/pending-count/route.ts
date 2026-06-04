import { NextResponse } from "next/server";
import { requireAdmin } from "@/server/auth/session";
import { prisma } from "@/server/db/client";

export async function GET() {
  const _auth = await requireAdmin(); if (_auth instanceof NextResponse) return _auth;
  const count = await prisma.paymentOrder.count({ where: { status: "pending" } });
  return NextResponse.json({ count });
}
