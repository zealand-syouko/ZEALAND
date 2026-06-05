"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function VerifyPage() {
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);
  const [verified, setVerified] = useState(false);
  const router = useRouter();

  async function handleSend() {
    if (!email) return;
    setLoading(true); setMsg("");
    const res = await fetch("/api/auth/verify", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email }) });
    const data = await res.json();
    setLoading(false);
    setMsg(data.message || data.error || "Error");
  }

  async function handleConfirm() {
    if (!email || !code) return;
    setLoading(true); setMsg("");
    const res = await fetch("/api/auth/verify", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email, code }) });
    const data = await res.json();
    setLoading(false);
    if (data.verified) {
      setVerified(true);
      setMsg("Email verified! Redirecting...");
      setTimeout(() => router.push("/"), 2000);
    } else {
      setMsg(data.error || "Invalid code");
    }
  }

  if (verified) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="w-full max-w-sm rounded-xl bg-white p-8 shadow text-center space-y-4">
          <h1 className="text-2xl font-bold">Verified!</h1>
          <p className="text-sm text-gray-500">Your email is verified. Redirecting to login...</p>
          <Link href="/" className="text-blue-600 underline text-sm">Sign In now</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="w-full max-w-sm space-y-4 rounded-xl bg-white p-8 shadow">
        <h1 className="text-2xl font-bold text-center">Verify Email</h1>
        <p className="text-sm text-gray-500 text-center">Enter your email to receive a verification code.</p>

        {msg && <p className="text-sm text-center py-2 rounded bg-blue-50 text-blue-800">{msg}</p>}

        <input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} className="w-full rounded border px-3 py-2" />
        <button onClick={handleSend} disabled={loading} className="w-full rounded bg-black px-4 py-2 text-white hover:bg-gray-800 disabled:opacity-50">
          {loading ? "Sending..." : "Send Code"}
        </button>

        <div className="border-t pt-4">
          <input type="text" placeholder="Verification Code" value={code} onChange={e => setCode(e.target.value)} className="w-full rounded border px-3 py-2" />
          <button onClick={handleConfirm} disabled={loading} className="w-full rounded bg-green-600 px-4 py-2 text-white hover:bg-green-700 disabled:opacity-50 mt-2">
            {loading ? "Verifying..." : "Verify"}
          </button>
        </div>

        <p className="text-sm text-center text-gray-500"><Link href="/" className="text-blue-600 hover:underline">Back to Sign In</Link></p>
      </div>
    </div>
  );
}
