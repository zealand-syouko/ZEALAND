"use client";

import { useEffect, useState, useCallback } from "react";

interface Order { id: string; userId: string; user: { email: string }; amount: number; method: string; status: string; tradeNo: string | null; paidAt: string | null; createdAt: string; }

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);

  const fetchOrders = useCallback(async () => {
    const res = await fetch("/api/admin/orders");
    setOrders(await res.json());
  }, []);

  useEffect(() => { fetchOrders(); }, [fetchOrders]);

  async function handleConfirm(orderId: string) {
    await fetch("/api/admin/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ orderId, action: "confirm" }),
    });
    fetchOrders();
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Payment Orders</h2>
      <p className="text-sm text-gray-500">Review and confirm user top-up orders. Click Confirm to credit the user balance.</p>

      <div className="rounded-xl bg-white shadow overflow-hidden">
        <table className="w-full text-sm">
          <thead><tr className="text-left text-gray-500 border-b"><th className="px-4 py-3">Order ID</th><th className="px-4 py-3">User</th><th className="px-4 py-3">Amount</th><th className="px-4 py-3">Method</th><th className="px-4 py-3">Status</th><th className="px-4 py-3">Time</th><th className="px-4 py-3">Actions</th></tr></thead>
          <tbody>
            {orders.map((o) => (
              <tr key={o.id} className="border-b">
                <td className="px-4 py-3 font-mono text-xs">{o.id.slice(0, 12)}...</td>
                <td className="px-4 py-3">{o.user?.email || o.userId.slice(0, 8)}</td>
                <td className="px-4 py-3 font-bold">¥{(o.amount / 100).toFixed(2)}</td>
                <td className="px-4 py-3 capitalize">{o.method}</td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-0.5 rounded text-xs ${o.status === "paid" ? "bg-green-100 text-green-700" : o.status === "pending" ? "bg-yellow-100 text-yellow-700" : "bg-red-100 text-red-700"}`}>
                    {o.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-gray-500 text-xs">{new Date(o.createdAt).toLocaleString()}</td>
                <td className="px-4 py-3">
                  {o.status === "pending" && (
                    <button onClick={() => handleConfirm(o.id)} className="text-green-600 hover:underline text-xs font-bold">Confirm</button>
                  )}
                </td>
              </tr>
            ))}
            {orders.length === 0 && (<tr><td colSpan={7} className="px-4 py-6 text-center text-gray-400">No orders yet</td></tr>)}
          </tbody>
        </table>
      </div>
    </div>
  );
}
