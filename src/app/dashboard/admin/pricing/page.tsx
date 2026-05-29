"use client";

import { useEffect, useState, useCallback } from "react";

interface Pricing {
  id: string;
  model: string;
  inputPrice: number;
  outputPrice: number;
  unit: number;
}

export default function AdminPricingPage() {
  const [pricing, setPricing] = useState<Pricing[]>([]);
  const [model, setModel] = useState("");
  const [inputPrice, setInputPrice] = useState("");
  const [outputPrice, setOutputPrice] = useState("");
  const [saving, setSaving] = useState(false);

  const fetchPricing = useCallback(async () => {
    const res = await fetch("/api/admin/pricing");
    setPricing(await res.json());
  }, []);

  useEffect(() => { fetchPricing(); }, [fetchPricing]);

  async function handleSave() {
    if (!model || !inputPrice || !outputPrice) return;
    setSaving(true);
    await fetch("/api/admin/pricing", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ model, inputPrice: Number(inputPrice), outputPrice: Number(outputPrice) }),
    });
    setModel(""); setInputPrice(""); setOutputPrice("");
    setSaving(false);
    fetchPricing();
  }

  async function handleDelete(m: string) {
    await fetch("/api/admin/pricing", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ model: m }),
    });
    fetchPricing();
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Model Pricing</h2>
      <p className="text-sm text-gray-500">Prices are in cents per {pricing[0]?.unit?.toLocaleString() || "1,000,000"} tokens. Model matches by prefix (e.g., &quot;gpt&quot; matches gpt-4o, gpt-4o-mini).</p>

      <div className="flex gap-3 items-end">
        <div>
          <label className="block text-sm text-gray-500 mb-1">Model Prefix</label>
          <input value={model} onChange={(e) => setModel(e.target.value)} placeholder="gpt" className="rounded border px-3 py-2 text-sm w-32" />
        </div>
        <div>
          <label className="block text-sm text-gray-500 mb-1">Input Price</label>
          <input value={inputPrice} onChange={(e) => setInputPrice(e.target.value)} placeholder="150" type="number" className="rounded border px-3 py-2 text-sm w-24" />
        </div>
        <div>
          <label className="block text-sm text-gray-500 mb-1">Output Price</label>
          <input value={outputPrice} onChange={(e) => setOutputPrice(e.target.value)} placeholder="600" type="number" className="rounded border px-3 py-2 text-sm w-24" />
        </div>
        <button onClick={handleSave} disabled={saving} className="rounded bg-black px-4 py-2 text-sm text-white hover:bg-gray-800 disabled:opacity-50">
          {saving ? "Saving..." : "Save"}
        </button>
      </div>

      <div className="rounded-xl bg-white shadow overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-gray-500 border-b">
              <th className="px-4 py-3">Model</th>
              <th className="px-4 py-3">Input / 1M tokens</th>
              <th className="px-4 py-3">Output / 1M tokens</th>
              <th className="px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {pricing.map((p) => (
              <tr key={p.id} className="border-b">
                <td className="px-4 py-3 font-mono">{p.model}</td>
                <td className="px-4 py-3">{p.inputPrice} cents</td>
                <td className="px-4 py-3">{p.outputPrice} cents</td>
                <td className="px-4 py-3">
                  <button onClick={() => handleDelete(p.model)} className="text-red-600 hover:underline text-xs">Delete</button>
                </td>
              </tr>
            ))}
            {pricing.length === 0 && (
              <tr><td colSpan={4} className="px-4 py-6 text-center text-gray-400">No pricing configured</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
