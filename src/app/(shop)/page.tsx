import { notFound } from "next/navigation";
import { Footer } from "@/components/footer";
import {
  Author,
  Benefits,
  Faq,
  FinalCta,
  ForWho,
  Header,
  Hero,
  Honesty,
  Hooks,
  MarketStats,
  Pipeline,
  Plan,
  Previews,
  Pricing,
  Problem,
  Sample,
  StickyCta,
  TableOfContents,
} from "@/components/landing/sections";
import { Tracker } from "@/components/tracker";
import { faq } from "@/content/ebook";
import { env } from "@/lib/env";
import { mainProduct } from "@/lib/products";
import { getSettings } from "@/lib/settings";

export const dynamic = "force-dynamic";

export default async function Home() {
  const [product, s] = await Promise.all([mainProduct(), getSettings()]);
  if (!product) notFound();

  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "Book",
      name: "Faceless Cash-Cow 2026",
      author: { "@type": "Person", name: "Michał Florczak" },
      bookFormat: "https://schema.org/EBook",
      inLanguage: "pl",
      numberOfPages: 123,
      image: `${env.APP_URL}/preview/p1.jpg`,
      offers: {
        "@type": "Offer",
        price: (product.priceCents / 100).toFixed(2),
        priceCurrency: product.currency,
        availability: "https://schema.org/InStock",
        url: env.APP_URL,
      },
    },
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: faq.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
    },
  ];

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />
      <Tracker page="landing" />
      <Header announcement={s.announcement} />
      <main>
        <Hero price={product} sample={s.leadMagnetEnabled} />
        <MarketStats />
        <Problem />
        <Benefits />
        <Pipeline />
        <TableOfContents />
        <Previews />
        <Hooks />
        <Plan />
        <Honesty />
        <ForWho />
        {s.leadMagnetEnabled && <Sample />}
        <Author />
        <Pricing price={product} />
        <Faq />
        <FinalCta price={product} />
      </main>
      <Footer s={s} />
      <StickyCta price={product} />
    </>
  );
}
