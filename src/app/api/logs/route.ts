import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/server/auth/session";
import { queryCallLogs } from "@/server/db/logs";

export async function GET(req: NextRequest) {
  const _auth = await requireAdmin(); if (_auth instanceof NextResponse) return _auth;
  const params = req.nextUrl.searchParams;
  const result = await queryCallLogs({
    apiKeyId: params.get("apiKeyId") || undefined,
    provider: params.get("provider") || undefined,
    status: params.get("status") ? Number(params.get("status")) : undefined,
    startDate: params.get("startDate") ? new Date(params.get("startDate")!) : undefined,
    endDate: params.get("endDate") ? new Date(params.get("endDate")!) : undefined,
    limit: params.get("limit") ? Number(params.get("limit")) : 50,
    offset: params.get("offset") ? Number(params.get("offset")) : 0,
  });
  return NextResponse.json(result);
}
