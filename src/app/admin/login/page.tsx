"use client";

import { useActionState } from "react";
import { login } from "./actions";

export default function LoginPage() {
  const [state, action, pending] = useActionState(login, {});
  return (
    <main className="grid min-h-dvh place-items-center px-4">
      <form action={action} className="card w-full max-w-sm space-y-4 p-8">
        <p className="font-display text-lg font-black uppercase text-gold">Panel administracyjny</p>
        <label className="block">
          <span className="mb-1.5 block text-sm text-ink-300">E-mail</span>
          <input name="email" type="email" required autoComplete="username" className="field" />
        </label>
        <label className="block">
          <span className="mb-1.5 block text-sm text-ink-300">Hasło</span>
          <input name="password" type="password" required autoComplete="current-password" className="field" />
        </label>
        {state.error && (
          <p className="text-sm text-coral" role="alert">
            {state.error}
          </p>
        )}
        <button className="btn btn-gold w-full" disabled={pending}>
          {pending ? "Logowanie…" : "Zaloguj"}
        </button>
      </form>
    </main>
  );
}
