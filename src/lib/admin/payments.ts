import type { PaymentStatus } from "@/types/payments";
import type {
  AdminTransaction,
  PaymentMethod,
  PaymentSummary,
  TransactionFilters,
} from "@/types/admin-payments";

/*
 * Payment rules for the admin area. Pure functions only, so the same
 * rules run on the server, in the development preview and in the tests
 * (payments.test.ts).
 *
 * Step 12D.5 is read-only: nothing here takes a payment, issues a refund,
 * changes a status or talks to a provider. No payment provider is
 * connected to this project at all.
 */

/** How each status is written for an administrator. "paid" is shown as Successful. */
export const transactionStatusLabels: Record<PaymentStatus, string> = {
  paid: "Successful",
  pending: "Pending",
  failed: "Failed",
  cancelled: "Cancelled",
  refunded: "Refunded",
};

/** Every method says "(Demo)", so a sample transaction is never read as a real one. */
export const paymentMethodLabels: Record<PaymentMethod, string> = {
  card: "Card (Demo)",
  "mobile-money": "Mobile Money (Demo)",
  "bank-transfer": "Bank Transfer (Demo)",
};

/** Search by transaction reference, student name or course name, plus the status drop-down. */
export function filterTransactions(
  transactions: readonly AdminTransaction[],
  filters: TransactionFilters,
): AdminTransaction[] {
  const query = filters.query.trim().toLocaleLowerCase();
  return transactions.filter((transaction) => {
    if (
      query &&
      !transaction.id.toLocaleLowerCase().includes(query) &&
      !transaction.studentName.toLocaleLowerCase().includes(query) &&
      !transaction.courseTitle.toLocaleLowerCase().includes(query)
    ) {
      return false;
    }
    if (filters.status !== "all" && transaction.status !== filters.status) return false;
    return true;
  });
}

/**
 * The four figures above the table, worked out from the transactions
 * themselves so they can never disagree with the list.
 *
 * These are counts, not amounts. A count can be added up across
 * currencies; a sum of money cannot, and this page must not invent an
 * exchange rate to show a single total.
 */
export function summarisePayments(transactions: readonly AdminTransaction[]): PaymentSummary {
  const count = (status: PaymentStatus) => transactions.filter((transaction) => transaction.status === status).length;
  return {
    total: transactions.length,
    successful: count("paid"),
    pending: count("pending"),
    failed: count("failed"),
    refunded: count("refunded"),
  };
}

/**
 * Money the academy is currently holding, kept separate per currency.
 *
 * Returned as one entry per currency rather than a single number,
 * because adding US dollars to anything else would be meaningless.
 *
 * Only transactions that are still successful count. Pending money has
 * not arrived; failed and cancelled payments took nothing; and a
 * refunded transaction is no longer "paid", so it drops out of this
 * total the moment it is refunded. That is the definition this figure
 * uses: money held now, not money ever received.
 */
export function totalsByCurrency(transactions: readonly AdminTransaction[]): { currency: string; amountMinor: number }[] {
  const totals = new Map<string, number>();
  for (const transaction of transactions) {
    if (transaction.status !== "paid") continue;
    totals.set(transaction.currency, (totals.get(transaction.currency) ?? 0) + transaction.amountMinor);
  }
  return [...totals].map(([currency, amountMinor]) => ({ currency, amountMinor })).sort((a, b) => a.currency.localeCompare(b.currency));
}

/** Newest transactions first, so the most recent activity is at the top. */
export function byNewestTransaction(a: AdminTransaction, b: AdminTransaction): number {
  return b.createdAt.localeCompare(a.createdAt);
}
