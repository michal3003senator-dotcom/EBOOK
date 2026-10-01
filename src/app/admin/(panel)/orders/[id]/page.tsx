import Link from "next/link";
import { notFound } from "next/navigation";
import { orderAction, saveOrderNote } from "@/app/admin/actions";
import { Badge, PageTitle, Panel, Table } from "@/components/admin/ui";
import { db } from "@/lib/db";
import { env } from "@/lib/env";
import { dateTime, money } from "@/lib/format";

export const dynamic = "force-dynamic";

const EVENT_LABEL: Record<string, string> = {
  pageview: "Odsłona",
  scroll: "Przewinięcie",
  section_view: "Sekcja",
  cta_click: "Klik CTA",
  faq_open: "FAQ",
  toc_open: "Spis treści",
  checkout_view: "Kasa",
  checkout_start: "Wysłanie formularza",
  coupon_apply: "Kod rabatowy",
  engagement: "Czas aktywny (s)",
  purchase: "Zakup",
  payment_failed: "Płatność nieudana",
  refund: "Zwrot",
  download: "Pobranie",
  lead: "Lead",
};

export default async function OrderDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const o = await db.order.findUnique({
    where: { id },
    include: {
      product: true,
      coupon: true,
      affiliate: true,
      downloadTokens: { include: { logs: { orderBy: { createdAt: "desc" } } }, orderBy: { createdAt: "desc" } },
      emails: { orderBy: { createdAt: "desc" } },
      paymentEvents: { orderBy: { createdAt: "desc" } },
    },
  });
  if (!o) notFound();
  const journey = o.sessionId
    ? await db.event.findMany({ where: { sessionId: o.sessionId, type: { notIn: ["vital"] } }, orderBy: { createdAt: "asc" }, take: 200 })
    : [];
  const act = (a: Parameters<typeof orderAction>[1]) => orderAction.bind(null, o.id, a);

  const facts: [string, React.ReactNode][] = [
    ["Status", <Badge key="s" status={o.status} />],
    ["Produkt", o.product.name],
    ["Cena", money(o.unitPriceCents, o.currency)],
    ["Rabat", o.discountCents ? `−${money(o.discountCents, o.currency)} (${o.coupon?.code})` : "—"],
    ["Zapłacono", money(o.totalCents, o.currency)],
    ["Bramka", `${o.provider}${o.providerRef ? ` · ${o.providerRef}` : ""}`],
    ["Utworzono", dateTime(o.createdAt)],
    ["Opłacono", o.paidAt ? dateTime(o.paidAt) : "—"],
    ["Zwrot", o.refundedAt ? dateTime(o.refundedAt) : "—"],
    ["Partner", o.affiliate ? `${o.affiliate.name} · prowizja ${money(o.commissionCents)}` : "—"],
    ["Źródło", [o.source, o.utmCampaign && `kampania: ${o.utmCampaign}`, o.referrerHost].filter(Boolean).join(" · ")],
    ["Urządzenie / kraj", `${o.device ?? "?"} · ${o.country ?? "?"}`],
    ["Zgoda na regulamin", dateTime(o.termsAcceptedAt)],
    ["Zgoda na dostarczenie (utrata prawa odstąpienia)", dateTime(o.waiverAcceptedAt)],
    ["Zgoda marketingowa", o.marketingConsent ? "tak" : "nie"],
  ];

  return (
    <>
      <PageTitle title={`Zamówienie #${o.number}`}>
        <Link href="/admin/orders" className="text-sm text-ink-400 hover:text-white">
          ← Wszystkie zamówienia
        </Link>
      </PageTitle>
      <div className="grid gap-6 xl:grid-cols-[1fr_380px]">
        <div className="space-y-6">
          <Panel title="Szczegóły">
            <dl className="grid gap-x-6 gap-y-2 text-sm sm:grid-cols-[14rem_1fr]">
              {facts.map(([k, v]) => (
                <div key={k} className="contents">
                  <dt className="text-ink-400">{k}</dt>
                  <dd className="text-white">{v}</dd>
                </div>
              ))}
            </dl>
          </Panel>
          <Panel title="Ścieżka klienta (sesja zakupowa)">
            <Table
              head={["Czas", "Zdarzenie", "Szczegóły"]}
              rows={journey.map((e) => [dateTime(e.createdAt), EVENT_LABEL[e.type] ?? e.type, [e.name, e.value, e.path !== "/" ? e.path : null].filter((x) => x !== null && x !== undefined).join(" · ")])}
              empty="Brak danych o sesji"
            />
          </Panel>
          <Panel title="Linki do pobrania">
            <Table
              head={["Utworzono", "Ważny do", "Pobrania", "Status", "Ostatnie pobranie"]}
              rows={o.downloadTokens.map((t) => [
                dateTime(t.createdAt),
                dateTime(t.expiresAt),
                `${t.downloads} / ${t.maxDownloads}`,
                t.revoked ? "unieważniony" : t.expiresAt < new Date() ? "wygasł" : "aktywny",
                t.logs[0] ? dateTime(t.logs[0].createdAt) : "—",
              ])}
              empty="Brak — link powstaje po opłaceniu"
            />
          </Panel>
          <Panel title="Zdarzenia bramki płatności">
            <Table head={["Czas", "Typ", "ID zdarzenia"]} rows={o.paymentEvents.map((e) => [dateTime(e.createdAt), e.type, e.eventId])} empty="Brak" />
          </Panel>
        </div>
        <div className="space-y-6">
          <Panel title="Klient">
            <p className="text-white">{o.email}</p>
            {o.name && <p className="text-sm text-ink-300">{o.name}</p>}
            {o.wantsInvoice && (
              <div className="mt-3 rounded-lg border border-gold/40 bg-gold/10 p-3 text-sm">
                <p className="font-semibold text-gold">Wymaga rachunku / faktury</p>
                <p className="mt-1 text-white">{o.companyName}</p>
                <p className="text-ink-300">NIP: {o.taxId}</p>
                <p className="text-ink-300">{o.address}</p>
              </div>
            )}
          </Panel>
          <Panel title="Akcje">
            <div className="grid gap-2">
              {o.status === "PAID" && (
                <>
                  <form action={act("resend")}>
                    <button className="btn btn-ghost w-full">Wyślij ponownie e-mail z linkiem</button>
                  </form>
                  <form action={act("newLink")}>
                    <button className="btn btn-ghost w-full">Nowy link (unieważnij stare) i wyślij</button>
                  </form>
                  <form action={act("refund")}>
                    <button className="btn btn-ghost w-full text-coral">Oznacz jako zwrócone (blokuje pobieranie)</button>
                  </form>
                  <p className="text-xs text-ink-400">Zwrot pieniędzy wykonaj w panelu bramki — przy Stripe status zaktualizuje się sam.</p>
                </>
              )}
              {o.status !== "PAID" && o.status !== "REFUNDED" && (
                <form action={act("markPaid")}>
                  <button className="btn btn-gold w-full">Oznacz jako opłacone ręcznie</button>
                  <p className="mt-1 text-xs text-ink-400">Np. przy przelewie tradycyjnym. Wyśle e-mail z e-bookiem.</p>
                </form>
              )}
              <a className="text-center text-xs text-ink-400 hover:text-white" href={`${env.APP_URL}/zamowienie/${o.id}?t=${o.accessToken}`} target="_blank">
                Strona statusu klienta ↗
              </a>
            </div>
          </Panel>
          <Panel title="Notatka">
            <form action={saveOrderNote.bind(null, o.id)} className="space-y-2">
              <textarea name="note" defaultValue={o.note} rows={3} className="field" />
              <button className="btn btn-ghost px-3 py-1.5 text-sm">Zapisz notatkę</button>
            </form>
          </Panel>
          <Panel title="E-maile">
            <ul className="space-y-2 text-sm">
              {o.emails.map((e) => (
                <li key={e.id} className="flex items-start justify-between gap-2">
                  <span className="text-ink-300">
                    {e.subject}
                    <span className="block text-xs text-ink-400">{dateTime(e.createdAt)}{e.error && ` · ${e.error}`}</span>
                  </span>
                  <Badge status={e.status} />
                </li>
              ))}
              {!o.emails.length && <li className="text-ink-400">Brak</li>}
            </ul>
          </Panel>
        </div>
      </div>
    </>
  );
}
