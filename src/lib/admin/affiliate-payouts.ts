import type {
  AdminPayoutRequest,
  PayoutFilters,
  PayoutMethod,
  PayoutStatus,
  PayoutTotals,
} from "@/types/admin-affiliates";
import type { Currency } from "@/types/payments";

/*
 * Affiliate payout requests for the admin area (Step 12E.6).
 * Pure functions only, so the same rules run on the server, in the
 * development preview and in the tests (affiliate-payouts.test.ts).
 * Only type imports, so the file runs under `node --test` without a
 * bundler.
 *
 * VIEWING ONLY. Nothing here approves a request, rejects one, marks one
 * as paid or moves a single cent: no payment service is connected to
 * this project, and "Paid" is a label on a sample row, never a transfer
 * that happened.
 *
 * NO BANK DETAILS pass through this file. A payout method is the KIND of
 * payout — bank transfer, mobile money, PayPal — and the record has
 * nowhere to put an account number, so none can ever be displayed.
 */

export const payoutStatusLabels: Record<PayoutStatus, string> = {
  pending: "Pending",
  approved: "Approved",
  rejected: "Rejected",
  paid: "Paid",
};

/** The kind of payout, said plainly. Never an account, a number or an address. */
export const payoutMethodLabels: Record<PayoutMethod, string> = {
  "bank-transfer": "Bank transfer",
  "mobile-money": "Mobile money",
  paypal: "PayPal",
};

/** Search by affiliate name or request id, plus the status drop-down. They apply together. */
export function filterPayoutRequests(
  requests: readonly AdminPayoutRequest[],
  filters: PayoutFilters,
): AdminPayoutRequest[] {
  const query = filters.query.trim().toLocaleLowerCase();
  return requests.filter((request) => {
    if (
      query &&
      !request.affiliateName.toLocaleLowerCase().includes(query) &&
      !request.id.toLocaleLowerCase().includes(query)
    ) {
      return false;
    }
    if (filters.status !== "all" && request.status !== filters.status) return false;
    return true;
  });
}

/**
 * The four figures above the payout table, worked out from the same rows
 * the table shows, so the two can never disagree. Every request is
 * counted in exactly one of the four statuses.
 */
export function summarisePayoutRequests(requests: readonly AdminPayoutRequest[]): PayoutTotals {
  // Taken from the rows themselves: a total can only ever be in the
  // currency of the requests it adds up.
  const currency: Currency = requests[0]?.currency ?? "USD";
  const totals: PayoutTotals = {
    total: requests.length,
    totalAmountMinor: 0,
    pending: 0,
    pendingAmountMinor: 0,
    approved: 0,
    approvedAmountMinor: 0,
    paid: 0,
    paidAmountMinor: 0,
    rejected: 0,
    rejectedAmountMinor: 0,
    currency,
  };

  for (const request of requests) {
    totals.totalAmountMinor += request.amountMinor;
    switch (request.status) {
      case "pending":
        totals.pending += 1;
        totals.pendingAmountMinor += request.amountMinor;
        break;
      case "approved":
        totals.approved += 1;
        totals.approvedAmountMinor += request.amountMinor;
        break;
      case "paid":
        totals.paid += 1;
        totals.paidAmountMinor += request.amountMinor;
        break;
      case "rejected":
        totals.rejected += 1;
        totals.rejectedAmountMinor += request.amountMinor;
        break;
    }
  }

  return totals;
}

/**
 * Money an administrator should expect to pay out: requests waiting for
 * a decision, plus those approved and not yet paid. A rejected request
 * owes nothing, and a paid one is already behind us.
 */
export function outstandingPayoutMinor(requests: readonly AdminPayoutRequest[]): number {
  return requests.reduce(
    (total, request) =>
      request.status === "pending" || request.status === "approved" ? total + request.amountMinor : total,
    0,
  );
}

/** Newest requests first, so the most recent are at the top. */
export function byNewestPayoutRequest(a: AdminPayoutRequest, b: AdminPayoutRequest): number {
  return b.requestedAt.localeCompare(a.requestedAt);
}
