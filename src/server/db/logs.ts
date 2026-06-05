import { prisma } from "./client";

export interface CreateLogInput {
  apiKeyId: string;
  provider: string;
  model: string;
  endpoint: string;
  requestTokens: number;
  responseTokens: number;
  totalTokens: number;
  latencyMs: number;
  status: number;
  errorMessage?: string;
}

export async function createCallLog(input: CreateLogInput) {
  return prisma.callLog.create({ data: input });
}

export interface LogQuery {
  apiKeyId?: string;
  userId?: string;
  provider?: string;
  status?: number;
  startDate?: Date;
  endDate?: Date;
  limit?: number;
  offset?: number;
}

export async function queryCallLogs(query: LogQuery) {
  const where: Record<string, unknown> = {};
  if (query.apiKeyId) where.apiKeyId = query.apiKeyId;
  if (query.userId) {
    // Find all keys for this user and filter by them
    const { prisma: p } = await import("./client");
    const keys = await p.apiKey.findMany({ where: { userId: query.userId }, select: { id: true } });
    where.apiKeyId = { in: keys.map((k: { id: string }) => k.id) };
  }
  if (query.provider) where.provider = query.provider;
  if (query.status) where.status = query.status;
  if (query.startDate || query.endDate) {
    where.createdAt = {};
    if (query.startDate) (where.createdAt as Record<string, unknown>).gte = query.startDate;
    if (query.endDate) (where.createdAt as Record<string, unknown>).lte = query.endDate;
  }

  const [logs, total] = await Promise.all([
    prisma.callLog.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: query.limit || 50,
      skip: query.offset || 0,
    }),
    prisma.callLog.count({ where }),
  ]);

  return { logs, total };
}

export async function getUsageStats(userId: string, startDate: Date, endDate: Date) {
  const apiKeys = await prisma.apiKey.findMany({ where: { userId }, select: { id: true } });
  const ids = apiKeys.map((k) => k.id);

  const [totalCalls, totalTokens, byModel] = await Promise.all([
    prisma.callLog.count({ where: { apiKeyId: { in: ids }, createdAt: { gte: startDate, lte: endDate } } }),
    prisma.callLog.aggregate({
      where: { apiKeyId: { in: ids }, createdAt: { gte: startDate, lte: endDate }, status: 200 },
      _sum: { totalTokens: true },
    }),
    prisma.callLog.groupBy({
      by: ["model"],
      where: { apiKeyId: { in: ids }, createdAt: { gte: startDate, lte: endDate }, status: 200 },
      _sum: { totalTokens: true },
      _count: true,
    }),
  ]);

  return {
    totalCalls,
    totalTokens: totalTokens._sum.totalTokens || 0,
    byModel: byModel.map((m) => ({
      model: m.model,
      tokens: m._sum.totalTokens || 0,
      calls: m._count,
    })),
  };
}
