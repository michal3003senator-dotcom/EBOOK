import "server-only";
import { createHash, createHmac, randomBytes, timingSafeEqual } from "node:crypto";
import { env } from "./env";

export const randomToken = (bytes = 24) => randomBytes(bytes).toString("base64url");
export const sha256 = (s: string) => createHash("sha256").update(s).digest("hex");
export const hmac = (key: string, s: string) => createHmac("sha256", key).update(s).digest("hex");

export function safeEqual(a: string, b: string) {
  const x = Buffer.from(a);
  const y = Buffer.from(b);
  return x.length === y.length && timingSafeEqual(x, y);
}

/** Anonimowy identyfikator: zmienia się codziennie, nie da się go odwrócić do IP. */
export function dailyVisitorId(ip: string, ua: string, day: string) {
  const salt = hmac(env.SESSION_SECRET, `visitor:${day}`);
  return sha256(`${salt}|${ip}|${ua}`).slice(0, 20);
}

export const ipHash = (ip: string) => hmac(env.SESSION_SECRET, `ip:${ip}`).slice(0, 16);
