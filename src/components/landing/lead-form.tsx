"use client";

import { useActionState } from "react";
import { requestSample, type FormState } from "@/app/(shop)/actions";

export function LeadForm() {
  const [state, action, pending] = useActionState<FormState, FormData>(requestSample, {});

  if (state.ok)
    return (
      <div className="card p-6 text-center" role="status">
        <p className="text-lg font-bold text-white">Gotowe! Fragment czeka na Ciebie.</p>
        <p className="mt-2 text-ink-300">Link wysłaliśmy też na e-mail.</p>
        <a href={state.url} className="btn btn-gold mt-5" data-cta="sample_download">
          Pobierz fragment (PDF)
        </a>
      </div>
    );

  return (
    <form action={action} className="card space-y-4 p-6">
      <label className="block">
        <span className="mb-1.5 block text-sm font-semibold text-ink-300">Twój e-mail</span>
        <input name="email" type="email" required autoComplete="email" placeholder="ty@przyklad.pl" className="field" />
      </label>
      <label className="flex gap-3 text-sm text-ink-300">
        <input name="consent" type="checkbox" required className="mt-0.5 size-4 accent-gold" />
        <span>
          Chcę otrzymać bezpłatny fragment na e-mail. Akceptuję{" "}
          <a href="/polityka-prywatnosci" className="underline">
            politykę prywatności
          </a>
          .
        </span>
      </label>
      <label className="flex gap-3 text-sm text-ink-400">
        <input name="marketing" type="checkbox" className="mt-0.5 size-4 accent-gold" />
        <span>Chcę dostawać wiadomości o aktualizacjach i nowych poradnikach (opcjonalnie).</span>
      </label>
      {state.error && (
        <p className="text-sm text-coral" role="alert">
          {state.error}
        </p>
      )}
      <button className="btn btn-gold w-full" disabled={pending} data-cta="sample_submit">
        {pending ? "Wysyłam…" : "Wyślij mi fragment"}
      </button>
    </form>
  );
}
