import Link from "next/link";

export function PageTitle({ title, children }: { title: string; children?: React.ReactNode }) {
  return (
    <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
      <h1 className="text-2xl font-bold text-white">{title}</h1>
      {children}
    </div>
  );
}

export function Table({ head, rows, empty = "Brak danych", align }: { head: string[]; rows: React.ReactNode[][]; empty?: string; align?: ("l" | "r")[] }) {
  if (!rows.length) return <p className="py-6 text-center text-sm text-ink-400">{empty}</p>;
  const cls = (i: number) => (align?.[i] === "r" ? "text-right tabular-nums" : "text-left");
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-ink-700 text-xs text-ink-400">
            {head.map((h, i) => (
              <th key={h} scope="col" className={`px-2 py-2 font-medium ${cls(i)}`}>
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r, ri) => (
            <tr key={ri} className="border-b border-ink-800 hover:bg-ink-800/60">
              {r.map((c, i) => (
                <td key={i} className={`px-2 py-2 text-ink-300 ${cls(i)}`}>
                  {c}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function Badge({ status }: { status: string }) {
  const map: Record<string, string> = {
    PAID: "bg-emerald-500/15 text-emerald-300",
    PENDING: "bg-amber-500/15 text-amber-300",
    FAILED: "bg-rose-500/15 text-rose-300",
    CANCELED: "bg-ink-700 text-ink-300",
    REFUNDED: "bg-violet-500/15 text-violet-300",
    SENT: "bg-emerald-500/15 text-emerald-300",
    LOGGED: "bg-ink-700 text-ink-300",
  };
  const label: Record<string, string> = {
    PAID: "✓ Opłacone",
    PENDING: "… Oczekuje",
    FAILED: "✕ Nieudane",
    CANCELED: "– Anulowane",
    REFUNDED: "↺ Zwrócone",
    SENT: "✓ Wysłany",
    LOGGED: "Tylko log",
  };
  return <span className={`rounded px-2 py-0.5 text-xs font-medium ${map[status] ?? "bg-rose-500/15 text-rose-300"}`}>{label[status] ?? status}</span>;
}

export function Pager({ page, pages, href }: { page: number; pages: number; href: (p: number) => string }) {
  if (pages <= 1) return null;
  return (
    <div className="mt-4 flex items-center justify-end gap-2 text-sm">
      {page > 1 && <Link className="btn btn-ghost px-3 py-1.5" href={href(page - 1)}>← Poprzednia</Link>}
      <span className="text-ink-400">
        {page} / {pages}
      </span>
      {page < pages && <Link className="btn btn-ghost px-3 py-1.5" href={href(page + 1)}>Następna →</Link>}
    </div>
  );
}

export function Panel({ title, children, actions }: { title?: string; children: React.ReactNode; actions?: React.ReactNode }) {
  return (
    <section className="rounded-xl border border-ink-700 bg-ink-800 p-5">
      {(title || actions) && (
        <div className="mb-4 flex items-center justify-between gap-3">
          {title && <h2 className="font-semibold text-white">{title}</h2>}
          {actions}
        </div>
      )}
      {children}
    </section>
  );
}

export function Notice({ state }: { state: { ok?: string; error?: string } }) {
  if (state.error) return <p className="text-sm text-coral" role="alert">{state.error}</p>;
  if (state.ok) return <p className="text-sm text-emerald-400" role="status">{state.ok}</p>;
  return null;
}
