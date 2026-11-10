import type { AdminTransaction, RefundsById, TransactionRefund } from "@/types/admin-payments";

/*
 * Refund rules for the admin area (Step 12D.7).
 * FRONTEND DEMONSTRATION ONLY.
 *
 * Pure functions, so the same rules run in the dialog and in the tests
 * (refunds.test.ts).
 *
 * What marking a refund does here: it records a refund against the
 * transaction. What it deliberately does NOT do:
 *
 *  - It never moves money. No payment provider is connected to this
 *    project, so nothing can be refunded in any real sense.
 *  - It never deletes the transaction and never creates a second one.
 *    The original reference, amount and date stay exactly as they were.
 *  - It never touches enrolments, course access or affiliate
 *    commissions. Those are separate records with their own rules.
 *
 * When refunds are real, every one of these checks must run again on the
 * server, the refund must be requested through the provider rather than
 * written locally, and each one needs an audit entry naming the
 * administrator.
 */

/** The longest reason we keep. Long enough for a proper explanation, short enough to read. */
export const MAX_REFUND_REASON = 500;

/** A reason is required: a refund nobody can explain later is worse than no refund at all. */
export const REFUND_REASON_REQUIRED = "Please say why this transaction is being refunded.";

/**
 * Whether this transaction can be refunded.
 *
 * Only a successful payment can be: there is nothing to give back from a
 * pending, failed or cancelled one, and an already refunded transaction
 * must never be refunded twice.
 */
export function canRefund(transaction: AdminTransaction): boolean {
  return transaction.status === "paid";
}

/** Why the action isn't offered, for the few words shown in its place. */
export function whyNotRefundable(transaction: AdminTransaction): string | null {
  switch (transaction.status) {
    case "paid":
      return null;
    case "refunded":
      return "This transaction has already been refunded.";
    case "pending":
      return "A payment that hasn't been confirmed can't be refunded.";
    case "failed":
      return "A failed payment took no money, so there is nothing to refund.";
    case "cancelled":
      return "A cancelled payment took no money, so there is nothing to refund.";
  }
}

/** Checks the reason typed into the dialog. Returns a message, or null when it will do. */
export function validateRefundReason(reason: string): string | null {
  return reason.trim().length === 0 ? REFUND_REASON_REQUIRED : null;
}

/** Tidies a typed reason into the form that gets stored. */
export function cleanRefundReason(reason: string): string {
  return reason.trim().slice(0, MAX_REFUND_REASON);
}

/**
 * Builds the record of a refund made now.
 *
 * Full refunds only in this step, so the amount is always the amount
 * paid; it is stored rather than assumed, so partial refunds can be
 * added later without rewriting what is already recorded.
 */
export function newRefund(transaction: AdminTransaction, reason: string, now: Date = new Date()): TransactionRefund {
  return { reason: cleanRefundReason(reason), refundedAt: now.toISOString(), amountMinor: transaction.amountMinor };
}

/**
 * Marks one transaction as refunded, keeping everything else as it was:
 * the same reference, student, course, amount paid, currency, method and
 * date. Only the status and the three refund fields change.
 */
export function applyRefund(transaction: AdminTransaction, refund: TransactionRefund): AdminTransaction {
  return {
    ...transaction,
    status: "refunded",
    refundedAt: refund.refundedAt,
    refundReason: refund.reason,
    refundAmountMinor: refund.amountMinor,
  };
}

/**
 * Lays the refunds made in this browser over the transactions the page
 * was given, so a sample record can be marked without the sample data
 * being rewritten. Transactions with no refund come back untouched, and
 * one that could not be refunded is left alone.
 */
export function withRefunds(transactions: readonly AdminTransaction[], refunds: RefundsById): AdminTransaction[] {
  return transactions.map((transaction) => {
    const refund = refunds[transaction.id];
    // The rule is checked here too, not only in the dialog: stored data must never
    // be able to refund something that was pending, failed or cancelled.
    return refund && canRefund(transaction) ? applyRefund(transaction, refund) : transaction;
  });
}

/** Drops refunds whose transaction is no longer on the page, so the stored set can't grow stale. */
export function pruneRefunds(refunds: RefundsById, transactions: readonly AdminTransaction[]): RefundsById {
  const ids = new Set(transactions.map((transaction) => transaction.id));
  const kept: RefundsById = {};
  for (const [id, refund] of Object.entries(refunds)) if (ids.has(id)) kept[id] = refund;
  return kept;
}
