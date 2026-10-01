import { trackServerEvent } from "@/lib/analytics/track";
import { ipHash } from "@/lib/crypto";
import { db } from "@/lib/db";
import { limited } from "@/lib/rate-limit";
import { clientInfo } from "@/lib/request";
import { licensedPdf, productFileExists } from "@/lib/storage";

const html = (msg: string, status: number) =>
  new Response(
    `<!doctype html><meta charset="utf-8"><meta name="viewport" content="width=device-width"><title>Pobieranie</title><body style="font-family:system-ui;background:#0f1422;color:#e6e8ee;display:grid;place-items:center;min-height:100vh;margin:0;padding:16px;text-align:center"><div><p style="font-size:18px">${msg}</p><p><a style="color:#fbbf24" href="/">Wróć na stronę</a></p></div>`,
    { status, headers: { "Content-Type": "text/html; charset=utf-8" } },
  );

export async function GET(_: Request, { params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const { ip, ua } = await clientInfo();
  if (limited(`dl:${ip}`, 20, 600_000)) return html("Zbyt wiele prób. Spróbuj za kilka minut.", 429);

  const t = await db.downloadToken.findUnique({ where: { token }, include: { order: { include: { product: true } } } });
  if (!t || t.revoked || t.order.status !== "PAID") return html("Link jest nieprawidłowy.", 404);
  if (t.expiresAt < new Date()) return html("Link wygasł. Napisz do nas — wyślemy nowy.", 410);
  if (t.downloads >= t.maxDownloads) return html("Wykorzystano limit pobrań. Napisz do nas — wyślemy nowy link.", 410);
  if (!productFileExists(t.order.product.filePath)) return html("Plik jest chwilowo niedostępny. Spróbuj za chwilę.", 503);

  const pdf = await licensedPdf(t.order.product.filePath ?? "", t.order);
  const claimed = await db.downloadToken.updateMany({
    where: { id: t.id, downloads: { lt: t.maxDownloads } },
    data: { downloads: { increment: 1 } },
  });
  if (!claimed.count) return html("Wykorzystano limit pobrań.", 410);
  await db.downloadLog.create({ data: { tokenId: t.id, ipHash: ipHash(ip), userAgent: ua.slice(0, 300) } });
  await trackServerEvent("download", { visitorId: t.order.visitorId, sessionId: t.order.sessionId, name: `#${t.order.number}` });

  return new Response(new Uint8Array(pdf), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${t.order.product.fileName.replace(/[^\w.-]/g, "_")}"`,
      "Cache-Control": "private, no-store",
      "X-Robots-Tag": "noindex",
    },
  });
}
