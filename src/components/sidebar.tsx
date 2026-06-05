"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { LanguageSwitcher } from "@/components/language-switcher";

export function Sidebar() {
  const t = useTranslations("sidebar");
  const pathname = usePathname();
  const router = useRouter();
  const [balance, setBalance] = useState<number | null>(null);
  const [pending, setPending] = useState(0);
  const [isAdmin, setIsAdmin] = useState(false);

  const links = [
    { href: "/dashboard", label: t("overview") },
    { href: "/dashboard/keys", label: t("apiKeys") },
    { href: "/dashboard/recharge", label: t("recharge") },
  ];

  const adminLinks = [
    { href: "/dashboard/providers", label: t("providers") },
    { href: "/dashboard/logs", label: t("logs") },
    { href: "/dashboard/admin/pricing", label: t("pricing") },
    { href: "/dashboard/admin/users", label: t("users") },
    { href: "/dashboard/admin/orders", label: t("orders") + (pending > 0 ? ` (${pending})` : "") },
  ];

  useEffect(() => {
    fetch("/api/dashboard/balance").then((r) => r.json()).then((d) => setBalance(d.balance)).catch(() => {});
    fetch("/api/auth/me").then((r) => r.json()).then((d) => {
      if (d.email === "admin@tokenrelay.local") setIsAdmin(true);
    }).catch(() => {});
    fetch("/api/admin/pending-count").then((r) => { if (r.ok) r.json().then((d) => setPending(d.count)); }).catch(() => {});
  }, []);

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/");
  }

  return (
    <aside style={{ width: "14rem", minHeight: "100vh" }} className="bg-white border-r p-4 flex flex-col">
      <h1 className="text-lg font-bold mb-2">Token Relay</h1>
      {balance !== null && (
        <p className="text-xs text-gray-500 mb-4">
          {t("balance")}: <span className="font-bold text-black">${(balance / 100).toFixed(2)}</span>
        </p>
      )}

      <nav className="flex-1 space-y-1">
        {links.map((link) => (
          <Link key={link.href} href={link.href}
            className={`block px-3 py-2 rounded text-sm ${pathname === link.href ? "bg-gray-100 font-medium" : "text-gray-600 hover:bg-gray-50"}`}>
            {link.label}
          </Link>
        ))}

        {isAdmin && (
        <div className="pt-4 mt-2 border-t">
          <p className="px-3 text-xs text-gray-400 uppercase mb-1">{t("admin")}</p>
          {adminLinks.map((link) => (
            <Link key={link.href} href={link.href}
              className={`block px-3 py-2 rounded text-sm ${pathname.startsWith(link.href) ? "bg-gray-100 font-medium" : "text-gray-600 hover:bg-gray-50"}`}>
              {link.label}
            </Link>
          ))}
        </div>
        )}
      </nav>

      <div className="pt-2 border-t">
        <LanguageSwitcher className="w-full" />
      </div>

      <button onClick={handleLogout} className="mt-2 text-sm text-gray-500 hover:text-gray-700 text-left px-3 py-2">
        {t("signOut")}
      </button>
    </aside>
  );
}
