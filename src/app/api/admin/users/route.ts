import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/server/auth/session";
import { prisma } from "@/server/db/client";
import { topUpBalance } from "@/server/billing";
import { getUserTransactions } from "@/server/db/transactions";

export async function GET() {
  await requireAdmin();
  const users = await prisma.user.findMany({
    select: { id: true, email: true, balance: true, createdAt: true },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(users);
}

export async function POST(req: NextRequest) {
  await requireAdmin();
  const { userId, amount, description } = await req.json();
  if (!userId || !amount || amount <= 0) {
    return NextResponse.json({ error: "userId and positive amount required" }, { status: 400 });
  }
  await topUpBalance(userId, Number(amount), description || "Admin top-up");
  const user = await prisma.user.findUnique({ where: { id: userId } });
  return NextResponse.json({ email: user?.email, balance: user?.balance });
}
