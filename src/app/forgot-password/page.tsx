"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [recoveryCode, setRecoveryCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault(); setLoading(true); setMsg("");
    const res = await fetch("/api/auth/forgot-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, recoveryCode, newPassword }),
    });
    const data = await res.json();
    setLoading(false);
    if (res.ok) {
      setMsg("Password reset! Redirecting to login...");
      setTimeout(() => router.push("/"), 2000);
    } else {
      setMsg(data.error || "Reset failed");
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center">
      <form onSubmit={handleSubmit} className="w-full max-w-sm space-y-4 rounded-xl bg-white p-8 shadow">
        <h1 className="text-2xl font-bold text-center">Reset Password</h1>
        <p className="text-sm text-gray-500 text-center">Enter your email and the recovery code you saved when registering.</p>

        {msg && <p className={`text-sm text-center py-2 rounded ${msg.includes("success") || msg.includes("Reset") ? "bg-green-50 text-green-600" : "bg-red-50 text-red-600"}`}>{msg}</p>}

        <input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} className="w-full rounded border px-3 py-2" required />
        <input type="text" placeholder="Recovery Code" value={recoveryCode} onChange={e => setRecoveryCode(e.target.value)} className="w-full rounded border px-3 py-2" required />
        <input type="password" placeholder="New Password (6+ chars)" value={newPassword} onChange={e => setNewPassword(e.target.value)} className="w-full rounded border px-3 py-2" required minLength={6} />

        <button type="submit" disabled={loading} className="w-full rounded bg-black px-4 py-2 text-white hover:bg-gray-800 disabled:opacity-50">
          {loading ? "Resetting..." : "Reset Password"}
        </button>

        <p className="text-sm text-center text-gray-500"><Link href="/" className="text-blue-600 hover:underline">Back to Sign In</Link></p>
      </form>
    </div>
  );
}
