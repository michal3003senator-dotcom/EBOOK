"use client";

import Link from "next/link";
import { useActionState, useState, useTransition } from "react";
import { checkCoupon, checkout, type FormState } from "@/app/(shop)/actions";
import { track } from "@/components/tracker";
import { money } from "@/lib/format";

type Props = { productId: string; priceCents: number; currency: string; testMode: boolean };

export function CheckoutForm({ productId, priceCents, currency, testMode }: Props) {
  const [state, action, pending] = useActionState<FormState, FormData>(checkout, {});
  const [invoice, setInvoice] = useState(false);
  const [code, setCode] = useState(state.fields?.coupon ?? "");
  const [discount, setDiscount] = useState(0);
  const [couponMsg, setCouponMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [checking, startCheck] = useTransition();

  const applyCoupon = () =>
    startCheck(async () => {
      if (!code.trim()) return;
      const r = await checkCoupon(productId, code);
      track("coupon_apply", r.error ? "invalid" : code.trim().toUpperCase());
      if ("error" in r && r.error) {
        setDiscount(0);
        setCouponMsg({ ok: false, text: r.error });
      } else {
        setDiscount(r.discountCents ?? 0);
        setCouponMsg({ ok: true, text: `Rabat: −${money(r.discountCents ?? 0, currency)}` });
      }
    });

  const total = priceCents - discount;

  return (
    <form action={action} onSubmit={() => track("checkout_start")} className="space-y-6">
      <input type="hidden" name="productId" value={productId} />
      <fieldset className="card space-y-4 p-6">
        <legend className="sr-only">Dane kupującego</legend>
        <label className="block">
          <span className="mb-1.5 block text-sm font-semibold text-ink-300">E-mail (tu wyślemy e-book)</span>
          <input name="email" type="email" required autoComplete="email" defaultValue={state.fields?.email} className="field" />
        </label>
        <label className="block">
          <span className="mb-1.5 block text-sm font-semibold text-ink-300">Imię (opcjonalnie)</span>
          <input name="name" autoComplete="given-name" maxLength={120} defaultValue={state.fields?.name} className="field" />
        </label>
        <div>
          <span className="mb-1.5 block text-sm font-semibold text-ink-300">Kod rabatowy</span>
          <div className="flex gap-2">
            <input
              name="coupon"
              value={code}
              onChange={(e) => (setCode(e.target.value), setCouponMsg(null), setDiscount(0))}
              className="field uppercase"
              autoComplete="off"
            />
            <button type="button" onClick={applyCoupon} disabled={checking} className="btn btn-ghost shrink-0 px-4 py-2">
              {checking ? "…" : "Zastosuj"}
            </button>
          </div>
          {couponMsg && <p className={`mt-1.5 text-sm ${couponMsg.ok ? "text-gold" : "text-coral"}`}>{couponMsg.text}</p>}
        </div>
        <label className="flex gap-3 text-sm text-ink-300">
          <input name="invoice" type="checkbox" checked={invoice} onChange={(e) => setInvoice(e.target.checked)} className="mt-0.5 size-4 accent-gold" />
          Potrzebuję rachunku / faktury na firmę
        </label>
        {invoice && (
          <div className="grid gap-3 sm:grid-cols-2">
            <input name="companyName" required placeholder="Nazwa firmy" className="field sm:col-span-2" />
            <input name="taxId" required placeholder="NIP" inputMode="numeric" className="field" />
            <input name="address" required placeholder="Adres" className="field" />
          </div>
        )}
      </fieldset>

      <fieldset className="card space-y-3 p-6 text-sm text-ink-300">
        <legend className="sr-only">Zgody</legend>
        <label className="flex gap-3">
          <input name="terms" type="checkbox" required className="mt-0.5 size-4 shrink-0 accent-gold" />
          <span>
            Akceptuję{" "}
            <Link href="/regulamin" target="_blank" className="underline">
              regulamin
            </Link>{" "}
            i{" "}
            <Link href="/polityka-prywatnosci" target="_blank" className="underline">
              politykę prywatności
            </Link>
            . <span className="text-coral">*</span>
          </span>
        </label>
        <label className="flex gap-3">
          <input name="waiver" type="checkbox" required className="mt-0.5 size-4 shrink-0 accent-gold" />
          <span>
            Żądam dostarczenia treści cyfrowej przed upływem 14-dniowego terminu do odstąpienia od umowy i przyjmuję do wiadomości, że
            tracę prawo odstąpienia od umowy z chwilą rozpoczęcia dostarczania. <span className="text-coral">*</span>
          </span>
        </label>
        <label className="flex gap-3 text-ink-400">
          <input name="marketing" type="checkbox" className="mt-0.5 size-4 shrink-0 accent-gold" />
          <span>Chcę dostawać informacje o aktualizacjach i nowych poradnikach (opcjonalnie).</span>
        </label>
      </fieldset>

      <div className="card space-y-2 p-6">
        <div className="flex justify-between text-ink-300">
          <span>Cena</span>
          <span>{money(priceCents, currency)}</span>
        </div>
        {discount > 0 && (
          <div className="flex justify-between text-gold">
            <span>Rabat</span>
            <span>−{money(discount, currency)}</span>
          </div>
        )}
        <div className="flex justify-between border-t border-ink-700 pt-3 text-lg font-bold text-white">
          <span>Do zapłaty</span>
          <span>{money(total, currency)}</span>
        </div>
      </div>

      {state.error && (
        <p className="rounded-lg border border-coral/40 bg-coral/10 p-3 text-sm text-coral" role="alert">
          {state.error}
        </p>
      )}
      <button className="btn btn-gold w-full text-lg" disabled={pending} data-cta="checkout_pay">
        {pending ? "Przekierowuję do płatności…" : total === 0 ? "Odbieram za darmo" : `Zamawiam i płacę ${money(total, currency)}`}
      </button>
      {testMode && <p className="text-center text-xs text-coral">Tryb testowy: płatność jest symulowana, nic nie zostanie pobrane.</p>}
    </form>
  );
}
