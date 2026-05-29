import { prisma } from "./client";

export async function createApiKey(data: {
  userId: string;
  name: string;
  keyPrefix: string;
  keyHash: string;
  totalQuota?: number;
  expiresAt?: Date;
}) {
  return prisma.apiKey.create({ data });
}

export async function getApiKeyByHash(keyHash: string) {
  return prisma.apiKey.findFirst({ where: { keyHash } });
}

export async function getApiKeysByUser(userId: string) {
  return prisma.apiKey.findMany({ where: { userId }, orderBy: { createdAt: "desc" } });
}

export async function updateApiKey(id: string, data: {
  name?: string;
  isActive?: boolean;
  totalQuota?: number | null;
  expiresAt?: Date | null;
}) {
  return prisma.apiKey.update({ where: { id }, data });
}

export async function deleteApiKey(id: string) {
  return prisma.apiKey.delete({ where: { id } });
}

export async function incrementApiKeyQuota(id: string, tokens: number) {
  return prisma.apiKey.update({
    where: { id },
    data: { usedQuota: { increment: tokens } },
  });
}
