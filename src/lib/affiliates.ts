import "server-only";
import type { Affiliate } from "@/generated/prisma/client";
import { randomToken } from "./crypto";
import { db } from "./db";
import { partnerPendingEmail, partnerWelcomeEmail } from "./emails";
import { env } from "./env";
import { sendMail } from "./mailer";
import { getSettings } from "./settings";

export const partnerLinks = (a: Pick<Affiliate, "code" | "token">) => ({
  link: `${env.APP_URL}/?ref=${a.code}`,
  panel: `${env.APP_URL}/partner/${a.token}`,
});

const slug = (s: string) =>
  s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/ł/g, "l")
    .replace(/[^a-z0-9]+/g, "")
    .slice(0, 12) || "partner";

async function uniqueCode(seed: string) {
  const base = slug(seed);
  for (let i = 0; i < 20; i++) {
    const code = i === 0 ? base : `${base}${randomToken(3).replace(/[^a-zA-Z0-9]/g, "").toLowerCase().slice(0, 3)}`;
    if (code.length >= 2 && !(await db.affiliate.findUnique({ where: { code } }))) return code;
  }
  return `p${randomToken(6).replace(/[^a-zA-Z0-9]/g, "").toLowerCase()}`;
}

async function sendWelcome(a: Affiliate) {
  const s = await getSettings();
  const { link, panel } = partnerLinks(a);
  await sendMail({ to: a.email, ...partnerWelcomeEmail(a.name, link, panel, a.commissionPct, s), template: "partner_welcome" });
}

/** Kupujący automatycznie dostaje link polecający (jeśli włączone w ustawieniach). */
export async function ensureBuyerAffiliate(email: string, name: string) {
  const s = await getSettings();
  if (!s.affiliateEnabled || !s.affiliateAutoEnroll) return null;
  const existing = await db.affiliate.findUnique({ where: { email } });
  if (existing) {
    if (existing.pending) return db.affiliate.update({ where: { id: existing.id }, data: { pending: false, active: true } });
    return existing;
  }
  return db.affiliate.create({
    data: {
      email,
      name: name || email.split("@")[0]!,
      code: await uniqueCode(name || email.split("@")[0]!),
      token: randomToken(18),
      commissionPct: s.affiliateDefaultPct,
      origin: "buyer",
    },
  });
}

/** Zgłoszenie z publicznej strony. Kupujący są akceptowani od razu, pozostali czekają na zatwierdzenie. */
export async function applyAsAffiliate(input: { name: string; email: string; channel: string }) {
  const s = await getSettings();
  const existing = await db.affiliate.findUnique({ where: { email: input.email } });
  if (existing) {
    if (existing.active) await sendWelcome(existing);
    return existing.pending ? "pending" : "exists";
  }
  const isBuyer = Boolean(await db.order.findFirst({ where: { email: input.email, status: "PAID" }, select: { id: true } }));
  const a = await db.affiliate.create({
    data: {
      ...input,
      code: await uniqueCode(input.name),
      token: randomToken(18),
      commissionPct: s.affiliateDefaultPct,
      origin: "application",
      active: isBuyer,
      pending: !isBuyer,
    },
  });
  if (isBuyer) await sendWelcome(a);
  else await sendMail({ to: a.email, ...partnerPendingEmail(a.name), template: "partner_pending" });
  return isBuyer ? "approved" : "pending";
}

export async function approveAffiliate(id: string) {
  const a = await db.affiliate.update({ where: { id }, data: { pending: false, active: true } });
  await sendWelcome(a);
}

export { sendWelcome as sendPartnerWelcome };
