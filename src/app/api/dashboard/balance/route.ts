import { NextResponse } from "next/server";
import { requireAdmin } from "@/server/auth/session";
import { prisma } from "@/server/db/client";

export async function GET() {
  const session = await requireAdmin(); if (session instanceof NextResponse) return session;

  const user = await prisma.user.findUnique({
    where: { id: session.userId! },
    select: { balance: true, verified: true, email: true, lastLowBalanceEmail: true },
  });

  if (!user) return NextResponse.json({ balance: 0 });

  // Low balance warning email (below $1, max once per 24h)
  const LOW_THRESHOLD = 100; // $1.00
  if (
    user.balance < LOW_THRESHOLD &&
    user.verified &&
    process.env.RESEND_API_KEY &&
    (!user.lastLowBalanceEmail || Date.now() - user.lastLowBalanceEmail.getTime() > 24 * 60 * 60 * 1000)
  ) {
    try {
      const { Resend } = await import("resend");
      const resend = new Resend(process.env.RESEND_API_KEY);
      await resend.emails.send({
        from: "Token Relay <noreply@zealandr.xyz>",
        to: user.email,
        subject: "Your balance is running low",
        text: `Your Token Relay balance is $${(user.balance / 100).toFixed(2)}. API calls will be rejected when your balance reaches $0.\n\nRecharge now: https://www.zealandr.xyz/dashboard/recharge`,
      });
      await prisma.user.update({ where: { id: session.userId! }, data: { lastLowBalanceEmail: new Date() } });
    } catch (e) { /* email fail silent */ }
  }

  return NextResponse.json({ balance: user.balance });
}
