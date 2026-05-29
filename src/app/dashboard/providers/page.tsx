"use client";

import { useEffect, useState, useCallback } from "react";

interface Provider {
  id: string;
  name: string;
  apiKeyPreview: string;
  baseUrl: string | null;
  isEnabled: boolean;
}

const DEFAULT_URLS: Record<string, string> = {
  openai: "https://api.openai.com",
  anthropic: "https://api.anthropic.com",
  google: "https://generativelanguage.googleapis.com",
  deepseek: "https://api.deepseek.com",
};

export default function ProvidersPage() {
  const [providers, setProviders] = useState<Provider[]>([]);
  const [editing, setEditing] = useState<string | null>(null);
  const [apiKey, setApiKey] = useState("");
  const [baseUrl, setBaseUrl] = useState("");
  const [saving, setSaving] = useState(false);

  const fetchProviders = useCallback(async () => {
    const res = await fetch("/api/providers");
    setProviders(await res.json());
  }, []);

  useEffect(() => { fetchProviders(); }, [fetchProviders]);

  function startEdit(p: Provider) {
    setEditing(p.name);
    setApiKey("");
    setBaseUrl(p.baseUrl || DEFAULT_URLS[p.name] || "");
  }

  async function handleSave(name: string) {
    setSaving(true);
    await fetch("/api/providers", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, apiKey, baseUrl: baseUrl || null }),
    });
    setEditing(null);
    setSaving(false);
    fetchProviders();
  }

  async function handleToggle(p: Provider) {
    await fetch("/api/providers", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: p.name, apiKey: "", isEnabled: !p.isEnabled }),
    });
    fetchProviders();
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Providers</h2>

      <div className="space-y-4">
        {providers.map((p) => (
          <div key={p.id} className="rounded-xl bg-white shadow p-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold capitalize">{p.name}</h3>
                <p className="text-sm text-gray-500">{p.baseUrl || DEFAULT_URLS[p.name]}</p>
                {p.apiKeyPreview && <p className="text-sm text-gray-400">Key: {p.apiKeyPreview}</p>}
              </div>
              <div className="flex items-center gap-3">
                <span className={`px-2 py-0.5 rounded text-xs ${p.isEnabled ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>
                  {p.isEnabled ? "Enabled" : "Disabled"}
                </span>
                <button onClick={() => handleToggle(p)} className="text-xs text-blue-600 hover:underline">
                  {p.isEnabled ? "Disable" : "Enable"}
                </button>
                <button onClick={() => startEdit(p)} className="text-xs text-blue-600 hover:underline">Edit</button>
              </div>
            </div>

            {editing === p.name && (
              <div className="mt-4 space-y-3 border-t pt-4">
                <div>
                  <label className="block text-sm text-gray-500 mb-1">API Key</label>
                  <input
                    type="password"
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    placeholder="Enter API key"
                    className="w-full rounded border px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-500 mb-1">Base URL</label>
                  <input
                    value={baseUrl}
                    onChange={(e) => setBaseUrl(e.target.value)}
                    className="w-full rounded border px-3 py-2 text-sm"
                  />
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleSave(p.name)}
                    disabled={saving || !apiKey}
                    className="rounded bg-black px-4 py-2 text-sm text-white hover:bg-gray-800 disabled:opacity-50"
                  >
                    {saving ? "Saving..." : "Save"}
                  </button>
                  <button onClick={() => setEditing(null)} className="rounded border px-4 py-2 text-sm">Cancel</button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
