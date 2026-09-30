import "server-only";
import { mkdirSync } from "node:fs";
import { dirname } from "node:path";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import { PrismaClient } from "@/generated/prisma/client";
import { env } from "./env";

function create() {
  const url = env.DATABASE_URL.replace(/^file:/, "");
  mkdirSync(dirname(url), { recursive: true });
  return new PrismaClient({ adapter: new PrismaBetterSqlite3({ url }) });
}

const g = globalThis as unknown as { prisma?: PrismaClient };
export const db = g.prisma ?? create();
if (env.NODE_ENV !== "production") g.prisma = db;
