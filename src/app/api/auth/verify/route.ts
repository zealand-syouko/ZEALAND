import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/server/db/client";
import { randomBytes } from "crypto";

export async function POST(req: NextRequest) {
  const { email, code } = await req.json();

  if (!email) return NextResponse.json({ error: "Email required" }, { status: 400 });

  // Resend code
  if (!code) {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });
    if (user.verified) return NextResponse.json({ message: "Already verified" });

    const newCode = randomBytes(4).toString("hex").slice(0, 6);
    await prisma.user.update({ where: { id: user.id }, data: { verificationCode: newCode } });

    // If Resend is configured, send email
    if (process.env.RESEND_API_KEY) {
      try {
        const { Resend } = await import("resend");
        const resend = new Resend(process.env.RESEND_API_KEY);
        await resend.emails.send({
          from: "Token Relay <noreply@zealandr.xyz>",
          to: email,
          subject: "Verify your email",
          text: `Your verification code is: ${newCode}`,
        });
      } catch (e) { /* email fail silent */ }
    }

    return NextResponse.json({ code: newCode, note: process.env.RESEND_API_KEY ? "Email sent" : "Check response for code" });
  }

  // Confirm code
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });
  if (user.verificationCode !== code) return NextResponse.json({ error: "Invalid code" }, { status: 401 });

  await prisma.user.update({ where: { id: user.id }, data: { verified: true, verificationCode: null } });
  return NextResponse.json({ verified: true });
}
