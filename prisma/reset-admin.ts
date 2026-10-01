import "dotenv/config";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import bcrypt from "bcryptjs";
import { PrismaClient } from "../src/generated/prisma/client";

/** Ustawia login i hasło admina z ADMIN_EMAIL / ADMIN_PASSWORD w .env (tworzy lub nadpisuje konto). */
const url = (process.env.DATABASE_URL ?? "file:./data/app.db").replace(/^file:/, "");
const db = new PrismaClient({ adapter: new PrismaBetterSqlite3({ url }) });
const email = process.env.ADMIN_EMAIL?.toLowerCase();
const password = process.env.ADMIN_PASSWORD ?? "";

if (!email || password.length < 12) {
  console.error("Ustaw w .env ADMIN_EMAIL i ADMIN_PASSWORD (min. 12 znaków).");
  process.exit(1);
}
const passwordHash = await bcrypt.hash(password, 12);
await db.adminUser.upsert({ where: { email }, create: { email, passwordHash }, update: { passwordHash } });
await db.loginAttempt.deleteMany({ where: { email } });
console.log(`✓ Admin: ${email} — hasło ustawione z .env`);
await db.$disconnect();
