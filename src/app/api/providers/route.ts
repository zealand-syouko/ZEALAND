import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/server/auth/session";
import { getAllProviders, upsertProvider, setProviderEnabled } from "@/server/db/providers";
import { encrypt } from "@/server/encryption";
import type { ProviderName } from "@/server/types";

export async function GET() {
  const _auth = await requireAdmin(); if (_auth instanceof NextResponse) return _auth;
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
  const _auth = await requireAdmin(); if (_auth instanceof NextResponse) return _auth;
  const { name, apiKey, baseUrl, isEnabled } = await req.json();
  if (apiKey) {
    const encryptionKey = process.env.ENCRYPTION_KEY!;
    const encrypted = encrypt(apiKey, encryptionKey);
    await upsertProvider(name as ProviderName, encrypted, baseUrl || undefined);
  }
  if (typeof isEnabled === "boolean") {
    await setProviderEnabled(name as ProviderName, isEnabled);
  }
  return NextResponse.json({ success: true });
}
