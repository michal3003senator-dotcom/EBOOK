const parts = new Intl.DateTimeFormat("en-CA", {
  timeZone: "Europe/Warsaw",
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  hourCycle: "h23",
  weekday: "short",
});
const DOW: Record<string, number> = { Mon: 0, Tue: 1, Wed: 2, Thu: 3, Fri: 4, Sat: 5, Sun: 6 };

/** Dzień, godzina i dzień tygodnia w strefie Europe/Warsaw. */
export function warsaw(d = new Date()) {
  const p = Object.fromEntries(parts.formatToParts(d).map((x) => [x.type, x.value]));
  return { day: `${p.year}-${p.month}-${p.day}`, hour: Number(p.hour), dow: DOW[p.weekday ?? "Mon"] ?? 0 };
}

export function daysBetween(from: Date, to: Date): string[] {
  const out: string[] = [];
  const cur = new Date(from);
  while (cur <= to) {
    const { day } = warsaw(cur);
    if (out.at(-1) !== day) out.push(day);
    cur.setTime(cur.getTime() + 6 * 3600_000);
  }
  const last = warsaw(to).day;
  if (out.at(-1) !== last) out.push(last);
  return out;
}
