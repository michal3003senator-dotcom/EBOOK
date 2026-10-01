import type { Metadata } from "next";
import Link from "next/link";
import { logout } from "@/app/admin/actions";
import { AdminNav } from "@/components/admin/nav";
import { requireAdmin } from "@/lib/auth";
import { env } from "@/lib/env";

export const metadata: Metadata = { title: "Panel", robots: { index: false, follow: false } };

export default async function PanelLayout({ children }: { children: React.ReactNode }) {
  const admin = await requireAdmin();
  return (
    <div className="min-h-dvh bg-ink-950 lg:grid lg:grid-cols-[220px_1fr]">
      <aside className="border-b border-ink-700 bg-ink-900 p-4 lg:sticky lg:top-0 lg:h-dvh lg:border-b-0 lg:border-r">
        <div className="mb-4 flex items-center justify-between lg:block">
          <Link href="/admin" className="font-display font-black uppercase text-gold">
            Cash-Cow · Admin
          </Link>
          <p className="hidden truncate text-xs text-ink-400 lg:mt-1 lg:block">{admin.email}</p>
        </div>
        <AdminNav />
        <div className="mt-4 flex gap-3 text-xs text-ink-400 lg:mt-8 lg:flex-col">
          <a href="/" target="_blank" className="hover:text-white">
            Zobacz sklep ↗
          </a>
          <form action={logout}>
            <button className="hover:text-white">Wyloguj</button>
          </form>
        </div>
        {env.PAYMENT_PROVIDER === "mock" && (
          <p className="mt-4 rounded-md bg-coral/15 p-2 text-xs text-coral">Płatności w trybie testowym</p>
        )}
      </aside>
      <div className="min-w-0 p-4 sm:p-6 lg:p-8">{children}</div>
    </div>
  );
}
