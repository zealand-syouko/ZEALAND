"use client";

import { useEffect, useState, useCallback } from "react";
import { useTranslations } from "next-intl";
import { AdminGuard } from "@/components/admin-guard";

interface User { id: string; email: string; balance: number; createdAt: string; }

export default function AdminUsersPage() {
  const t = useTranslations("admin.users");
  const [users, setUsers] = useState<User[]>([]);
  const [topUpUserId, setTopUpUserId] = useState(""); const [topUpAmount, setTopUpAmount] = useState("");
  const [topUpDesc, setTopUpDesc] = useState(""); const [topping, setTopping] = useState(false);

  const fetchUsers = useCallback(async () => { const res = await fetch("/api/admin/users"); setUsers(await res.json()); }, []);
  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  async function handleTopUp() { if (!topUpUserId || !topUpAmount) return; setTopping(true); await fetch("/api/admin/users", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ userId: topUpUserId, amount: Number(topUpAmount), description: topUpDesc || "Admin top-up" }) }); setTopUpAmount(""); setTopUpDesc(""); setTopping(false); fetchUsers(); }

  return (
    <AdminGuard>
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">{t("title")}</h2>
      <p className="text-sm text-gray-500">{t("desc")}</p>
      <div className="flex gap-3 items-end rounded-xl bg-gray-50 p-4">
        <div><label className="block text-sm text-gray-500 mb-1">{t("email")}</label><select value={topUpUserId} onChange={(e) => setTopUpUserId(e.target.value)} className="rounded border px-3 py-2 text-sm w-56"><option value="">{t("selectUser")}</option>{users.map((u) => (<option key={u.id} value={u.id}>{u.email} (balance: {u.balance})</option>))}</select></div>
        <div><label className="block text-sm text-gray-500 mb-1">{t("amount")}</label><input value={topUpAmount} onChange={(e) => setTopUpAmount(e.target.value)} type="number" placeholder="10000" className="rounded border px-3 py-2 text-sm w-28" /></div>
        <div><label className="block text-sm text-gray-500 mb-1">{t("note")}</label><input value={topUpDesc} onChange={(e) => setTopUpDesc(e.target.value)} placeholder="WeChat top-up" className="rounded border px-3 py-2 text-sm w-40" /></div>
        <button onClick={handleTopUp} disabled={topping} className="rounded bg-green-600 px-4 py-2 text-sm text-white hover:bg-green-700 disabled:opacity-50">{topping ? t("processing") : t("topUp")}</button>
      </div>

      {/* Password Reset */}
      <div className="rounded-xl bg-gray-50 p-4 space-y-2 max-w-md">
        <h3 className="font-bold text-sm">Reset User Password</h3>
        <div className="flex gap-2 items-end">
          <div className="flex-1">
            <label className="block text-xs text-gray-500 mb-1">User</label>
            <select id="resetUser" className="rounded border px-3 py-2 text-sm w-full">
              <option value="">Select user...</option>
              {users.map((u) => (<option key={u.id} value={u.id}>{u.email}</option>))}
            </select>
          </div>
          <div className="flex-1">
            <label className="block text-xs text-gray-500 mb-1">New Password</label>
            <input id="resetPass" type="text" placeholder="6+ chars" className="rounded border px-3 py-2 text-sm w-full" />
          </div>
          <button onClick={async () => {
            const uid = (document.getElementById("resetUser") as HTMLSelectElement).value;
            const pw = (document.getElementById("resetPass") as HTMLInputElement).value;
            if (!uid || !pw) return alert("Select user and enter new password");
            await fetch("/api/admin/reset-password", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ userId: uid, newPassword: pw }) });
            alert("Password reset!");
            (document.getElementById("resetPass") as HTMLInputElement).value = "";
          }} className="rounded bg-orange-500 px-4 py-2 text-sm text-white hover:bg-orange-600">Reset</button>
        </div>
      </div>

      <div className="rounded-xl bg-white shadow overflow-hidden">
        <table className="w-full text-sm">
          <thead><tr className="text-left text-gray-500 border-b"><th className="px-4 py-3">{t("email")}</th><th className="px-4 py-3">{t("balance")}</th><th className="px-4 py-3">Verified</th><th className="px-4 py-3">{t("registered")}</th><th className="px-4 py-3"></th></tr></thead>
          <tbody>{users.map((u) => (<tr key={u.id} className="border-b"><td className="px-4 py-3">{u.email}</td><td className="px-4 py-3 font-bold">{u.balance.toLocaleString()}</td><td className="px-4 py-3 text-gray-500">{new Date(u.createdAt).toLocaleDateString()}</td><td className="px-4 py-3">{u.email !== "admin@tokenrelay.local" && <button onClick={async () => { if (confirm('Delete user ' + u.email + '?')) { await fetch('/api/admin/users', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ userId: u.id }) }); fetchUsers(); } }} className="text-red-500 hover:underline text-xs">Delete</button>}</td></tr>))}</tbody>
        </table>
      </div>
    </div>
    </AdminGuard>
  );
}
