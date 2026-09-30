import type { Metadata, Viewport } from "next";
import { Archivo, Inter } from "next/font/google";
import { env } from "@/lib/env";
import { getSettings } from "@/lib/settings";
import "./globals.css";

const head = Archivo({ subsets: ["latin", "latin-ext"], weight: ["700", "800", "900"], variable: "--font-head" });
const body = Inter({ subsets: ["latin", "latin-ext"], variable: "--font-body" });

export async function generateMetadata(): Promise<Metadata> {
  const s = await getSettings();
  return {
    metadataBase: new URL(env.APP_URL),
    title: { default: s.metaTitle, template: "%s · Faceless Cash-Cow" },
    description: s.metaDescription,
    openGraph: { title: s.metaTitle, description: s.metaDescription, images: ["/preview/p1.jpg"], locale: "pl_PL", type: "website" },
    twitter: { card: "summary_large_image" },
  };
}

export const viewport: Viewport = { themeColor: "#0f1422", colorScheme: "dark" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pl" className={`${head.variable} ${body.variable}`}>
      <body className="min-h-dvh font-sans">{children}</body>
    </html>
  );
}
