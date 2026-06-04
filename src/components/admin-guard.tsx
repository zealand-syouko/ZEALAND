"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export function AdminGuard({ children }: { children: React.ReactNode }) {
  const [ok, setOk] = useState(false);
  const router = useRouter();

  useEffect(() => {
    fetch("/api/admin/pending-count")
      .then((r) => {
        if (r.ok) { setOk(true); }
        else { router.push("/dashboard"); }
      })
      .catch(() => router.push("/dashboard"));
  }, [router]);

  if (!ok) return <div className="p-8 text-gray-400">Checking permissions...</div>;
  return <>{children}</>;
}
