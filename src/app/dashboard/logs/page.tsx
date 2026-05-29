"use client";

import { useEffect, useState, useCallback } from "react";

interface LogEntry {
  id: string;
  provider: string;
  model: string;
  endpoint: string;
  requestTokens: number;
  responseTokens: number;
  totalTokens: number;
  latencyMs: number;
  status: number;
  errorMessage: string | null;
  createdAt: string;
}

export default function LogsPage() {
  const [data, setData] = useState<{ logs: LogEntry[]; total: number }>({ logs: [], total: 0 });
  const [provider, setProvider] = useState("");
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);

  const fetchLogs = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (provider) params.set("provider", provider);
    if (status) params.set("status", status);
    const res = await fetch(`/api/logs?${params}`);
    setData(await res.json());
    setLoading(false);
  }, [provider, status]);

  useEffect(() => { fetchLogs(); }, [fetchLogs]);

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Call Logs</h2>

      <div className="flex gap-4">
        <select value={provider} onChange={(e) => setProvider(e.target.value)} className="rounded border px-3 py-2 text-sm">
          <option value="">All Providers</option>
          <option value="openai">OpenAI</option>
          <option value="anthropic">Anthropic</option>
          <option value="google">Google</option>
          <option value="deepseek">DeepSeek</option>
        </select>
        <select value={status} onChange={(e) => setStatus(e.target.value)} className="rounded border px-3 py-2 text-sm">
          <option value="">All Status</option>
          <option value="200">200 OK</option>
          <option value="502">502 Error</option>
          <option value="401">401 Auth Error</option>
        </select>
        <button onClick={fetchLogs} disabled={loading} className="rounded bg-black px-4 py-2 text-sm text-white hover:bg-gray-800 disabled:opacity-50">
          {loading ? "Loading..." : "Filter"}
        </button>
      </div>

      <div className="rounded-xl bg-white shadow overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-gray-500 border-b">
              <th className="px-4 py-3">Time</th>
              <th className="px-4 py-3">Provider</th>
              <th className="px-4 py-3">Model</th>
              <th className="px-4 py-3">Tokens</th>
              <th className="px-4 py-3">Latency</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Error</th>
            </tr>
          </thead>
          <tbody>
            {data.logs.map((log) => (
              <tr key={log.id} className="border-b">
                <td className="px-4 py-3 text-gray-500">{new Date(log.createdAt).toLocaleString()}</td>
                <td className="px-4 py-3 capitalize">{log.provider}</td>
                <td className="px-4 py-3 font-mono text-xs">{log.model}</td>
                <td className="px-4 py-3">{log.totalTokens.toLocaleString()}</td>
                <td className="px-4 py-3">{log.latencyMs}ms</td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-0.5 rounded text-xs ${log.status < 300 ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                    {log.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-red-500 text-xs max-w-48 truncate">{log.errorMessage || "—"}</td>
              </tr>
            ))}
            {data.logs.length === 0 && (
              <tr><td colSpan={7} className="px-4 py-6 text-center text-gray-400">No logs yet</td></tr>
            )}
          </tbody>
        </table>
      </div>
      <p className="text-sm text-gray-400">{data.total} total records</p>
    </div>
  );
}
