import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/server/auth/session";
import { getAllPricing, upsertPricing, deletePricing } from "@/server/db/pricing";

export async function GET() {
  const _auth = await requireAdmin(); if (_auth instanceof NextResponse) return _auth;
  return NextResponse.json(await getAllPricing());
}

export async function POST(req: NextRequest) {
  const _auth = await requireAdmin(); if (_auth instanceof NextResponse) return _auth;
  const { model, inputPrice, outputPrice } = await req.json();
  if (!model || inputPrice == null || outputPrice == null) {
    return NextResponse.json({ error: "model, inputPrice, outputPrice required" }, { status: 400 });
  }
  const p = await upsertPricing(model, Number(inputPrice), Number(outputPrice));
  return NextResponse.json(p);
}

export async function DELETE(req: NextRequest) {
  const _auth = await requireAdmin(); if (_auth instanceof NextResponse) return _auth;
  const { model } = await req.json();
  await deletePricing(model);
  return NextResponse.json({ success: true });
}
