import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/server/auth/session";
import { getAllProviders, upsertProvider, setProviderEnabled } from "@/server/db/providers";
import type { ProviderName } from "@/server/types";

export async function GET() {
  await requireAdmin();
  const providers = await getAllProviders();
  return NextResponse.json(providers.map((p) => ({
    id: p.id,
    name: p.name,
    apiKeyPreview: p.apiKeyEncrypted ? "********" : "",
    baseUrl: p.baseUrl,
    isEnabled: p.isEnabled,
  })));
}

export async function POST(req: NextRequest) {
  await requireAdmin();
  const { name, apiKey, baseUrl, isEnabled } = await req.json();
  if (apiKey) {
    // Store API key as-is for now; encryption will be handled when we add the encryption utility
    await upsertProvider(name as ProviderName, apiKey, baseUrl || undefined);
  }
  if (typeof isEnabled === "boolean") {
    await setProviderEnabled(name as ProviderName, isEnabled);
  }
  return NextResponse.json({ success: true });
}
