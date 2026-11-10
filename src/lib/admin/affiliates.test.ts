import assert from "node:assert/strict";
import { describe, it } from "node:test";
import type { AdminAffiliate, AffiliateFilters } from "@/types/admin-affiliates";
import {
  affiliateStatusLabels,
  byNewestAffiliate,
  earningsByCurrency,
  filterAffiliates,
  summariseAffiliates,
} from "./affiliates.ts";

const NO_FILTERS: AffiliateFilters = { query: "", status: "all" };

function affiliate(id: string, changes: Partial<AdminAffiliate> = {}): AdminAffiliate {
  return {
    id,
    studentId: `u-${id}`,
    name: "John Moyo",
    email: "john.moyo@example.com",
    referralCode: "GP-AFF-001",
    successfulSales: 8,
    commissionEarnedMinor: 9600,
    currency: "USD",
    status: "approved",
    joinedAt: "2026-06-04T09:00:00Z",
    ...changes,
  };
}

describe("affiliateStatusLabels", () => {
  it("has a label for every status the affiliate programme uses", () => {
    assert.deepEqual(Object.keys(affiliateStatusLabels).sort(), ["approved", "pending", "rejected", "suspended"]);
  });
});

describe("filterAffiliates", () => {
  const rows = [
    affiliate("a"),
    affiliate("b", { name: "Grace Okafor", email: "grace.okafor@example.com", referralCode: "GP-AFF-002", status: "pending" }),
    affiliate("c", { name: "Ruth Kamau", email: "ruth.k@example.com", referralCode: "GP-AFF-003", status: "suspended" }),
  ];

  const ids = (filters: Partial<AffiliateFilters>) =>
    filterAffiliates(rows, { ...NO_FILTERS, ...filters }).map((row) => row.id);

  it("returns everything when nothing is searched or filtered", () => {
    assert.equal(filterAffiliates(rows, NO_FILTERS).length, 3);
  });

  it("searches by affiliate name, ignoring case", () => {
    assert.deepEqual(ids({ query: "GRACE" }), ["b"]);
  });

  it("searches by email address", () => {
    assert.deepEqual(ids({ query: "ruth.k@" }), ["c"]);
  });

  it("searches by referral code", () => {
    assert.deepEqual(ids({ query: "gp-aff-002" }), ["b"]);
  });

  it("filters by status", () => {
    assert.deepEqual(ids({ status: "suspended" }), ["c"]);
  });

  it("applies the search and the status filter together", () => {
    assert.deepEqual(ids({ query: "ruth", status: "suspended" }), ["c"]);
    assert.deepEqual(ids({ query: "ruth", status: "approved" }), []);
  });

  it("finds nothing for a search that matches nothing", () => {
    assert.deepEqual(ids({ query: "nobody at all" }), []);
  });
});

describe("summariseAffiliates", () => {
  it("counts each status from the affiliates themselves, so the three add up to the total", () => {
    const summary = summariseAffiliates([
      affiliate("a"),
      affiliate("b"),
      affiliate("c", { status: "pending" }),
      affiliate("d", { status: "suspended" }),
    ]);
    assert.deepEqual(summary, { total: 4, approved: 2, pending: 1, rejected: 0, suspended: 1 });
    assert.equal(summary.approved + summary.pending + summary.rejected + summary.suspended, summary.total);
  });

  it("is all zeros for an empty list", () => {
    assert.deepEqual(summariseAffiliates([]), { total: 0, approved: 0, pending: 0, rejected: 0, suspended: 0 });
  });
});

describe("earningsByCurrency", () => {
  it("adds up what affiliates have earned", () => {
    const totals = earningsByCurrency([
      affiliate("a", { commissionEarnedMinor: 9600 }),
      affiliate("b", { commissionEarnedMinor: 2400 }),
      affiliate("c", { commissionEarnedMinor: 0, status: "pending" }),
    ]);
    assert.deepEqual(totals, [{ currency: "USD", amountMinor: 12000 }]);
  });

  it("never adds two currencies together", () => {
    const totals = earningsByCurrency([
      affiliate("a", { commissionEarnedMinor: 9600 }),
      // A second currency can't exist today, but the rule must hold the day it can.
      { ...affiliate("b", { commissionEarnedMinor: 1000 }), currency: "EUR" as AdminAffiliate["currency"] },
    ]);
    assert.deepEqual(totals, [
      { currency: "EUR", amountMinor: 1000 },
      { currency: "USD", amountMinor: 9600 },
    ]);
  });

  it("gives nothing when nobody has earned anything", () => {
    assert.deepEqual(earningsByCurrency([affiliate("a", { commissionEarnedMinor: 0 })]), []);
  });
});

describe("byNewestAffiliate", () => {
  it("puts the most recent application first", () => {
    const rows = [
      affiliate("old", { joinedAt: "2026-06-04T09:00:00Z" }),
      affiliate("new", { joinedAt: "2026-11-04T09:00:00Z" }),
    ];
    assert.deepEqual([...rows].sort(byNewestAffiliate).map((row) => row.id), ["new", "old"]);
  });
});
