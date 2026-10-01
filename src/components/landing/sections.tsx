import Image from "next/image";
import Link from "next/link";
import {
  appendices,
  benefits,
  book,
  chapters,
  facts,
  faq,
  forWho,
  honesty,
  hooks,
  marketStats,
  pains,
  pipeline,
  plan30,
  screenCards,
} from "@/content/ebook";
import { money } from "@/lib/format";
import { LeadForm } from "./lead-form";

type Price = { priceCents: number; compareAtCents: number | null; currency: string };

function Section({ id, name, className = "", children }: { id?: string; name: string; className?: string; children: React.ReactNode }) {
  return (
    <section id={id} data-section={name} className={`scroll-mt-20 py-16 sm:py-24 ${className}`}>
      <div className="container-page">{children}</div>
    </section>
  );
}

function Heading({ eyebrow, title, intro }: { eyebrow: string; title: React.ReactNode; intro?: string }) {
  return (
    <div className="mb-10 max-w-3xl">
      <p className="eyebrow">{eyebrow}</p>
      <h2 className="mt-3 font-display text-3xl font-extrabold uppercase leading-tight text-white sm:text-4xl">{title}</h2>
      <span className="mt-4 block h-1 w-16 rounded bg-coral" aria-hidden />
      {intro && <p className="mt-5 text-lg text-ink-300">{intro}</p>}
    </div>
  );
}

export function BuyButton({ price, cta, className = "" }: { price: Price; cta: string; className?: string }) {
  return (
    <Link href="/kasa" data-cta={cta} className={`btn btn-gold text-lg ${className}`}>
      Kupuję za {money(price.priceCents, price.currency)}
    </Link>
  );
}

export function Header({ announcement }: { announcement: string }) {
  return (
    <header className="sticky top-0 z-40 border-b border-ink-700/70 bg-ink-900/85 backdrop-blur">
      {announcement && <p className="bg-gold px-4 py-1.5 text-center text-sm font-bold text-ink-950">{announcement}</p>}
      <div className="container-page flex h-16 items-center justify-between gap-4">
        <a href="#top" className="font-display text-lg font-black uppercase tracking-tight text-gold">
          Faceless Cash-Cow
        </a>
        <nav className="hidden gap-6 text-sm text-ink-300 md:flex" aria-label="Sekcje">
          <a href="#system" className="hover:text-white">System</a>
          <a href="#spis" className="hover:text-white">Spis treści</a>
          <a href="#fragment" className="hover:text-white">Darmowy fragment</a>
          <a href="#faq" className="hover:text-white">FAQ</a>
        </nav>
        <a href="#cena" data-cta="header" className="btn btn-gold px-4 py-2 text-sm">
          Kup e-book
        </a>
      </div>
    </header>
  );
}

export function Hero({ price, sample }: { price: Price; sample: boolean }) {
  return (
    <section id="top" data-section="hero" className="relative overflow-hidden">
      <div aria-hidden className="pointer-events-none absolute inset-0 bg-[radial-gradient(60%_50%_at_75%_30%,rgba(251,191,36,0.13),transparent_70%),radial-gradient(40%_40%_at_10%_90%,rgba(240,96,90,0.10),transparent_70%)]" />
      <div className="container-page relative grid items-center gap-12 py-14 sm:py-20 lg:grid-cols-[1.15fr_0.85fr]">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-ink-400">{book.edition}</p>
          <h1 className="mt-5 font-display text-5xl font-black uppercase leading-[0.95] text-gold sm:text-7xl">
            Faceless
            <br />
            Cash-Cow
          </h1>
          <p className="mt-6 font-display text-2xl font-extrabold uppercase text-white sm:text-3xl">
            Viralowe wideo <span className="text-coral">bez pokazywania twarzy</span>
          </p>
          <p className="mt-5 max-w-xl text-lg text-ink-300">{book.lead}</p>
          <p className="mt-4 text-sm font-semibold text-ink-400">{book.platforms}</p>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <BuyButton price={price} cta="hero" />
            {sample && (
              <a href="#fragment" data-cta="hero_sample" className="btn btn-ghost">
                Przeczytaj rozdział 1 za darmo
              </a>
            )}
          </div>
          <p className="mt-4 text-sm text-ink-400">PDF · 123 strony · natychmiastowy dostęp · aktualizacje gratis</p>
        </div>
        <div className="relative mx-auto w-full max-w-sm">
          <div aria-hidden className="absolute -inset-6 rounded-[2rem] bg-gold/10 blur-2xl" />
          <Image
            src="/preview/p1.jpg"
            alt="Okładka e-booka Faceless Cash-Cow 2026"
            width={737}
            height={1039}
            priority
            sizes="(min-width: 1024px) 384px, 80vw"
            className="relative rotate-2 rounded-xl shadow-2xl shadow-black/60 ring-1 ring-white/10"
          />
        </div>
      </div>
    </section>
  );
}

export function MarketStats() {
  return (
    <section data-section="stats" className="border-y border-ink-700 bg-ink-850">
      <div className="container-page grid gap-8 py-10 sm:grid-cols-3">
        {marketStats.map((s) => (
          <div key={s.value}>
            <p className="font-display text-4xl font-black text-gold">{s.value}</p>
            <p className="mt-1 text-ink-300">{s.label}</p>
            <p className="mt-1 text-xs text-ink-400">Źródło: {s.source}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

export function Problem() {
  return (
    <Section name="problem">
      <Heading
        eyebrow="Prawda, którą znasz z autopsji"
        title="Większość ludzi nigdy nie publikuje pierwszego filmu"
        intro="Jeśli to o Tobie — spokojnie. To nie jest Twój problem. To Twoja przewaga. Każda osoba, która odpuściła, zostawiła Ci kawałek rynku."
      />
      <ul className="grid gap-4 sm:grid-cols-2">
        {pains.map((p) => (
          <li key={p} className="card flex gap-3 p-5 text-ink-300">
            <span aria-hidden className="mt-1 text-coral">✕</span>
            {p}
          </li>
        ))}
      </ul>
      <p className="mt-10 max-w-3xl font-display text-2xl font-extrabold uppercase leading-snug text-white sm:text-3xl">
        Algorytm nie potrzebuje Twojej twarzy. <span className="text-gold">Potrzebuje Twojego systemu.</span>
      </p>
    </Section>
  );
}

export function Benefits() {
  return (
    <Section name="benefits" className="bg-ink-850">
      <Heading
        eyebrow="Co tu właściwie sprzedajesz"
        title="Produktem nie jesteś Ty. Produktem jest emocja."
        intro="Kiedy na ekranie jest nocna jazda przez mokre od deszczu miasto, a lektor mówi jedno mocne zdanie, widz nie ma kogo oceniać. Ocenia przekaz. Z biznesowego punktu widzenia daje Ci to trzy rzeczy:"
      />
      <div className="grid gap-5 md:grid-cols-3">
        {benefits.map((b, i) => (
          <div key={b.title} className="card p-6">
            <p className="font-display text-4xl font-black text-gold/80">{i + 1}</p>
            <h3 className="mt-3 text-xl font-bold text-white">{b.title}</h3>
            <p className="mt-2 text-ink-300">{b.text}</p>
          </div>
        ))}
      </div>
    </Section>
  );
}

export function Pipeline() {
  return (
    <Section id="system" name="pipeline">
      <Heading
        eyebrow="Jak zbudowana jest ta książka"
        title="Linia produkcyjna, nie zbiór porad"
        intro="Każdy rozdział to jeden etap. Jednorazowo ustawiasz niszę, potem co tydzień produkujesz seriami po 10–30 filmów. Wnioski z krzywej retencji wracają do następnej serii skryptów."
      />
      <ol className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-7">
        {pipeline.map((p, i) => (
          <li
            key={p.step}
            className={`rounded-xl border p-4 text-center ${p.key ? "border-gold bg-gold text-ink-950" : "border-ink-700 bg-ink-800"}`}
          >
            <p className={`text-xs font-semibold ${p.key ? "text-ink-950/70" : "text-ink-400"}`}>{String(i + 1).padStart(2, "0")}</p>
            <p className={`mt-1 font-bold ${p.key ? "" : "text-white"}`}>{p.step}</p>
            <p className={`mt-1 text-xs ${p.key ? "text-ink-950/70" : "text-ink-400"}`}>{p.ch}</p>
          </li>
        ))}
      </ol>
      <p className="mt-5 text-sm text-ink-400">
        Skrypt jest wyróżniony, bo decyduje o wyniku bardziej niż obraz i głos. Pętla analizy to jedyny element, który z czasem podnosi
        średnią całego konta.
      </p>
      <div className="mt-12 grid grid-cols-2 gap-4 sm:grid-cols-4">
        {facts.map((f) => (
          <div key={f.label} className="card p-5">
            <p className="font-display text-4xl font-black text-white">{f.value}</p>
            <p className="mt-1 text-sm text-ink-300">{f.label}</p>
          </div>
        ))}
      </div>
    </Section>
  );
}

export function TableOfContents() {
  const parts = [...new Set(chapters.map((c) => c.part))];
  return (
    <Section id="spis" name="toc" className="bg-ink-850">
      <Heading eyebrow="Spis treści" title="13 rozdziałów + 4 dodatki" intro="Kliknij rozdział, żeby zobaczyć wszystkie podrozdziały." />
      <div className="space-y-10">
        {parts.map((part, pi) => (
          <div key={part}>
            <p className="mb-3 text-sm font-bold uppercase tracking-widest text-gold">
              Część {["I", "II", "III", "IV"][pi]}: {part}
            </p>
            <div className="space-y-2">
              {chapters
                .filter((c) => c.part === part)
                .map((c) => (
                  <details key={c.n} data-toc={c.n} className="card group p-0">
                    <summary className="flex cursor-pointer list-none items-start gap-4 p-5 [&::-webkit-details-marker]:hidden">
                      <span className="font-display text-3xl font-black leading-none text-gold">{c.n}</span>
                      <span className="flex-1">
                        <span className="block font-bold uppercase text-white">{c.title}</span>
                        <span className="mt-1 block text-sm text-ink-300">{c.desc}</span>
                      </span>
                      <span aria-hidden className="mt-1 text-ink-400 transition group-open:rotate-45">
                        +
                      </span>
                    </summary>
                    <ol className="grid gap-x-6 gap-y-1.5 border-t border-ink-700 px-5 py-4 text-sm text-ink-300 sm:grid-cols-2">
                      {c.sections.map((s, i) => (
                        <li key={s}>
                          <span className="font-semibold text-ink-400">
                            {c.n}.{i + 1}
                          </span>{" "}
                          {s}
                        </li>
                      ))}
                    </ol>
                  </details>
                ))}
            </div>
          </div>
        ))}
        <div>
          <p className="mb-3 text-sm font-bold uppercase tracking-widest text-gold">Dodatki</p>
          <div className="grid gap-3 sm:grid-cols-2">
            {appendices.map((a) => (
              <div key={a.n} className="card flex gap-4 p-5">
                <span className="font-display text-3xl font-black leading-none text-coral">{a.n}</span>
                <span>
                  <span className="block font-bold uppercase text-white">{a.title}</span>
                  <span className="mt-1 block text-sm text-ink-300">{a.desc}</span>
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Section>
  );
}

const previews = [
  { src: "/preview/p9.jpg", alt: "Otwarcie rozdziału 1: Anatomia virala" },
  { src: "/preview/p8.jpg", alt: "Strona: linia produkcyjna i zasada zero ściemy" },
  { src: "/preview/p16.jpg", alt: "Strona: karta do screena i trzy emocje" },
  { src: "/preview/p26.jpg", alt: "Strona: kalkulator przychodu" },
  { src: "/preview/p107.jpg", alt: "Strona: plan pierwszych 30 dni" },
];

export function Previews() {
  return (
    <Section name="previews">
      <Heading eyebrow="Zajrzyj do środka" title="Tak wygląda e-book" intro="Tabele, schematy, karty do screena i checklisty. Zero lania wody." />
      <div className="-mx-4 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-4 sm:mx-0 sm:grid sm:grid-cols-5 sm:overflow-visible sm:px-0">
        {previews.map((p) => (
          <figure key={p.src} className="w-56 shrink-0 snap-center sm:w-auto">
            <Image src={p.src} alt={p.alt} width={737} height={1039} sizes="(min-width: 640px) 20vw, 224px" className="rounded-lg ring-1 ring-white/10" />
            <figcaption className="mt-2 text-xs text-ink-400">{p.alt}</figcaption>
          </figure>
        ))}
      </div>
    </Section>
  );
}

export function Hooks() {
  return (
    <Section name="hooks" className="bg-ink-850">
      <Heading
        eyebrow="Próbka z banku 60 hooków"
        title="Pierwsza sekunda to cały film w miniaturze"
        intro="Masz 1,5–3 sekundy, zanim kciuk podejmie decyzję. W dodatku B znajdziesz 60 otwarć ułożonych według dziesięciu formuł. Oto sześć z nich:"
      />
      <div className="grid gap-4 md:grid-cols-3">
        {hooks.map((h) => (
          <figure key={h.text} className="card p-5">
            <figcaption className="text-xs font-bold uppercase tracking-widest text-coral">{h.formula}</figcaption>
            <blockquote className="mt-2 text-lg font-semibold text-white">„{h.text}”</blockquote>
          </figure>
        ))}
      </div>
      <div className="mt-14">
        <p className="mb-4 text-sm font-bold uppercase tracking-widest text-gold">Karty do screena z książki</p>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {screenCards.map((c) => (
            <p key={c} className="rounded-2xl border border-ink-600 bg-gradient-to-b from-ink-800 to-ink-950 p-6 font-display text-xl font-extrabold leading-snug text-white">
              {c}
            </p>
          ))}
        </div>
      </div>
    </Section>
  );
}

export function Plan() {
  return (
    <Section name="plan">
      <Heading
        eyebrow="Rozdział 13"
        title="Za 30 dni będziesz mieć dane. Nie nadzieje."
        intro="Celem pierwszych 30 dni nie jest viral ani pierwszy tysiąc złotych. Celem jest działająca linia produkcyjna i 30–45 opublikowanych filmów, z których wyciągniesz wnioski."
      />
      <ol className="grid gap-4 md:grid-cols-4">
        {plan30.map((w, i) => (
          <li key={w.week} className="card relative p-6">
            <span className="text-xs font-bold uppercase tracking-widest text-ink-400">{w.week}</span>
            <p className="mt-2 text-xl font-bold text-white">{w.title}</p>
            <p className="mt-2 text-sm text-ink-300">{w.text}</p>
            <span aria-hidden className={`absolute right-5 top-5 size-3 rounded-full ${i === 3 ? "bg-coral" : "bg-gold"}`} />
          </li>
        ))}
      </ol>
    </Section>
  );
}

export function Honesty() {
  return (
    <Section name="honesty" className="bg-ink-850">
      <Heading
        eyebrow="Moja zasada: zero ściemy"
        title="Czego ten model Ci nie da"
        intro="Mówię to na samym początku, bo oszczędzi Ci to miesięcy frustracji i pieniędzy wydanych na kursy obiecujące „pasywny dochód w tydzień”."
      />
      <div className="grid gap-4 sm:grid-cols-2">
        {honesty.map((h) => (
          <div key={h.title} className="card p-6">
            <h3 className="font-bold text-white">{h.title}</h3>
            <p className="mt-2 text-ink-300">{h.text}</p>
          </div>
        ))}
      </div>
      <p className="mt-8 max-w-3xl text-ink-300">
        Każda liczba w książce ma jedno z trzech oznaczeń: <b className="text-white">źródło</b> (z datą),{" "}
        <b className="text-white">próg roboczy</b> albo <b className="text-white">model</b> (przykład obliczeniowy). Żadnych wymyślonych
        „prawdziwych historii” o milionie wyświetleń w cztery dni.
      </p>
    </Section>
  );
}

export function ForWho() {
  return (
    <Section name="for_who">
      <Heading eyebrow="Dla kogo" title="Czy to książka dla Ciebie?" />
      <div className="grid gap-5 md:grid-cols-2">
        <div className="card p-6">
          <p className="font-bold text-gold">Tak, jeśli…</p>
          <ul className="mt-4 space-y-3">
            {forWho.yes.map((x) => (
              <li key={x} className="flex gap-3 text-ink-300">
                <span aria-hidden className="text-gold">✓</span>
                {x}
              </li>
            ))}
          </ul>
        </div>
        <div className="card p-6">
          <p className="font-bold text-coral">Nie, jeśli…</p>
          <ul className="mt-4 space-y-3">
            {forWho.no.map((x) => (
              <li key={x} className="flex gap-3 text-ink-300">
                <span aria-hidden className="text-coral">✕</span>
                {x}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </Section>
  );
}

export function Sample() {
  return (
    <Section id="fragment" name="sample" className="bg-ink-850">
      <div className="grid items-center gap-10 lg:grid-cols-2">
        <Heading
          eyebrow="Bezpłatny fragment"
          title="Przeczytaj wstęp i cały rozdział 1"
          intro="Anatomia virala: neurobiologia scrollowania, co naprawdę mierzy algorytm, pętla, trzy emocje, które zatrzymują kciuk, i checklista przed publikacją. Sprawdź styl, zanim kupisz."
        />
        <LeadForm />
      </div>
    </Section>
  );
}

export function Author() {
  return (
    <Section name="author">
      <div className="card grid gap-6 p-8 md:grid-cols-[auto_1fr] md:items-center">
        <div aria-hidden className="grid size-20 place-items-center rounded-full bg-gold font-display text-3xl font-black text-ink-950">
          MF
        </div>
        <div>
          <p className="eyebrow">Autor</p>
          <p className="mt-2 text-2xl font-bold text-white">{book.author}</p>
          <p className="mt-3 text-ink-300">
            „Nie musisz pokazywać twarzy, żeby zbudować zasięg, który zarabia. Musisz za to mieć system, który produkuje filmy zatrzymujące
            kciuk — regularnie, tanio i bez spalania się po dwóch tygodniach. Tę książkę napisałem właśnie po to, żebyś taki system
            zbudował.”
          </p>
        </div>
      </div>
    </Section>
  );
}

const included = [
  "E-book PDF, 123 strony, 13 rozdziałów",
  "Bank 60 hooków w 10 formułach",
  "Biblioteka 10 promptów (ChatGPT, Claude, Gemini)",
  "10 skryptów gotowych do produkcji",
  "Arkusz analityczny 12 kolumn + słownik",
  "Plan pierwszych 30 dni dzień po dniu",
  "Rozdział o prawie i podatkach w Polsce 2026",
  "Aktualizacje kolejnych wydań bez dopłat",
];

export function Pricing({ price }: { price: Price }) {
  const saving = price.compareAtCents && price.compareAtCents > price.priceCents ? price.compareAtCents - price.priceCents : 0;
  return (
    <Section id="cena" name="pricing" className="bg-ink-850">
      <div className="mx-auto max-w-xl">
        <div className="relative rounded-3xl border-2 border-gold bg-ink-900 p-8 shadow-2xl shadow-gold/10 sm:p-10">
          <p className="eyebrow text-center">Pełna wersja</p>
          <h2 className="mt-2 text-center font-display text-3xl font-black uppercase text-white">Faceless Cash-Cow 2026</h2>
          <div className="mt-6 text-center">
            {saving > 0 && <p className="text-lg text-ink-400 line-through">{money(price.compareAtCents ?? 0, price.currency)}</p>}
            <p className="font-display text-6xl font-black text-gold">{money(price.priceCents, price.currency)}</p>
            <p className="mt-1 text-sm text-ink-400">jednorazowo · brutto · bez subskrypcji</p>
          </div>
          <ul className="mt-8 space-y-3">
            {included.map((x) => (
              <li key={x} className="flex gap-3 text-ink-300">
                <span aria-hidden className="text-gold">✓</span>
                {x}
              </li>
            ))}
          </ul>
          <BuyButton price={price} cta="pricing" className="mt-8 w-full" />
          <p className="mt-4 text-center text-xs text-ink-400">
            Bezpieczna płatność: BLIK, szybki przelew, karta. Plik od razu po zaksięgowaniu wpłaty.
          </p>
        </div>
      </div>
    </Section>
  );
}

export function Faq() {
  return (
    <Section id="faq" name="faq">
      <Heading eyebrow="FAQ" title="Najczęstsze pytania" />
      <div className="max-w-3xl space-y-2">
        {faq.map((f, i) => (
          <details key={f.q} data-faq={String(i + 1)} className="card group">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-4 p-5 font-semibold text-white [&::-webkit-details-marker]:hidden">
              {f.q}
              <span aria-hidden className="text-ink-400 transition group-open:rotate-45">+</span>
            </summary>
            <p className="px-5 pb-5 text-ink-300">{f.a}</p>
          </details>
        ))}
      </div>
    </Section>
  );
}

export function FinalCta({ price }: { price: Price }) {
  return (
    <Section name="final_cta" className="text-center">
      <p className="mx-auto max-w-3xl font-display text-3xl font-black uppercase leading-tight text-white sm:text-5xl">
        Zacznij dziś. <span className="text-gold">Od dnia 1.</span>
      </p>
      <p className="mx-auto mt-5 max-w-2xl text-lg text-ink-300">
        Ludzie, którzy zarabiają na kontach faceless, nie mają lepszych narzędzi niż Ty. Po prostu przeszli pętlę skrypt → film → dane →
        lepszy skrypt więcej razy.
      </p>
      <BuyButton price={price} cta="final" className="mt-8" />
    </Section>
  );
}

export function StickyCta({ price }: { price: Price }) {
  return (
    <div className="fixed inset-x-0 bottom-0 z-40 border-t border-ink-700 bg-ink-900/95 p-3 backdrop-blur md:hidden">
      <Link href="/kasa" data-cta="sticky_mobile" className="btn btn-gold w-full">
        Kup e-book · {money(price.priceCents, price.currency)}
      </Link>
    </div>
  );
}
