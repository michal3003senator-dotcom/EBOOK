import Link from "next/link";
import { Badge, PageTitle, Pager, Panel, Table } from "@/components/admin/ui";
import { db } from "@/lib/db";
import { env } from "@/lib/env";
import { dateTime } from "@/lib/format";

export const dynamic = "force-dynamic";
const PER_PAGE = 50;

export default async function Emails({ searchParams }: { searchParams: Promise<{ page?: string }> }) {
  const page = Math.max(1, Number((await searchParams).page) || 1);
  const [emails, total] = await Promise.all([
    db.emailLog.findMany({ orderBy: { createdAt: "desc" }, skip: (page - 1) * PER_PAGE, take: PER_PAGE, include: { order: { select: { id: true, number: true } } } }),
    db.emailLog.count(),
  ]);
  return (
    <>
      <PageTitle title="E-maile" />
      {!env.SMTP_URL && (
        <p className="mb-4 rounded-lg border border-coral/40 bg-coral/10 p-3 text-sm text-coral">
          SMTP nie jest skonfigurowany — wiadomości trafiają tylko do logu serwera. Ustaw SMTP_URL w pliku .env.
        </p>
      )}
      <Panel>
        <Table
          head={["Data", "Do", "Temat", "Szablon", "Zamówienie", "Status"]}
          rows={emails.map((e) => [
            dateTime(e.createdAt),
            e.to,
            <span key="s">
              {e.subject}
              {e.error && <span className="block text-xs text-coral">{e.error}</span>}
            </span>,
            e.template,
            e.order ? (
              <Link key="o" href={`/admin/orders/${e.order.id}`} className="text-gold hover:underline">
                #{e.order.number}
              </Link>
            ) : (
              "—"
            ),
            <Badge key="b" status={e.status} />,
          ])}
          empty="Brak wiadomości"
        />
        <Pager page={page} pages={Math.ceil(total / PER_PAGE)} href={(p) => `/admin/emails?page=${p}`} />
      </Panel>
    </>
  );
}
