import "server-only";
import { cache } from "react";
import { z } from "zod";
import { db } from "./db";

export const settingsSchema = z.object({
  sellerName: z.string().max(200).default("Michał Florczak"),
  sellerAddress: z.string().max(300).default("[adres do doręczeń]"),
  sellerTaxId: z.string().max(40).default(""),
  sellerRegistry: z.string().max(300).default("działalność nierejestrowana (art. 5 ustawy Prawo przedsiębiorców)"),
  sellerEmail: z.string().max(200).default("kontakt@example.com"),
  announcement: z.string().max(200).default(""),
  leadMagnetEnabled: z.boolean().default(true),
  metaTitle: z.string().max(120).default("Faceless Cash-Cow 2026 — viralowe wideo bez pokazywania twarzy"),
  metaDescription: z
    .string()
    .max(300)
    .default(
      "Kompletny system krok po kroku: od pierwszego hooka do pierwszej prowizji. Bez kamery, bez drogiego sprzętu i zgodnie z polskim prawem. 123 strony, 13 rozdziałów, 60 hooków.",
    ),
});

export type Settings = z.infer<typeof settingsSchema>;

export const getSettings = cache(async (): Promise<Settings> => {
  const rows = await db.setting.findMany();
  const raw = Object.fromEntries(rows.map((r) => [r.key, JSON.parse(r.value) as unknown]));
  const parsed = settingsSchema.safeParse(raw);
  return parsed.success ? parsed.data : settingsSchema.parse({});
});

export async function saveSettings(input: Settings) {
  await db.$transaction(
    Object.entries(input).map(([key, v]) =>
      db.setting.upsert({ where: { key }, create: { key, value: JSON.stringify(v) }, update: { value: JSON.stringify(v) } }),
    ),
  );
}
