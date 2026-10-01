import { PageTitle, Pager, Panel, Table } from "@/components/admin/ui";
import { db } from "@/lib/db";
import { dateTime, int, money } from "@/lib/format";

export const dynamic = "force-dynamic";
const PER_PAGE = 50;

export default async function Customers({ searchParams }: { searchParams: Promise<{ q?: string; page?: string }> }) {
  const { q = "", page: pageRaw } = await searchParams;
  const page = Math.max(1, Number(pageRaw) || 1);
  const where = q ? { OR: [{ email: { contains: q.toLowerCase() } }, { name: { contains: q } }] } : {};
  const [customers, total] = await Promise.all([
    db.customer.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * PER_PAGE,
      take: PER_PAGE,
      include: { orders: { where: { status: "PAID" }, select: { totalCents: true, paidAt: true } } },
    }),
    db.customer.count({ where }),
  ]);
  return (
    <>
      <PageTitle title={`Klienci (${int(total)})`}>
        <a href="/api/admin/export/customers" className="btn btn-ghost px-3 py-2 text-sm">
          Eksport CSV
        </a>
      </PageTitle>
      <Panel>
        <form className="mb-4 flex gap-2">
          <input name="q" defaultValue={q} placeholder="Szukaj e-mail lub imię" className="field max-w-xs" />
          <button className="btn btn-gold px-4 py-2">Szukaj</button>
        </form>
        <Table
          head={["E-mail", "Imię", "Zamówienia", "Wartość (LTV)", "Marketing", "Pierwszy zakup"]}
          align={["l", "l", "r", "r", "l", "l"]}
          rows={customers.map((c) => [
            c.email,
            c.name || "—",
            int(c.orders.length),
            money(c.orders.reduce((s, o) => s + o.totalCents, 0)),
            c.marketingConsent ? "✓ zgoda" : "—",
            dateTime(c.createdAt),
          ])}
          empty="Brak klientów"
        />
        <Pager page={page} pages={Math.ceil(total / PER_PAGE)} href={(p) => `/admin/customers?${new URLSearchParams({ q, page: String(p) })}`} />
      </Panel>
    </>
  );
}
