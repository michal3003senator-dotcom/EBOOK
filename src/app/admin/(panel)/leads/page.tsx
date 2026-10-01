import { PageTitle, Pager, Panel, Table } from "@/components/admin/ui";
import { db } from "@/lib/db";
import { dateTime, int, percent, ratio } from "@/lib/format";

export const dynamic = "force-dynamic";
const PER_PAGE = 50;

export default async function Leads({ searchParams }: { searchParams: Promise<{ page?: string }> }) {
  const page = Math.max(1, Number((await searchParams).page) || 1);
  const [leads, total, buyers] = await Promise.all([
    db.lead.findMany({ orderBy: { createdAt: "desc" }, skip: (page - 1) * PER_PAGE, take: PER_PAGE }),
    db.lead.count(),
    db.order.findMany({ where: { status: "PAID" }, select: { email: true }, distinct: ["email"] }),
  ]);
  const bought = new Set(buyers.map((b) => b.email));
  const allLeads = await db.lead.findMany({ select: { email: true } });
  const converted = allLeads.filter((l) => bought.has(l.email)).length;

  return (
    <>
      <PageTitle title={`Leady — bezpłatny fragment (${int(total)})`}>
        <a href="/api/admin/export/leads" className="btn btn-ghost px-3 py-2 text-sm">
          Eksport CSV
        </a>
      </PageTitle>
      <p className="mb-4 text-sm text-ink-300">
        Kupiło później: <b className="text-white">{int(converted)}</b> ({percent(ratio(converted, allLeads.length))} leadów). Do wysyłki
        newslettera używaj tylko osób ze zgodą marketingową.
      </p>
      <Panel>
        <Table
          head={["E-mail", "Źródło", "Zgoda marketingowa", "Kupił", "Data"]}
          rows={leads.map((l) => [l.email, l.source, l.marketingConsent ? "✓ tak" : "—", bought.has(l.email) ? "✓ tak" : "—", dateTime(l.createdAt)])}
          empty="Brak leadów"
        />
        <Pager page={page} pages={Math.ceil(total / PER_PAGE)} href={(p) => `/admin/leads?page=${p}`} />
      </Panel>
    </>
  );
}
