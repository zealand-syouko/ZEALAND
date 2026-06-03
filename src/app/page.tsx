"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { LanguageSwitcher } from "@/components/language-switcher";

function LoginForm() {
  const t = useTranslations("login");
  const router = useRouter();
  const params = useSearchParams();
  const registered = params.get("registered");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true); setError("");
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    if (res.ok) { router.push("/dashboard"); }
    else { setError(t("invalid")); }
    setLoading(false);
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
      {/* Hero */}
      <div className="max-w-4xl mx-auto px-6 pt-20 pb-12 text-center">
        <h1 className="text-5xl font-bold mb-4">Token Relay</h1>
        <p className="text-xl text-gray-600 mb-2">One API Key, All AI Models</p>
        <p className="text-gray-500 mb-8">DeepSeek · GPT · Claude · Gemini. No credit card needed.</p>

        <div className="flex justify-center gap-4 mb-12">
          <Link href="/register" className="rounded-full bg-black px-8 py-3 text-white font-medium hover:bg-gray-800">Get Started Free</Link>
          <a href="#pricing" className="rounded-full border px-8 py-3 font-medium hover:bg-gray-50">View Pricing</a>
        </div>
      </div>

      {/* Pricing */}
      <div id="pricing" className="max-w-4xl mx-auto px-6 pb-20">
        <h2 className="text-3xl font-bold text-center mb-10">Pricing</h2>
        <div className="grid grid-cols-2 gap-6 max-w-2xl mx-auto">
          <div className="rounded-xl bg-white p-6 shadow text-center">
            <h3 className="font-bold text-lg mb-1">DeepSeek Chat</h3>
            <p className="text-sm text-gray-500 mb-3">deepseek-chat / deepseek-reasoner</p>
            <p className="text-3xl font-bold">$0.06<span className="text-sm text-gray-400">/1M tokens</span></p>
            <p className="text-xs text-gray-400 mt-1">output</p>
          </div>
          <div className="rounded-xl bg-white p-6 shadow text-center">
            <h3 className="font-bold text-lg mb-1">GPT / Claude</h3>
            <p className="text-sm text-gray-500 mb-3">Coming soon</p>
            <p className="text-3xl font-bold">—</p>
          </div>
        </div>
      </div>

      {/* Usage */}
      <div className="max-w-2xl mx-auto px-6 pb-20">
        <h2 className="text-3xl font-bold text-center mb-8">How to use</h2>
        <div className="rounded-xl bg-gray-900 p-6 text-white font-mono text-sm overflow-x-auto">
          <pre>{`curl https://zealand-delta.vercel.app/api/proxy \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{"model":"deepseek-chat","messages":[{"role":"user","content":"Hello"}],"stream":false}'`}</pre>
        </div>
        <p className="text-center text-gray-500 mt-4 text-sm">OpenAI-compatible. Works with any ChatGPT client.</p>
      </div>

      {/* Login */}
      <div className="max-w-lg mx-auto px-6 pb-20" id="login">
        <form onSubmit={handleSubmit} className="rounded-xl bg-white p-8 shadow space-y-4">
          <h3 className="text-xl font-bold text-center">Sign In</h3>
          {registered === "1" && (<p className="text-green-600 text-sm text-center bg-green-50 py-2 rounded">{t("registered")}</p>)}
          <input type="email" placeholder={t("email")} value={email} onChange={e => setEmail(e.target.value)} className="w-full rounded border px-3 py-2" required />
          <input type="password" placeholder={t("password")} value={password} onChange={e => setPassword(e.target.value)} className="w-full rounded border px-3 py-2" required />
          {error && <p className="text-red-500 text-sm">{error}</p>}
          <button type="submit" disabled={loading} className="w-full rounded bg-black px-4 py-2 text-white hover:bg-gray-800 disabled:opacity-50">{loading ? t("signingIn") : t("signIn")}</button>
          <p className="text-sm text-center text-gray-500">{t("noAccount")} <Link href="/register" className="text-blue-600 hover:underline">{t("register")}</Link></p>
          <div className="flex justify-center pt-2 border-t"><LanguageSwitcher /></div>
        </form>
      </div>

      <footer className="text-center pb-8 text-sm text-gray-400">Token Relay &copy; 2026</footer>
    </div>
  );
}

export default function LoginPage() {
  return <Suspense><LoginForm /></Suspense>;
}
