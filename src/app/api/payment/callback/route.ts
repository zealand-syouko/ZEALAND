import { NextRequest, NextResponse } from "next/server";
import { confirmOrder, getOrderById } from "@/server/db/orders";
import { topUpBalance } from "@/server/billing";

export async function POST(req: NextRequest) {
  const { orderId, tradeNo } = await req.json();

  if (!orderId) {
    return NextResponse.json({ error: "orderId required" }, { status: 400 });
  }

  const order = await getOrderById(orderId);
  if (!order) {
    return NextResponse.json({ error: "Order not found" }, { status: 404 });
  }

  if (order.status === "paid") {
    return NextResponse.json({ message: "Already paid" });
  }

  const tn = tradeNo || `manual-${Date.now()}`;
  await confirmOrder(orderId, tn);
  await topUpBalance(order.userId, order.amount, `Payment: ${order.method} #${tn}`);

  return NextResponse.json({ success: true, tradeNo: tn });
}
