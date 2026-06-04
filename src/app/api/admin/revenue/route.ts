import { NextResponse } from "next/server";
import { requireAdmin } from "@/server/auth/session";
import { prisma } from "@/server/db/client";

export async function GET() {
  const _auth = await requireAdmin(); if (_auth instanceof NextResponse) return _auth;

  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const weekStart = new Date(todayStart.getTime() - 7 * 24 * 60 * 60 * 1000);
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

  const [today, week, month, all] = await Promise.all([
    prisma.transaction.aggregate({ where: { type: "charge", createdAt: { gte: todayStart } }, _sum: { amount: true } }),
    prisma.transaction.aggregate({ where: { type: "charge", createdAt: { gte: weekStart } }, _sum: { amount: true } }),
    prisma.transaction.aggregate({ where: { type: "charge", createdAt: { gte: monthStart } }, _sum: { amount: true } }),
    prisma.transaction.aggregate({ where: { type: "charge" }, _sum: { amount: true } }),
  ]);

  const topups = await prisma.transaction.aggregate({
    where: { type: "topup" },
    _sum: { amount: true },
  });

  const pendingOrders = await prisma.paymentOrder.count({ where: { status: "pending" } });
  const totalUsers = await prisma.user.count();

  return NextResponse.json({
    revenue: {
      today: -(today._sum.amount || 0),
      week: -(week._sum.amount || 0),
      month: -(month._sum.amount || 0),
      total: -(all._sum.amount || 0),
      totalTopUps: topups._sum.amount || 0,
    },
    users: totalUsers,
    pendingOrders,
  });
}
