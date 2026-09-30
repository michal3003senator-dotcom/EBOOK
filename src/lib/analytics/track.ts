import "server-only";
import { z } from "zod";
import { dailyVisitorId, randomToken } from "../crypto";
import { db } from "../db";
import { env } from "../env";
import { clientInfo } from "../request";
import { warsaw } from "../time";
import { parseUA } from "../ua";
import { classifySource, referrerHost } from "./source";

export const CLIENT_EVENTS = [
  "pageview",
  "scroll",
  "section_view",
  "cta_click",
  "faq_open",
  "toc_open",
  "checkout_view",
  "checkout_start",
  "checkout_error",
  "coupon_apply",
  "engagement",
  "vital",
  "outbound",
] as const;

export const SERVER_EVENTS = ["purchase", "payment_failed", "refund", "lead", "download"] as const;

const str = (max: number) => z.string().trim().max(max).optional();

export const clientEventSchema = z.object({
  type: z.enum(CLIENT_EVENTS),
  name: str(80),
  value: z.number().int().min(0).max(10_000_000).optional(),
  path: z.string().max(300).default("/"),
  referrer: str(500),
  utm: z
    .object({ source: str(100), medium: str(100), campaign: str(150), content: str(150), term: str(150) })
    .partial()
    .optional(),
  ref: str(40),
});

const SESSION_GAP_MS = 30 * 60_000;
const ownHost = new URL(env.APP_URL).hostname.replace(/^www\./, "");

/** Identyfikacja odwiedzającego i sesji bez cookies. */
export async function resolveVisit(opts: {
  referrer?: string;
  utm?: z.infer<typeof clientEventSchema>["utm"];
  ref?: string;
}) {
  const { ip, ua, country, lang } = await clientInfo();
  const now = new Date();
  const t = warsaw(now);
  const agent = parseUA(ua);
  const visitorId = dailyVisitorId(ip, ua, t.day);

  const last = await db.event.findFirst({
    where: { visitorId, createdAt: { gt: new Date(now.getTime() - SESSION_GAP_MS) } },
    orderBy: { createdAt: "desc" },
  });

  const hasNewCampaign = Boolean(opts.utm?.source);
  if (last && !hasNewCampaign) {
    return {
      bot: agent.bot,
      base: {
        visitorId,
        sessionId: last.sessionId,
        source: last.source,
        referrerHost: last.referrerHost,
        utmSource: last.utmSource,
        utmMedium: last.utmMedium,
        utmCampaign: last.utmCampaign,
        utmContent: last.utmContent,
        utmTerm: last.utmTerm,
        affiliate: last.affiliate ?? opts.ref ?? null,
        device: agent.device,
        browser: agent.browser,
        os: agent.os,
        country,
        lang,
        ...t,
      },
    };
  }

  const refHost = referrerHost(opts.referrer, ownHost);
  const affiliate = opts.ref ?? null;
  return {
    bot: agent.bot,
    base: {
      visitorId,
      sessionId: randomToken(12),
      source: classifySource(opts.utm?.source, refHost, affiliate),
      referrerHost: refHost,
      utmSource: opts.utm?.source ?? null,
      utmMedium: opts.utm?.medium ?? null,
      utmCampaign: opts.utm?.campaign ?? null,
      utmContent: opts.utm?.content ?? null,
      utmTerm: opts.utm?.term ?? null,
      affiliate,
      device: agent.device,
      browser: agent.browser,
      os: agent.os,
      country,
      lang,
      ...t,
    },
  };
}

export type VisitBase = Awaited<ReturnType<typeof resolveVisit>>["base"];

export async function trackClientEvent(input: z.infer<typeof clientEventSchema>) {
  const visit = await resolveVisit(input);
  if (visit.bot) return null;
  await db.event.create({
    data: { ...visit.base, type: input.type, name: input.name ?? null, value: input.value ?? null, path: input.path },
  });
  return visit.base;
}

/** Zdarzenie serwerowe (zakup, zwrot, pobranie) przypięte do sesji zamówienia. */
export async function trackServerEvent(
  type: (typeof SERVER_EVENTS)[number],
  opts: { visitorId?: string | null; sessionId?: string | null; name?: string; value?: number; path?: string },
) {
  const sessionEvent = opts.sessionId
    ? await db.event.findFirst({ where: { sessionId: opts.sessionId }, orderBy: { createdAt: "asc" } })
    : null;
  const t = warsaw();
  await db.event.create({
    data: {
      type,
      name: opts.name ?? null,
      value: opts.value ?? null,
      path: opts.path ?? "/",
      visitorId: opts.visitorId ?? sessionEvent?.visitorId ?? "server",
      sessionId: opts.sessionId ?? "server",
      source: sessionEvent?.source ?? "bezpośrednie",
      referrerHost: sessionEvent?.referrerHost ?? null,
      utmSource: sessionEvent?.utmSource ?? null,
      utmMedium: sessionEvent?.utmMedium ?? null,
      utmCampaign: sessionEvent?.utmCampaign ?? null,
      utmContent: sessionEvent?.utmContent ?? null,
      utmTerm: sessionEvent?.utmTerm ?? null,
      affiliate: sessionEvent?.affiliate ?? null,
      device: sessionEvent?.device ?? "desktop",
      browser: sessionEvent?.browser ?? "inna",
      os: sessionEvent?.os ?? "inny",
      country: sessionEvent?.country ?? "??",
      lang: sessionEvent?.lang ?? "",
      ...t,
    },
  });
}
