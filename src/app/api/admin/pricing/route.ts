import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/server/auth/session";
import { getAllPricing, upsertPricing, deletePricing } from "@/server/db/pricing";

export async function GET() {
  await requireAdmin();
  return NextResponse.json(await getAllPricing());
}

export async function POST(req: NextRequest) {
  await requireAdmin();
  const { model, inputPrice, outputPrice } = await req.json();
  if (!model || inputPrice == null || outputPrice == null) {
    return NextResponse.json({ error: "model, inputPrice, outputPrice required" }, { status: 400 });
  }
  const p = await upsertPricing(model, Number(inputPrice), Number(outputPrice));
  return NextResponse.json(p);
}

export async function DELETE(req: NextRequest) {
  await requireAdmin();
  const { model } = await req.json();
  await deletePricing(model);
  return NextResponse.json({ success: true });
}
