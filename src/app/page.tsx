"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const params = useSearchParams();
  const registered = params.get("registered");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    if (res.ok) {
      router.push("/dashboard");
    } else {
      setError("Invalid credentials");
    }
    setLoading(false);
  }

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-sm space-y-4 rounded-xl bg-white p-8 shadow">
      <h1 className="text-2xl font-bold text-center">Token Relay</h1>

      {registered === "1" && (
        <p className="text-green-600 text-sm text-center bg-green-50 py-2 rounded">Account created! Sign in to continue.</p>
      )}

      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="w-full rounded border px-3 py-2"
        required
      />
      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        className="w-full rounded border px-3 py-2"
        required
      />
      {error && <p className="text-red-500 text-sm">{error}</p>}
      <button
        type="submit"
        disabled={loading}
        className="w-full rounded bg-black px-4 py-2 text-white hover:bg-gray-800 disabled:opacity-50"
      >
        {loading ? "Signing in..." : "Sign In"}
      </button>

      <p className="text-sm text-center text-gray-500">
        Don&apos;t have an account?{" "}
        <Link href="/register" className="text-blue-600 hover:underline">Register</Link>
      </p>
    </form>
  );
}

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <Suspense>
        <LoginForm />
      </Suspense>
    </div>
  );
}
