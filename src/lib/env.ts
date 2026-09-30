import "server-only";
import { z } from "zod";

const schema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  DATABASE_URL: z.string().min(1),
  APP_URL: z.url().transform((u) => u.replace(/\/$/, "")),
  SESSION_SECRET: z.string().min(32, "SESSION_SECRET musi mieć min. 32 znaki"),
  PAYMENT_PROVIDER: z.enum(["mock", "stripe"]).default("mock"),
  ALLOW_MOCK_PAYMENTS: z.stringbool().default(false),
  STRIPE_SECRET_KEY: z.string().default(""),
  STRIPE_WEBHOOK_SECRET: z.string().default(""),
  SMTP_URL: z.string().default(""),
  MAIL_FROM: z.string().default("Sklep <sklep@example.com>"),
  STORAGE_DIR: z.string().default("./storage"),
});

export const env = schema.parse(process.env);

export const mockPaymentsAllowed = env.NODE_ENV !== "production" || env.ALLOW_MOCK_PAYMENTS;
