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
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json();

    if (res.ok) {
      router.push("/?registered=1");
    } else {
      setError(data.error || "Registration failed");
    }
    setLoading(false);
  }

  return (
    <div className="flex min-h-screen items-center justify-center">
      <form onSubmit={handleSubmit} className="w-full max-w-sm space-y-4 rounded-xl bg-white p-8 shadow">
        <h1 className="text-2xl font-bold text-center">{t("title")}</h1>
        {error && <p className="text-red-500 text-sm text-center">{error}</p>}
        <input type="email" placeholder={t("email")} value={email} onChange={(e) => setEmail(e.target.value)} className="w-full rounded border px-3 py-2" required />
        <input type="password" placeholder={t("password")} value={password} onChange={(e) => setPassword(e.target.value)} className="w-full rounded border px-3 py-2" required minLength={6} />
        <button type="submit" disabled={loading} className="w-full rounded bg-black px-4 py-2 text-white hover:bg-gray-800 disabled:opacity-50">
          {loading ? t("creating") : t("create")}
        </button>
        <p className="text-sm text-center text-gray-500">
          {t("hasAccount")}{" "}
          <Link href="/" className="text-blue-600 hover:underline">{t("signIn")}</Link>
        </p>
        <div className="flex justify-center pt-2 border-t">
          <LanguageSwitcher />
        </div>
      </form>
    </div>
  );
}
