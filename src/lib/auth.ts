import "server-only";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { cache } from "react";
import { SESSION_COOKIE, SESSION_TTL_S, signSession, verifySession } from "./auth-token";
import { db } from "./db";
import { env } from "./env";

export const currentAdmin = cache(async () => {
  const id = await verifySession((await cookies()).get(SESSION_COOKIE)?.value);
  return id ? db.adminUser.findUnique({ where: { id }, select: { id: true, email: true, name: true } }) : null;
});

export async function requireAdmin() {
  const admin = await currentAdmin();
  if (!admin) redirect("/admin/login");
  return admin;
}

export async function startSession(adminId: string) {
  (await cookies()).set(SESSION_COOKIE, await signSession(adminId), {
    httpOnly: true,
    secure: env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_TTL_S,
  });
}

export async function endSession() {
  (await cookies()).delete(SESSION_COOKIE);
}
