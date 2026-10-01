import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Tracker } from "@/components/tracker";
import { env } from "@/lib/env";
import { money } from "@/lib/format";
import { mainProduct } from "@/lib/products";
import { CheckoutForm } from "./checkout-form";
import { CheckoutViewBeacon } from "./view-beacon";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Zamówienie", robots: { index: false } };

export default async function CheckoutPage({ searchParams }: { searchParams: Promise<{ anulowano?: string }> }) {
  const [product, { anulowano }] = await Promise.all([mainProduct(), searchParams]);
  if (!product) notFound();

  return (
    <main className="container-page max-w-5xl py-10">
      <Tracker page="checkout" />
      <CheckoutViewBeacon />
      <Link href="/" className="text-sm text-ink-400 hover:text-white">
        ← Wróć do opisu
      </Link>
      <h1 className="mt-4 font-display text-3xl font-black uppercase text-white">Twoje zamówienie</h1>
      {anulowano && (
        <p className="mt-4 rounded-lg border border-coral/40 bg-coral/10 p-3 text-sm text-coral">
          Płatność została przerwana. Możesz spróbować ponownie.
        </p>
      )}
      <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_320px]">
        <CheckoutForm productId={product.id} priceCents={product.priceCents} currency={product.currency} testMode={env.PAYMENT_PROVIDER === "mock"} />
        <aside className="card h-fit p-6 lg:sticky lg:top-6">
          <Image src="/preview/p1.jpg" alt="" width={737} height={1039} className="mx-auto w-40 rounded-lg ring-1 ring-white/10" />
          <p className="mt-4 text-center font-bold text-white">{product.name}</p>
          <p className="text-center text-sm text-ink-400">{product.subtitle}</p>
          <p className="mt-3 text-center font-display text-3xl font-black text-gold">{money(product.priceCents, product.currency)}</p>
          <ul className="mt-5 space-y-2 text-sm text-ink-300">
            <li>✓ PDF, 123 strony — dostęp od razu po płatności</li>
            <li>✓ Link do pobrania również na e-mail</li>
            <li>✓ Aktualizacje kolejnych wydań gratis</li>
            <li>✓ BLIK, szybki przelew, karta</li>
          </ul>
        </aside>
      </div>
    </main>
  );
}
