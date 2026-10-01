import { addPayout, approvePartner, createAffiliate, rejectPartner, setCommission, toggleAffiliate } from "@/app/admin/actions";
import { ActionForm, Field } from "@/components/admin/action-form";
import { PageTitle, Panel, Table } from "@/components/admin/ui";
import { db } from "@/lib/db";
import { env } from "@/lib/env";
import { dateTime, int, money } from "@/lib/format";
import { getSettings } from "@/lib/settings";

export const dynamic = "force-dynamic";

const ORIGIN: Record<string, string> = { manual: "ręcznie", buyer: "kupujący", application: "zgłoszenie" };

export default async function Affiliates() {
  const s = await getSettings();
  const pendingList = await db.affiliate.findMany({ where: { pending: true }, orderBy: { createdAt: "asc" } });
  const affiliates = await db.affiliate.findMany({
    where: { pending: false },
    orderBy: { createdAt: "desc" },
    include: { orders: { where: { status: "PAID" }, select: { totalCents: true, commissionCents: true } }, payouts: true },
  });
  return (
    <>
      <PageTitle title="Program partnerski" />
      <div className="mb-6 max-w-3xl space-y-2 text-sm text-ink-300">
        <p>
          Jak klienci się dowiadują: {s.affiliateAutoEnroll ? "każdy kupujący dostaje własny link w e-mailu i na stronie podziękowania; " : ""}
          publiczna strona <a href="/program-partnerski" target="_blank" className="text-gold underline">/program-partnerski</a> (link w stopce i FAQ)
          przyjmuje zgłoszenia. Partner dostaje link <code className="text-gold">{env.APP_URL}/?ref=KOD</code> (atrybucja 30 dni) i panel ze statystykami.
        </p>
        <p>
          W PDF e-booka (strona „Co dalej”) wpisz w miejsce „[link i wysokość prowizji]”:{" "}
          <code className="text-gold">{env.APP_URL}/program-partnerski — {s.affiliateDefaultPct}%</code>
        </p>
        {!s.affiliateEnabled && <p className="text-coral">Program jest wyłączony w Ustawieniach.</p>}
      </div>
      <div className="space-y-6">
        {pendingList.length > 0 && (
          <Panel title={`Zgłoszenia do akceptacji (${pendingList.length})`}>
            <Table
              head={["Data", "Partner", "Kanał", ""]}
              rows={pendingList.map((a) => [
                dateTime(a.createdAt),
                <span key="n">
                  <b className="text-white">{a.name}</b>
                  <span className="block text-xs text-ink-400">{a.email}</span>
                </span>,
                a.channel || "—",
                <span key="x" className="flex gap-3">
                  <form action={approvePartner.bind(null, a.id)}>
                    <button className="text-xs font-semibold text-gold hover:underline">Zatwierdź i wyślij link</button>
                  </form>
                  <form action={rejectPartner.bind(null, a.id)}>
                    <button className="text-xs text-ink-400 hover:text-coral">Odrzuć</button>
                  </form>
                </span>,
              ])}
            />
          </Panel>
        )}
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
                <input name="commissionPct" type="number" min="1" max="90" defaultValue={s.affiliateDefaultPct} className="field" />
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
                  <span className="ml-1 text-xs text-ink-400">({ORIGIN[a.origin] ?? a.origin}{a.active ? "" : ", wyłączony"})</span>
                  <a href={`/partner/${a.token}`} target="_blank" className="block text-xs text-gold hover:underline">
                    Panel partnera ↗ (wyślij mu ten link)
                  </a>
                </span>,
                <form key="pct" action={setCommission.bind(null, a.id)} className="flex items-center gap-1">
                  <input name="pct" type="number" min="1" max="90" defaultValue={a.commissionPct} className="field w-16 py-1" />
                  <button className="text-xs text-gold hover:underline">%</button>
                </form>,
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
