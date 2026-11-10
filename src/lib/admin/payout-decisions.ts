import type { AdminPayoutRequest, PayoutDecision, PayoutDecisionsById } from "@/types/admin-affiliates";

/*
 * Deciding an affiliate payout request (Step 12E.7).
 * FRONTEND DEMONSTRATION ONLY.
 *
 * Pure functions, so the same rules run in the dialogs and in the tests
 * (payout-decisions.test.ts). Only type imports, so the file runs under
 * `node --test` without a bundler.
 *
 * What a decision does here: it records the outcome against the request.
 * What it deliberately does NOT do:
 *
 *  - APPROVING NEVER PAYS. An approved request is money GrowPilot has
 *    agreed is owed; it is not money that has moved. The status goes to
 *    "approved" and stops there — nothing in this file can set "paid",
 *    because marking a payout as paid is a separate act that must follow
 *    a real transfer, and no payment service is connected to this
 *    project.
 *  - It never deletes a request. A rejected one stays in the list with
 *    its reason, so the decision is always on record.
 *  - It never changes the amount asked for, the payout method, the date
 *    it was requested or who asked. Only the status and the two decision
 *    fields change.
 *  - It never notifies the affiliate. No email or message is sent from
 *    this project.
 *
 * When this is real, the same checks must run again on the server, each
 * decision needs an audit entry naming the administrator, and approving
 * must be checked against what the affiliate has actually earned.
 */

/** The longest reason we keep. Long enough to explain, short enough to read. */
export const MAX_PAYOUT_REJECTION_REASON = 500;

/** A reason is required: an affiliate refused their money must always be able to be told why. */
export const PAYOUT_REJECTION_REASON_REQUIRED = "Please say why this payout request is being rejected.";

/**
 * Whether this request is still waiting for a decision.
 *
 * Only a pending one can be decided, so a request that has already been
 * approved, rejected or paid can never be decided again.
 */
export function canDecidePayout(request: AdminPayoutRequest): boolean {
  return request.status === "pending";
}

/** Checks the reason typed into the reject dialog. Returns a message, or null when it will do. */
export function validatePayoutRejectionReason(reason: string): string | null {
  return reason.trim().length === 0 ? PAYOUT_REJECTION_REASON_REQUIRED : null;
}

/** Tidies a typed reason into the form that gets stored. */
export function cleanPayoutRejectionReason(reason: string): string {
  return reason.trim().slice(0, MAX_PAYOUT_REJECTION_REASON);
}

/**
 * The decision recorded when a request is approved now.
 *
 * The outcome is "approved" and can never be "paid": see the note at the
 * top of this file.
 */
export function payoutApproval(now: Date = new Date()): PayoutDecision {
  return { outcome: "approved", decidedAt: now.toISOString() };
}

/** The decision recorded when a request is rejected now. */
export function payoutRejection(reason: string, now: Date = new Date()): PayoutDecision {
  return { outcome: "rejected", decidedAt: now.toISOString(), reason: cleanPayoutRejectionReason(reason) };
}

/**
 * Records one decision against a request, keeping everything else as it
 * was: the same id, affiliate, referral code, amount, payout method and
 * original request date.
 */
export function applyPayoutDecision(request: AdminPayoutRequest, decision: PayoutDecision): AdminPayoutRequest {
  return {
    ...request,
    status: decision.outcome,
    decidedAt: decision.decidedAt,
    rejectionReason: decision.outcome === "rejected" ? decision.reason : null,
  };
}

/**
 * Lays the decisions made in this browser over the requests the page was
 * given, so a sample request can be decided without the sample data
 * being rewritten. Requests with no decision come back untouched.
 */
export function withPayoutDecisions(
  requests: readonly AdminPayoutRequest[],
  decisions: PayoutDecisionsById,
): AdminPayoutRequest[] {
  return requests.map((request) => {
    const decision = decisions[request.id];
    // The rule is checked here too, not only in the dialogs: stored data must
    // never be able to re-decide a request that was already settled — nor
    // turn one that is already paid back into something else.
    return decision && canDecidePayout(request) ? applyPayoutDecision(request, decision) : request;
  });
}

/** Drops decisions whose request is no longer on the page, so the stored set can't grow stale. */
export function prunePayoutDecisions(
  decisions: PayoutDecisionsById,
  requests: readonly AdminPayoutRequest[],
): PayoutDecisionsById {
  const ids = new Set(requests.map((request) => request.id));
  const kept: PayoutDecisionsById = {};
  for (const [id, decision] of Object.entries(decisions)) if (ids.has(id)) kept[id] = decision;
  return kept;
}
