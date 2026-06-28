"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface OnboardingState { hasKeys: boolean; hasBalance: boolean; hasCalls: boolean; }

export function Onboarding() {
  const [state, setState] = useState<OnboardingState | null>(null);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    const d = localStorage.getItem("onboarding-dismissed");
    if (d) { setDismissed(true); return; }
    Promise.all([
      fetch("/api/keys").then(r => r.json()),
      fetch("/api/dashboard/balance").then(r => r.json()),
      fetch("/api/dashboard/stats").then(r => r.json()),
    ]).then(([keys, bal, stats]) => {
      setState({
        hasKeys: Array.isArray(keys) && keys.length > 0,
        hasBalance: bal.balance > 0,
        hasCalls: stats.today?.calls > 0 || stats.week?.calls > 0,
      });
    }).catch(() => {});
  }, []);

  function dismiss() {
    localStorage.setItem("onboarding-dismissed", "1");
    setDismissed(true);
  }

  if (!state || dismissed) return null;
  // All done, nothing to guide
  if (state.hasKeys && state.hasBalance && state.hasCalls) return null;

  const steps = [
    { done: state.hasKeys, label: "Create an API Key", href: "/dashboard/keys", desc: "Go to API Keys and click Create Key" },
    { done: state.hasBalance, label: "Add funds to your account", href: "/dashboard/recharge", desc: "Recharge with USDT to start making API calls" },
    { done: state.hasCalls, label: "Make your first API call", href: "/docs", desc: "Use the API docs to send your first request" },
  ];

  const done = steps.filter(s => s.done).length;

  if (done === 3) return null;

  return (
    <div className="rounded-xl bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-bold text-lg text-blue-900">Getting Started</h3>
          <p className="text-sm text-blue-700">{done}/3 steps completed</p>
        </div>
        <button onClick={dismiss} className="text-sm text-blue-500 hover:text-blue-700 underline">Dismiss</button>
      </div>
      <div className="grid grid-cols-3 gap-4">
        {steps.map((step, i) => (
          <Link key={i} href={step.href} className={`rounded-lg p-4 border text-center transition ${step.done ? "bg-green-50 border-green-200" : "bg-white border-gray-200 hover:border-blue-300"}`}>
            <div className={`text-2xl mb-1 ${step.done ? "" : "opacity-50"}`}>{step.done ? "✓" : i + 1}</div>
            <div className={`font-medium text-sm ${step.done ? "text-green-700" : "text-gray-800"}`}>{step.label}</div>
            {!step.done && <div className="text-xs text-gray-500 mt-1">{step.desc}</div>}
          </Link>
        ))}
      </div>
    </div>
  );
}
