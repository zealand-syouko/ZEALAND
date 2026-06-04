import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/server/auth/session";
import { getAllOrders, confirmOrder, getOrderById } from "@/server/db/orders";
import { topUpBalance } from "@/server/billing";

export async function GET() {
  const _auth = await requireAdmin(); if (_auth instanceof NextResponse) return _auth;
  return NextResponse.json(await getAllOrders());
}

export async function POST(req: NextRequest) {
  const _auth = await requireAdmin(); if (_auth instanceof NextResponse) return _auth;
  const { orderId, action } = await req.json();

  if (action === "confirm") {
    const order = await getOrderById(orderId);
    if (!order) return NextResponse.json({ error: "Not found" }, { status: 404 });
    if (order.status === "paid") return NextResponse.json({ message: "Already paid" });

    const tradeNo = `admin-${Date.now()}`;
    await confirmOrder(orderId, tradeNo);
    await topUpBalance(order.userId, order.amount, `Admin confirmed: ${order.method} #${tradeNo}`);

    return NextResponse.json({ success: true });
  }

  return NextResponse.json({ error: "Unknown action" }, { status: 400 });
}
