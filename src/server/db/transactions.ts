import { prisma } from "./client";

export async function createTransaction(data: {
  userId: string;
  amount: number;
  type: string;
  description: string;
}) {
  return prisma.transaction.create({ data });
}

export async function getUserTransactions(userId: string, limit = 50) {
  return prisma.transaction.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    take: limit,
  });
}
