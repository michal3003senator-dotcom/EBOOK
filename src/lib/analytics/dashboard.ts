import "server-only";
import { faq, chapters } from "@/content/ebook";
import { db } from "../db";
import { daysBetween, warsaw } from "../time";

export const RANGES = { "1": "Dziś", "7": "7 dni", "30": "30 dni", "90": "90 dni", "365": "12 mies.", all: "Całość" } as const;
export type RangeKey = keyof typeof RANGES;

function startOfWarsawDay(d: Date) {
  const utcMidnight = new Date(`${warsaw(d).day}T00:00:00Z`);
  return new Date(utcMidnight.getTime() - warsaw(utcMidnight).hour * 3600_000);
}

export function resolveRange(key: string | undefined) {
  const k: RangeKey = key && key in RANGES ? (key as RangeKey) : "30";
  const to = new Date();
  let from: Date;
  if (k === "all") from = new Date("2024-01-01");
  else if (k === "1") from = startOfWarsawDay(to);
  else from = new Date(to.getTime() - Number(k) * 86_400_000);
  const span = to.getTime() - from.getTime();
  return { key: k, from, to, prevFrom: new Date(from.getTime() - span), prevTo: from };
}

type Row = Awaited<ReturnType<typeof loadEvents>>[number];

const loadEvents = (from: Date, to: Date) =>
  db.event.findMany({
    where: { createdAt: { gte: from, lte: to } },
    select: {
      type: true,
      name: true,
      value: true,
      sessionId: true,
      visitorId: true,
      source: true,
      utmSource: true,
      utmMedium: true,
      utmCampaign: true,
      referrerHost: true,
      device: true,
      browser: true,
      os: true,
      country: true,
      lang: true,
      affiliate: true,
      path: true,
      day: true,
      hour: true,
      dow: true,
      createdAt: true,
    },
    orderBy: { createdAt: "asc" },
    take: 1_000_000,
  });

type Session = Row & { events: Row[]; engaged: number; pageviews: number };

function sessionsOf(events: Row[]) {
  const map = new Map<string, Session>();
  for (const e of events) {
    if (e.sessionId === "server") continue;
    let s = map.get(e.sessionId);
    if (!s) map.set(e.sessionId, (s = { ...e, events: [], engaged: 0, pageviews: 0 }));
    s.events.push(e);
    if (e.type === "engagement") s.engaged += e.value ?? 0;
    if (e.type === "pageview") s.pageviews++;
  }
  return [...map.values()].filter((s) => s.pageviews > 0);
}

const has = (s: Session, type: string, name?: string) => s.events.some((e) => e.type === type && (name === undefined || e.name === name));

const INTERACTIONS = new Set(["cta_click", "faq_open", "toc_open", "checkout_view", "checkout_start", "lead", "purchase", "outbound"]);
const bounced = (s: Session) =>
  s.pageviews <= 1 && s.engaged < 10 && !s.events.some((e) => INTERACTIONS.has(e.type) || (e.type === "scroll" && (e.value ?? 0) >= 50));

export type Breakdown = { key: string; sessions: number; orders: number; revenue: number };

function breakdown(sessions: Session[], orders: OrderRow[], key: (s: { source: string } & Partial<Row>) => string | null | undefined, orderKey: (o: OrderRow) => string | null | undefined) {
  const m = new Map<string, Breakdown>();
  const get = (k: string) => m.get(k) ?? (m.set(k, { key: k, sessions: 0, orders: 0, revenue: 0 }), m.get(k)!);
  for (const s of sessions) {
    const k = key(s);
    if (k) get(k).sessions++;
  }
  for (const o of orders) {
    const k = orderKey(o);
    if (!k) continue;
    const b = get(k);
    b.orders++;
    b.revenue += o.totalCents;
  }
  return [...m.values()].sort((a, b) => b.revenue - a.revenue || b.sessions - a.sessions);
}

function count<T>(items: T[], key: (x: T) => string | null | undefined) {
  const m = new Map<string, number>();
  for (const x of items) {
    const k = key(x);
    if (k) m.set(k, (m.get(k) ?? 0) + 1);
  }
  return [...m.entries()].map(([label, value]) => ({ label, value })).sort((a, b) => b.value - a.value);
}

function p75(values: number[]) {
  if (!values.length) return null;
  const v = [...values].sort((a, b) => a - b);
  return v[Math.min(v.length - 1, Math.floor(v.length * 0.75))] ?? null;
}

const loadOrders = (from: Date, to: Date) =>
  db.order.findMany({
    where: { OR: [{ createdAt: { gte: from, lte: to } }, { paidAt: { gte: from, lte: to } }, { refundedAt: { gte: from, lte: to } }] },
    select: {
      id: true,
      status: true,
      totalCents: true,
      discountCents: true,
      commissionCents: true,
      email: true,
      source: true,
      utmCampaign: true,
      utmSource: true,
      utmMedium: true,
      device: true,
      country: true,
      createdAt: true,
      paidAt: true,
      refundedAt: true,
      coupon: { select: { code: true } },
      affiliate: { select: { code: true, name: true } },
    },
  });
type OrderRow = Awaited<ReturnType<typeof loadOrders>>[number];

const inRange = (d: Date | null, from: Date, to: Date) => Boolean(d && d >= from && d <= to);

function core(events: Row[], orders: OrderRow[], from: Date, to: Date) {
  const sessions = sessionsOf(events);
  const paid = orders.filter((o) => (o.status === "PAID" || o.status === "REFUNDED") && inRange(o.paidAt, from, to));
  const revenue = paid.reduce((s, o) => s + o.totalCents, 0);
  const refunds = orders.filter((o) => inRange(o.refundedAt, from, to));
  const refunded = refunds.reduce((s, o) => s + o.totalCents, 0);
  const visitors = new Set(events.filter((e) => e.sessionId !== "server").map((e) => `${e.day}|${e.visitorId}`)).size;
  const engaged = sessions.reduce((s, x) => s + x.engaged, 0);
  return {
    sessions,
    paid,
    kpi: {
      revenue: revenue - refunded,
      grossRevenue: revenue,
      orders: paid.length,
      aov: paid.length ? Math.round(revenue / paid.length) : 0,
      visitors,
      sessions: sessions.length,
      pageviews: events.filter((e) => e.type === "pageview").length,
      conversion: sessions.length ? paid.length / sessions.length : 0,
      bounceRate: sessions.length ? sessions.filter(bounced).length / sessions.length : 0,
      avgEngagement: sessions.length ? Math.round(engaged / sessions.length) : 0,
      leads: events.filter((e) => e.type === "lead").length,
      refunds: refunds.length,
      refunded,
      revenuePerVisitor: visitors ? Math.round((revenue - refunded) / visitors) : 0,
    },
  };
}

export async function getDashboard(rangeKey: string | undefined) {
  const r = resolveRange(rangeKey);
  const [events, prevEvents, orders, prevOrders, rt, recent, downloads, failedEmails, coupons, affiliates] = await Promise.all([
    loadEvents(r.from, r.to),
    loadEvents(r.prevFrom, r.prevTo),
    loadOrders(r.from, r.to),
    loadOrders(r.prevFrom, r.prevTo),
    db.event.groupBy({ by: ["visitorId"], where: { createdAt: { gte: new Date(Date.now() - 5 * 60_000) }, sessionId: { not: "server" } } }),
    db.event.findMany({
      where: { type: { in: ["pageview", "cta_click", "checkout_start", "purchase", "lead", "download"] } },
      orderBy: { createdAt: "desc" },
      take: 12,
      select: { type: true, name: true, path: true, source: true, device: true, country: true, createdAt: true, value: true },
    }),
    db.downloadLog.count({ where: { createdAt: { gte: r.from, lte: r.to } } }),
    db.emailLog.count({ where: { status: "FAILED", createdAt: { gte: r.from, lte: r.to } } }),
    db.coupon.findMany({ select: { code: true, usedCount: true, maxUses: true, active: true } }),
    db.affiliate.findMany({ select: { code: true, name: true, commissionPct: true } }),
  ]);

  const cur = core(events, orders, r.from, r.to);
  const prev = core(prevEvents, prevOrders, r.prevFrom, r.prevTo);
  const { sessions, paid } = cur;

  // Serie dzienne
  const days = daysBetween(r.key === "all" && events[0] ? events[0].createdAt : r.from, r.to).slice(-366);
  const daily = new Map(days.map((d) => [d, { day: d, revenue: 0, orders: 0, visitors: new Set<string>(), sessions: 0 }]));
  for (const e of events) if (e.sessionId !== "server") daily.get(e.day)?.visitors.add(e.visitorId);
  for (const s of sessions) {
    const d = daily.get(s.day);
    if (d) d.sessions++;
  }
  for (const o of paid) {
    const d = daily.get(warsaw(o.paidAt ?? o.createdAt).day);
    if (d) (d.revenue += o.totalCents, d.orders++);
  }
  const series = [...daily.values()].map((d) => ({ day: d.day, revenue: d.revenue, orders: d.orders, visitors: d.visitors.size, sessions: d.sessions }));

  // Lejek (unikalne sesje)
  const funnel = [
    { label: "Wejście na stronę", value: sessions.length },
    { label: "Zobaczył cennik", value: sessions.filter((s) => has(s, "section_view", "pricing")).length },
    { label: "Kliknął „Kup”", value: sessions.filter((s) => has(s, "cta_click")).length },
    { label: "Otworzył kasę", value: sessions.filter((s) => has(s, "checkout_view")).length },
    { label: "Wysłał formularz", value: sessions.filter((s) => has(s, "checkout_start")).length },
    { label: "Zapłacił", value: paid.length },
  ];

  const landingSessions = sessions.filter((s) => s.events.some((e) => e.type === "pageview" && e.path === "/"));
  const sectionNames: Record<string, string> = {
    hero: "Hero",
    stats: "Statystyki rynku",
    problem: "Problem",
    benefits: "Korzyści",
    pipeline: "Linia produkcyjna",
    toc: "Spis treści",
    previews: "Podgląd stron",
    hooks: "Hooki i karty",
    plan: "Plan 30 dni",
    honesty: "Zero ściemy",
    for_who: "Dla kogo",
    sample: "Darmowy fragment",
    author: "Autor",
    pricing: "Cennik",
    faq: "FAQ",
    final_cta: "Końcowe CTA",
  };
  const sectionReach = Object.entries(sectionNames).map(([k, label]) => ({
    label,
    value: landingSessions.filter((s) => has(s, "section_view", k)).length,
  }));
  const scrollDepth = [25, 50, 75, 100].map((d) => ({
    label: `${d}%`,
    value: landingSessions.filter((s) => s.events.some((e) => e.type === "scroll" && (e.value ?? 0) >= d)).length,
  }));

  const clientEvents = events.filter((e) => e.sessionId !== "server");
  const ctaLabels: Record<string, string> = {
    hero: "Hero: Kup",
    hero_sample: "Hero: fragment",
    header: "Nagłówek",
    pricing: "Cennik",
    final: "Końcowe CTA",
    sticky_mobile: "Pasek mobilny",
    sample_submit: "Wyślij fragment",
    sample_download: "Pobierz fragment",
    checkout_pay: "Kasa: Zapłać",
    partner_apply: "Zgłoszenie partnera",
  };
  const ctas = count(clientEvents.filter((e) => e.type === "cta_click"), (e) => ctaLabels[e.name ?? ""] ?? e.name);
  const faqOpens = count(clientEvents.filter((e) => e.type === "faq_open"), (e) => faq[Number(e.name) - 1]?.q ?? e.name);
  const tocOpens = count(clientEvents.filter((e) => e.type === "toc_open"), (e) => {
    const c = chapters.find((x) => x.n === e.name);
    return c ? `${c.n}. ${c.title}` : e.name;
  });

  const heat = Array.from({ length: 7 }, () => Array<number>(24).fill(0));
  for (const s of sessions) heat[s.dow]![s.hour]!++;

  const vitals = (n: string) => p75(clientEvents.filter((e) => e.type === "vital" && e.name === n).map((e) => e.value ?? 0));

  const couponStats = new Map<string, { code: string; uses: number; discount: number; revenue: number }>();
  for (const o of paid) {
    if (!o.coupon) continue;
    const c = couponStats.get(o.coupon.code) ?? { code: o.coupon.code, uses: 0, discount: 0, revenue: 0 };
    c.uses++;
    c.discount += o.discountCents;
    c.revenue += o.totalCents;
    couponStats.set(c.code, c);
  }

  const affStats = affiliates
    .map((a) => {
      const os = paid.filter((o) => o.affiliate?.code === a.code);
      return {
        ...a,
        sessions: sessions.filter((s) => s.affiliate === a.code).length,
        orders: os.length,
        revenue: os.reduce((s, o) => s + o.totalCents, 0),
        commission: os.reduce((s, o) => s + o.commissionCents, 0),
      };
    })
    .filter((a) => a.sessions || a.orders)
    .sort((a, b) => b.revenue - a.revenue);

  const created = orders.filter((o) => inRange(o.createdAt, r.from, r.to));
  const hourAgo = Date.now() - 3600_000;
  const abandoned = created.filter((o) => o.status !== "PAID" && o.status !== "REFUNDED" && o.createdAt.getTime() < hourAgo);
  const attempts = created.filter((o) => o.status !== "PENDING");
  const customers = await db.order.groupBy({ by: ["email"], where: { status: "PAID" }, _count: true });

  return {
    range: r,
    kpi: cur.kpi,
    prev: prev.kpi,
    series,
    funnel,
    sources: breakdown(sessions, paid, (s) => s.source, (o) => o.source).slice(0, 15),
    campaigns: breakdown(
      sessions,
      paid,
      (s) => (s.utmCampaign ? `${s.utmCampaign} · ${s.utmSource ?? "?"}/${s.utmMedium ?? "?"}` : null),
      (o) => (o.utmCampaign ? `${o.utmCampaign} · ${o.utmSource ?? "?"}/${o.utmMedium ?? "?"}` : null),
    ).slice(0, 15),
    referrers: count(sessions, (s) => s.referrerHost).slice(0, 12),
    devices: breakdown(sessions, paid, (s) => s.device, (o) => o.device),
    browsers: count(sessions, (s) => s.browser).slice(0, 10),
    os: count(sessions, (s) => s.os).slice(0, 8),
    countries: count(sessions, (s) => s.country).slice(0, 12),
    languages: count(sessions, (s) => s.lang || null).slice(0, 8),
    pages: count(clientEvents.filter((e) => e.type === "pageview"), (e) => e.path).slice(0, 12),
    outbound: count(clientEvents.filter((e) => e.type === "outbound"), (e) => e.name).slice(0, 10),
    sectionReach,
    landingSessions: landingSessions.length,
    scrollDepth,
    ctas,
    faqOpens,
    tocOpens,
    heat,
    vitals: { lcp: vitals("LCP"), cls: vitals("CLS"), inp: vitals("INP") },
    coupons: [...couponStats.values()].sort((a, b) => b.uses - a.uses),
    couponList: coupons,
    affiliates: affStats,
    abandoned: abandoned.length,
    abandonedValue: abandoned.reduce((s, o) => s + o.totalCents, 0),
    paymentSuccess: attempts.length ? attempts.filter((o) => o.status === "PAID" || o.status === "REFUNDED").length / attempts.length : null,
    repeatCustomers: customers.filter((c) => c._count > 1).length,
    totalCustomers: customers.length,
    downloads,
    failedEmails,
    realtime: rt.length,
    recent,
  };
}

export type Dashboard = Awaited<ReturnType<typeof getDashboard>>;
