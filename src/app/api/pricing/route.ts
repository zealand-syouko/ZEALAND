import { NextResponse } from "next/server";
import { prisma } from "@/server/db/client";

export async function GET() {
  const pricing = await prisma.modelPricing.findUnique({ where: { model: "deepseek" } });
  return NextResponse.json(pricing ? {
    inputPrice: pricing.inputPrice,
    outputPrice: pricing.outputPrice,
    unit: pricing.unit,
  } : null);
}
