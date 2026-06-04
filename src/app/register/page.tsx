"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { LanguageSwitcher } from "@/components/language-switcher";

export default function RegisterPage() {
  const t = useTranslations("register");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [recoveryCode, setRecoveryCode] = useState("");
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true); setError(""); setRecoveryCode("");
    const res = await fetch("/api/auth/register", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email, password }) });
    const data = await res.json();
    setLoading(false);
    if (res.ok) {
      setRecoveryCode(data.recoveryCode);
    } else {
      setError(data.error || "Registration failed");
    }
  }

  if (recoveryCode) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="w-full max-w-sm space-y-4 rounded-xl bg-white p-8 shadow text-center">
          <h1 className="text-2xl font-bold">Account Created</h1>
          <p className="text-sm text-gray-500">Save this recovery code — you will need it to reset your password:</p>
          <div className="rounded-lg bg-yellow-50 border border-yellow-300 p-4 font-mono text-lg font-bold break-all select-all">{recoveryCode}</div>
          <p className="text-xs text-red-500">Copy it now. It will NOT be shown again.</p>
          <button onClick={() => router.push("/?registered=1")} className="w-full rounded bg-black px-4 py-2 text-white hover:bg-gray-800">I&apos;ve saved it — Go to Login</button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center">
      <form onSubmit={handleSubmit} className="w-full max-w-sm space-y-4 rounded-xl bg-white p-8 shadow">
        <h1 className="text-2xl font-bold text-center">{t("title")}</h1>
        {error && <p className="text-red-500 text-sm text-center">{error}</p>}
        <input type="email" placeholder={t("email")} value={email} onChange={(e) => setEmail(e.target.value)} className="w-full rounded border px-3 py-2" required />
        <input type="password" placeholder={t("password")} value={password} onChange={(e) => setPassword(e.target.value)} className="w-full rounded border px-3 py-2" required minLength={6} />
        <button type="submit" disabled={loading} className="w-full rounded bg-black px-4 py-2 text-white hover:bg-gray-800 disabled:opacity-50">{loading ? t("creating") : t("create")}</button>
        <p className="text-sm text-center text-gray-500">{t("hasAccount")} <Link href="/" className="text-blue-600 hover:underline">{t("signIn")}</Link></p>
        <div className="flex justify-center pt-2 border-t"><LanguageSwitcher /></div>
      </form>
    </div>
  );
}
