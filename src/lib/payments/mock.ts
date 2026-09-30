import "server-only";
import { env } from "../env";
import type { PaymentProvider } from "./types";

/** Tryb testowy: symulowana strona płatności pod /checkout/mock/[id]. */
export const mockProvider: PaymentProvider = {
  id: "mock",
  async createPayment(order) {
    return { redirectUrl: `${env.APP_URL}/checkout/mock/${order.id}?t=${order.accessToken}`, providerRef: `mock_${order.id}` };
  },
  async parseWebhook() {
    throw new Error("Bramka testowa nie przyjmuje webhooków");
  },
};
