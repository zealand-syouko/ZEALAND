"use client";

import { useEffect, useState, useCallback } from "react";

interface Order { id: string; amount: number; method: string; status: string; tradeNo: string | null; createdAt: string; }

const AMOUNTS = [
  { cents: 500, label: "$5" },
  { cents: 2500, label: "$25" },
  { cents: 5000, label: "$50" },
  { cents: 25000, label: "$250" },
  { cents: 0, label: "Custom" },
];

const PAYMENT_INFO: Record<string, { label: string; address: string; note: string }> = {
  paypal: { label: "PayPal", address: "YOUR_PAYPAL_EMAIL@example.com", note: "Send payment to this PayPal address. Include your Order ID in the note." },
  crypto: { label: "USDT (TRC20)", address: "TQDUt3LZHfLjReiSd8ATsuNJLKQDDLuDvA", note: "Send USDT via TRC20 network. Include Order ID in memo if available." },
};

export default function RechargePage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [amount, setAmount] = useState(5000);
  const [customAmount, setCustomAmount] = useState("");
  const [method, setMethod] = useState("paypal");
  const [creating, setCreating] = useState(false);
  const [msg, setMsg] = useState("");
  const [activeOrder, setActiveOrder] = useState<string | null>(null);
  const [activeMethod, setActiveMethod] = useState("");

  const fetchOrders = useCallback(async () => {
    const res = await fetch("/api/payment/orders");
    setOrders(await res.json());
  }, []);

  useEffect(() => { fetchOrders(); }, [fetchOrders]);

  async function handleCreate() {
    const finalAmount = amount === 0 ? Math.round(Number(customAmount) * 100) : amount;
    if (finalAmount <= 0) return;
    setCreating(true); setMsg("");
    const res = await fetch("/api/payment/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ amount: finalAmount, method }),
    });
    const data = await res.json();
    setCreating(false);
    if (res.ok) {
      setActiveOrder(data.id);
      setActiveMethod(method);
      setMsg(`Order #${data.id.slice(0, 8)} created`);
      fetchOrders();
    } else {
      setMsg(data.error || "Failed to create order");
    }
  }

  const info = PAYMENT_INFO[activeMethod];

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Recharge</h2>

      {msg && !info && <div className="rounded-xl bg-blue-50 border border-blue-200 p-4"><p className="text-sm text-blue-800">{msg}</p></div>}

      {activeOrder && info && (
        <div className="rounded-xl bg-yellow-50 border border-yellow-300 p-6 space-y-3 max-w-md">
          <h3 className="font-bold text-lg">Complete Payment</h3>
          <p className="text-sm text-gray-700">Order: <code className="bg-white px-2 py-0.5 rounded text-xs">{activeOrder}</code></p>
          <div className="bg-white rounded p-4 border">
            <p className="text-sm font-bold">{info.label}</p>
            <p className="text-xl font-mono mt-1 break-all">{info.address}</p>
            <p className="text-xs text-gray-500 mt-2">{info.note}</p>
          </div>
          <p className="text-xs text-gray-500">After sending payment, the admin will confirm your order and your balance will be credited.</p>
          <button onClick={() => { setActiveOrder(null); setActiveMethod(""); }} className="text-sm text-blue-600 underline">Close</button>
        </div>
      )}

      <div className="rounded-xl bg-white shadow p-6 space-y-4 max-w-md">
        <div>
          <label className="block text-sm text-gray-500 mb-2">Amount (USD)</label>
          <div className="grid grid-cols-2 gap-2">
            {AMOUNTS.map((a) => (
              <button key={a.label} onClick={() => setAmount(a.cents)}
                className={`py-2 px-3 rounded border text-sm ${amount === a.cents ? "bg-black text-white border-black" : "bg-white hover:bg-gray-50"}`}>
                {a.label}
              </button>
            ))}
          </div>
          {amount === 0 && (
            <input type="number" value={customAmount} onChange={(e) => setCustomAmount(e.target.value)}
              placeholder="Amount in USD" className="mt-2 w-full rounded border px-3 py-2 text-sm" />
          )}
        </div>

        <div>
          <label className="block text-sm text-gray-500 mb-2">Payment Method</label>
          <div className="flex gap-2">
            {[{ key: "paypal", label: "PayPal" }, { key: "crypto", label: "Crypto (USDT)" }].map((m) => (
              <button key={m.key} onClick={() => setMethod(m.key)}
                className={`py-2 px-4 rounded border text-sm ${method === m.key ? "bg-black text-white border-black" : "bg-white hover:bg-gray-50"}`}>
                {m.label}
              </button>
            ))}
          </div>
        </div>

        <button onClick={handleCreate} disabled={creating}
          className="w-full rounded bg-green-600 px-4 py-2 text-white hover:bg-green-700 disabled:opacity-50">
          {creating ? "Creating..." : `Create Order ($${((amount === 0 ? Number(customAmount) * 100 : amount) / 100).toFixed(2)})`}
        </button>
      </div>

      <div className="rounded-xl bg-white shadow overflow-hidden">
        <table className="w-full text-sm">
          <thead><tr className="text-left text-gray-500 border-b"><th className="px-4 py-3">Order ID</th><th className="px-4 py-3">Amount</th><th className="px-4 py-3">Method</th><th className="px-4 py-3">Status</th><th className="px-4 py-3">Time</th></tr></thead>
          <tbody>
            {orders.map((o) => (
              <tr key={o.id} className="border-b">
                <td className="px-4 py-3 font-mono text-xs">{o.id.slice(0, 12)}...</td>
                <td className="px-4 py-3">${(o.amount / 100).toFixed(2)}</td>
                <td className="px-4 py-3 capitalize">{o.method}</td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-0.5 rounded text-xs ${o.status === "paid" ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"}`}>
                    {o.status === "paid" ? "Paid" : "Pending"}
                  </span>
                </td>
                <td className="px-4 py-3 text-gray-500 text-xs">{new Date(o.createdAt).toLocaleString()}</td>
              </tr>
            ))}
            {orders.length === 0 && (<tr><td colSpan={5} className="px-4 py-6 text-center text-gray-400">No orders yet</td></tr>)}
          </tbody>
        </table>
      </div>
    </div>
  );
}
