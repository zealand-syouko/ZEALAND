import { getPricingForModel } from "./db/pricing";
import { createTransaction } from "./db/transactions";
import { prisma } from "./db/client";

export async function calculateCost(
  model: string,
  inputTokens: number,
  outputTokens: number,
): Promise<{ cost: number; pricing: { inputPrice: number; outputPrice: number; unit: number } } | null> {
  const pricing = await getPricingForModel(model);
  if (!pricing) return null;

  const inputCost = (inputTokens / pricing.unit) * pricing.inputPrice;
  const outputCost = (outputTokens / pricing.unit) * pricing.outputPrice;
  const cost = Math.ceil(inputCost + outputCost);

  return {
    cost,
    pricing: { inputPrice: pricing.inputPrice, outputPrice: pricing.outputPrice, unit: pricing.unit },
  };
}

export async function chargeUser(
  userId: string,
  model: string,
  inputTokens: number,
  outputTokens: number,
  apiKeyId: string,
): Promise<{ charged: boolean; cost: number; reason?: string }> {
  const result = await calculateCost(model, inputTokens, outputTokens);

  if (!result || result.cost === 0) {
    return { charged: false, cost: 0 };
  }

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user || user.balance < result.cost) {
    return { charged: false, cost: result.cost, reason: "insufficient_balance" };
  }

  await prisma.user.update({
    where: { id: userId },
    data: { balance: { decrement: result.cost } },
  });

  await createTransaction({
    userId,
    amount: -result.cost,
    type: "charge",
    description: `${model}: ${inputTokens}+${outputTokens} tokens via key ${apiKeyId.slice(0, 8)}`,
  });

  return { charged: true, cost: result.cost };
}

export async function getUserBalance(userId: string): Promise<number> {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  return user?.balance ?? 0;
}

export async function topUpBalance(userId: string, amount: number, description = "Manual top-up") {
  await prisma.user.update({
    where: { id: userId },
    data: { balance: { increment: amount } },
  });
  await createTransaction({ userId, amount, type: "topup", description });
}
