import { addPayout, createAffiliate, toggleAffiliate } from "@/app/admin/actions";
import { ActionForm, Field } from "@/components/admin/action-form";
import { PageTitle, Panel, Table } from "@/components/admin/ui";
import { db } from "@/lib/db";
import { env } from "@/lib/env";
import { int, money } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function Affiliates() {
  const affiliates = await db.affiliate.findMany({
    orderBy: { createdAt: "desc" },
    include: { orders: { where: { status: "PAID" }, select: { totalCents: true, commissionCents: true } }, payouts: true },
  });
  return (
    <>
      <PageTitle title="Program partnerski" />
      <p className="mb-6 max-w-3xl text-sm text-ink-300">
        E-book w rozdziale „Co dalej” zaprasza czytelników do programu partnerskiego. Partner dostaje link{" "}
        <code className="text-gold">{env.APP_URL}/?ref=KOD</code> (atrybucja 30 dni) i własną stronę ze statystykami.
      </p>
      <div className="space-y-6">
        <Panel title="Nowy partner">
          <ActionForm action={createAffiliate} submit="Dodaj partnera">
            <div className="grid gap-4 md:grid-cols-4">
              <Field label="Imię / nazwa">
                <input name="name" required className="field" />
              </Field>
              <Field label="E-mail">
                <input name="email" type="email" required className="field" />
              </Field>
              <Field label="Kod (w linku)">
                <input name="code" required placeholder="anna" className="field" />
              </Field>
              <Field label="Prowizja (%)">
                <input name="commissionPct" type="number" min="1" max="90" defaultValue={30} className="field" />
              </Field>
            </div>
          </ActionForm>
        </Panel>
        <Panel title="Partnerzy">
          <Table
            head={["Partner", "Prowizja", "Sprzedaże", "Przychód", "Prowizja należna", "Wypłacono", "Saldo", "Wypłata", ""]}
            rows={affiliates.map((a) => {
              const commission = a.orders.reduce((s, o) => s + o.commissionCents, 0);
              const paid = a.payouts.reduce((s, p) => s + p.amountCents, 0);
              return [
                <span key="n">
                  <b className="text-white">{a.name}</b> · {a.code}
                  <a href={`/partner/${a.token}`} target="_blank" className="block text-xs text-gold hover:underline">
                    Panel partnera ↗ (wyślij mu ten link)
                  </a>
                </span>,
                `${a.commissionPct}%`,
                int(a.orders.length),
                money(a.orders.reduce((s, o) => s + o.totalCents, 0)),
                money(commission),
                money(paid),
                <b key="b" className="text-white">{money(commission - paid)}</b>,
                <form key="p" action={addPayout.bind(null, a.id)} className="flex gap-1">
                  <input name="amount" type="number" step="0.01" min="0.01" placeholder="zł" className="field w-24 py-1" />
                  <button className="text-xs text-gold hover:underline">Zapisz</button>
                </form>,
                <form key="t" action={toggleAffiliate.bind(null, a.id)}>
                  <button className="text-xs text-ink-400 hover:text-white">{a.active ? "Wyłącz" : "Włącz"}</button>
                </form>,
              ];
            })}
            empty="Brak partnerów"
          />
        </Panel>
      </div>
    </>
  );
}
