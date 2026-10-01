import "server-only";
import type { Coupon, Order, Prisma, Product } from "@/generated/prisma/client";
import { ensureBuyerAffiliate, partnerLinks } from "./affiliates";
import { trackServerEvent } from "./analytics/track";
import { randomToken } from "./crypto";
import { db } from "./db";
import { purchaseEmail } from "./emails";
import { env } from "./env";
import { sendMail } from "./mailer";
import { getProvider } from "./payments";
import type { ProviderEvent } from "./payments/types";
import { getSettings } from "./settings";

const MIN_PAYMENT_CENTS = 200;

export type Pricing = { unitCents: number; discountCents: number; totalCents: number; coupon: Coupon | null; couponError?: string };

export async function priceFor(product: Product, code?: string | null): Promise<Pricing> {
  const base = { unitCents: product.priceCents, discountCents: 0, totalCents: product.priceCents, coupon: null };
  const normalized = code?.trim().toUpperCase();
  if (!normalized) return base;

  const c = await db.coupon.findUnique({ where: { code: normalized } });
  const now = new Date();
  const invalid =
    !c ||
    !c.active ||
    (c.validFrom && c.validFrom > now) ||
    (c.validUntil && c.validUntil < now) ||
    (c.maxUses !== null && c.usedCount >= c.maxUses);
  if (invalid || !c) return { ...base, couponError: "Kod rabatowy jest nieprawidłowy lub wygasł" };

  const raw = c.type === "PERCENT" ? Math.round((product.priceCents * Math.min(c.value, 100)) / 100) : c.value;
  // Bramki nie przyjmują płatności poniżej 2 zł: rabat daje 0 zł (zamówienie darmowe) albo min. 2 zł.
  let discountCents = Math.min(raw, product.priceCents);
  const rest = product.priceCents - discountCents;
  if (rest > 0 && rest < MIN_PAYMENT_CENTS) discountCents = Math.max(0, product.priceCents - MIN_PAYMENT_CENTS);
  return { unitCents: product.priceCents, discountCents, totalCents: product.priceCents - discountCents, coupon: c };
}

export async function createOrder(data: Omit<Prisma.OrderUncheckedCreateInput, "number" | "accessToken">) {
  return db.$transaction(async (tx) => {
    const last = await tx.order.findFirst({ orderBy: { number: "desc" }, select: { number: true } });
    return tx.order.create({ data: { ...data, number: (last?.number ?? 1000) + 1, accessToken: randomToken(18) } });
  });
}

export async function issueDownloadToken(order: Order & { product: Product }) {
  return db.downloadToken.create({
    data: {
      orderId: order.id,
      token: randomToken(24),
      maxDownloads: order.product.downloadLimit,
      expiresAt: new Date(Date.now() + order.product.downloadDays * 86_400_000),
    },
  });
}

export async function sendPurchaseEmail(orderId: string, fresh = false) {
  const order = await db.order.findUniqueOrThrow({
    where: { id: orderId },
    include: { product: true, downloadTokens: { where: { revoked: false }, orderBy: { createdAt: "desc" }, take: 1 } },
  });
  const existing = order.downloadTokens[0];
  const usable = existing && existing.expiresAt > new Date() && existing.downloads < existing.maxDownloads;
  const token = !fresh && usable ? existing : await issueDownloadToken(order);
  const partner = await db.affiliate.findUnique({ where: { email: order.email } });
  const mail = purchaseEmail(
    { ...order, productName: order.product.name },
    `${env.APP_URL}/d/${token.token}`,
    token.expiresAt,
    token.maxDownloads,
    await getSettings(),
    partner?.active ? { ...partnerLinks(partner), pct: partner.commissionPct } : null,
  );
  return sendMail({ to: order.email, ...mail, template: "purchase", orderId: order.id });
}

export async function markPaid(orderId: string, providerRef?: string | null) {
  const updated = await db.order.updateMany({
    where: { id: orderId, status: { in: ["PENDING", "FAILED", "CANCELED"] } },
    data: { status: "PAID", paidAt: new Date(), ...(providerRef ? { providerRef } : {}) },
  });
  if (updated.count === 0) return false; // już opłacone — idempotencja

  const order = await db.order.findUniqueOrThrow({ where: { id: orderId }, include: { affiliate: true } });
  const customer = await db.customer.upsert({
    where: { email: order.email },
    create: { email: order.email, name: order.name, marketingConsent: order.marketingConsent },
    update: { ...(order.name ? { name: order.name } : {}), ...(order.marketingConsent ? { marketingConsent: true } : {}) },
  });
  await db.order.update({
    where: { id: orderId },
    data: {
      customerId: customer.id,
      commissionCents: order.affiliate ? Math.round((order.totalCents * order.affiliate.commissionPct) / 100) : 0,
    },
  });
  if (order.couponId) await db.coupon.update({ where: { id: order.couponId }, data: { usedCount: { increment: 1 } } });
  await ensureBuyerAffiliate(order.email, order.name);

  await sendPurchaseEmail(orderId);
  await trackServerEvent("purchase", { visitorId: order.visitorId, sessionId: order.sessionId, value: order.totalCents, name: `#${order.number}` });
  return true;
}

export async function markFailed(orderId: string, status: "FAILED" | "CANCELED") {
  const res = await db.order.updateMany({ where: { id: orderId, status: "PENDING" }, data: { status } });
  if (res.count) {
    const o = await db.order.findUniqueOrThrow({ where: { id: orderId } });
    await trackServerEvent("payment_failed", { visitorId: o.visitorId, sessionId: o.sessionId, name: status });
  }
}

export async function markRefunded(orderId: string) {
  const res = await db.order.updateMany({ where: { id: orderId, status: "PAID" }, data: { status: "REFUNDED", refundedAt: new Date() } });
  if (!res.count) return false;
  await db.downloadToken.updateMany({ where: { orderId }, data: { revoked: true } });
  const o = await db.order.findUniqueOrThrow({ where: { id: orderId } });
  await trackServerEvent("refund", { visitorId: o.visitorId, sessionId: o.sessionId, value: o.totalCents, name: `#${o.number}` });
  return true;
}

/** Wspólna ścieżka dla wszystkich bramek. Idempotentna dzięki unikalnemu (provider, eventId). */
export async function applyProviderEvent(providerId: string, evt: ProviderEvent) {
  const order = evt.orderId ? await db.order.findUnique({ where: { id: evt.orderId } }) : null;
  try {
    await db.paymentEvent.create({
      data: { provider: providerId, eventId: evt.eventId, type: evt.type, orderId: order?.id ?? null, payload: evt.payload.slice(0, 20_000) },
    });
  } catch {
    return "duplicate";
  }
  if (!order || !evt.kind) return "ignored";
  if (evt.kind === "paid") await markPaid(order.id, evt.providerRef);
  else if (evt.kind === "refunded") await markRefunded(order.id);
  else await markFailed(order.id, evt.kind === "failed" ? "FAILED" : "CANCELED");
  return "ok";
}

export async function handleWebhook(providerId: string, req: Request) {
  const provider = getProvider(providerId);
  if (!provider) return new Response("Unknown provider", { status: 404 });
  let evt: ProviderEvent;
  try {
    evt = await provider.parseWebhook(req);
  } catch (e) {
    console.warn(`[webhook:${providerId}]`, e instanceof Error ? e.message : e);
    return new Response("Invalid signature", { status: 400 });
  }
  const result = await applyProviderEvent(providerId, evt);
  return Response.json({ received: true, result });
}
