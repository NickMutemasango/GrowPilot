import assert from "node:assert/strict";
import { describe, it } from "node:test";
import type { AdminPayoutRequest, PayoutPaymentsById, PayoutStatus } from "@/types/admin-affiliates";
// Relative paths: only type imports may use the "@/" alias in these tests.
import { summarisePayoutRequests } from "./affiliate-payouts.ts";
import {
  applyPayoutPayment,
  canMarkPayoutPaid,
  payoutPayment,
  prunePayoutPayments,
  withPayoutPayments,
} from "./payout-payments.ts";

function request(
  id: string,
  status: PayoutStatus = "approved",
  changes: Partial<AdminPayoutRequest> = {},
): AdminPayoutRequest {
  return {
    id,
    affiliateId: "aff-004",
    affiliateName: "Grace Mutasa",
    referralCode: "GP-AFF-004",
    amountMinor: 5_000,
    currency: "USD",
    method: "bank-transfer",
    requestedAt: "2026-10-02T08:45:00Z",
    status,
    rejectionReason: null,
    ...changes,
  };
}

const PAID_AT = "2026-11-08T09:30:00.000Z";

describe("canMarkPayoutPaid", () => {
  it("offers the action on an approved request", () => {
    assert.equal(canMarkPayoutPaid(request("PR-1", "approved")), true);
  });

  it("never offers it on a pending, rejected or already paid request", () => {
    for (const status of ["pending", "rejected", "paid"] as const) {
      assert.equal(canMarkPayoutPaid(request("PR-1", status)), false, status);
    }
  });
});

describe("payoutPayment", () => {
  it("records only the date it was marked", () => {
    assert.deepEqual(payoutPayment(new Date(PAID_AT)), { paidAt: PAID_AT });
  });
});

describe("applyPayoutPayment", () => {
  it("marks the request paid and keeps the payment date", () => {
    const paid = applyPayoutPayment(request("PR-1004"), { paidAt: PAID_AT });
    assert.equal(paid.status, "paid");
    assert.equal(paid.paidAt, PAID_AT);
  });

  it("changes nothing else about the request", () => {
    const original = request("PR-1004", "approved", { decidedAt: "2026-10-03T10:00:00.000Z" });
    const paid = applyPayoutPayment(original, { paidAt: PAID_AT });
    assert.equal(paid.id, original.id);
    assert.equal(paid.affiliateId, original.affiliateId);
    assert.equal(paid.affiliateName, original.affiliateName);
    assert.equal(paid.referralCode, original.referralCode);
    assert.equal(paid.amountMinor, original.amountMinor);
    assert.equal(paid.currency, original.currency);
    assert.equal(paid.method, original.method);
    assert.equal(paid.requestedAt, original.requestedAt);
    // The approval that came before it is kept: paying does not erase it.
    assert.equal(paid.decidedAt, original.decidedAt);
  });

  it("leaves the request the page was given untouched", () => {
    const original = request("PR-1004");
    applyPayoutPayment(original, { paidAt: PAID_AT });
    assert.equal(original.status, "approved");
    assert.equal(original.paidAt, undefined);
  });
});

describe("withPayoutPayments", () => {
  const payments: PayoutPaymentsById = { "PR-1004": { paidAt: PAID_AT } };

  it("lays a recorded payment over the matching request", () => {
    const [paid] = withPayoutPayments([request("PR-1004")], payments);
    assert.equal(paid.status, "paid");
    assert.equal(paid.paidAt, PAID_AT);
  });

  it("leaves requests with no payment alone", () => {
    const [other] = withPayoutPayments([request("PR-1005")], payments);
    assert.equal(other.status, "approved");
    assert.equal(other.paidAt, undefined);
  });

  it("refuses to pay a request that was never approved", () => {
    for (const status of ["pending", "rejected"] as const) {
      const [row] = withPayoutPayments([request("PR-1004", status)], payments);
      assert.equal(row.status, status, status);
      assert.equal(row.paidAt, undefined, status);
    }
  });

  it("cannot record the same payout twice", () => {
    const once = withPayoutPayments([request("PR-1004")], payments);
    const twice = withPayoutPayments(once, { "PR-1004": { paidAt: "2026-11-09T09:30:00.000Z" } });
    assert.equal(twice[0].paidAt, PAID_AT);
  });
});

describe("prunePayoutPayments", () => {
  it("drops payments whose request is no longer on the page", () => {
    const payments: PayoutPaymentsById = { "PR-1004": { paidAt: PAID_AT }, "PR-9999": { paidAt: PAID_AT } };
    assert.deepEqual(prunePayoutPayments(payments, [request("PR-1004")]), { "PR-1004": { paidAt: PAID_AT } });
  });
});

describe("the figures after a simulated payout", () => {
  it("moves the amount from approved to paid, leaving the total alone", () => {
    const requests = [request("PR-1004"), request("PR-1005", "pending", { amountMinor: 8_000 })];
    const before = summarisePayoutRequests(requests);
    const after = summarisePayoutRequests(withPayoutPayments(requests, { "PR-1004": { paidAt: PAID_AT } }));

    assert.equal(before.approved, 1);
    assert.equal(before.paid, 0);
    assert.equal(after.approved, 0);
    assert.equal(after.approvedAmountMinor, 0);
    assert.equal(after.paid, 1);
    assert.equal(after.paidAmountMinor, 5_000);
    assert.equal(after.total, before.total);
    assert.equal(after.totalAmountMinor, before.totalAmountMinor);
    // The pending request is untouched by somebody else's payout.
    assert.equal(after.pending, 1);
    assert.equal(after.pendingAmountMinor, 8_000);
  });
});
