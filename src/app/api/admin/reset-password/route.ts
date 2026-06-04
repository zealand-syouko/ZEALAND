import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/server/auth/session";
import { prisma } from "@/server/db/client";
import bcrypt from "bcrypt";

export async function POST(req: NextRequest) {
  const _auth = await requireAdmin(); if (_auth instanceof NextResponse) return _auth;
  const { userId, newPassword } = await req.json();

  if (!userId || !newPassword || newPassword.length < 6) {
    return NextResponse.json({ error: "userId and newPassword (6+ chars) required" }, { status: 400 });
  }

  const hash = await bcrypt.hash(newPassword, 10);
  await prisma.user.update({ where: { id: userId }, data: { passwordHash: hash } });

  return NextResponse.json({ success: true });
}
