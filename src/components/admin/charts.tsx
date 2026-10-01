"use client";

import { useState } from "react";
import { int, money } from "@/lib/format";

/* Paleta zwalidowana (dataviz validator) na tle #161d2f: niebieski / pomarańczowy / morski. */
const S1 = "#3987e5";
const S2 = "#d95926";
const SEQ = ["#1f2a44", "#184f95", "#1c5cab", "#256abf", "#2a78d6", "#3987e5", "#5598e7", "#86b6ef"];

type Fmt = (n: number) => string;
const FORMATS: Record<"money" | "number", Fmt> = { money: (zl) => money(Math.round(zl * 100)), number: int };
const shortDay = (d: string) => `${d.slice(8, 10)}.${d.slice(5, 7)}`;

export function KpiTile({ label, value, delta, goodWhenUp = true, hint }: { label: string; value: string; delta?: number | null; goodWhenUp?: boolean; hint?: string }) {
  const show = delta !== undefined && delta !== null && Number.isFinite(delta);
  const up = (delta ?? 0) >= 0;
  const good = up === goodWhenUp;
  return (
    <div className="rounded-xl border border-ink-700 bg-ink-800 p-4" title={hint}>
      <p className="text-xs font-medium text-ink-400">{label}</p>
      <p className="mt-1.5 text-2xl font-bold text-white">{value}</p>
      {show && (
        <p className={`mt-1 text-xs font-semibold ${Math.abs(delta!) < 0.005 ? "text-ink-400" : good ? "text-emerald-400" : "text-rose-400"}`}>
          {up ? "▲" : "▼"} {Math.abs(delta! * 100).toFixed(1)}% <span className="font-normal text-ink-400">vs poprzedni okres</span>
        </p>
      )}
    </div>
  );
}

export function ChartCard({ title, subtitle, children, className = "" }: { title: string; subtitle?: string; children: React.ReactNode; className?: string }) {
  return (
    <section className={`rounded-xl border border-ink-700 bg-ink-800 p-5 ${className}`}>
      <h3 className="font-semibold text-white">{title}</h3>
      {subtitle && <p className="mt-0.5 text-xs text-ink-400">{subtitle}</p>}
      <div className="mt-4">{children}</div>
    </section>
  );
}

const Empty = () => <p className="py-8 text-center text-sm text-ink-400">Brak danych w tym okresie</p>;

/** Słupki dzienne (jedna seria). */
export function DailyBars({ data, unit = "number" }: { data: { day: string; value: number; note?: string }[]; unit?: "money" | "number" }) {
  const format = FORMATS[unit];
  const [hover, setHover] = useState<number | null>(null);
  const max = Math.max(1, ...data.map((d) => d.value));
  if (!data.some((d) => d.value)) return <Empty />;
  const h = data[hover ?? -1];
  return (
    <div>
      <div className="relative flex h-44 items-end gap-[2px] border-b border-ink-600" onMouseLeave={() => setHover(null)}>
        {data.map((d, i) => (
          <div key={d.day} className="flex h-full flex-1 items-end" onMouseEnter={() => setHover(i)}>
            <div
              className="w-full rounded-t-[4px] transition-opacity"
              style={{ height: `${(d.value / max) * 100}%`, minHeight: d.value ? 2 : 0, background: S1, opacity: hover === null || hover === i ? 1 : 0.45 }}
            />
          </div>
        ))}
        {h && (
          <div className="pointer-events-none absolute -top-2 left-1/2 -translate-x-1/2 rounded-md border border-ink-600 bg-ink-950 px-3 py-1.5 text-xs shadow-lg">
            <span className="text-ink-400">{h.day}</span> · <b className="text-white">{format(h.value)}</b>
            {h.note && <span className="text-ink-300"> · {h.note}</span>}
          </div>
        )}
      </div>
      <Axis days={data.map((d) => d.day)} />
    </div>
  );
}

function Axis({ days }: { days: string[] }) {
  const step = Math.max(1, Math.ceil(days.length / 6));
  return (
    <div className="mt-1.5 flex justify-between text-[11px] tabular-nums text-ink-400">
      {days.filter((_, i) => i % step === 0 || i === days.length - 1).map((d) => (
        <span key={d}>{shortDay(d)}</span>
      ))}
    </div>
  );
}

/** Linie dzienne (max 2 serie), z legendą i crosshairem. */
export function DailyLines({ days, series }: { days: string[]; series: { name: string; values: number[] }[] }) {
  const [hover, setHover] = useState<number | null>(null);
  const colors = [S1, S2];
  const max = Math.max(1, ...series.flatMap((s) => s.values));
  const n = days.length;
  if (!series.some((s) => s.values.some(Boolean))) return <Empty />;
  const x = (i: number) => (n === 1 ? 50 : (i / (n - 1)) * 100);
  const y = (v: number) => 100 - (v / max) * 100;
  return (
    <div>
      <div className="mb-3 flex gap-4 text-xs text-ink-300">
        {series.map((s, i) => (
          <span key={s.name} className="flex items-center gap-1.5">
            <span className="h-0.5 w-4 rounded" style={{ background: colors[i] }} />
            {s.name}
          </span>
        ))}
      </div>
      <div
        className="relative h-44 border-b border-ink-600"
        onMouseMove={(e) => {
          const r = e.currentTarget.getBoundingClientRect();
          setHover(Math.round(((e.clientX - r.left) / r.width) * (n - 1)));
        }}
        onMouseLeave={() => setHover(null)}
      >
        <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="absolute inset-0 size-full overflow-visible">
          {[25, 50, 75].map((g) => (
            <line key={g} x1="0" x2="100" y1={g} y2={g} stroke="#2a3350" strokeWidth="1" vectorEffect="non-scaling-stroke" />
          ))}
          {series.map((s, si) => (
            <polyline
              key={s.name}
              fill="none"
              stroke={colors[si]}
              strokeWidth="2"
              strokeLinejoin="round"
              vectorEffect="non-scaling-stroke"
              points={s.values.map((v, i) => `${x(i)},${y(v)}`).join(" ")}
            />
          ))}
          {hover !== null && <line x1={x(hover)} x2={x(hover)} y1="0" y2="100" stroke="#8a93ab" strokeWidth="1" vectorEffect="non-scaling-stroke" />}
        </svg>
        {hover !== null && days[hover] && (
          <div className="pointer-events-none absolute -top-2 left-1/2 -translate-x-1/2 rounded-md border border-ink-600 bg-ink-950 px-3 py-1.5 text-xs shadow-lg">
            <span className="text-ink-400">{days[hover]}</span>
            {series.map((s, i) => (
              <span key={s.name} className="ml-2 text-white">
                <span style={{ color: colors[i] }}>●</span> {s.name}: <b>{s.values[hover]}</b>
              </span>
            ))}
          </div>
        )}
      </div>
      <Axis days={days} />
    </div>
  );
}

/** Lejek: kolejne etapy, ten sam odcień, konwersja krok do kroku. */
export function Funnel({ steps }: { steps: { label: string; value: number }[] }) {
  const top = Math.max(1, steps[0]?.value ?? 1);
  return (
    <ol className="space-y-2.5">
      {steps.map((s, i) => {
        const prev = steps[i - 1]?.value;
        return (
          <li key={s.label} className="grid grid-cols-[9rem_1fr_auto] items-center gap-3 text-sm" title={`${s.label}: ${s.value}`}>
            <span className="text-ink-300">{s.label}</span>
            <span className="h-6 rounded bg-ink-900">
              <span className="block h-full rounded" style={{ width: `${Math.max((s.value / top) * 100, s.value ? 1 : 0)}%`, background: SEQ[7 - Math.min(i, 5)] }} />
            </span>
            <span className="w-28 text-right tabular-nums text-white">
              {s.value}
              {prev !== undefined && <span className="ml-1.5 text-xs text-ink-400">{prev ? `${Math.round((s.value / prev) * 100)}%` : "—"}</span>}
            </span>
          </li>
        );
      })}
    </ol>
  );
}

/** Lista z poziomymi paskami (udział). */
export function BarList({ items, total }: { items: { label: string; value: number }[]; total?: number }) {
  const format = int;
  if (!items.length || !items.some((i) => i.value)) return <Empty />;
  const max = Math.max(1, ...items.map((i) => i.value));
  return (
    <ul className="space-y-1.5">
      {items.map((it) => (
        <li key={it.label} className="relative flex items-center justify-between gap-3 rounded px-2 py-1.5 text-sm hover:bg-ink-700/40" title={`${it.label}: ${format(it.value)}`}>
          <span className="absolute inset-y-0 left-0 rounded bg-[#3987e5]/20" style={{ width: `${(it.value / max) * 100}%` }} />
          <span className="relative truncate text-ink-300">{it.label}</span>
          <span className="relative shrink-0 tabular-nums text-white">
            {format(it.value)}
            {total ? <span className="ml-1.5 text-xs text-ink-400">{Math.round((it.value / total) * 100)}%</span> : null}
          </span>
        </li>
      ))}
    </ul>
  );
}

const DOW = ["Pn", "Wt", "Śr", "Cz", "Pt", "So", "Nd"];

/** Mapa ciepła: sesje wg dnia tygodnia i godziny. */
export function Heatmap({ grid }: { grid: number[][] }) {
  const [hover, setHover] = useState<[number, number] | null>(null);
  const max = Math.max(1, ...grid.flat());
  if (!grid.flat().some(Boolean)) return <Empty />;
  return (
    <div className="overflow-x-auto">
      <div className="min-w-[560px]">
        <div className="grid grid-cols-[2rem_repeat(24,1fr)] gap-[2px] text-[10px] text-ink-400">
          <span />
          {Array.from({ length: 24 }, (_, h) => (
            <span key={h} className="text-center tabular-nums">{h % 3 === 0 ? h : ""}</span>
          ))}
          {grid.map((row, d) => (
            <div key={d} className="contents">
              <span className="self-center">{DOW[d]}</span>
              {row.map((v, h) => (
                <span
                  key={h}
                  onMouseEnter={() => setHover([d, h])}
                  onMouseLeave={() => setHover(null)}
                  className="h-5 rounded-[3px]"
                  style={{ background: v ? SEQ[1 + Math.min(6, Math.floor((v / max) * 6.99))] : SEQ[0] }}
                />
              ))}
            </div>
          ))}
        </div>
        <p className="mt-2 h-4 text-xs text-ink-300">
          {hover ? `${DOW[hover[0]]}, ${hover[1]}:00–${hover[1]}:59 — ${grid[hover[0]]![hover[1]]} sesji` : "Najedź na komórkę, aby zobaczyć liczbę sesji"}
        </p>
      </div>
    </div>
  );
}
