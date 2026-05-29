"use client";

import { useEffect, useState, useCallback } from "react";

interface User {
  id: string;
  email: string;
  balance: number;
  createdAt: string;
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [topUpUserId, setTopUpUserId] = useState("");
  const [topUpAmount, setTopUpAmount] = useState("");
  const [topUpDesc, setTopUpDesc] = useState("");
  const [topping, setTopping] = useState(false);

  const fetchUsers = useCallback(async () => {
    const res = await fetch("/api/admin/users");
    setUsers(await res.json());
  }, []);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  async function handleTopUp() {
    if (!topUpUserId || !topUpAmount) return;
    setTopping(true);
    await fetch("/api/admin/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId: topUpUserId, amount: Number(topUpAmount), description: topUpDesc || "Admin top-up" }),
    });
    setTopUpAmount(""); setTopUpDesc("");
    setTopping(false);
    fetchUsers();
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">User Management</h2>
      <p className="text-sm text-gray-500">All balances are in cents (1 yuan = 100 cents).</p>

      <div className="flex gap-3 items-end rounded-xl bg-gray-50 p-4">
        <div>
          <label className="block text-sm text-gray-500 mb-1">User</label>
          <select value={topUpUserId} onChange={(e) => setTopUpUserId(e.target.value)} className="rounded border px-3 py-2 text-sm w-56">
            <option value="">Select user...</option>
            {users.map((u) => (
              <option key={u.id} value={u.id}>{u.email} (balance: {u.balance})</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm text-gray-500 mb-1">Amount (cents)</label>
          <input value={topUpAmount} onChange={(e) => setTopUpAmount(e.target.value)} type="number" placeholder="10000" className="rounded border px-3 py-2 text-sm w-28" />
        </div>
        <div>
          <label className="block text-sm text-gray-500 mb-1">Note</label>
          <input value={topUpDesc} onChange={(e) => setTopUpDesc(e.target.value)} placeholder="WeChat top-up" className="rounded border px-3 py-2 text-sm w-40" />
        </div>
        <button onClick={handleTopUp} disabled={topping} className="rounded bg-green-600 px-4 py-2 text-sm text-white hover:bg-green-700 disabled:opacity-50">
          {topping ? "Processing..." : "Top Up"}
        </button>
      </div>

      <div className="rounded-xl bg-white shadow overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-gray-500 border-b">
              <th className="px-4 py-3">Email</th>
              <th className="px-4 py-3">Balance (cents)</th>
              <th className="px-4 py-3">Registered</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id} className="border-b">
                <td className="px-4 py-3">{u.email}</td>
                <td className="px-4 py-3 font-bold">{u.balance.toLocaleString()}</td>
                <td className="px-4 py-3 text-gray-500">{new Date(u.createdAt).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
