import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/server/auth/session";
import { prisma } from "@/server/db/client";
import { topUpBalance } from "@/server/billing";

export async function GET() {
  const _auth = await requireAdmin(); if (_auth instanceof NextResponse) return _auth;
  const users = await prisma.user.findMany({
    select: { id: true, email: true, balance: true, verified: true, createdAt: true },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(users);
}

export async function POST(req: NextRequest) {
  const _auth = await requireAdmin(); if (_auth instanceof NextResponse) return _auth;
  const { userId, amount, description } = await req.json();
  if (!userId || !amount || amount <= 0) {
    return NextResponse.json({ error: "userId and positive amount required" }, { status: 400 });
  }
  await topUpBalance(userId, Number(amount), description || "Admin top-up");
  const user = await prisma.user.findUnique({ where: { id: userId } });
  return NextResponse.json({ email: user?.email, balance: user?.balance });
}

export async function DELETE(req: NextRequest) {
  const _auth = await requireAdmin(); if (_auth instanceof NextResponse) return _auth;
  const { userId } = await req.json();
  if (!userId) return NextResponse.json({ error: "userId required" }, { status: 400 });
  // Prevent deleting the admin
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (user.email === process.env.DEFAULT_ADMIN_EMAIL) {
    return NextResponse.json({ error: "Cannot delete admin account" }, { status: 403 });
  }
  await prisma.user.delete({ where: { id: userId } });
  return NextResponse.json({ success: true });
}
