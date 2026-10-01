"use server";

import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { endSession, requireAdmin } from "@/lib/auth";
import { randomToken } from "@/lib/crypto";
import { db } from "@/lib/db";
import { markPaid, markRefunded, sendPurchaseEmail } from "@/lib/orders";
import { saveSettings, settingsSchema } from "@/lib/settings";

export type ActionState = { ok?: string; error?: string };

const zlote = z.coerce.number().min(0).max(100_000).transform((v) => Math.round(v * 100));
const optZlote = z.preprocess((v) => (v === "" ? undefined : v), zlote.optional());
const optDate = z.preprocess((v) => (v ? new Date(String(v)) : undefined), z.date().optional());
const bool = z.preprocess((v) => v === "on", z.boolean());
const fail = (e: z.ZodError) => ({ error: e.issues[0]?.message ?? "Nieprawidłowe dane" });

export async function logout() {
  await endSession();
  redirect("/admin/login");
}

/* Zamówienia */

export async function orderAction(orderId: string, action: "resend" | "newLink" | "refund" | "markPaid") {
  await requireAdmin();
  if (action === "resend") await sendPurchaseEmail(orderId);
  if (action === "newLink") {
    await db.downloadToken.updateMany({ where: { orderId }, data: { revoked: true } });
    await sendPurchaseEmail(orderId, true);
  }
  if (action === "refund") await markRefunded(orderId);
  if (action === "markPaid") await markPaid(orderId, "manual");
  revalidatePath(`/admin/orders/${orderId}`);
}

export async function saveOrderNote(orderId: string, form: FormData) {
  await requireAdmin();
  await db.order.update({ where: { id: orderId }, data: { note: String(form.get("note") ?? "").slice(0, 2000) } });
  revalidatePath(`/admin/orders/${orderId}`);
}

/* Produkty */

export async function saveProduct(_: ActionState, form: FormData): Promise<ActionState> {
  await requireAdmin();
  const parsed = z
    .object({
      id: z.string().min(1),
      name: z.string().trim().min(1).max(200),
      subtitle: z.string().trim().max(300),
      price: zlote,
      compareAt: optZlote,
      vatRate: z.coerce.number().int().min(0).max(23),
      fileName: z.string().trim().min(1).max(120),
      samplePages: z.string().trim().regex(/^[\d,\-\s]*$/, "Strony fragmentu: np. 1-22 albo 1-5,9"),
      downloadLimit: z.coerce.number().int().min(1).max(1000),
      downloadDays: z.coerce.number().int().min(1).max(3650),
      active: bool,
    })
    .safeParse(Object.fromEntries(form));
  if (!parsed.success) return fail(parsed.error);
  const { id, price, compareAt, ...rest } = parsed.data;
  if (price < 200) return { error: "Minimalna cena to 2 zł" };
  await db.product.update({ where: { id }, data: { ...rest, priceCents: price, compareAtCents: compareAt ?? null } });
  revalidatePath("/", "layout");
  return { ok: "Zapisano" };
}

/* Kupony */

export async function createCoupon(_: ActionState, form: FormData): Promise<ActionState> {
  await requireAdmin();
  const parsed = z
    .object({
      code: z.string().trim().toUpperCase().regex(/^[A-Z0-9_-]{3,40}$/, "Kod: 3–40 znaków A–Z, 0–9, - lub _"),
      type: z.enum(["PERCENT", "FIXED"]),
      value: z.coerce.number().positive(),
      maxUses: z.preprocess((v) => (v === "" ? undefined : v), z.coerce.number().int().positive().optional()),
      validUntil: optDate,
      note: z.string().trim().max(200).default(""),
    })
    .safeParse(Object.fromEntries(form));
  if (!parsed.success) return fail(parsed.error);
  const d = parsed.data;
  if (d.type === "PERCENT" && d.value > 100) return { error: "Rabat procentowy max 100%" };
  if (await db.coupon.findUnique({ where: { code: d.code } })) return { error: "Taki kod już istnieje" };
  await db.coupon.create({
    data: {
      code: d.code,
      type: d.type,
      value: d.type === "PERCENT" ? Math.round(d.value) : Math.round(d.value * 100),
      maxUses: d.maxUses ?? null,
      validUntil: d.validUntil ?? null,
      note: d.note,
    },
  });
  revalidatePath("/admin/coupons");
  return { ok: `Utworzono kod ${d.code}` };
}

export async function toggleCoupon(id: string) {
  await requireAdmin();
  const c = await db.coupon.findUniqueOrThrow({ where: { id } });
  await db.coupon.update({ where: { id }, data: { active: !c.active } });
  revalidatePath("/admin/coupons");
}

/* Partnerzy */

export async function createAffiliate(_: ActionState, form: FormData): Promise<ActionState> {
  await requireAdmin();
  const parsed = z
    .object({
      name: z.string().trim().min(1).max(120),
      email: z.email(),
      code: z.string().trim().regex(/^[A-Za-z0-9_-]{2,40}$/, "Kod: 2–40 znaków A–Z, 0–9, - lub _"),
      commissionPct: z.coerce.number().int().min(1).max(90),
    })
    .safeParse(Object.fromEntries(form));
  if (!parsed.success) return fail(parsed.error);
  if (await db.affiliate.findUnique({ where: { code: parsed.data.code } })) return { error: "Taki kod partnera już istnieje" };
  await db.affiliate.create({ data: { ...parsed.data, token: randomToken(18) } });
  revalidatePath("/admin/affiliates");
  return { ok: "Dodano partnera" };
}

export async function toggleAffiliate(id: string) {
  await requireAdmin();
  const a = await db.affiliate.findUniqueOrThrow({ where: { id } });
  await db.affiliate.update({ where: { id }, data: { active: !a.active } });
  revalidatePath("/admin/affiliates");
}

export async function addPayout(affiliateId: string, form: FormData) {
  await requireAdmin();
  const amount = zlote.safeParse(form.get("amount"));
  if (!amount.success || amount.data <= 0) return;
  await db.affiliatePayout.create({ data: { affiliateId, amountCents: amount.data, note: String(form.get("note") ?? "").slice(0, 200) } });
  revalidatePath("/admin/affiliates");
}

/* Ustawienia i konto */

export async function updateSettings(_: ActionState, form: FormData): Promise<ActionState> {
  await requireAdmin();
  const raw = Object.fromEntries(form);
  const parsed = settingsSchema.safeParse({ ...raw, leadMagnetEnabled: raw.leadMagnetEnabled === "on" });
  if (!parsed.success) return fail(parsed.error);
  await saveSettings(parsed.data);
  revalidatePath("/", "layout");
  return { ok: "Zapisano ustawienia" };
}

export async function changePassword(_: ActionState, form: FormData): Promise<ActionState> {
  const admin = await requireAdmin();
  const parsed = z
    .object({ current: z.string().min(1), next: z.string().min(12, "Nowe hasło: min. 12 znaków").max(200) })
    .safeParse(Object.fromEntries(form));
  if (!parsed.success) return fail(parsed.error);
  const user = await db.adminUser.findUniqueOrThrow({ where: { id: admin.id } });
  if (!(await bcrypt.compare(parsed.data.current, user.passwordHash))) return { error: "Obecne hasło jest nieprawidłowe" };
  await db.adminUser.update({ where: { id: admin.id }, data: { passwordHash: await bcrypt.hash(parsed.data.next, 12) } });
  return { ok: "Hasło zmienione" };
}
