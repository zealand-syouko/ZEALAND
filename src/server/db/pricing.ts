import { prisma } from "./client";

export async function getAllPricing() {
  return prisma.modelPricing.findMany();
}

export async function getPricingForModel(model: string) {
  const all = await prisma.modelPricing.findMany();
  for (const p of all) {
    if (model.startsWith(p.model)) return p;
  }
  return null;
}

export async function upsertPricing(model: string, inputPrice: number, outputPrice: number) {
  return prisma.modelPricing.upsert({
    where: { model },
    create: { model, inputPrice, outputPrice },
    update: { inputPrice, outputPrice },
  });
}

export async function deletePricing(model: string) {
  return prisma.modelPricing.delete({ where: { model } });
}
