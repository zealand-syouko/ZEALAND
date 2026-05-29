"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function RegisterPage() {
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
        <h1 className="text-2xl font-bold text-center">Register</h1>

        {error && <p className="text-red-500 text-sm text-center">{error}</p>}

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
          placeholder="Password (6+ characters)"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full rounded border px-3 py-2"
          required
          minLength={6}
        />
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded bg-black px-4 py-2 text-white hover:bg-gray-800 disabled:opacity-50"
        >
          {loading ? "Creating..." : "Create Account"}
        </button>

        <p className="text-sm text-center text-gray-500">
          Already have an account?{" "}
          <Link href="/" className="text-blue-600 hover:underline">Sign In</Link>
        </p>
      </form>
    </div>
  );
}
