import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/server/db/client";
import bcrypt from "bcrypt";

export async function POST(req: NextRequest) {
  const { email, recoveryCode, newPassword } = await req.json();

  if (!email || !recoveryCode || !newPassword) {
    return NextResponse.json({ error: "Email, recovery code, and new password required" }, { status: 400 });
  }

  if (newPassword.length < 6) {
    return NextResponse.json({ error: "Password must be at least 6 characters" }, { status: 400 });
  }

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    return NextResponse.json({ error: "Account not found" }, { status: 404 });
  }

  if (user.recoveryCode !== recoveryCode) {
    return NextResponse.json({ error: "Invalid recovery code" }, { status: 401 });
  }

  const passwordHash = await bcrypt.hash(newPassword, 10);
  await prisma.user.update({ where: { id: user.id }, data: { passwordHash } });

  return NextResponse.json({ success: true });
}
