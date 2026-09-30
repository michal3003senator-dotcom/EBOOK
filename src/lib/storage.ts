import "server-only";
import { existsSync } from "node:fs";
import { mkdir, readFile, stat, writeFile } from "node:fs/promises";
import { basename, join, resolve } from "node:path";
import { PDFDocument, rgb, StandardFonts } from "pdf-lib";
import { sha256 } from "./crypto";
import { env } from "./env";

const root = resolve(env.STORAGE_DIR);
const productsDir = join(root, "products");
const cacheDir = join(root, "cache");

export const productFile = (name: string) => join(productsDir, basename(name));

export async function saveProductFile(file: File) {
  await mkdir(productsDir, { recursive: true });
  const bytes = Buffer.from(await file.arrayBuffer());
  if (bytes.subarray(0, 5).toString() !== "%PDF-") throw new Error("To nie jest plik PDF");
  const name = `${Date.now()}-${sha256(bytes.toString("base64")).slice(0, 10)}.pdf`;
  await writeFile(productFile(name), bytes);
  return name;
}

export const productFileExists = (name: string | null) => Boolean(name && existsSync(productFile(name)));

/** WinAnsi (Helvetica) nie ma polskich znaków — transliteracja do ASCII. */
const ascii = (s: string) =>
  s
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/ł/g, "l")
    .replace(/Ł/g, "L")
    .replace(/[^\x20-\x7E]/g, "");

/** PDF z indywidualnym znakiem licencji na każdej stronie (cache per zamówienie). */
export async function licensedPdf(source: string, order: { id: string; number: number; email: string }) {
  await mkdir(cacheDir, { recursive: true });
  const target = join(cacheDir, `order-${order.id}-${sha256(source).slice(0, 8)}.pdf`);
  if (existsSync(target)) return readFile(target);

  const doc = await PDFDocument.load(await readFile(productFile(source)));
  const font = await doc.embedFont(StandardFonts.Helvetica);
  const label = ascii(`Licencja osobista: ${order.email} | zamowienie #${order.number} | udostepnianie zabronione`);
  for (const page of doc.getPages()) {
    page.drawText(label, { x: 14, y: 6, size: 5.5, font, color: rgb(0.55, 0.57, 0.62), opacity: 0.8 });
  }
  doc.setSubject(label);
  doc.setKeywords([`order-${order.number}`]);
  const out = Buffer.from(await doc.save());
  await writeFile(target, out);
  return out;
}

/** Bezpłatny fragment: wybrane strony (np. "1-22" albo "1-5,9,16"). */
export async function samplePdf(source: string, range: string) {
  await mkdir(cacheDir, { recursive: true });
  const { mtimeMs } = await stat(productFile(source));
  const target = join(cacheDir, `sample-${sha256(`${source}|${range}|${mtimeMs}`).slice(0, 12)}.pdf`);
  if (existsSync(target)) return readFile(target);

  const src = await PDFDocument.load(await readFile(productFile(source)));
  const total = src.getPageCount();
  const pages = new Set<number>();
  for (const part of range.split(",")) {
    const [a, b] = part.split("-").map((n) => Number(n.trim()));
    if (!a) continue;
    for (let i = a; i <= (b || a); i++) if (i >= 1 && i <= total) pages.add(i - 1);
  }
  const out = await PDFDocument.create();
  const copied = await out.copyPages(src, [...pages].sort((x, y) => x - y));
  copied.forEach((p) => out.addPage(p));
  out.setTitle("Faceless Cash-Cow — bezpłatny fragment");
  const bytes = Buffer.from(await out.save());
  await writeFile(target, bytes);
  return bytes;
}
