"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { z } from "zod";
import { resolveVisit, trackServerEvent } from "@/lib/analytics/track";
import { REF_COOKIE } from "@/lib/constants";
import { db } from "@/lib/db";
import { sampleEmail } from "@/lib/emails";
import { env } from "@/lib/env";
import { sendMail } from "@/lib/mailer";
import { createOrder, markPaid, priceFor } from "@/lib/orders";
import { activeProvider } from "@/lib/payments";
import { limited } from "@/lib/rate-limit";
import { clientInfo } from "@/lib/request";
import { sampleUrl } from "@/lib/sample";
import { getSettings } from "@/lib/settings";

export type FormState = { error?: string; ok?: boolean; url?: string; fields?: Record<string, string> };

const email = z.email("Podaj poprawny adres e-mail").max(200).transform((e) => e.toLowerCase());
const checked = (msg: string) => z.literal("on", { error: msg });

export async function requestSample(_: FormState, form: FormData): Promise<FormState> {
  const { ip } = await clientInfo();
  if (limited(`lead:${ip}`, 5, 600_000)) return { error: "Zbyt wiele prób. Spróbuj za kilka minut." };
  if ((await getSettings()).leadMagnetEnabled === false) return { error: "Fragment jest chwilowo niedostępny." };

  const parsed = z
    .object({ email, consent: checked("Zaznacz zgodę, żebyśmy mogli wysłać fragment"), marketing: z.string().optional() })
    .safeParse(Object.fromEntries(form));
  if (!parsed.success) return { error: parsed.error.issues[0]?.message };

  const visit = await resolveVisit({});
  const marketing = parsed.data.marketing === "on";
  await db.lead.upsert({
    where: { email: parsed.data.email },
    create: { email: parsed.data.email, source: visit.base.source, marketingConsent: marketing, visitorId: visit.base.visitorId },
    update: marketing ? { marketingConsent: true } : {},
  });
  const url = sampleUrl();
  await sendMail({ to: parsed.data.email, ...sampleEmail(url), template: "sample" });
  await trackServerEvent("lead", { visitorId: visit.base.visitorId, sessionId: visit.base.sessionId });
  return { ok: true, url };
}

const checkoutSchema = z
  .object({
    productId: z.string().min(1),
    email,
    name: z.string().trim().max(120).default(""),
    coupon: z.string().trim().max(40).optional(),
    terms: checked("Zaakceptuj regulamin i politykę prywatności"),
    waiver: checked("Wyraź zgodę na natychmiastowe dostarczenie treści cyfrowej"),
    marketing: z.string().optional(),
    invoice: z.string().optional(),
    companyName: z.string().trim().max(200).default(""),
    taxId: z.string().trim().max(20).default(""),
    address: z.string().trim().max(300).default(""),
  })
  .refine((d) => d.invoice !== "on" || (d.companyName && d.taxId && d.address), {
    message: "Do faktury podaj nazwę firmy, NIP i adres",
  });

export async function checkout(_: FormState, form: FormData): Promise<FormState> {
  const raw = Object.fromEntries(form) as Record<string, string>;
  const fields = { email: raw.email ?? "", name: raw.name ?? "", coupon: raw.coupon ?? "" };
  const { ip, country } = await clientInfo();
  if (limited(`checkout:${ip}`, 10, 600_000)) return { error: "Zbyt wiele prób. Spróbuj za kilka minut.", fields };

  const parsed = checkoutSchema.safeParse(raw);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message, fields };
  const d = parsed.data;

  const product = await db.product.findFirst({ where: { id: d.productId, active: true } });
  if (!product) return { error: "Produkt jest niedostępny", fields };
  const price = await priceFor(product, d.coupon);
  if (price.couponError) return { error: price.couponError, fields };

  const visit = await resolveVisit({});
  const refCode = (await cookies()).get(REF_COOKIE)?.value ?? visit.base.affiliate;
  const affiliate = refCode ? await db.affiliate.findFirst({ where: { code: refCode, active: true } }) : null;
  const free = price.totalCents === 0;
  let provider: ReturnType<typeof activeProvider> | null = null;
  if (!free) {
    try {
      provider = activeProvider();
    } catch (e) {
      console.error("[checkout]", e);
      return { error: "Płatności są chwilowo niedostępne. Spróbuj później.", fields };
    }
  }
  const now = new Date();

  const order = await createOrder({
    email: d.email,
    name: d.name,
    productId: product.id,
    unitPriceCents: price.unitCents,
    discountCents: price.discountCents,
    totalCents: price.totalCents,
    currency: product.currency,
    couponId: price.coupon?.id ?? null,
    affiliateId: affiliate?.id ?? null,
    provider: provider?.id ?? "free",
    termsAcceptedAt: now,
    waiverAcceptedAt: now,
    marketingConsent: d.marketing === "on",
    wantsInvoice: d.invoice === "on",
    companyName: d.companyName,
    taxId: d.taxId,
    address: d.address,
    visitorId: visit.base.visitorId,
    sessionId: visit.base.sessionId,
    source: visit.base.source,
    utmSource: visit.base.utmSource,
    utmMedium: visit.base.utmMedium,
    utmCampaign: visit.base.utmCampaign,
    referrerHost: visit.base.referrerHost,
    device: visit.base.device,
    country,
  });

  const statusUrl = `${env.APP_URL}/zamowienie/${order.id}?t=${order.accessToken}`;
  if (!provider) {
    await markPaid(order.id, "free");
    redirect(statusUrl);
  }

  let redirectUrl: string;
  try {
    const res = await provider.createPayment(
      { ...order, productName: product.name },
      { success: statusUrl, cancel: `${env.APP_URL}/kasa?anulowano=1` },
    );
    if (res.providerRef) await db.order.update({ where: { id: order.id }, data: { providerRef: res.providerRef } });
    redirectUrl = res.redirectUrl;
  } catch (e) {
    console.error("[checkout]", e);
    await db.order.update({ where: { id: order.id }, data: { status: "FAILED", note: "Błąd inicjacji płatności" } });
    return { error: "Nie udało się połączyć z bramką płatności. Spróbuj ponownie za chwilę.", fields };
  }
  redirect(redirectUrl);
}

export async function checkCoupon(productId: string, code: string) {
  const { ip } = await clientInfo();
  if (limited(`coupon:${ip}`, 20, 600_000)) return { error: "Zbyt wiele prób" };
  const product = await db.product.findFirst({ where: { id: productId, active: true } });
  if (!product) return { error: "Produkt niedostępny" };
  const p = await priceFor(product, code);
  return p.couponError ? { error: p.couponError } : { discountCents: p.discountCents, totalCents: p.totalCents };
}
