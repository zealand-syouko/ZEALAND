import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/server/auth/session";
import { queryCallLogs } from "@/server/db/logs";
import { prisma } from "@/server/db/client";

export async function GET(req: NextRequest) {
  const session = await getSession();
  if (!session.userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const isAdmin = session.email === process.env.DEFAULT_ADMIN_EMAIL;
  const params = req.nextUrl.searchParams;

  // Non-admin users can only see their own logs
  let apiKeyId = params.get("apiKeyId") || undefined;
  if (!isAdmin && !apiKeyId) {
    const keys = await prisma.apiKey.findMany({ where: { userId: session.userId }, select: { id: true } });
    if (keys.length === 0) return NextResponse.json({ logs: [], total: 0 });
    // This is a simplification — the queryCallLogs function needs to support multiple IDs
    // For now, show logs for all user's keys
  }

  const result = await queryCallLogs({
    apiKeyId,
    provider: params.get("provider") || undefined,
    status: params.get("status") ? Number(params.get("status")) : undefined,
    startDate: params.get("startDate") ? new Date(params.get("startDate")!) : undefined,
    endDate: params.get("endDate") ? new Date(params.get("endDate")!) : undefined,
    limit: params.get("limit") ? Number(params.get("limit")) : 50,
    offset: params.get("offset") ? Number(params.get("offset")) : 0,
    userId: isAdmin ? undefined : session.userId,
  });
  return NextResponse.json(result);
}
