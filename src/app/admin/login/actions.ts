"use server";

import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";
import { z } from "zod";
import { startSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { clientInfo } from "@/lib/request";

const WINDOW_MS = 15 * 60_000;
const MAX_FAILS = 5;
const DUMMY_HASH = "$2b$12$yOQ9Kg2FCdlq7S918syA.OuGVrlzlsigyh3XWmTFHfpa.Wzh3hysu"; // wyrównuje czas odpowiedzi

export async function login(_: { error?: string }, form: FormData): Promise<{ error?: string }> {
  const parsed = z.object({ email: z.email(), password: z.string().min(1).max(200) }).safeParse(Object.fromEntries(form));
  if (!parsed.success) return { error: "Podaj e-mail i hasło" };
  const email = parsed.data.email.toLowerCase();
  const { ip } = await clientInfo();

  const since = new Date(Date.now() - WINDOW_MS);
  const fails = await db.loginAttempt.count({ where: { success: false, createdAt: { gt: since }, OR: [{ ip }, { email }] } });
  if (fails >= MAX_FAILS) return { error: "Zbyt wiele nieudanych prób. Spróbuj za 15 minut." };

  const admin = await db.adminUser.findUnique({ where: { email } });
  const ok = await bcrypt.compare(parsed.data.password, admin?.passwordHash ?? DUMMY_HASH);
  await db.loginAttempt.create({ data: { ip, email, success: ok && Boolean(admin) } });
  if (!ok || !admin) return { error: "Nieprawidłowy e-mail lub hasło" };

  await db.adminUser.update({ where: { id: admin.id }, data: { lastLoginAt: new Date() } });
  await startSession(admin.id);
  redirect("/admin");
}
