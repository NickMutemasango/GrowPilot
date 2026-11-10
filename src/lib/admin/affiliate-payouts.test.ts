import assert from "node:assert/strict";
import { describe, it } from "node:test";
import type { AdminPayoutRequest, PayoutStatus } from "@/types/admin-affiliates";
import {
  byNewestPayoutRequest,
  filterPayoutRequests,
  outstandingPayoutMinor,
  payoutMethodLabels,
  payoutStatusLabels,
  summarisePayoutRequests,
} from "./affiliate-payouts.ts";

function request(
  id: string,
  amountMinor: number,
  status: PayoutStatus,
  changes: Partial<AdminPayoutRequest> = {},
): AdminPayoutRequest {
  return {
    id,
    affiliateId: "aff-001",
    affiliateName: "John Moyo",
    referralCode: "GP-AFF-001",
    amountMinor,
    currency: "USD",
    method: "bank-transfer",
    requestedAt: "2026-10-01T09:00:00Z",
    status,
    rejectionReason: null,
    ...changes,
  };
}

describe("summarisePayoutRequests", () => {
  const requests = [
    request("PR-1", 10_000, "paid"),
    request("PR-2", 5_000, "approved"),
    request("PR-3", 3_000, "approved"),
    request("PR-4", 2_000, "pending"),
    request("PR-5", 7_000, "rejected"),
  ];
  const totals = summarisePayoutRequests(requests);

  it("counts every request exactly once, in one status", () => {
    assert.equal(totals.total, 5);
    assert.equal(totals.pending + totals.approved + totals.paid + totals.rejected, totals.total);
  });

  it("splits the counts by status", () => {
    assert.equal(totals.pending, 1);
    assert.equal(totals.approved, 2);
    assert.equal(totals.paid, 1);
    assert.equal(totals.rejected, 1);
  });

  it("adds up the money behind each status", () => {
    assert.equal(totals.pendingAmountMinor, 2_000);
    assert.equal(totals.approvedAmountMinor, 8_000);
    assert.equal(totals.paidAmountMinor, 10_000);
    assert.equal(totals.rejectedAmountMinor, 7_000);
    assert.equal(totals.totalAmountMinor, 27_000);
  });

  it("gives empty totals for an empty list rather than failing", () => {
    const empty = summarisePayoutRequests([]);
    assert.equal(empty.total, 0);
    assert.equal(empty.totalAmountMinor, 0);
    assert.equal(empty.currency, "USD");
  });
});

describe("outstandingPayoutMinor", () => {
  it("counts what is waiting and what is approved but unpaid", () => {
    const requests = [request("PR-1", 2_000, "pending"), request("PR-2", 3_000, "approved")];
    assert.equal(outstandingPayoutMinor(requests), 5_000);
  });

  it("owes nothing for a rejected or an already paid request", () => {
    const requests = [request("PR-1", 9_000, "rejected"), request("PR-2", 8_000, "paid")];
    assert.equal(outstandingPayoutMinor(requests), 0);
  });
});

describe("filterPayoutRequests", () => {
  const requests = [
    request("PR-1001", 10_000, "paid", { affiliateName: "John Moyo" }),
    request("PR-1002", 5_000, "pending", { affiliateName: "Grace Okafor" }),
    request("PR-1003", 3_000, "rejected", { affiliateName: "Grace Okafor" }),
  ];

  it("searches by affiliate name, ignoring case and spacing", () => {
    assert.deepEqual(filterPayoutRequests(requests, { query: "  grace ", status: "all" }).map((r) => r.id), [
      "PR-1002",
      "PR-1003",
    ]);
  });

  it("searches by request id too, ignoring case", () => {
    assert.deepEqual(filterPayoutRequests(requests, { query: "pr-1001", status: "all" }).map((r) => r.id), [
      "PR-1001",
    ]);
  });

  it("filters by payout status", () => {
    assert.deepEqual(filterPayoutRequests(requests, { query: "", status: "rejected" }).map((r) => r.id), [
      "PR-1003",
    ]);
  });

  it("applies the search and the status together", () => {
    assert.deepEqual(filterPayoutRequests(requests, { query: "grace", status: "pending" }).map((r) => r.id), [
      "PR-1002",
    ]);
    assert.deepEqual(filterPayoutRequests(requests, { query: "john", status: "pending" }), []);
  });

  it("returns an empty list when nothing matches, so the empty state can be shown", () => {
    assert.deepEqual(filterPayoutRequests(requests, { query: "nobody at all", status: "all" }), []);
  });

  it("returns everything when nothing is searched or filtered", () => {
    assert.equal(filterPayoutRequests(requests, { query: "", status: "all" }).length, 3);
  });
});

describe("byNewestPayoutRequest", () => {
  it("puts the most recent request first", () => {
    const older = request("PR-1", 1_000, "paid", { requestedAt: "2026-07-01T09:00:00Z" });
    const newer = request("PR-2", 1_000, "paid", { requestedAt: "2026-10-01T09:00:00Z" });
    assert.deepEqual([older, newer].sort(byNewestPayoutRequest).map((r) => r.id), ["PR-2", "PR-1"]);
  });
});

describe("the labels", () => {
  it("names all four payout statuses", () => {
    assert.deepEqual(Object.keys(payoutStatusLabels).sort(), ["approved", "paid", "pending", "rejected"]);
  });

  it("names each payout method as a kind, never an account", () => {
    assert.deepEqual(payoutMethodLabels, {
      "bank-transfer": "Bank transfer",
      "mobile-money": "Mobile money",
      paypal: "PayPal",
    });
  });
});
