import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Footer } from "@/components/footer";
import { Tracker } from "@/components/tracker";
import { REF_DAYS } from "@/lib/constants";
import { money } from "@/lib/format";
import { mainProduct } from "@/lib/products";
import { getSettings } from "@/lib/settings";
import { PartnerForm } from "./partner-form";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Program partnerski — poleć i zarabiaj",
  description: "Polecaj e-book Faceless Cash-Cow i zarabiaj prowizję od każdego zakupu z Twojego linku.",
};

export default async function PartnerProgram() {
  const [s, product] = await Promise.all([getSettings(), mainProduct()]);
  if (!s.affiliateEnabled || !product) notFound();
  const perSale = Math.round((product.priceCents * s.affiliateDefaultPct) / 100);

  const steps = [
    ["Dołącz", "Kupujący dostają link automatycznie w e-mailu z e-bookiem. Pozostali — przez formularz poniżej."],
    ["Polecaj", `Wklej link w bio, opisie filmu albo wyślij znajomemu. Link działa ${REF_DAYS} dni od kliknięcia.`],
    ["Zarabiaj", `${s.affiliateDefaultPct}% od każdego opłaconego zakupu, czyli ok. ${money(perSale)} za sprzedaż. Wszystko widzisz w swoim panelu.`],
  ];
  const rules = [
    "Oznaczaj link jako reklamę lub link afiliacyjny — zgodnie z zaleceniami UOKiK (rozdział 11.5 e-booka).",
    "Nie składasz zamówień z własnego linku — takie zakupy nie dają prowizji.",
    "Bez spamu, fałszywych obietnic zarobku i reklam na frazę z nazwą e-booka.",
    "Prowizja dotyczy opłaconych zamówień; zwrócone zamówienia nie są rozliczane.",
    `Wypłaty raz w miesiącu${s.affiliateMinPayoutCents ? ` od ${money(s.affiliateMinPayoutCents)} salda` : ""}, na podstawie rachunku lub faktury. Kontakt: ${s.sellerEmail}.`,
    "Możemy zakończyć współpracę przy naruszeniu zasad; należne prowizje za zgodne sprzedaże zostaną wypłacone.",
  ];

  return (
    <>
      <Tracker page="partner_program" />
      <main className="container-page max-w-4xl py-12">
        <Link href="/" className="text-sm text-ink-400 hover:text-white">
          ← Strona główna
        </Link>
        <p className="eyebrow mt-6">Program partnerski</p>
        <h1 className="mt-3 font-display text-4xl font-black uppercase leading-tight text-white sm:text-5xl">
          Poleć i zarabiaj <span className="text-gold">{s.affiliateDefaultPct}%</span>
        </h1>
        <p className="mt-5 max-w-2xl text-lg text-ink-300">
          Jeśli ta książka Ci pomogła, możesz na niej zarobić dokładnie tak, jak uczy rozdział 11 — na swoim koncie faceless w niszy
          okołobiznesowej albo po prostu wysyłając link znajomemu.
        </p>

        <ol className="mt-10 grid gap-4 md:grid-cols-3">
          {steps.map(([t, d], i) => (
            <li key={t} className="card p-6">
              <p className="font-display text-3xl font-black text-gold">{i + 1}</p>
              <p className="mt-2 font-bold text-white">{t}</p>
              <p className="mt-2 text-sm text-ink-300">{d}</p>
            </li>
          ))}
        </ol>

        <div className="mt-12 grid gap-8 lg:grid-cols-2">
          <section>
            <h2 className="font-display text-2xl font-black uppercase text-white">Zasady</h2>
            <ul className="mt-4 space-y-3">
              {rules.map((r) => (
                <li key={r} className="flex gap-3 text-ink-300">
                  <span aria-hidden className="text-gold">✓</span>
                  {r}
                </li>
              ))}
            </ul>
          </section>
          <section>
            <h2 className="mb-4 font-display text-2xl font-black uppercase text-white">Dołącz</h2>
            <PartnerForm />
          </section>
        </div>
      </main>
      <Footer s={s} />
    </>
  );
}
