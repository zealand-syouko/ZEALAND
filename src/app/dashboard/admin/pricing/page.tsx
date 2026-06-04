"use client";

import { useEffect, useState, useCallback } from "react";
import { useTranslations } from "next-intl";
import { AdminGuard } from "@/components/admin-guard";

interface Pricing { id: string; model: string; inputPrice: number; outputPrice: number; unit: number; }

export default function AdminPricingPage() {
  const t = useTranslations("admin.pricing");
  const [pricing, setPricing] = useState<Pricing[]>([]);
  const [model, setModel] = useState(""); const [inputPrice, setInputPrice] = useState("");
  const [outputPrice, setOutputPrice] = useState(""); const [saving, setSaving] = useState(false);

  const fetchPricing = useCallback(async () => { const res = await fetch("/api/admin/pricing"); setPricing(await res.json()); }, []);
  useEffect(() => { fetchPricing(); }, [fetchPricing]);

  async function handleSave() { if (!model || !inputPrice || !outputPrice) return; setSaving(true); await fetch("/api/admin/pricing", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ model, inputPrice: Number(inputPrice), outputPrice: Number(outputPrice) }) }); setModel(""); setInputPrice(""); setOutputPrice(""); setSaving(false); fetchPricing(); }
  async function handleDelete(m: string) { await fetch("/api/admin/pricing", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ model: m }) }); fetchPricing(); }

  return (
    <AdminGuard>
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">{t("title")}</h2>
      <p className="text-sm text-gray-500">{t("desc")}</p>
      <div className="flex gap-3 items-end">
        <div><label className="block text-sm text-gray-500 mb-1">{t("modelPrefix")}</label><input value={model} onChange={(e) => setModel(e.target.value)} placeholder="gpt" className="rounded border px-3 py-2 text-sm w-32" /></div>
        <div><label className="block text-sm text-gray-500 mb-1">{t("inputPrice")}</label><input value={inputPrice} onChange={(e) => setInputPrice(e.target.value)} placeholder="150" type="number" className="rounded border px-3 py-2 text-sm w-24" /></div>
        <div><label className="block text-sm text-gray-500 mb-1">{t("outputPrice")}</label><input value={outputPrice} onChange={(e) => setOutputPrice(e.target.value)} placeholder="600" type="number" className="rounded border px-3 py-2 text-sm w-24" /></div>
        <button onClick={handleSave} disabled={saving} className="rounded bg-black px-4 py-2 text-sm text-white hover:bg-gray-800 disabled:opacity-50">{saving ? t("saving") : t("save")}</button>
      </div>
      <div className="rounded-xl bg-white shadow overflow-hidden">
        <table className="w-full text-sm" suppressHydrationWarning>
          <thead><tr className="text-left text-gray-500 border-b"><th className="px-4 py-3">{t("model")}</th><th className="px-4 py-3">{t("inputPerM")}</th><th className="px-4 py-3">{t("outputPerM")}</th><th className="px-4 py-3">{t("actions")}</th></tr></thead>
          <tbody>
            {pricing.map((p) => (
              <tr key={p.id} className="border-b">
                <td className="px-4 py-3 font-mono">{p.model}</td>
                <td className="px-4 py-3">{p.inputPrice} cents</td>
                <td className="px-4 py-3">{p.outputPrice} cents</td>
                <td className="px-4 py-3"><button onClick={() => handleDelete(p.model)} className="text-red-600 hover:underline text-xs">{t("delete")}</button></td>
              </tr>
            ))}
            {pricing.length === 0 && (<tr><td colSpan={4} className="px-4 py-6 text-center text-gray-400">{t("noPricing")}</td></tr>)}
          </tbody>
        </table>
      </div>
    </div>
    </AdminGuard>
  );
}
