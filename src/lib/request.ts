import "server-only";
import { headers } from "next/headers";

export async function clientInfo() {
  const h = await headers();
  const ip = h.get("x-forwarded-for")?.split(",")[0]?.trim() || h.get("x-real-ip") || "0.0.0.0";
  const country = (h.get("cf-ipcountry") || h.get("x-vercel-ip-country") || h.get("x-country") || "??").toUpperCase();
  return { ip, country, ua: h.get("user-agent") ?? "", lang: (h.get("accept-language") ?? "").slice(0, 2) };
}
