import "server-only";
import { hmac, safeEqual } from "./crypto";
import { env } from "./env";

const TTL_MS = 7 * 86_400_000;

export function sampleUrl() {
  const exp = Date.now() + TTL_MS;
  return `${env.APP_URL}/api/sample?e=${exp}&s=${hmac(env.SESSION_SECRET, `sample:${exp}`).slice(0, 32)}`;
}

export function verifySample(e: string | null, s: string | null) {
  const exp = Number(e);
  if (!exp || !s || exp < Date.now()) return false;
  return safeEqual(s, hmac(env.SESSION_SECRET, `sample:${exp}`).slice(0, 32));
}
