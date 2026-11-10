import type { AdminPayoutRequest, PayoutPayment, PayoutPaymentsById } from "@/types/admin-affiliates";

/*
 * Marking an approved payout request as paid (Step 12E.8).
 * FRONTEND DEMONSTRATION ONLY.
 *
 * Pure functions, so the same rules run in the dialog and in the tests
 * (payout-payments.test.ts). Only type imports, so the file runs under
 * `node --test` without a bundler.
 *
 * MARKING AS PAID DOES NOT PAY ANYBODY. No payment service, bank or
 * wallet is connected to this project, so nothing here can move a cent.
 * This records that an administrator says a transfer was made somewhere
 * else — a label on a sample row — and the date it was recorded.
 *
 * What it deliberately does NOT do:
 *
 *  - It never transfers money, and cannot: there is no payment API in
 *    this project and no account details anywhere in its data.
 *  - It never skips approval. Only an APPROVED request can be marked
 *    paid, so a pending request can never jump straight to Paid and a
 *    rejected one can never be paid at all.
 *  - It never happens twice. A request already marked Paid has no action
 *    left, so the same payout cannot be recorded again.
 *  - It never changes the amount asked for, the payout method, the date
 *    it was requested, who asked, or the approval that came before it.
 *    Only the status and the payment date are added.
 *  - It never notifies the affiliate. No email or message is sent from
 *    this project.
 *
 * When this is real, the same checks must run again on the server, the
 * payment reference from the provider must be recorded with the request,
 * and each marking needs an audit entry naming the administrator.
 */

/**
 * Whether this request can be marked as paid.
 *
 * Approved and nothing else: a pending request has not been agreed yet,
 * a rejected one is owed nothing, and a paid one is already done — which
 * is what stops the same payout being recorded twice.
 */
export function canMarkPayoutPaid(request: AdminPayoutRequest): boolean {
  return request.status === "approved";
}

/** The record kept when a request is marked paid now. A date, and nothing else. */
export function payoutPayment(now: Date = new Date()): PayoutPayment {
  return { paidAt: now.toISOString() };
}

/**
 * Records the payment against a request, keeping everything else as it
 * was: the same id, affiliate, referral code, amount, payout method,
 * original request date and the approval date already on the record.
 */
export function applyPayoutPayment(request: AdminPayoutRequest, payment: PayoutPayment): AdminPayoutRequest {
  return { ...request, status: "paid", paidAt: payment.paidAt };
}

/**
 * Lays the payments recorded in this browser over the requests the page
 * was given, so a sample request can be marked paid without the sample
 * data being rewritten. Applied AFTER the approve/reject decisions, so a
 * request approved on this screen can then be paid on it.
 */
export function withPayoutPayments(
  requests: readonly AdminPayoutRequest[],
  payments: PayoutPaymentsById,
): AdminPayoutRequest[] {
  return requests.map((request) => {
    const payment = payments[request.id];
    // The rule is checked here too, not only in the dialog: stored data must
    // never be able to pay a request that was never approved.
    return payment && canMarkPayoutPaid(request) ? applyPayoutPayment(request, payment) : request;
  });
}

/** Drops payments whose request is no longer on the page, so the stored set can't grow stale. */
export function prunePayoutPayments(
  payments: PayoutPaymentsById,
  requests: readonly AdminPayoutRequest[],
): PayoutPaymentsById {
  const ids = new Set(requests.map((request) => request.id));
  const kept: PayoutPaymentsById = {};
  for (const [id, payment] of Object.entries(payments)) if (ids.has(id)) kept[id] = payment;
  return kept;
}
