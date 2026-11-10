import assert from "node:assert/strict";
import { describe, it } from "node:test";
import type { AdminPayoutRequest, PayoutDecisionsById, PayoutStatus } from "@/types/admin-affiliates";
// Relative paths: only type imports may use the "@/" alias in these tests.
import { summarisePayoutRequests } from "./affiliate-payouts.ts";
import {
  MAX_PAYOUT_REJECTION_REASON,
  PAYOUT_REJECTION_REASON_REQUIRED,
  applyPayoutDecision,
  canDecidePayout,
  cleanPayoutRejectionReason,
  payoutApproval,
  payoutRejection,
  prunePayoutDecisions,
  validatePayoutRejectionReason,
  withPayoutDecisions,
} from "./payout-decisions.ts";

function request(
  id: string,
  status: PayoutStatus = "pending",
  changes: Partial<AdminPayoutRequest> = {},
): AdminPayoutRequest {
  return {
    id,
    affiliateId: "aff-001",
    affiliateName: "John Moyo",
    referralCode: "GP-AFF-001",
    amountMinor: 3_920,
    currency: "USD",
    method: "bank-transfer",
    requestedAt: "2026-10-22T13:15:00Z",
    status,
    rejectionReason: null,
    ...changes,
  };
}

const DECIDED_AT = "2026-11-06T12:00:00.000Z";

describe("canDecidePayout", () => {
  it("offers the actions only while a request is pending", () => {
    assert.equal(canDecidePayout(request("PR-1")), true);
  });

  it("never offers them on a request that has already been settled or paid", () => {
    for (const status of ["approved", "rejected", "paid"] as const) {
      assert.equal(canDecidePayout(request("PR-1", status)), false, status);
    }
  });
});

describe("validatePayoutRejectionReason", () => {
  it("requires a reason", () => {
    assert.equal(validatePayoutRejectionReason(""), PAYOUT_REJECTION_REASON_REQUIRED);
    assert.equal(validatePayoutRejectionReason("   \n  "), PAYOUT_REJECTION_REASON_REQUIRED);
  });

  it("accepts a written reason", () => {
    assert.equal(validatePayoutRejectionReason("The refund window has not closed yet."), null);
  });
});

describe("cleanPayoutRejectionReason", () => {
  it("trims the text and caps its length", () => {
    assert.equal(cleanPayoutRejectionReason("  Too soon.  "), "Too soon.");
    assert.equal(
      cleanPayoutRejectionReason("x".repeat(MAX_PAYOUT_REJECTION_REASON + 50)).length,
      MAX_PAYOUT_REJECTION_REASON,
    );
  });
});

describe("payoutApproval", () => {
  it("approves, and can never mark a request as paid", () => {
    const decision = payoutApproval(new Date(DECIDED_AT));
    assert.deepEqual(decision, { outcome: "approved", decidedAt: DECIDED_AT });
  });

  it("moves a request to Approved and not one step further", () => {
    const approved = applyPayoutDecision(request("PR-1"), payoutApproval(new Date(DECIDED_AT)));
    assert.equal(approved.status, "approved");
    assert.notEqual(approved.status, "paid");
    assert.equal(approved.decidedAt, DECIDED_AT);
    assert.equal(approved.rejectionReason, null);
  });
});

describe("payoutRejection", () => {
  it("records the date and the tidied reason", () => {
    const decision = payoutRejection("  Too soon.  ", new Date(DECIDED_AT));
    assert.deepEqual(decision, { outcome: "rejected", decidedAt: DECIDED_AT, reason: "Too soon." });
  });

  it("keeps the reason on the request", () => {
    const rejected = applyPayoutDecision(request("PR-1"), payoutRejection("Too soon.", new Date(DECIDED_AT)));
    assert.equal(rejected.status, "rejected");
    assert.equal(rejected.rejectionReason, "Too soon.");
  });
});

describe("applyPayoutDecision", () => {
  it("never changes who asked, what for, how much, or when", () => {
    const before = request("PR-1");
    for (const decision of [payoutApproval(new Date(DECIDED_AT)), payoutRejection("No.", new Date(DECIDED_AT))]) {
      const after = applyPayoutDecision(before, decision);
      assert.equal(after.id, before.id);
      assert.equal(after.affiliateId, before.affiliateId);
      assert.equal(after.affiliateName, before.affiliateName);
      assert.equal(after.referralCode, before.referralCode);
      assert.equal(after.amountMinor, before.amountMinor);
      assert.equal(after.currency, before.currency);
      assert.equal(after.method, before.method);
      assert.equal(after.requestedAt, before.requestedAt);
    }
  });
});

describe("withPayoutDecisions", () => {
  const decisions: PayoutDecisionsById = { "PR-1": { outcome: "approved", decidedAt: DECIDED_AT } };

  it("lays a decision over the matching request and leaves the rest alone", () => {
    const list = withPayoutDecisions([request("PR-1"), request("PR-2")], decisions);
    assert.equal(list[0].status, "approved");
    assert.equal(list[1].status, "pending");
  });

  it("ignores a stored decision on a request that was already settled or paid", () => {
    for (const status of ["approved", "rejected", "paid"] as const) {
      const [only] = withPayoutDecisions([request("PR-1", status)], decisions);
      assert.equal(only.status, status, status);
      assert.equal(only.decidedAt, undefined, status);
    }
  });

  it("can never turn a paid request into something else", () => {
    const stored: PayoutDecisionsById = { "PR-1": { outcome: "rejected", decidedAt: DECIDED_AT, reason: "No." } };
    const [only] = withPayoutDecisions([request("PR-1", "paid")], stored);
    assert.equal(only.status, "paid");
    assert.equal(only.rejectionReason, null);
  });

  it("moves the request from Pending to Approved without changing the count", () => {
    const requests = [request("PR-1"), request("PR-2", "paid")];
    const before = summarisePayoutRequests(requests);
    const after = summarisePayoutRequests(withPayoutDecisions(requests, decisions));
    assert.equal(after.total, before.total);
    assert.equal(after.pending, before.pending - 1);
    assert.equal(after.approved, before.approved + 1);
    assert.equal(after.paid, before.paid, "approving must never add to the paid total");
    assert.equal(after.totalAmountMinor, before.totalAmountMinor);
  });

  it("moves the money from pending to approved, never to paid", () => {
    const requests = [request("PR-1", "pending", { amountMinor: 5_000 })];
    const after = summarisePayoutRequests(withPayoutDecisions(requests, decisions));
    assert.equal(after.pendingAmountMinor, 0);
    assert.equal(after.approvedAmountMinor, 5_000);
    assert.equal(after.paidAmountMinor, 0);
  });

  it("moves the money out of the totals entirely when a request is rejected", () => {
    const stored: PayoutDecisionsById = { "PR-1": { outcome: "rejected", decidedAt: DECIDED_AT, reason: "No." } };
    const after = summarisePayoutRequests(withPayoutDecisions([request("PR-1", "pending", { amountMinor: 5_000 })], stored));
    assert.equal(after.pendingAmountMinor, 0);
    assert.equal(after.approvedAmountMinor, 0);
    assert.equal(after.rejectedAmountMinor, 5_000);
  });
});

describe("prunePayoutDecisions", () => {
  it("keeps decisions for requests still on the page and drops the rest", () => {
    const stored: PayoutDecisionsById = {
      "PR-1": { outcome: "approved", decidedAt: DECIDED_AT },
      "PR-gone": { outcome: "approved", decidedAt: DECIDED_AT },
    };
    assert.deepEqual(Object.keys(prunePayoutDecisions(stored, [request("PR-1")])), ["PR-1"]);
  });
});
