"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

export function StatusPoller({ id, token }: { id: string; token: string }) {
  const router = useRouter();
  useEffect(() => {
    let tries = 0;
    const timer = setInterval(async () => {
      if (++tries > 60) return clearInterval(timer);
      const res = await fetch(`/api/order-status/${id}?t=${encodeURIComponent(token)}`, { cache: "no-store" });
      const { status } = (await res.json()) as { status?: string };
      if (status && status !== "PENDING") {
        clearInterval(timer);
        router.refresh();
      }
    }, 2500);
    return () => clearInterval(timer);
  }, [id, token, router]);
  return <div aria-hidden className="mx-auto mt-6 size-8 animate-spin rounded-full border-2 border-ink-600 border-t-gold" />;
}
