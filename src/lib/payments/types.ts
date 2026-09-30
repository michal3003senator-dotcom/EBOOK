export type PaymentOrder = {
  id: string;
  number: number;
  accessToken: string;
  email: string;
  totalCents: number;
  currency: string;
  productName: string;
};

export type PaymentEventKind = "paid" | "failed" | "canceled" | "refunded";

export type ProviderEvent = {
  eventId: string;
  kind: PaymentEventKind | null; // null = zdarzenie nieobsługiwane (zapisujemy i ignorujemy)
  type: string;
  orderId: string | null;
  providerRef: string | null;
  payload: string;
};

/**
 * Kontrakt bramki płatności. Nowa bramka (Przelewy24, PayU, Tpay…) = nowy plik
 * implementujący ten interfejs + wpis w `payments/index.ts`. Reszta sklepu się nie zmienia.
 */
export interface PaymentProvider {
  readonly id: string;
  createPayment(order: PaymentOrder, urls: { success: string; cancel: string }): Promise<{ redirectUrl: string; providerRef?: string }>;
  /** Weryfikuje podpis i zwraca zdarzenie albo rzuca błąd. */
  parseWebhook(req: Request): Promise<ProviderEvent>;
}
