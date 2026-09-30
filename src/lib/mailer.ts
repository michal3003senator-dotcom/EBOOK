import "server-only";
import nodemailer from "nodemailer";
import { db } from "./db";
import { env } from "./env";

const transport = env.SMTP_URL ? nodemailer.createTransport(env.SMTP_URL) : null;

export async function sendMail(msg: { to: string; subject: string; html: string; text: string; template: string; orderId?: string }) {
  let status = "LOGGED";
  let error: string | null = null;
  if (transport) {
    try {
      await transport.sendMail({ from: env.MAIL_FROM, to: msg.to, subject: msg.subject, html: msg.html, text: msg.text });
      status = "SENT";
    } catch (e) {
      status = "FAILED";
      error = e instanceof Error ? e.message : String(e);
    }
  } else {
    console.info(`[mail:${msg.template}] -> ${msg.to}: ${msg.subject}\n${msg.text}`);
  }
  await db.emailLog.create({
    data: { to: msg.to, subject: msg.subject, template: msg.template, status, error, orderId: msg.orderId ?? null },
  });
  return status !== "FAILED";
}
