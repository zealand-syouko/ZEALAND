import { prisma } from "./client";
import type { ProviderName } from "../types";

export async function getAllProviders() {
  return prisma.provider.findMany();
}

export async function getProviderByName(name: ProviderName) {
  return prisma.provider.findUnique({ where: { name } });
}

export async function upsertProvider(name: ProviderName, apiKeyEncrypted: string, baseUrl?: string) {
  return prisma.provider.upsert({
    where: { name },
    create: { name, apiKeyEncrypted, baseUrl },
    update: { apiKeyEncrypted, baseUrl },
  });
}

export async function setProviderEnabled(name: ProviderName, isEnabled: boolean) {
  return prisma.provider.update({ where: { name }, data: { isEnabled } });
}
