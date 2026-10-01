"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Notice } from "./ui";

export function UploadForm({ productId }: { productId: string }) {
  const router = useRouter();
  const [state, setState] = useState<{ ok?: string; error?: string }>({});
  const [busy, setBusy] = useState(false);

  async function upload(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const file = new FormData(e.currentTarget).get("file");
    if (!(file instanceof File) || !file.size) return setState({ error: "Wybierz plik PDF" });
    setBusy(true);
    setState({});
    const res = await fetch(`/api/admin/product-file?id=${encodeURIComponent(productId)}`, { method: "POST", body: file });
    const json = (await res.json().catch(() => ({}))) as { error?: string };
    setBusy(false);
    if (!res.ok) return setState({ error: json.error ?? "Błąd wysyłania" });
    setState({ ok: "Plik zapisany" });
    router.refresh();
  }

  return (
    <form onSubmit={upload} className="flex flex-wrap items-center gap-3">
      <input name="file" type="file" accept="application/pdf" className="field max-w-md file:mr-3 file:rounded file:border-0 file:bg-ink-700 file:px-3 file:py-1 file:text-white" />
      <button className="btn btn-ghost px-4 py-2" disabled={busy}>
        {busy ? "Wysyłam…" : "Wgraj PDF"}
      </button>
      <Notice state={state} />
    </form>
  );
}
