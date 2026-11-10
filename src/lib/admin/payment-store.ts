import type { AdminTransaction, PaymentSummary, TransactionFilters } from "@/types/admin-payments";

/*
 * Where transactions are read for administrators.
 *
 * NO PAYMENT PROVIDER AND NO DATABASE ARE CONFIGURED, so
 * `getPaymentStore` returns null and the Payments page says so on the
 * live site. When payments are real, implement this against the
 * database, never against the provider's API directly:
 *
 *  - `listTransactions` searches, filters and pages on the server, so the
 *    browser never receives every transaction.
 *  - Join the payment record to the student account and the course; store
 *    the amount in the currency's smallest unit, with the currency beside
 *    it, and never total different currencies together.
 *  - Return the least that does the job: a reference, a name, a course,
 *    an amount and a status. NEVER card numbers, provider references,
 *    billing addresses or anything else that could leak from this page.
 *  - Keep this store read-only. Refunds and status changes are separate
 *    steps with their own rules, approvals and audit log.
 */
export type PaymentStore = {
  listTransactions(
    filters: TransactionFilters,
    page: number,
    pageSize: number,
  ): Promise<{ transactions: AdminTransaction[]; total: number }>;
  /** Counts for the summary cards, worked out by the database. */
  summary(): Promise<PaymentSummary>;
};

export function getPaymentStore(): PaymentStore | null {
  return null;
}
