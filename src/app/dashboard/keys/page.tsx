"use client";

import { useEffect, useState, useCallback } from "react";
import { useTranslations } from "next-intl";

interface ApiKey {
  id: string; name: string; keyPrefix: string; totalQuota: number | null;
  usedQuota: number; isActive: boolean; expiresAt: string | null; createdAt: string;
}

export default function KeysPage() {
  const t = useTranslations("keys");
  const [keys, setKeys] = useState<ApiKey[]>([]);
  const [newKey, setNewKey] = useState<string | null>(null);
  const [name, setName] = useState("Default");
  const [loading, setLoading] = useState(false);

  const fetchKeys = useCallback(async () => { const res = await fetch("/api/keys"); setKeys(await res.json()); }, []);
  useEffect(() => { fetchKeys(); }, [fetchKeys]);

  async function handleCreate() { setLoading(true); const res = await fetch("/api/keys", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name }) }); const data = await res.json(); setNewKey(data.key); setName("Default"); setLoading(false); fetchKeys(); }
  async function handleToggle(key: ApiKey) { await fetch("/api/keys", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: key.id, isActive: !key.isActive }) }); fetchKeys(); }
  async function handleDelete(id: string) { await fetch("/api/keys", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id }) }); fetchKeys(); }
  function quotaPercent(key: ApiKey) { if (!key.totalQuota) return 0; return Math.min(100, Math.round((key.usedQuota / key.totalQuota) * 100)); }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">{t("title")}</h2>
      {newKey && (
        <div className="rounded-xl bg-green-50 border border-green-200 p-4">
          <p className="text-sm font-medium text-green-800">{t("newKeyBanner")}</p>
          <code className="mt-1 block bg-white px-3 py-2 rounded border text-sm break-all">{newKey}</code>
          <button onClick={() => setNewKey(null)} className="mt-2 text-sm text-green-700 underline">{t("dismiss")}</button>
        </div>
      )}
      <div className="flex gap-3 items-end">
        <div><label className="block text-sm text-gray-500 mb-1">{t("keyName")}</label><input value={name} onChange={(e) => setName(e.target.value)} className="rounded border px-3 py-2 text-sm w-48" /></div>
        <button onClick={handleCreate} disabled={loading} className="rounded bg-black px-4 py-2 text-sm text-white hover:bg-gray-800 disabled:opacity-50">{loading ? t("creating") : t("createKey")}</button>
      </div>
      <div className="rounded-xl bg-white shadow overflow-hidden">
        <table className="w-full text-sm">
          <thead><tr className="text-left text-gray-500 border-b"><th className="px-4 py-3">{t("name")}</th><th className="px-4 py-3">{t("prefix")}</th><th className="px-4 py-3">{t("quota")}</th><th className="px-4 py-3">{t("status")}</th><th className="px-4 py-3">{t("created")}</th><th className="px-4 py-3">{t("actions")}</th></tr></thead>
          <tbody>
            {keys.map((key) => (
              <tr key={key.id} className="border-b">
                <td className="px-4 py-3">{key.name}</td>
                <td className="px-4 py-3 font-mono text-gray-500">{key.keyPrefix}...</td>
                <td className="px-4 py-3">{key.totalQuota ? `${key.usedQuota.toLocaleString()} / ${key.totalQuota.toLocaleString()}` : t("unlimited")}{key.totalQuota && (<div className="w-24 h-1 bg-gray-200 rounded mt-1"><div className="h-1 bg-blue-500 rounded" style={{ width: `${quotaPercent(key)}%` }} /></div>)}</td>
                <td className="px-4 py-3"><span className={`px-2 py-0.5 rounded text-xs ${key.isActive ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>{key.isActive ? t("active") : t("disabled")}</span></td>
                <td className="px-4 py-3 text-gray-500">{new Date(key.createdAt).toLocaleDateString()}</td>
                <td className="px-4 py-3 space-x-2">
                  <button onClick={() => handleToggle(key)} className="text-blue-600 hover:underline text-xs">{key.isActive ? t("disable") : t("enable")}</button>
                  <button onClick={() => handleDelete(key.id)} className="text-red-600 hover:underline text-xs">{t("delete")}</button>
                </td>
              </tr>
            ))}
            {keys.length === 0 && (<tr><td colSpan={6} className="px-4 py-6 text-center text-gray-400">{t("noKeys")}</td></tr>)}
          </tbody>
        </table>
      </div>
    </div>
  );
}
