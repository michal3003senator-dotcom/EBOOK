"use client";

import { useActionState } from "react";
import type { ActionState } from "@/app/admin/actions";
import { Notice } from "./ui";

export function ActionForm({
  action,
  submit,
  children,
  className = "space-y-4",
}: {
  action: (s: ActionState, f: FormData) => Promise<ActionState>;
  submit: string;
  children: React.ReactNode;
  className?: string;
}) {
  const [state, run, pending] = useActionState(action, {});
  return (
    <form action={run} className={className}>
      {children}
      <div className="flex flex-wrap items-center gap-3">
        <button className="btn btn-gold px-4 py-2" disabled={pending}>
          {pending ? "Zapisuję…" : submit}
        </button>
        <Notice state={state} />
      </div>
    </form>
  );
}

export function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium text-ink-300">{label}</span>
      {children}
      {hint && <span className="mt-1 block text-xs text-ink-400">{hint}</span>}
    </label>
  );
}
