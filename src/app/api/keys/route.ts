import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/server/auth/session";
import { createApiKey, getApiKeysByUser, updateApiKey, deleteApiKey } from "@/server/db/api-keys";
import { randomBytes, createHash } from "crypto";

function generateApiKey(): { raw: string; prefix: string; hash: string } {
  const raw = `sk-${randomBytes(24).toString("hex")}`;
  const prefix = raw.slice(0, 7);
  const hash = createHash("sha256").update(raw).digest("hex");
  return { raw, prefix, hash };
}

export async function GET() {
  const session = await requireAdmin();
  const keys = await getApiKeysByUser(session.userId!);
  return NextResponse.json(keys.map((k) => ({
    id: k.id,
    name: k.name,
    keyPrefix: k.keyPrefix,
    totalQuota: k.totalQuota,
    usedQuota: k.usedQuota,
    isActive: k.isActive,
    expiresAt: k.expiresAt,
    createdAt: k.createdAt,
  })));
}

export async function POST(req: NextRequest) {
  const session = await requireAdmin();
  const { name, totalQuota, expiresAt } = await req.json();
  const { raw, prefix, hash } = generateApiKey();

  await createApiKey({
    userId: session.userId!,
    name: name || "Default",
    keyPrefix: prefix,
    keyHash: hash,
    totalQuota: totalQuota || null,
    expiresAt: expiresAt ? new Date(expiresAt) : undefined,
  });

  return NextResponse.json({ key: raw, prefix }, { status: 201 });
}

export async function PATCH(req: NextRequest) {
  await requireAdmin();
  const { id, name, isActive, totalQuota, expiresAt } = await req.json();
  await updateApiKey(id, { name, isActive, totalQuota, expiresAt: expiresAt ? new Date(expiresAt) : undefined });
  return NextResponse.json({ success: true });
}

export async function DELETE(req: NextRequest) {
  await requireAdmin();
  const { id } = await req.json();
  await deleteApiKey(id);
  return NextResponse.json({ success: true });
}
