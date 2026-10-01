import Link from "next/link";
import { Footer } from "@/components/footer";
import type { Settings } from "@/lib/settings";

export function LegalPage({ title, s, children }: { title: string; s: Settings; children: React.ReactNode }) {
  return (
    <>
      <main className="container-page max-w-3xl py-12">
        <Link href="/" className="text-sm text-ink-400 hover:text-white">
          ← Strona główna
        </Link>
        <h1 className="mt-4 font-display text-3xl font-black uppercase text-white">{title}</h1>
        <div className="mt-8 space-y-4 text-ink-300 [&_h2]:mt-8 [&_h2]:text-lg [&_h2]:font-bold [&_h2]:text-white [&_li]:ml-5 [&_li]:list-decimal">
          {children}
        </div>
      </main>
      <Footer s={s} />
    </>
  );
}
