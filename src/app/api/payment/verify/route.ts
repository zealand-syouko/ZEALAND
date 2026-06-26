import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/server/auth/session";
import { prisma } from "@/server/db/client";
import { topUpBalance } from "@/server/billing";

const USDT_TRC20 = "TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t";
const WALLET_BASE58 = "TQDUt3LZHfLjReiSd8ATsuNJLKQDDLuDvA";
const TRONGRID = "https://api.trongrid.io";

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session.userId) return NextResponse.json({ error: "Login required" }, { status: 401 });

  const { orderId, txHash } = await req.json();
  if (!orderId || !txHash) return NextResponse.json({ error: "orderId and txHash required" }, { status: 400 });

  const order = await prisma.paymentOrder.findUnique({ where: { id: orderId } });
  if (!order) return NextResponse.json({ error: "Order not found" }, { status: 404 });
  if (order.userId !== session.userId) return NextResponse.json({ error: "Not your order" }, { status: 403 });
  if (order.status === "paid") return NextResponse.json({ message: "Already paid" });

  // Prevent txHash reuse
  const existing = await prisma.paymentOrder.findFirst({ where: { txHash, status: "paid", id: { not: orderId } } });
  if (existing) return NextResponse.json({ error: "This transaction hash was already used" }, { status: 409 });

  try {
    const res = await fetch(`${TRONGRID}/v1/transactions/${txHash}`);
    const data = await res.json();

    if ((data as any).Error) {
      return NextResponse.json({ error: "Transaction not found on-chain yet. Wait 30 seconds and retry." }, { status: 404 });
    }

    const rawData = (data as any).raw_data;
    const contract = rawData?.contract?.[0];
    const param = contract?.parameter;
    const value = param?.value;

    // Must be TriggerSmartContract (TRC20 transfer)
    if (param?.type_url !== "type.googleapis.com/protocol.TriggerSmartContract") {
      return NextResponse.json({ error: "Not a token transfer transaction" }, { status: 400 });
    }

    // Must be USDT contract
    if (!value?.contract_address || (value.contract_address as string).toUpperCase() !== "41" + base58ToHex(USDT_TRC20).toUpperCase()) {
      return NextResponse.json({ error: "Not a USDT (TRC20) transaction" }, { status: 400 });
    }

    // Parse TRC20 transfer: data = 0xa9059cbb + 32B to + 32B amount
    const dataHex: string = value?.data || "";
    if (!dataHex || dataHex.length < 136) {
      return NextResponse.json({ error: "Invalid transfer data" }, { status: 400 });
    }

    const toAddrHex = dataHex.slice(32, 96);
    const amountHex = dataHex.slice(96, 160);
    const walletHex = base58ToHex(WALLET_BASE58);

    // Verify recipient
    if (toAddrHex.toLowerCase().replace(/^0+/, "") !== walletHex.toLowerCase().replace(/^0+/, "")) {
      return NextResponse.json({ error: "Transfer was not sent to our wallet" }, { status: 400 });
    }

    const rawAmount = parseInt(amountHex, 16);
    // USDT TRC20 has 6 decimals → convert to cents (USD * 100)
    // rawAmount is in USDT * 1e6, divide by 1e4 to get cents
    const receivedCents = Math.floor(rawAmount / 10000);

    if (receivedCents < order.amount * 0.85) {
      return NextResponse.json({
        error: `Amount too low. Received ~$${(receivedCents / 100).toFixed(2)}, order is $${(order.amount / 100).toFixed(2)}`
      }, { status: 400 });
    }

    // Confirm!
    const tradeNo = txHash.slice(0, 20);
    await prisma.paymentOrder.update({
      where: { id: orderId },
      data: { status: "paid", txHash, tradeNo, paidAt: new Date() },
    });
    await topUpBalance(order.userId, order.amount, `USDT verified: ${tradeNo}`);

    return NextResponse.json({ success: true, credited: order.amount });
  } catch (e) {
    return NextResponse.json({ error: "Network error verifying transaction. Try again." }, { status: 500 });
  }
}

// base58 → hex (no external library dependency at runtime)
function base58ToHex(b58: string): string {
  const ALPHABET = "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz";
  const bytes: number[] = [];
  for (let i = 0; i < b58.length; i++) {
    let carry = ALPHABET.indexOf(b58[i]);
    if (carry < 0) continue;
    for (let j = 0; j < bytes.length; j++) {
      carry += bytes[j] * 58;
      bytes[j] = carry & 0xff;
      carry >>= 8;
    }
    while (carry > 0) { bytes.push(carry & 0xff); carry >>= 8; }
  }
  // Add leading zeros
  for (let i = 0; i < b58.length && b58[i] === "1"; i++) bytes.push(0);
  bytes.reverse();
  // Remove 4-byte checksum
  return bytes.slice(0, -4).map(b => b.toString(16).padStart(2, "0")).join("");
}
