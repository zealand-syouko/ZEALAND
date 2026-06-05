import { NextResponse } from "next/server";
import { prisma } from "@/server/db/client";

export async function GET() {
  const [totalUsers, totalTokens] = await Promise.all([
    prisma.user.count(),
    prisma.callLog.aggregate({ where: { status: 200 }, _sum: { totalTokens: true } }),
  ]);

  return NextResponse.json({
    totalUsers,
    totalTokens: totalTokens._sum.totalTokens || 0,
  });
}
