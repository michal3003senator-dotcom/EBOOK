import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { env } from "@/lib/env";
import { int, money, percent, ratio } from "@/lib/format";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Panel partnera", robots: { index: false } };

export default async function PartnerPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const a = await db.affiliate.findUnique({ where: { token }, include: { payouts: true } });
  if (!a) notFound();

  const [visits, orders] = await Promise.all([
    db.event.groupBy({ by: ["sessionId"], where: { affiliate: a.code, type: "pageview" } }),
    db.order.findMany({ where: { affiliateId: a.id, status: "PAID" }, select: { totalCents: true, commissionCents: true, paidAt: true, number: true } }),
  ]);
  const commission = orders.reduce((s, o) => s + o.commissionCents, 0);
  const paid = a.payouts.reduce((s, p) => s + p.amountCents, 0);
  const link = `${env.APP_URL}/?ref=${a.code}`;
  const tiles = [
    ["Wizyty z linku", int(visits.length)],
    ["Sprzedaże", int(orders.length)],
    ["Konwersja", percent(ratio(orders.length, visits.length))],
    ["Prowizja łącznie", money(commission)],
    ["Wypłacono", money(paid)],
    ["Do wypłaty", money(commission - paid)],
  ];

  return (
    <main className="container-page max-w-3xl py-12">
      <p className="eyebrow">Program partnerski</p>
      <h1 className="mt-2 font-display text-3xl font-black uppercase text-white">Cześć, {a.name}</h1>
      <p className="mt-3 text-ink-300">
        Twoja prowizja: <b className="text-white">{a.commissionPct}%</b> od każdej opłaconej sprzedaży (atrybucja 30 dni). Pamiętaj o
        oznaczeniu linku jako reklamy (rozdział 11.5).
      </p>
      <div className="card mt-6 p-4">
        <p className="text-xs text-ink-400">Twój link</p>
        <p className="mt-1 break-all font-mono text-gold">{link}</p>
      </div>
      <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3">
        {tiles.map(([k, v]) => (
          <div key={k} className="card p-4">
            <p className="text-xs text-ink-400">{k}</p>
            <p className="mt-1 text-2xl font-bold text-white">{v}</p>
          </div>
        ))}
      </div>
    </main>
  );
}
