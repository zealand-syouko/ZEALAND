import { NextResponse } from "next/server";
import { requireAdmin } from "@/server/auth/session";
import { getUsageStats } from "@/server/db/logs";
import { getApiKeysByUser } from "@/server/db/api-keys";

export async function GET() {
  const session = await requireAdmin();

  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const weekStart = new Date(todayStart.getTime() - 7 * 24 * 60 * 60 * 1000);

  const [todayStats, weekStats, keys] = await Promise.all([
    getUsageStats(session.userId!, todayStart, now),
    getUsageStats(session.userId!, weekStart, now),
    getApiKeysByUser(session.userId!),
  ]);

  const activeKeys = keys.filter((k) => k.isActive).length;

  return NextResponse.json({
    today: { calls: todayStats.totalCalls, tokens: todayStats.totalTokens },
    week: { calls: weekStats.totalCalls, tokens: weekStats.totalTokens },
    activeKeys,
    totalKeys: keys.length,
    byModel: weekStats.byModel,
  });
}
