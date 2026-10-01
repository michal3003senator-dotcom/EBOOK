import Link from "next/link";
import type { Settings } from "@/lib/settings";

export function Footer({ s }: { s: Settings }) {
  return (
    <footer className="border-t border-ink-700 bg-ink-950 pb-24 pt-10 text-sm text-ink-400 md:pb-10">
      <div className="container-page grid gap-6 md:grid-cols-[1fr_auto]">
        <div className="space-y-2">
          <p className="font-display font-black uppercase text-gold">Faceless Cash-Cow</p>
          <p>
            Sprzedawca: {s.sellerName}, {s.sellerAddress}
            {s.sellerTaxId && `, NIP ${s.sellerTaxId}`}. Kontakt:{" "}
            <a className="underline" href={`mailto:${s.sellerEmail}`}>
              {s.sellerEmail}
            </a>
          </p>
          <p className="max-w-3xl text-xs">
            Publikacja ma charakter edukacyjny. Nie jest poradą prawną, podatkową ani inwestycyjną. Scenariusze modelowe to przykłady
            obliczeniowe, a nie obietnica zarobku. TikTok, Instagram, YouTube, CapCut, ElevenLabs, ChatGPT i inne nazwy należą do ich
            właścicieli; autor nie jest powiązany z tymi firmami.
          </p>
          <p className="text-xs">© {new Date().getFullYear()} {s.sellerName}. Wszelkie prawa zastrzeżone.</p>
        </div>
        <nav className="flex flex-col gap-2 md:items-end" aria-label="Informacje prawne">
          <Link href="/regulamin" className="hover:text-white">Regulamin</Link>
          <Link href="/polityka-prywatnosci" className="hover:text-white">Polityka prywatności</Link>
          <a href={`mailto:${s.sellerEmail}`} className="hover:text-white">Kontakt</a>
        </nav>
      </div>
    </footer>
  );
}
