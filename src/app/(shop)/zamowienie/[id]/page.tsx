import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { safeEqual } from "@/lib/crypto";
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
