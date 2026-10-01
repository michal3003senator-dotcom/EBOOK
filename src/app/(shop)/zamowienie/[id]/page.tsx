import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { safeEqual } from "@/lib/crypto";
import { partnerLinks } from "@/lib/affiliates";
import { db } from "@/lib/db";
import { money } from "@/lib/format";
import { StatusPoller } from "./status-poller";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Status zamówienia", robots: { index: false } };

export default async function OrderPage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ t?: string }> }) {
  const [{ id }, { t }] = await Promise.all([params, searchParams]);
  const order = await db.order.findUnique({
    where: { id },
    include: { product: true, downloadTokens: { where: { revoked: false }, orderBy: { createdAt: "desc" }, take: 1 } },
  });
  if (!order || !t || !safeEqual(t, order.accessToken)) notFound();
  const token = order.downloadTokens[0];
  const partner = order.status === "PAID" ? await db.affiliate.findUnique({ where: { email: order.email } }) : null;
  const links = partner?.active ? partnerLinks(partner) : null;

  return (
    <main className="container-page max-w-2xl py-16">
      <div className="card p-8 text-center">
        {order.status === "PAID" ? (
          <>
            <p className="eyebrow">Zamówienie #{order.number}</p>
            <h1 className="mt-3 font-display text-3xl font-black uppercase text-white">Dziękujemy za zakup!</h1>
            <p className="mt-4 text-ink-300">
              {order.product.name} · {money(order.totalCents, order.currency)}. Link do pobrania wysłaliśmy też na <b className="text-white">{order.email}</b>.
            </p>
            {token && (
              <a href={`/d/${token.token}`} className="btn btn-gold mt-8 text-lg">
                Pobierz e-book (PDF)
              </a>
            )}
            <p className="mt-6 text-sm text-ink-400">
              Plik jest oznaczony Twoim adresem e-mail (licencja osobista). Masz mało czasu? Zacznij od rozdziałów 1, 6 i 9.
            </p>
            {partner && links && (
              <div className="mt-8 rounded-xl border border-gold/40 bg-gold/5 p-5 text-left">
                <p className="font-bold text-gold">Poleć i zarabiaj {partner.commissionPct}%</p>
                <p className="mt-1 text-sm text-ink-300">
                  Za każdy zakup z Twojego linku dostajesz {partner.commissionPct}% prowizji — dokładnie tak, jak uczy rozdział 11.
                </p>
                <p className="mt-3 break-all rounded-lg bg-ink-950 p-3 font-mono text-sm text-gold">{links.link}</p>
                <p className="mt-3 text-sm">
                  <a href={links.panel} className="text-ink-300 underline">
                    Panel partnera
                  </a>{" "}
                  ·{" "}
                  <Link href="/program-partnerski" className="text-ink-300 underline">
                    Zasady
                  </Link>
                </p>
              </div>
            )}
          </>
        ) : order.status === "PENDING" ? (
          <>
            <h1 className="font-display text-2xl font-black uppercase text-white">Czekamy na potwierdzenie płatności…</h1>
            <p className="mt-4 text-ink-300">To zwykle trwa kilka sekund. Strona odświeży się sama.</p>
            <StatusPoller id={order.id} token={order.accessToken} />
          </>
        ) : (
          <>
            <h1 className="font-display text-2xl font-black uppercase text-coral">Płatność nie powiodła się</h1>
            <p className="mt-4 text-ink-300">Nic nie zostało pobrane. Możesz spróbować ponownie.</p>
            <Link href="/kasa" className="btn btn-gold mt-6">
              Spróbuj ponownie
            </Link>
          </>
        )}
      </div>
    </main>
  );
}
