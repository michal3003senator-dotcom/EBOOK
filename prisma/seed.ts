import "dotenv/config";
import { copyFileSync, existsSync, mkdirSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import bcrypt from "bcryptjs";
import { PrismaClient } from "../src/generated/prisma/client";

const url = (process.env.DATABASE_URL ?? "file:./data/app.db").replace(/^file:/, "");
mkdirSync(dirname(url), { recursive: true });
const db = new PrismaClient({ adapter: new PrismaBetterSqlite3({ url }) });

async function main() {
  const email = process.env.ADMIN_EMAIL?.toLowerCase();
  const password = process.env.ADMIN_PASSWORD;
  if (email && password) {
    if (password.length < 12 && process.env.NODE_ENV === "production") throw new Error("ADMIN_PASSWORD: min. 12 znaków");
    const exists = await db.adminUser.findUnique({ where: { email } });
    if (!exists) {
      await db.adminUser.create({ data: { email, passwordHash: await bcrypt.hash(password, 12) } });
      console.log(`✓ Konto admina: ${email}`);
    }
  }

  // Plik e-booka: jeśli leży w katalogu projektu, kopiujemy go do prywatnego storage.
  const storage = resolve(process.env.STORAGE_DIR ?? "./storage", "products");
  const source = resolve("Faceless-Cash-Cow-2026.pdf");
  let filePath: string | null = null;
  if (existsSync(source)) {
    mkdirSync(storage, { recursive: true });
    filePath = "faceless-cash-cow-2026.pdf";
    copyFileSync(source, join(storage, filePath));
    console.log("✓ Skopiowano PDF do storage/products");
  }

  await db.product.upsert({
    where: { slug: "faceless-cash-cow" },
    create: {
      slug: "faceless-cash-cow",
      name: "Faceless Cash-Cow 2026",
      subtitle: "Viralowe wideo bez pokazywania twarzy",
      priceCents: 9700,
      fileName: "Faceless-Cash-Cow-2026.pdf",
      samplePages: "1-22",
      filePath,
    },
    update: filePath ? { filePath } : {},
  });
  console.log("✓ Produkt gotowy (cenę zmienisz w panelu)");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
