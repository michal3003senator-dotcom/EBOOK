import Link from "next/link";
import { BarList, ChartCard, DailyBars, DailyLines, Funnel, Heatmap, KpiTile } from "@/components/admin/charts";
import { Table } from "@/components/admin/ui";
import { getDashboard, RANGES } from "@/lib/analytics/dashboard";
import { dateTime, int, money, percent, ratio } from "@/lib/format";

export const dynamic = "force-dynamic";

const delta = (a: number, b: number) => (b ? (a - b) / b : null);
const secs = (s: number) => (s >= 60 ? `${Math.floor(s / 60)} min ${s % 60} s` : `${s} s`);
const EVENT_LABEL: Record<string, string> = {
  pageview: "Odsłona",
  cta_click: "Klik CTA",
  checkout_start: "Formularz kasy",
  purchase: "Zakup",
  lead: "Lead",
  download: "Pobranie",
};

function vitalRating(name: "lcp" | "cls" | "inp", v: number | null) {
  if (v === null) return "brak danych";
  const [good, poor] = ({ lcp: [2500, 4000], cls: [100, 250], inp: [200, 500] } as const)[name];
  return v <= good ? "✓ dobrze" : v <= poor ? "! do poprawy" : "✕ słabo";
}

export default async function Dashboard({ searchParams }: { searchParams: Promise<{ range?: string }> }) {
  const d = await getDashboard((await searchParams).range);
  const k = d.kpi;
  const p = d.prev;
  const days = d.series.map((s) => s.day);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-white">Statystyki</h1>
          <p className="mt-1 flex items-center gap-2 text-sm text-ink-300">
            <span className="relative flex size-2.5">
              <span className="absolute inline-flex size-full animate-ping rounded-full bg-emerald-400 opacity-60" />
              <span className="relative inline-flex size-2.5 rounded-full bg-emerald-400" />
            </span>
            {d.realtime} {d.realtime === 1 ? "osoba" : "osób"} na stronie (ostatnie 5 min)
          </p>
        </div>
        <nav className="flex flex-wrap gap-1 rounded-lg border border-ink-700 bg-ink-900 p-1" aria-label="Zakres dat">
          {Object.entries(RANGES).map(([key, label]) => (
            <Link
              key={key}
              href={`/admin?range=${key}`}
              aria-current={d.range.key === key ? "true" : undefined}
              className={`rounded-md px-3 py-1.5 text-sm ${d.range.key === key ? "bg-gold font-semibold text-ink-950" : "text-ink-300 hover:text-white"}`}
            >
              {label}
            </Link>
          ))}
        </nav>
      </div>

      <section aria-label="Sprzedaż" className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
        <KpiTile label="Przychód netto" value={money(k.revenue)} delta={delta(k.revenue, p.revenue)} hint="Opłacone zamówienia minus zwroty" />
        <KpiTile label="Zamówienia opłacone" value={int(k.orders)} delta={delta(k.orders, p.orders)} />
        <KpiTile label="Średnia wartość zamówienia" value={money(k.aov)} delta={delta(k.aov, p.aov)} />
        <KpiTile label="Konwersja" value={percent(k.conversion)} delta={delta(k.conversion, p.conversion)} hint="Opłacone zamówienia / sesje" />
        <KpiTile label="Przychód na odwiedzającego" value={money(k.revenuePerVisitor)} delta={delta(k.revenuePerVisitor, p.revenuePerVisitor)} />
        <KpiTile label="Skuteczność płatności" value={d.paymentSuccess === null ? "—" : percent(d.paymentSuccess)} hint="Opłacone / zakończone próby płatności" />
      </section>
      <section aria-label="Ruch" className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
        <KpiTile label="Unikalni odwiedzający" value={int(k.visitors)} delta={delta(k.visitors, p.visitors)} hint="Suma unikalnych dziennych (bez cookies)" />
        <KpiTile label="Sesje" value={int(k.sessions)} delta={delta(k.sessions, p.sessions)} />
        <KpiTile label="Odsłony" value={int(k.pageviews)} delta={delta(k.pageviews, p.pageviews)} />
        <KpiTile label="Współczynnik odrzuceń" value={percent(k.bounceRate)} delta={delta(k.bounceRate, p.bounceRate)} goodWhenUp={false} />
        <KpiTile label="Śr. czas zaangażowania" value={secs(k.avgEngagement)} delta={delta(k.avgEngagement, p.avgEngagement)} hint="Aktywny czas na stronie na sesję" />
        <KpiTile label="Leady (fragment)" value={int(k.leads)} delta={delta(k.leads, p.leads)} />
      </section>
      <section aria-label="Operacje" className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
        <KpiTile label="Porzucone koszyki" value={int(d.abandoned)} hint={`Wartość: ${money(d.abandonedValue)}`} />
        <KpiTile label="Utracona wartość koszyków" value={money(d.abandonedValue)} />
        <KpiTile label="Zwroty" value={`${int(k.refunds)} · ${money(k.refunded)}`} />
        <KpiTile label="Pobrania PDF" value={int(d.downloads)} />
        <KpiTile label="Klienci powracający" value={`${int(d.repeatCustomers)} / ${int(d.totalCustomers)}`} hint="Klienci z więcej niż 1 zamówieniem (cały okres)" />
        <KpiTile label="Nieudane e-maile" value={int(d.failedEmails)} />
      </section>

      <div className="grid gap-6 xl:grid-cols-2">
        <ChartCard title="Przychód dziennie" subtitle="Opłacone zamówienia wg dnia płatności">
          <DailyBars data={d.series.map((s) => ({ day: s.day, value: s.revenue / 100, note: `${s.orders} zam.` }))} unit="money" />
        </ChartCard>
        <ChartCard title="Ruch dziennie" subtitle="Unikalni odwiedzający i sesje">
          <DailyLines days={days} series={[{ name: "Odwiedzający", values: d.series.map((s) => s.visitors) }, { name: "Sesje", values: d.series.map((s) => s.sessions) }]} />
        </ChartCard>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <ChartCard title="Lejek sprzedaży" subtitle="Unikalne sesje na każdym etapie · % = przejście z poprzedniego kroku">
          <Funnel steps={d.funnel} />
        </ChartCard>
        <ChartCard title="Źródła ruchu" subtitle="UTM source, a gdy brak — domena odsyłająca">
          <Table
            head={["Źródło", "Sesje", "Zamówienia", "Konwersja", "Przychód"]}
            align={["l", "r", "r", "r", "r"]}
            rows={d.sources.map((s) => [s.key, int(s.sessions), int(s.orders), percent(ratio(s.orders, s.sessions)), money(s.revenue)])}
          />
        </ChartCard>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <ChartCard title="Kampanie (UTM)" subtitle="utm_campaign · source/medium">
          <Table
            head={["Kampania", "Sesje", "Zam.", "Konw.", "Przychód"]}
            align={["l", "r", "r", "r", "r"]}
            rows={d.campaigns.map((s) => [s.key, int(s.sessions), int(s.orders), percent(ratio(s.orders, s.sessions)), money(s.revenue)])}
            empty="Dodawaj ?utm_source=tiktok&utm_campaign=… do linków, aby mierzyć kampanie"
          />
        </ChartCard>
        <ChartCard title="Partnerzy" subtitle="Program partnerski (link ?ref=KOD)">
          <Table
            head={["Partner", "Sesje", "Zam.", "Przychód", "Prowizja"]}
            align={["l", "r", "r", "r", "r"]}
            rows={d.affiliates.map((a) => [`${a.name} (${a.code})`, int(a.sessions), int(a.orders), money(a.revenue), money(a.commission)])}
            empty="Brak ruchu z linków partnerskich"
          />
        </ChartCard>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <ChartCard title="Urządzenia" subtitle="Sesje, zamówienia, konwersja">
          <Table
            head={["Typ", "Sesje", "Zam.", "Konw."]}
            align={["l", "r", "r", "r"]}
            rows={d.devices.map((s) => [s.key, int(s.sessions), int(s.orders), percent(ratio(s.orders, s.sessions))])}
          />
        </ChartCard>
        <ChartCard title="Przeglądarki">
          <BarList items={d.browsers} total={k.sessions} />
        </ChartCard>
        <ChartCard title="Systemy">
          <BarList items={d.os} total={k.sessions} />
        </ChartCard>
        <ChartCard title="Kraje">
          <BarList items={d.countries} total={k.sessions} />
        </ChartCard>
        <ChartCard title="Języki przeglądarki">
          <BarList items={d.languages} total={k.sessions} />
        </ChartCard>
        <ChartCard title="Domeny odsyłające">
          <BarList items={d.referrers} />
        </ChartCard>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <ChartCard title="Zasięg sekcji strony sprzedażowej" subtitle={`Ile z ${int(d.landingSessions)} sesji na stronie głównej zobaczyło sekcję`}>
          <BarList items={d.sectionReach} total={d.landingSessions} />
        </ChartCard>
        <div className="space-y-6">
          <ChartCard title="Głębokość przewijania" subtitle="Sesje, które dotarły do danego % strony głównej">
            <BarList items={d.scrollDepth} total={d.landingSessions} />
          </ChartCard>
          <ChartCard title="Kliknięcia przycisków (CTA)">
            <BarList items={d.ctas} />
          </ChartCard>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <ChartCard title="Najczęściej otwierane pytania FAQ" subtitle="Podpowiada, jakie obiekcje mają kupujący">
          <BarList items={d.faqOpens} />
        </ChartCard>
        <ChartCard title="Najciekawsze rozdziały" subtitle="Rozwinięcia w spisie treści">
          <BarList items={d.tocOpens} />
        </ChartCard>
      </div>

      <ChartCard title="Kiedy przychodzą odwiedzający" subtitle="Sesje wg dnia tygodnia i godziny (czas polski) — publikuj filmy przed szczytem">
        <Heatmap grid={d.heat} />
      </ChartCard>

      <div className="grid gap-6 lg:grid-cols-3">
        <ChartCard title="Szybkość strony (Core Web Vitals, p75)">
          <Table
            head={["Metryka", "Wartość", "Ocena"]}
            align={["l", "r", "r"]}
            rows={[
              ["LCP (ładowanie)", d.vitals.lcp === null ? "—" : `${(d.vitals.lcp / 1000).toFixed(2)} s`, vitalRating("lcp", d.vitals.lcp)],
              ["INP (reakcja)", d.vitals.inp === null ? "—" : `${d.vitals.inp} ms`, vitalRating("inp", d.vitals.inp)],
              ["CLS (stabilność)", d.vitals.cls === null ? "—" : (d.vitals.cls / 1000).toFixed(3), vitalRating("cls", d.vitals.cls)],
            ]}
          />
        </ChartCard>
        <ChartCard title="Kody rabatowe" subtitle="Wykorzystanie w okresie">
          <Table
            head={["Kod", "Użycia", "Rabat", "Przychód"]}
            align={["l", "r", "r", "r"]}
            rows={d.coupons.map((c) => [c.code, int(c.uses), money(c.discount), money(c.revenue)])}
            empty="Brak zamówień z kodem"
          />
        </ChartCard>
        <ChartCard title="Najczęściej odwiedzane strony">
          <BarList items={d.pages} />
        </ChartCard>
      </div>

      <div className="grid gap-6 xl:grid-cols-[2fr_1fr]">
        <ChartCard title="Ostatnia aktywność" subtitle="Na żywo, niezależnie od zakresu">
          <Table
            head={["Kiedy", "Zdarzenie", "Szczegóły", "Źródło", "Urządzenie"]}
            rows={d.recent.map((e) => [
              dateTime(e.createdAt),
              EVENT_LABEL[e.type] ?? e.type,
              e.type === "purchase" ? `${e.name} · ${money(e.value ?? 0)}` : (e.name ?? e.path),
              e.source,
              `${e.device} · ${e.country}`,
            ])}
          />
        </ChartCard>
        <ChartCard title="Linki wychodzące">
          <BarList items={d.outbound} />
        </ChartCard>
      </div>
    </div>
  );
}
