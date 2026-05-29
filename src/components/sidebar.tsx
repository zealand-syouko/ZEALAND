"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

const links = [
  { href: "/dashboard", label: "Overview" },
  { href: "/dashboard/keys", label: "API Keys" },
  { href: "/dashboard/providers", label: "Providers" },
  { href: "/dashboard/logs", label: "Logs" },
];

const adminLinks = [
  { href: "/dashboard/admin/pricing", label: "Pricing" },
  { href: "/dashboard/admin/users", label: "Users" },
];

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [balance, setBalance] = useState<number | null>(null);

  useEffect(() => {
    fetch("/api/dashboard/balance").then((r) => r.json()).then((d) => setBalance(d.balance)).catch(() => {});
  }, []);

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/");
  }

  return (
    <aside className="w-56 bg-white border-r min-h-screen p-4 flex flex-col">
      <h1 className="text-lg font-bold mb-2">Token Relay</h1>
      {balance !== null && (
        <p className="text-xs text-gray-500 mb-4">
          Balance: <span className="font-bold text-black">{balance.toLocaleString()}</span> cents
        </p>
      )}

      <nav className="flex-1 space-y-1">
        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className={`block px-3 py-2 rounded text-sm ${
              pathname === link.href ? "bg-gray-100 font-medium" : "text-gray-600 hover:bg-gray-50"
            }`}
          >
            {link.label}
          </Link>
        ))}

        <div className="pt-4 mt-2 border-t">
          <p className="px-3 text-xs text-gray-400 uppercase mb-1">Admin</p>
          {adminLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`block px-3 py-2 rounded text-sm ${
                pathname.startsWith(link.href) ? "bg-gray-100 font-medium" : "text-gray-600 hover:bg-gray-50"
              }`}
            >
              {link.label}
            </Link>
          ))}
        </div>
      </nav>

      <button
        onClick={handleLogout}
        className="mt-auto text-sm text-gray-500 hover:text-gray-700 text-left px-3 py-2"
      >
        Sign Out
      </button>
    </aside>
  );
}
