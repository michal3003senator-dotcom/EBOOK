"use client";

import { useEffect } from "react";

type Payload = { type: string; name?: string; value?: number };

export function track(type: string, name?: string, value?: number) {
  send({ type, name, value });
}

function send(p: Payload & Record<string, unknown>) {
  const body = JSON.stringify({ path: location.pathname, ...p });
  if (navigator.sendBeacon?.(("/api/track"), new Blob([body], { type: "application/json" }))) return;
  void fetch("/api/track", { method: "POST", body, keepalive: true, headers: { "Content-Type": "application/json" } });
}

/** Analityka własna: bez cookies i zewnętrznych skryptów. */
export function Tracker({ page }: { page?: string }) {
  useEffect(() => {
    const url = new URL(location.href);
    const q = (k: string) => url.searchParams.get(k) ?? undefined;
    send({
      type: "pageview",
      name: page,
      referrer: document.referrer || undefined,
      ref: q("ref"),
      utm: { source: q("utm_source"), medium: q("utm_medium"), campaign: q("utm_campaign"), content: q("utm_content"), term: q("utm_term") },
    });

    // Głębokość przewijania
    const marks = [25, 50, 75, 100];
    const hit = new Set<number>();
    const onScroll = () => {
      const h = document.documentElement;
      const pct = ((h.scrollTop + innerHeight) / h.scrollHeight) * 100;
      for (const m of marks) if (pct >= m - 1 && !hit.has(m)) (hit.add(m), send({ type: "scroll", value: m }));
    };
    addEventListener("scroll", onScroll, { passive: true });

    // Zasięg sekcji
    const io = new IntersectionObserver(
      (entries) =>
        entries.forEach((e) => {
          if (!e.isIntersecting) return;
          send({ type: "section_view", name: (e.target as HTMLElement).dataset.section });
          io.unobserve(e.target);
        }),
      { threshold: 0.35 },
    );
    document.querySelectorAll("[data-section]").forEach((el) => io.observe(el));

    // Kliknięcia CTA i linki wychodzące
    const onClick = (ev: MouseEvent) => {
      const el = (ev.target as HTMLElement).closest<HTMLElement>("[data-cta],a[href^='http']");
      if (!el) return;
      if (el.dataset.cta) send({ type: "cta_click", name: el.dataset.cta });
      else if (el instanceof HTMLAnchorElement && el.host !== location.host) send({ type: "outbound", name: el.host });
    };
    document.addEventListener("click", onClick);

    // Rozwinięcia FAQ / spisu treści (<details data-faq|data-toc>)
    const onToggle = (ev: Event) => {
      const d = ev.target as HTMLDetailsElement;
      if (!d.open) return;
      if (d.dataset.faq) send({ type: "faq_open", name: d.dataset.faq });
      if (d.dataset.toc) send({ type: "toc_open", name: d.dataset.toc });
    };
    document.addEventListener("toggle", onToggle, true);

    // Czas zaangażowania (tylko gdy karta jest widoczna) i Web Vitals
    let active = 0;
    let since = document.visibilityState === "visible" ? performance.now() : 0;
    let lcp = 0;
    let cls = 0;
    let inp = 0;
    const observers: PerformanceObserver[] = [];
    const observe = (type: string, cb: (list: PerformanceObserverEntryList) => void, extra: object = {}) => {
      try {
        const o = new PerformanceObserver(cb);
        o.observe({ type, buffered: true, ...extra });
        observers.push(o);
      } catch {
        /* nieobsługiwane */
      }
    };
    observe("largest-contentful-paint", (l) => (lcp = l.getEntries().at(-1)?.startTime ?? lcp));
    observe("layout-shift", (l) =>
      l.getEntries().forEach((e) => {
        const s = e as PerformanceEntry & { value: number; hadRecentInput: boolean };
        if (!s.hadRecentInput) cls += s.value;
      }),
    );
    observe("event", (l) => l.getEntries().forEach((e) => (inp = Math.max(inp, e.duration))), { durationThreshold: 40 });

    let flushedVitals = false;
    const flush = () => {
      if (since) active += performance.now() - since;
      since = 0;
      if (active > 1000) send({ type: "engagement", value: Math.round(active / 1000) });
      active = 0;
      if (!flushedVitals) {
        flushedVitals = true;
        if (lcp) send({ type: "vital", name: "LCP", value: Math.round(lcp) });
        send({ type: "vital", name: "CLS", value: Math.round(cls * 1000) });
        if (inp) send({ type: "vital", name: "INP", value: Math.round(inp) });
      }
    };
    const onVisibility = () => (document.visibilityState === "hidden" ? flush() : (since = performance.now()));
    document.addEventListener("visibilitychange", onVisibility);
    addEventListener("pagehide", flush);

    return () => {
      removeEventListener("scroll", onScroll);
      document.removeEventListener("click", onClick);
      document.removeEventListener("toggle", onToggle, true);
      document.removeEventListener("visibilitychange", onVisibility);
      removeEventListener("pagehide", flush);
      io.disconnect();
      observers.forEach((o) => o.disconnect());
    };
  }, [page]);

  return null;
}
