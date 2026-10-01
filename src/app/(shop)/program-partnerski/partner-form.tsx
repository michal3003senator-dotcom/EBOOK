"use client";

import Link from "next/link";
import { useActionState } from "react";
import { applyPartner, type FormState } from "@/app/(shop)/actions";

export function PartnerForm() {
  const [state, action, pending] = useActionState<FormState, FormData>(applyPartner, {});

  if (state.ok)
    return (
      <div className="card p-6 text-center" role="status">
        <p className="text-lg font-bold text-white">Sprawdź skrzynkę e-mail</p>
        <p className="mt-2 text-ink-300">
          {state.url === "approved"
            ? "Jesteś już naszym klientem, więc konto partnera jest aktywne od razu. Link i dostęp do panelu wysłaliśmy e-mailem."
            : "Zgłoszenie przyjęte. Po akceptacji wyślemy Ci link partnerski i dostęp do panelu. Jeśli już jesteś w programie, wysłaliśmy Ci ponownie Twój link."}
        </p>
      </div>
    );

  return (
    <form action={action} className="card space-y-4 p-6">
      <label className="block">
        <span className="mb-1.5 block text-sm font-semibold text-ink-300">Imię lub nazwa profilu</span>
        <input name="name" required maxLength={120} className="field" />
      </label>
      <label className="block">
        <span className="mb-1.5 block text-sm font-semibold text-ink-300">E-mail</span>
        <input name="email" type="email" required autoComplete="email" className="field" />
      </label>
      <label className="block">
        <span className="mb-1.5 block text-sm font-semibold text-ink-300">Gdzie będziesz polecać? (opcjonalnie)</span>
        <input name="channel" maxLength={300} placeholder="np. tiktok.com/@twoj_profil" className="field" />
      </label>
      <label className="flex gap-3 text-sm text-ink-300">
        <input name="terms" type="checkbox" required className="mt-0.5 size-4 shrink-0 accent-gold" />
        <span>
          Akceptuję zasady programu (powyżej) i{" "}
          <Link href="/polityka-prywatnosci" className="underline">
            politykę prywatności
          </Link>
          .
        </span>
      </label>
      {state.error && (
        <p className="text-sm text-coral" role="alert">
          {state.error}
        </p>
      )}
      <button className="btn btn-gold w-full" disabled={pending} data-cta="partner_apply">
        {pending ? "Wysyłam…" : "Dołącz do programu"}
      </button>
    </form>
  );
}
