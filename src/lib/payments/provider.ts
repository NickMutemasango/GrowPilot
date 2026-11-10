import type { Order, VerifiedPaymentEvent } from "@/types/payments";

/*
 * The connection to a payment provider. Server-only: secret keys stay in
 * environment variables and never reach the browser.
 *
 * NO PAYMENT PROVIDER IS CONFIGURED, so `getPaymentProvider` returns null and
 * the checkout says online payment isn't available yet. Nobody can be
 * charged, and no card details are ever asked for or stored here.
 *
 * To switch payments on:
 *  1. Choose a provider GrowPilot is eligible for and that supports the
 *     methods students will use, e.g. Paynow (EcoCash, OneMoney, cards in
 *     Zimbabwe), Stripe or PayPal (cards, in supported countries).
 *  2. Confirm the currency: course prices are in US dollars (USD).
 *  3. Add the provider's test/sandbox keys as server environment variables.
 *  4. Implement this type with the provider's official SDK or API, test it
 *     end to end in sandbox mode, then switch to live keys.
 */
export type PaymentProvider = {
  name: string;
  /** Plain-English methods shown at checkout, e.g. ["Card", "EcoCash"]. */
  methods: string[];
  /** Creates the payment on the provider's side and returns its hosted payment page. */
  createPayment(input: {
    order: Order;
    courseTitle: string;
    /** Where the provider sends the student back; never treated as proof of payment. */
    returnUrl: string;
    cancelUrl: string;
  }): Promise<{ redirectUrl: string; providerReference: string | null }>;
  /**
   * Reads a provider notification (webhook). Must check the signature or
   * hash with the provider's secret, and return null for anything that
   * doesn't verify.
   */
  verifyNotification(request: Request): Promise<VerifiedPaymentEvent | null>;
  /** Asks the provider for the latest status, server to server. */
  fetchStatus(order: Order): Promise<VerifiedPaymentEvent | null>;
};

export function getPaymentProvider(): PaymentProvider | null {
  return null;
}
