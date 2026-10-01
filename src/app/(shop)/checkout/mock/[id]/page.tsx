import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { safeEqual } from "@/lib/crypto";
import { db } from "@/lib/db";
import { mockPaymentsAllowed } from "@/lib/env";
import { money } from "@/lib/format";
import { markFailed, markPaid } from "@/lib/orders";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Płatność testowa", robots: { index: false } };

async function load(id: string, t: string) {
  if (!mockPaymentsAllowed) notFound();
  const order = await db.order.findUnique({ where: { id }, include: { product: true } });
  if (!order || order.provider !== "mock" || !safeEqual(t, order.accessToken)) notFound();
  return order;
}

export default async function MockPayment({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ t?: string }> }) {
  const [{ id }, { t = "" }] = await Promise.all([params, searchParams]);
  const order = await load(id, t);
  const back = `/zamowienie/${order.id}?t=${order.accessToken}`;

  async function pay(form: FormData) {
    "use server";
    const o = await load(id, t);
    if (form.get("result") === "ok") await markPaid(o.id, `mock_${o.number}`);
    else await markFailed(o.id, "FAILED");
    redirect(back);
  }

  return (
    <main className="container-page grid min-h-dvh max-w-md place-items-center py-10">
      <form action={pay} className="card w-full space-y-5 p-8 text-center">
        <p className="eyebrow">Bramka testowa</p>
        <h1 className="text-2xl font-bold text-white">{money(order.totalCents, order.currency)}</h1>
        <p className="text-sm text-ink-300">
          Zamówienie #{order.number} · {order.product.name}
          <br />
          {order.email}
        </p>
        <p className="rounded-lg bg-coral/10 p-3 text-xs text-coral">
          To symulacja bramki płatności. Po podpięciu Stripe klient trafi tu na prawdziwą stronę płatności.
        </p>
        <button name="result" value="ok" className="btn btn-gold w-full">
          Symuluj udaną płatność
        </button>
        <button name="result" value="fail" className="btn btn-ghost w-full">
          Symuluj odrzuconą płatność
        </button>
      </form>
    </main>
  );
}
