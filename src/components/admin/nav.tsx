"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  ["/admin", "Statystyki"],
  ["/admin/orders", "Zamówienia"],
  ["/admin/customers", "Klienci"],
  ["/admin/leads", "Leady"],
  ["/admin/products", "Produkt"],
  ["/admin/coupons", "Kody rabatowe"],
  ["/admin/affiliates", "Partnerzy"],
  ["/admin/emails", "E-maile"],
  ["/admin/settings", "Ustawienia"],
] as const;

export function AdminNav() {
  const path = usePathname();
  return (
    <nav className="flex gap-1 overflow-x-auto lg:flex-col" aria-label="Panel">
      {links.map(([href, label]) => {
        const active = href === "/admin" ? path === href : path.startsWith(href);
        return (
          <Link
            key={href}
            href={href}
            aria-current={active ? "page" : undefined}
            className={`whitespace-nowrap rounded-lg px-3 py-2 text-sm ${active ? "bg-ink-700 font-semibold text-white" : "text-ink-300 hover:bg-ink-800 hover:text-white"}`}
          >
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
