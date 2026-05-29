import { prisma } from "./client";

export async function createOrder(data: { userId: string; amount: number; method: string; tradeNo?: string }) {
  return prisma.paymentOrder.create({ data: { ...data, status: "pending" } });
}

export async function getOrderById(id: string) {
  return prisma.paymentOrder.findUnique({ where: { id } });
}

export async function getUserOrders(userId: string) {
  return prisma.paymentOrder.findMany({ where: { userId }, orderBy: { createdAt: "desc" }, take: 50 });
}

export async function confirmOrder(id: string, tradeNo: string) {
  return prisma.paymentOrder.update({
    where: { id },
    data: { status: "paid", tradeNo, paidAt: new Date() },
  });
}

export async function getAllOrders() {
  return prisma.paymentOrder.findMany({
    include: { user: { select: { email: true } } },
    orderBy: { createdAt: "desc" },
    take: 100,
  });
}
