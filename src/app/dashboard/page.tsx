"use client";

import { useEffect, useState } from "react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import { useTranslations } from "next-intl";
import Link from "next/link";

interface Stats {
  today: { calls: number; tokens: number };
  week: { calls: number; tokens: number };
  activeKeys: number;
  totalKeys: number;
  byModel: { model: string; tokens: number; calls: number }[];
  transactions: { amount: number; type: string; description: string; createdAt: string }[];
}

interface Revenue { revenue: { today: number; week: number; month: number; total: number; totalTopUps: number }; users: number; pendingOrders: number; }

const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899"];

export default function DashboardPage() {
  const t = useTranslations("dashboard");
  const [stats, setStats] = useState<Stats | null>(null);
  const [balance, setBalance] = useState<number>(0);
  const [rev, setRev] = useState<Revenue | null>(null);
  const [pubStats, setPubStats] = useState<{ totalUsers: number; totalTokens: number } | null>(null);

  useEffect(() => {
    fetch("/api/dashboard/stats").then((r) => r.json()).then(setStats);
    fetch("/api/dashboard/balance").then((r) => r.json()).then((d) => setBalance(d.balance));
    fetch("/api/admin/revenue").then((r) => { if (r.ok) r.json().then(setRev); }).catch(() => {});
    fetch("/api/dashboard/public-stats").then((r) => r.json()).then(setPubStats);
  }, []);

  if (!stats) return <p>{t("loading")}</p>;

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">{t("overview")}</h2>

      {balance === 0 && (
        <div className="rounded-xl bg-red-50 border border-red-300 p-4">
          <p className="font-bold text-red-800">Your balance is $0. API calls will be rejected. <Link href="/dashboard/recharge" className="underline">Recharge now</Link>.</p>
        </div>
      )}
      {balance > 0 && balance < 100 && (
        <div className="rounded-xl bg-yellow-50 border border-yellow-300 p-4">
          <p className="font-bold text-yellow-800">Low balance ({balance} cents). <Link href="/dashboard/recharge" className="underline">Recharge</Link> to avoid interruption.</p>
        </div>
      )}

      {rev && rev.pendingOrders > 0 && (
        <Link href="/dashboard/admin/orders" className="block rounded-xl bg-yellow-50 border border-yellow-300 p-4 hover:bg-yellow-100">
          <p className="font-bold text-yellow-800">{rev.pendingOrders} pending order{rev.pendingOrders > 1 ? 's' : ''} — click to confirm</p>
        </Link>
      )}

      {pubStats && (
        <div className="grid grid-cols-2 gap-4">
          <StatCard label="Total Users" value={pubStats.totalUsers.toLocaleString()} />
          <StatCard label="Total Tokens Served" value={pubStats.totalTokens.toLocaleString()} />
        </div>
      )}

      <div className="grid grid-cols-4 gap-4">
        <StatCard label={t("balance")} value={balance.toLocaleString()} highlight />
        <StatCard label={t("todayCalls")} value={stats.today.calls.toLocaleString()} />
        <StatCard label={t("todayTokens")} value={stats.today.tokens.toLocaleString()} />
        <StatCard label={t("activeKeys")} value={`${stats.activeKeys}/${stats.totalKeys}`} />
      </div>

      {rev && (
        <div className="grid grid-cols-4 gap-4">
          <StatCard label="Revenue Today" value={`$${(rev.revenue.today / 100).toFixed(2)}`} />
          <StatCard label="Revenue This Week" value={`$${(rev.revenue.week / 100).toFixed(2)}`} />
          <StatCard label="Revenue This Month" value={`$${(rev.revenue.month / 100).toFixed(2)}`} />
          <StatCard label="Total Users" value={rev.users.toString()} />
        </div>
      )}

      <div className="grid grid-cols-2 gap-6">
        <div className="rounded-xl bg-white p-6 shadow">
          <h3 className="font-semibold mb-4">{t("tokenUsage")}</h3>
          {stats.byModel.length === 0 ? (
            <p className="text-gray-400 text-sm">{t("noData")}</p>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie data={stats.byModel} dataKey="tokens" nameKey="model" cx="50%" cy="50%" outerRadius={100}>
                  {stats.byModel.map((_, i) => (<Cell key={i} fill={COLORS[i % COLORS.length]} />))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="rounded-xl bg-white p-6 shadow">
          <h3 className="font-semibold mb-4">{t("recentTransactions")}</h3>
          {stats.transactions.length === 0 ? (
            <p className="text-gray-400 text-sm">{t("noTransactions")}</p>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-gray-500">
                  <th className="pb-2">{t("time")}</th>
                  <th className="pb-2">{t("type")}</th>
                  <th className="pb-2">{t("amount")}</th>
                  <th className="pb-2">{t("detail")}</th>
                </tr>
              </thead>
              <tbody>
                {stats.transactions.map((tx, i) => (
                  <tr key={i} className="border-t">
                    <td className="py-2 text-gray-500 text-xs">{new Date(tx.createdAt).toLocaleString()}</td>
                    <td className="py-2">
                      <span className={`px-2 py-0.5 rounded text-xs ${tx.type === "topup" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                        {tx.type === "topup" ? t("topup") : t("charge")}
                      </span>
                    </td>
                    <td className={`py-2 text-sm ${tx.amount >= 0 ? "text-green-600" : "text-red-600"}`}>
                      {tx.amount >= 0 ? "+" : ""}{tx.amount}
                    </td>
                    <td className="py-2 text-xs text-gray-500 max-w-40 truncate">{tx.description}</td>
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
