"use client";

import { useEffect, useState } from "react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";

interface Stats {
  today: { calls: number; tokens: number };
  week: { calls: number; tokens: number };
  activeKeys: number;
  totalKeys: number;
  byModel: { model: string; tokens: number; calls: number }[];
}

const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899"];

export default function DashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => {
    fetch("/api/dashboard/stats")
      .then((r) => r.json())
      .then(setStats);
  }, []);

  if (!stats) return <p>Loading...</p>;

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Overview</h2>

      <div className="grid grid-cols-4 gap-4">
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
          <h3 className="font-semibold mb-4">Breakdown</h3>
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-gray-500">
                <th className="pb-2">Model</th>
                <th className="pb-2">Calls</th>
                <th className="pb-2">Tokens</th>
              </tr>
            </thead>
            <tbody>
              {stats.byModel.map((m) => (
                <tr key={m.model} className="border-t">
                  <td className="py-2">{m.model}</td>
                  <td className="py-2">{m.calls}</td>
                  <td className="py-2">{m.tokens.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-white p-4 shadow">
      <p className="text-sm text-gray-500">{label}</p>
      <p className="text-2xl font-bold">{value}</p>
    </div>
  );
}
