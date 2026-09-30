import "server-only";

const buckets = new Map<string, { count: number; reset: number }>();

/** Prosty limiter w pamięci (jedna instancja). Zwraca true, gdy limit przekroczony. */
export function limited(key: string, max: number, windowMs: number) {
  const now = Date.now();
  const b = buckets.get(key);
  if (!b || b.reset < now) {
    buckets.set(key, { count: 1, reset: now + windowMs });
    if (buckets.size > 10_000) for (const [k, v] of buckets) if (v.reset < now) buckets.delete(k);
    return false;
  }
  return ++b.count > max;
}
