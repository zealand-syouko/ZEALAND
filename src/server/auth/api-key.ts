import { createHash } from "crypto";
import { getApiKeyByHash } from "../db/api-keys";

export function hashApiKey(key: string): string {
  return createHash("sha256").update(key).digest("hex");
}

export function formatApiKey(key: string): string {
  const prefix = key.slice(0, 7);
  return `sk-${prefix}...`;
}

export async function validateApiKey(bearerToken: string) {
  const key = bearerToken.replace(/^Bearer\s+/i, "");
  const hash = hashApiKey(key);
  const record = await getApiKeyByHash(hash);
  if (!record) return { valid: false, reason: "invalid_key" } as const;
  if (!record.isActive) return { valid: false, reason: "disabled" } as const;
  if (record.expiresAt && record.expiresAt < new Date()) return { valid: false, reason: "expired" } as const;
  if (record.totalQuota !== null && record.usedQuota >= record.totalQuota) {
    return { valid: false, reason: "quota_exceeded" } as const;
  }
  return { valid: true, apiKey: record } as const;
}
