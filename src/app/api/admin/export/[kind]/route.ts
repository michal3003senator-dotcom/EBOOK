import { currentAdmin } from "@/lib/auth";
import { db } from "@/lib/db";

const cell = (v: unknown) => {
  let s = v instanceof Date ? v.toISOString() : String(v ?? "");
  if (/^[=+\-@\t\r]/.test(s)) s = `'${s}`; // ochrona przed CSV injection
  return /[",;\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
};
const csv = (head: string[], rows: unknown[][]) => "﻿" + [head, ...rows].map((r) => r.map(cell).join(";")).join("\r\n");
const zl = (c: number) => (c / 100).toFixed(2).replace(".", ",");

export async function GET(req: Request, { params }: { params: Promise<{ kind: string }> }) {
  if (!(await currentAdmin())) return new Response("Unauthorized", { status: 401 });
  const { kind } = await params;
  const q = new URL(req.url).searchParams;
  let body: string;

  if (kind === "orders") {
    const status = q.get("status") || undefined;
    const search = q.get("q") || undefined;
    const orders = await db.order.findMany({
      where: { ...(status ? { status } : {}), ...(search ? { email: { contains: search.toLowerCase() } } : {}) },
      orderBy: { createdAt: "desc" },
      include: { coupon: true, affiliate: true, product: true },
    });
    body = csv(
      ["numer", "data", "opłacono", "status", "email", "imię", "produkt", "cena", "rabat", "kwota", "waluta", "kod", "partner", "prowizja", "bramka", "id_bramki", "źródło", "kampania", "faktura", "firma", "nip", "adres", "zgoda_marketing"],
      orders.map((o) => [
        o.number, o.createdAt, o.paidAt, o.status, o.email, o.name, o.product.name, zl(o.unitPriceCents), zl(o.discountCents), zl(o.totalCents),
        o.currency, o.coupon?.code, o.affiliate?.code, zl(o.commissionCents), o.provider, o.providerRef, o.source, o.utmCampaign,
        o.wantsInvoice ? "tak" : "nie", o.companyName, o.taxId, o.address, o.marketingConsent ? "tak" : "nie",
      ]),
    );
  } else if (kind === "customers") {
    const customers = await db.customer.findMany({ include: { orders: { where: { status: "PAID" } } }, orderBy: { createdAt: "desc" } });
    body = csv(
      ["email", "imię", "zamówienia", "wartość", "zgoda_marketing", "utworzono"],
      customers.map((c) => [c.email, c.name, c.orders.length, zl(c.orders.reduce((s, o) => s + o.totalCents, 0)), c.marketingConsent ? "tak" : "nie", c.createdAt]),
    );
  } else if (kind === "leads") {
    const leads = await db.lead.findMany({ orderBy: { createdAt: "desc" } });
    body = csv(["email", "źródło", "zgoda_marketing", "utworzono"], leads.map((l) => [l.email, l.source, l.marketingConsent ? "tak" : "nie", l.createdAt]));
  } else {
    return new Response("Not found", { status: 404 });
  }

  return new Response(body, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${kind}-${new Date().toISOString().slice(0, 10)}.csv"`,
      "Cache-Control": "no-store",
    },
  });
}
