import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/server/auth/session";
import { createOrder, getUserOrders } from "@/server/db/orders";

export async function GET() {
  const session = await requireAdmin();
  const orders = await getUserOrders(session.userId!);
  return NextResponse.json(orders);
}

export async function POST(req: NextRequest) {
  const session = await requireAdmin();
  const { amount, method } = await req.json();

  if (!amount || amount <= 0 || !method) {
    return NextResponse.json({ error: "amount and method required" }, { status: 400 });
  }

  if (!["alipay", "wechat", "manual", "crypto"].includes(method)) {
    return NextResponse.json({ error: "Invalid payment method" }, { status: 400 });
  }

  const order = await createOrder({
    userId: session.userId!,
    amount: Number(amount),
    method,
  });

  return NextResponse.json(order, { status: 201 });
}
