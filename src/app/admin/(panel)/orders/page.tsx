import Link from "next/link";
import type { Prisma } from "@/generated/prisma/client";
import { Badge, PageTitle, Pager, Panel, Table } from "@/components/admin/ui";
import { db } from "@/lib/db";
import { dateTime, money, STATUS_LABEL } from "@/lib/format";

export const dynamic = "force-dynamic";
const PER_PAGE = 50;

export default async function Orders({ searchParams }: { searchParams: Promise<{ q?: string; status?: string; page?: string }> }) {
  const { q = "", status = "", page: pageRaw } = await searchParams;
  const page = Math.max(1, Number(pageRaw) || 1);
  const num = Number(q.replace("#", ""));
  const where: Prisma.OrderWhereInput = {
    ...(status ? { status } : {}),
    ...(q ? { OR: [{ email: { contains: q.toLowerCase() } }, { name: { contains: q } }, ...(num ? [{ number: num }] : [])] } : {}),
  };
  const [orders, total] = await Promise.all([
    db.order.findMany({ where, orderBy: { createdAt: "desc" }, skip: (page - 1) * PER_PAGE, take: PER_PAGE, include: { coupon: true } }),
    db.order.count({ where }),
  ]);
  const qs = (p: number) => `/admin/orders?${new URLSearchParams({ q, status, page: String(p) })}`;

  return (
    <>
      <PageTitle title="Zamówienia">
        <a href={`/api/admin/export/orders?${new URLSearchParams({ q, status })}`} className="btn btn-ghost px-3 py-2 text-sm">
          Eksport CSV
        </a>
      </PageTitle>
      <Panel>
        <form className="mb-4 flex flex-wrap gap-2">
          <input name="q" defaultValue={q} placeholder="E-mail, imię lub #numer" className="field max-w-xs" />
          <select name="status" defaultValue={status} className="field max-w-48">
            <option value="">Wszystkie statusy</option>
            {Object.entries(STATUS_LABEL).map(([v, l]) => (
              <option key={v} value={v}>
                {l}
              </option>
            ))}
          </select>
          <button className="btn btn-gold px-4 py-2">Filtruj</button>
        </form>
        <Table
          head={["#", "Data", "Klient", "Kwota", "Kod", "Źródło", "Status"]}
          align={["l", "l", "l", "r", "l", "l", "l"]}
          rows={orders.map((o) => [
            <Link key="n" href={`/admin/orders/${o.id}`} className="font-semibold text-gold hover:underline">
              #{o.number}
            </Link>,
            dateTime(o.createdAt),
            <span key="c">
              {o.email}
              {o.name && <span className="block text-xs text-ink-400">{o.name}</span>}
            </span>,
            money(o.totalCents, o.currency),
            o.coupon?.code ?? "—",
            o.source,
            <Badge key="s" status={o.status} />,
          ])}
          empty="Brak zamówień"
        />
        <Pager page={page} pages={Math.ceil(total / PER_PAGE)} href={qs} />
      </Panel>
    </>
  );
}
