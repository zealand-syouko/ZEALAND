"use client";

import { useEffect, useState, useCallback } from "react";

interface Order { id: string; amount: number; method: string; status: string; tradeNo: string | null; createdAt: string; }

const AMOUNTS = [
  { cents: 1000, label: "¥10" },
  { cents: 5000, label: "¥50" },
  { cents: 10000, label: "¥100" },
  { cents: 50000, label: "¥500" },
  { cents: 100000, label: "¥1000" },
  { cents: 0, label: "Custom" },
];

export default function RechargePage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [amount, setAmount] = useState(10000);
  const [customAmount, setCustomAmount] = useState("");
  const [method, setMethod] = useState("manual");
  const [creating, setCreating] = useState(false);
  const [msg, setMsg] = useState("");

  const fetchOrders = useCallback(async () => {
    const res = await fetch("/api/payment/orders");
    setOrders(await res.json());
  }, []);

  useEffect(() => { fetchOrders(); }, [fetchOrders]);

  async function handleCreate() {
    const finalAmount = amount === 0 ? Number(customAmount) * 100 : amount;
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
      setMsg(`Order #${data.id.slice(0, 8)} created. Please contact admin to complete payment.`);
      fetchOrders();
    } else {
      setMsg(data.error || "Failed to create order");
    }
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Recharge</h2>
      <p className="text-sm text-gray-500">Create a top-up order and contact the administrator to complete payment.</p>

      {msg && <div className="rounded-xl bg-blue-50 border border-blue-200 p-4"><p className="text-sm text-blue-800">{msg}</p></div>}

      <div className="rounded-xl bg-white shadow p-6 space-y-4 max-w-md">
        <div>
          <label className="block text-sm text-gray-500 mb-2">Amount</label>
          <div className="grid grid-cols-3 gap-2">
            {AMOUNTS.map((a) => (
              <button
                key={a.label}
                onClick={() => setAmount(a.cents)}
                className={`py-2 px-3 rounded border text-sm ${amount === a.cents ? "bg-black text-white border-black" : "bg-white hover:bg-gray-50"}`}
              >
                {a.label}
              </button>
            ))}
          </div>
          {amount === 0 && (
            <input
              type="number"
              value={customAmount}
              onChange={(e) => setCustomAmount(e.target.value)}
              placeholder="Amount in yuan"
              className="mt-2 w-full rounded border px-3 py-2 text-sm"
            />
          )}
        </div>

        <div>
          <label className="block text-sm text-gray-500 mb-2">Payment Method</label>
          <div className="flex gap-2">
            {[
              { key: "alipay", label: "Alipay" },
              { key: "wechat", label: "WeChat Pay" },
              { key: "manual", label: "Manual Transfer" },
            ].map((m) => (
              <button
                key={m.key}
                onClick={() => setMethod(m.key)}
                className={`py-2 px-4 rounded border text-sm ${method === m.key ? "bg-black text-white border-black" : "bg-white hover:bg-gray-50"}`}
              >
                {m.label}
              </button>
            ))}
          </div>
        </div>

        <button
          onClick={handleCreate}
          disabled={creating}
          className="w-full rounded bg-green-600 px-4 py-2 text-white hover:bg-green-700 disabled:opacity-50"
        >
          {creating ? "Creating..." : `Create Top-up Order (¥${((amount === 0 ? Number(customAmount) * 100 : amount) / 100).toFixed(2)})`}
        </button>
      </div>

      <div className="rounded-xl bg-white shadow overflow-hidden">
        <table className="w-full text-sm">
          <thead><tr className="text-left text-gray-500 border-b"><th className="px-4 py-3">Order ID</th><th className="px-4 py-3">Amount</th><th className="px-4 py-3">Method</th><th className="px-4 py-3">Status</th><th className="px-4 py-3">Time</th></tr></thead>
          <tbody>
            {orders.map((o) => (
              <tr key={o.id} className="border-b">
                <td className="px-4 py-3 font-mono text-xs">{o.id.slice(0, 12)}...</td>
                <td className="px-4 py-3">¥{(o.amount / 100).toFixed(2)}</td>
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
