"use client";

import { useEffect, useState } from "react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";

interface Stats {
  today: { calls: number; tokens: number };
  week: { calls: number; tokens: number };
  activeKeys: number;
  totalKeys: number;
  byModel: { model: string; tokens: number; calls: number }[];
  transactions: { amount: number; type: string; description: string; createdAt: string }[];
}

const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899"];

export default function DashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [balance, setBalance] = useState<number>(0);

  useEffect(() => {
    fetch("/api/dashboard/stats").then((r) => r.json()).then(setStats);
    fetch("/api/dashboard/balance").then((r) => r.json()).then((d) => setBalance(d.balance));
  }, []);

  if (!stats) return <p>Loading...</p>;

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Overview</h2>

      <div className="grid grid-cols-5 gap-4">
        <StatCard label="Balance (cents)" value={balance.toLocaleString()} highlight />
        <StatCard label="Today Calls" value={stats.today.calls.toLocaleString()} />
        <StatCard label="Today Tokens" value={stats.today.tokens.toLocaleString()} />
        <StatCard label="Week Calls" value={stats.week.calls.toLocaleString()} />
        <StatCard label="Active Keys" value={`${stats.activeKeys}/${stats.totalKeys}`} />
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div className="rounded-xl bg-white p-6 shadow">
          <h3 className="font-semibold mb-4">Token Usage by Model (Week)</h3>
          {stats.byModel.length === 0 ? (
            <p className="text-gray-400 text-sm">No data</p>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie data={stats.byModel} dataKey="tokens" nameKey="model" cx="50%" cy="50%" outerRadius={100}>
                  {stats.byModel.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="rounded-xl bg-white p-6 shadow">
          <h3 className="font-semibold mb-4">Recent Transactions</h3>
          {stats.transactions.length === 0 ? (
            <p className="text-gray-400 text-sm">No transactions yet</p>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-gray-500">
                  <th className="pb-2">Time</th>
                  <th className="pb-2">Type</th>
                  <th className="pb-2">Amount</th>
                  <th className="pb-2">Detail</th>
                </tr>
              </thead>
              <tbody>
                {stats.transactions.map((t, i) => (
                  <tr key={i} className="border-t">
                    <td className="py-2 text-gray-500 text-xs">{new Date(t.createdAt).toLocaleString()}</td>
                    <td className="py-2">
                      <span className={`px-2 py-0.5 rounded text-xs ${t.type === "topup" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                        {t.type === "topup" ? "Top-up" : "Charge"}
                      </span>
                    </td>
                    <td className={`py-2 text-sm ${t.amount >= 0 ? "text-green-600" : "text-red-600"}`}>
                      {t.amount >= 0 ? "+" : ""}{t.amount}
                    </td>
                    <td className="py-2 text-xs text-gray-500 max-w-40 truncate">{t.description}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className={`rounded-xl p-4 shadow ${highlight ? "bg-black text-white" : "bg-white"}`}>
      <p className={`text-sm ${highlight ? "text-gray-300" : "text-gray-500"}`}>{label}</p>
      <p className="text-2xl font-bold">{value}</p>
    </div>
  );
}
