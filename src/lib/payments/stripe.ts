import "server-only";
import { hmac, safeEqual } from "../crypto";
import { env } from "../env";
import type { PaymentEventKind, PaymentProvider } from "./types";

const API = "https://api.stripe.com/v1";
const TOLERANCE_S = 300;

async function stripe<T>(path: string, body: Record<string, string>, idempotencyKey: string) {
  const res = await fetch(`${API}${path}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${env.STRIPE_SECRET_KEY}`,
      "Content-Type": "application/x-www-form-urlencoded",
      "Idempotency-Key": idempotencyKey,
    },
    body: new URLSearchParams(body),
  });
  const json = (await res.json()) as T & { error?: { message: string } };
  if (!res.ok) throw new Error(`Stripe: ${json.error?.message ?? res.status}`);
  return json;
}

const KIND: Record<string, PaymentEventKind> = {
  "checkout.session.completed": "paid",
  "checkout.session.async_payment_succeeded": "paid",
  "checkout.session.async_payment_failed": "failed",
  "checkout.session.expired": "canceled",
  "charge.refunded": "refunded",
};

type StripeObject = {
  id: string;
  payment_status?: string;
  client_reference_id?: string | null;
  payment_intent?: string | null;
  metadata?: Record<string, string>;
};

/** Stripe Checkout (karty, BLIK, Przelewy24, Apple/Google Pay — wg ustawień konta Stripe). */
export const stripeProvider: PaymentProvider = {
  id: "stripe",
  async createPayment(order, urls) {
    const s = await stripe<{ id: string; url: string }>(
      "/checkout/sessions",
      {
        mode: "payment",
        customer_email: order.email,
        client_reference_id: order.id,
        "metadata[orderId]": order.id,
        "payment_intent_data[metadata][orderId]": order.id,
        "line_items[0][quantity]": "1",
        "line_items[0][price_data][currency]": order.currency.toLowerCase(),
        "line_items[0][price_data][unit_amount]": String(order.totalCents),
        "line_items[0][price_data][product_data][name]": order.productName,
        success_url: urls.success,
        cancel_url: urls.cancel,
        locale: "pl",
      },
      `order_${order.id}_${order.totalCents}`,
    );
    return { redirectUrl: s.url, providerRef: s.id };
  },

  async parseWebhook(req) {
    const payload = await req.text();
    const header = req.headers.get("stripe-signature") ?? "";
    const parts = Object.fromEntries(header.split(",").map((p) => p.split("=") as [string, string]));
    const t = Number(parts.t);
    const expected = hmac(env.STRIPE_WEBHOOK_SECRET, `${parts.t}.${payload}`);
    const valid = header
      .split(",")
      .filter((p) => p.startsWith("v1="))
      .some((p) => safeEqual(p.slice(3), expected));
    if (!env.STRIPE_WEBHOOK_SECRET || !valid || Math.abs(Date.now() / 1000 - t) > TOLERANCE_S) {
      throw new Error("Nieprawidłowy podpis webhooka");
    }

    const evt = JSON.parse(payload) as { id: string; type: string; data: { object: StripeObject } };
    const obj = evt.data.object;
    let kind = KIND[evt.type] ?? null;
    if (evt.type === "checkout.session.completed" && obj.payment_status !== "paid") kind = null; // płatność asynchroniczna w toku
    return {
      eventId: evt.id,
      type: evt.type,
      kind,
      orderId: obj.metadata?.orderId ?? obj.client_reference_id ?? null,
      providerRef: evt.type.startsWith("checkout.session") ? obj.id : (obj.payment_intent ?? obj.id),
      payload,
    };
  },
};
