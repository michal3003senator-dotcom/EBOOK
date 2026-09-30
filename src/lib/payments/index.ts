import "server-only";
import { env, mockPaymentsAllowed } from "../env";
import { mockProvider } from "./mock";
import { stripeProvider } from "./stripe";
import type { PaymentProvider } from "./types";

const providers: Record<string, PaymentProvider> = { mock: mockProvider, stripe: stripeProvider };

export function activeProvider(): PaymentProvider {
  if (env.PAYMENT_PROVIDER === "mock" && !mockPaymentsAllowed) {
    throw new Error("Tryb testowy płatności jest wyłączony na produkcji (ustaw PAYMENT_PROVIDER lub ALLOW_MOCK_PAYMENTS)");
  }
  return providers[env.PAYMENT_PROVIDER] ?? mockProvider;
}

export const getProvider = (id: string) => providers[id];
