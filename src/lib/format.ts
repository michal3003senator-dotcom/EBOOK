const pln = new Intl.NumberFormat("pl-PL", { style: "currency", currency: "PLN" });
const num = new Intl.NumberFormat("pl-PL");
const pct = new Intl.NumberFormat("pl-PL", { style: "percent", maximumFractionDigits: 1 });
const dt = new Intl.DateTimeFormat("pl-PL", { dateStyle: "short", timeStyle: "short", timeZone: "Europe/Warsaw" });

export const money = (cents: number, currency = "PLN") =>
  currency === "PLN" ? pln.format(cents / 100) : new Intl.NumberFormat("pl-PL", { style: "currency", currency }).format(cents / 100);
export const int = (n: number) => num.format(n);
export const percent = (ratio: number) => pct.format(Number.isFinite(ratio) ? ratio : 0);
export const dateTime = (d: Date) => dt.format(d);
export const ratio = (a: number, b: number) => (b > 0 ? a / b : 0);

export const STATUS_LABEL: Record<string, string> = {
  PENDING: "Oczekuje",
  PAID: "Opłacone",
  FAILED: "Nieudane",
  CANCELED: "Anulowane",
  REFUNDED: "Zwrócone",
};
