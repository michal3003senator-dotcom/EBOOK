import { createCoupon, toggleCoupon } from "@/app/admin/actions";
import { ActionForm, Field } from "@/components/admin/action-form";
import { PageTitle, Panel, Table } from "@/components/admin/ui";
import { db } from "@/lib/db";
import { dateTime, money } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function Coupons() {
  const coupons = await db.coupon.findMany({
    orderBy: { createdAt: "desc" },
    include: { orders: { where: { status: "PAID" }, select: { totalCents: true, discountCents: true } } },
  });
  return (
    <>
      <PageTitle title="Kody rabatowe" />
      <div className="space-y-6">
        <Panel title="Nowy kod">
          <ActionForm action={createCoupon} submit="Utwórz kod">
            <div className="grid gap-4 md:grid-cols-3">
              <Field label="Kod">
                <input name="code" required placeholder="START20" className="field uppercase" />
              </Field>
              <Field label="Typ">
                <select name="type" className="field">
                  <option value="PERCENT">Procent (%)</option>
                  <option value="FIXED">Kwota (zł)</option>
                </select>
              </Field>
              <Field label="Wartość">
                <input name="value" type="number" step="0.01" min="0.01" required className="field" />
              </Field>
              <Field label="Limit użyć" hint="Puste = bez limitu">
                <input name="maxUses" type="number" min="1" className="field" />
              </Field>
              <Field label="Ważny do" hint="Puste = bezterminowo">
                <input name="validUntil" type="datetime-local" className="field" />
              </Field>
              <Field label="Notatka">
                <input name="note" placeholder="np. kampania TikTok październik" className="field" />
              </Field>
            </div>
          </ActionForm>
        </Panel>
        <Panel title="Wszystkie kody">
          <Table
            head={["Kod", "Rabat", "Użycia", "Ważny do", "Przychód", "Udzielony rabat", "Status", ""]}
            rows={coupons.map((c) => [
              <b key="c" className="text-white">{c.code}</b>,
              c.type === "PERCENT" ? `${c.value}%` : money(c.value),
              `${c.usedCount}${c.maxUses ? ` / ${c.maxUses}` : ""}`,
              c.validUntil ? dateTime(c.validUntil) : "—",
              money(c.orders.reduce((s, o) => s + o.totalCents, 0)),
              money(c.orders.reduce((s, o) => s + o.discountCents, 0)),
              c.active ? "aktywny" : "wyłączony",
              <form key="t" action={toggleCoupon.bind(null, c.id)}>
                <button className="text-xs text-gold hover:underline">{c.active ? "Wyłącz" : "Włącz"}</button>
              </form>,
            ])}
            empty="Brak kodów"
          />
        </Panel>
      </div>
    </>
  );
}
