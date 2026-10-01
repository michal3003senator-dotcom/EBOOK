import "server-only";
import { env } from "./env";
import { dateTime, money } from "./format";
import type { Settings } from "./settings";

const esc = (s: string) => s.replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);

function layout(title: string, body: string) {
  return `<!doctype html><html lang="pl"><body style="margin:0;background:#0f1422;font-family:Arial,sans-serif;color:#e5e7eb">
<table width="100%" cellpadding="0" cellspacing="0"><tr><td align="center" style="padding:32px 16px">
<table width="560" cellpadding="0" cellspacing="0" style="max-width:560px;background:#161d2f;border-radius:12px;padding:32px">
<tr><td style="font-size:12px;letter-spacing:2px;color:#fbbf24;font-weight:bold">FACELESS CASH-COW</td></tr>
<tr><td style="font-size:22px;font-weight:bold;padding:12px 0 16px;color:#fff">${esc(title)}</td></tr>
<tr><td style="font-size:15px;line-height:1.6">${body}</td></tr>
</table></td></tr></table></body></html>`;
}

const button = (href: string, label: string) =>
  `<p style="margin:24px 0"><a href="${esc(href)}" style="background:#fbbf24;color:#111;padding:14px 22px;border-radius:8px;font-weight:bold;text-decoration:none;display:inline-block">${esc(label)}</a></p>`;

type OrderMail = {
  number: number;
  name: string;
  totalCents: number;
  currency: string;
  productName: string;
  waiverAcceptedAt: Date;
  wantsInvoice: boolean;
};

type PartnerInfo = { link: string; panel: string; pct: number } | null;

const partnerBlockHtml = (p: PartnerInfo) =>
  p
    ? `<div style="margin:24px 0;padding:16px;border:1px solid #2a3350;border-radius:10px">
<p style="margin:0 0 8px;font-weight:bold;color:#fbbf24">Poleć i zarabiaj ${p.pct}%</p>
<p style="margin:0 0 8px">Dokładnie tak, jak uczy rozdział 11: za każdy zakup z Twojego linku dostajesz ${p.pct}% prowizji.</p>
<p style="margin:0 0 8px">Twój link: <a style="color:#fbbf24" href="${esc(p.link)}">${esc(p.link)}</a></p>
<p style="margin:0;font-size:13px;color:#9ca3af">Statystyki i saldo: <a style="color:#9ca3af" href="${esc(p.panel)}">panel partnera</a>. Pamiętaj o oznaczeniu linku jako reklamy (rozdz. 11.5).</p></div>`
    : "";

export function purchaseEmail(o: OrderMail, downloadUrl: string, expiresAt: Date, maxDownloads: number, s: Settings, partner: PartnerInfo = null) {
  const subject = `Twój e-book: ${o.productName} (zamówienie #${o.number})`;
  const waiver = `Potwierdzamy, że ${dateTime(o.waiverAcceptedAt)} wyraziłeś(-aś) zgodę na dostarczenie treści cyfrowej przed upływem terminu do odstąpienia od umowy i przyjąłeś(-ęłaś) do wiadomości utratę prawa odstąpienia (art. 38 ust. 1 pkt 13 ustawy o prawach konsumenta).`;
  const invoice = o.wantsInvoice ? "Fakturę wyślemy osobną wiadomością." : "";
  const text = [
    `Dziękujemy za zakup${o.name ? `, ${o.name}` : ""}!`,
    `Produkt: ${o.productName}`,
    `Kwota: ${money(o.totalCents, o.currency)}`,
    `Pobierz: ${downloadUrl}`,
    `Link ważny do ${dateTime(expiresAt)}, limit pobrań: ${maxDownloads}.`,
    "Aktualizacje e-booka otrzymasz bezpłatnie na ten adres e-mail.",
    invoice,
    waiver,
    partner ? `Poleć i zarabiaj ${partner.pct}%: ${partner.link}\nPanel partnera: ${partner.panel}` : "",
    `Regulamin: ${env.APP_URL}/regulamin`,
    `Sprzedawca: ${s.sellerName}, ${s.sellerAddress}, ${s.sellerEmail}`,
  ]
    .filter(Boolean)
    .join("\n\n");
  const html = layout(
    "Dziękujemy za zakup!",
    `<p>${o.name ? `${esc(o.name)}, ` : ""}Twój egzemplarz <b>${esc(o.productName)}</b> jest gotowy.</p>
${button(downloadUrl, "Pobierz e-book (PDF)")}
<p style="font-size:13px;color:#9ca3af">Link ważny do ${dateTime(expiresAt)}, limit pobrań: ${maxDownloads}. Plik jest oznaczony Twoim adresem e-mail — to licencja osobista.</p>
<p>Kwota: <b>${money(o.totalCents, o.currency)}</b> · zamówienie #${o.number}</p>
<p>Kolejne wydania otrzymasz bezpłatnie na ten adres e-mail. ${esc(invoice)}</p>
${partnerBlockHtml(partner)}
<hr style="border:0;border-top:1px solid #2a3350;margin:24px 0">
<p style="font-size:12px;color:#9ca3af">${esc(waiver)}</p>
<p style="font-size:12px;color:#9ca3af">Sprzedawca: ${esc(s.sellerName)}, ${esc(s.sellerAddress)}, ${esc(s.sellerEmail)}. <a style="color:#9ca3af" href="${env.APP_URL}/regulamin">Regulamin</a></p>`,
  );
  return { subject, text, html };
}

export function sampleEmail(url: string) {
  const subject = "Bezpłatny fragment: Faceless Cash-Cow 2026";
  const text = `Oto Twój bezpłatny fragment (wstęp i rozdział 1): ${url}\n\nPełna wersja: ${env.APP_URL}/#cena`;
  const html = layout(
    "Twój bezpłatny fragment",
    `<p>Wstęp i cały rozdział 1 „Anatomia virala” — psychologia kciuka i inżynieria uwagi.</p>
${button(url, "Pobierz fragment")}
<p>Gdy będziesz gotowy na cały system (13 rozdziałów, 60 hooków, 10 promptów, plan 30 dni): <a style="color:#fbbf24" href="${env.APP_URL}/#cena">zobacz pełną wersję</a>.</p>`,
  );
  return { subject, text, html };
}

export function partnerWelcomeEmail(name: string, link: string, panel: string, pct: number, s: Settings) {
  const subject = "Twój link partnerski — Faceless Cash-Cow";
  const min = s.affiliateMinPayoutCents ? ` Wypłata od ${money(s.affiliateMinPayoutCents)} salda.` : "";
  const text = `Cześć ${name}!\n\nTwój link: ${link}\nProwizja: ${pct}% od każdego opłaconego zakupu (atrybucja 30 dni).\nPanel ze statystykami: ${panel}\n\nOznaczaj link jako reklamę (#reklama / „link afiliacyjny”).${min} W sprawie wypłat pisz na ${s.sellerEmail}.\n\nZasady: ${env.APP_URL}/program-partnerski`;
  const html = layout(
    "Witaj w programie partnerskim",
    `<p>Cześć ${esc(name)}! Za każdy opłacony zakup z Twojego linku dostajesz <b>${pct}%</b> prowizji. Link działa 30 dni od kliknięcia.</p>
<p style="padding:12px;background:#0f1422;border-radius:8px;word-break:break-all"><a style="color:#fbbf24" href="${esc(link)}">${esc(link)}</a></p>
${button(panel, "Otwórz panel partnera")}
<p style="font-size:13px;color:#9ca3af">Oznaczaj link jako reklamę (rozdział 11.5).${esc(min)} W sprawie wypłat pisz na ${esc(s.sellerEmail)}. <a style="color:#9ca3af" href="${env.APP_URL}/program-partnerski">Zasady programu</a></p>`,
  );
  return { subject, text, html };
}

export function partnerPendingEmail(name: string) {
  const subject = "Zgłoszenie do programu partnerskiego przyjęte";
  const text = `Cześć ${name}! Dostaliśmy Twoje zgłoszenie. Po akceptacji wyślemy Ci link partnerski i dostęp do panelu.`;
  const html = layout("Zgłoszenie przyjęte", `<p>Cześć ${esc(name)}! Dostaliśmy Twoje zgłoszenie. Po akceptacji wyślemy Ci link partnerski i dostęp do panelu ze statystykami.</p>`);
  return { subject, text, html };
}
