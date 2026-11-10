import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { rewardsPolicy } from "../../config/rewards.ts";
import { calculateCommission } from "../rewards/rules.ts";
import type { AdminAffiliateSale } from "@/types/admin-affiliates";
import type { CommissionStatus } from "@/types/rewards";
import {
  byNewestSale,
  commissionStatusLabels,
  eligibleSalesValueMinor,
  filterAffiliateSales,
  isEligible,
  summariseAffiliateSales,
} from "./affiliate-sales.ts";

const RATE = rewardsPolicy.commissionRateBasisPoints;

function sale(
  id: string,
  saleAmountMinor: number,
  status: CommissionStatus,
  changes: Partial<AdminAffiliateSale> = {},
): AdminAffiliateSale {
  return {
    id,
    affiliateId: `aff-${id}`,
    affiliateName: "John Moyo",
    referralCode: "GP-AFF-001",
    courseSlug: "microsoft-excel-made-easy",
    courseTitle: "Microsoft Excel Made Easy",
    saleAmountMinor,
    rateBasisPoints: RATE,
    commissionMinor: calculateCommission(saleAmountMinor, RATE),
    currency: "USD",
    status,
    saleAt: "2026-10-01T09:00:00Z",
    ...changes,
  };
}

describe("the commission rate", () => {
  it("is 60%, so a $20 sale earns $12", () => {
    assert.equal(RATE, 6000);
    assert.equal(calculateCommission(2000, RATE), 1200);
  });

  it("works a sale out at 60% of the course price", () => {
    assert.equal(sale("a", 2900, "approved").commissionMinor, 1740);
    assert.equal(sale("b", 4900, "paid").commissionMinor, 2940);
  });
});

describe("isEligible", () => {
  it("counts pending, approved and paid commissions", () => {
    for (const status of ["pending", "approved", "paid"] as const) {
      assert.equal(isEligible(sale("x", 2900, status)), true, status);
    }
  });

  it("never counts a reversed one", () => {
    assert.equal(isEligible(sale("x", 2900, "reversed")), false);
  });
});

describe("summariseAffiliateSales", () => {
  const sales = [
    sale("a", 2900, "paid"),
    sale("b", 1900, "approved"),
    sale("c", 3900, "approved"),
    sale("d", 4900, "pending"),
    sale("e", 2900, "reversed"),
  ];
  const totals = summariseAffiliateSales(sales);

  it("counts only the sales that still earn", () => {
    assert.equal(totals.totalSales, 4);
    assert.equal(totals.reversedSales, 1);
  });

  it("adds pending, approved and paid into the total earned", () => {
    assert.equal(
      totals.totalCommissionMinor,
      calculateCommission(2900, RATE) +
        calculateCommission(1900, RATE) +
        calculateCommission(3900, RATE) +
        calculateCommission(4900, RATE),
    );
  });

  it("leaves a refunded or failed sale out of every eligible total", () => {
    const reversedOnly = summariseAffiliateSales([sale("e", 2900, "reversed")]);
    assert.equal(reversedOnly.totalSales, 0);
    assert.equal(reversedOnly.totalCommissionMinor, 0);
    assert.equal(reversedOnly.pendingCommissionMinor, 0);
    assert.equal(reversedOnly.approvedCommissionMinor, 0);
    // Still reported, so a reversal is never silently dropped.
    assert.equal(reversedOnly.reversedCommissionMinor, calculateCommission(2900, RATE));
  });

  it("splits pending from approved, and never counts paid as either", () => {
    assert.equal(totals.pendingCommissionMinor, calculateCommission(4900, RATE));
    assert.equal(
      totals.approvedCommissionMinor,
      calculateCommission(1900, RATE) + calculateCommission(3900, RATE),
    );
    assert.equal(
      totals.pendingCommissionMinor + totals.approvedCommissionMinor + calculateCommission(2900, RATE),
      totals.totalCommissionMinor,
    );
  });

  it("adds up the value of the eligible sales themselves", () => {
    assert.equal(eligibleSalesValueMinor(sales), 2900 + 1900 + 3900 + 4900);
  });
});

describe("filterAffiliateSales", () => {
  const sales = [
    sale("a", 2900, "paid", { affiliateName: "John Moyo" }),
    sale("b", 1900, "pending", { affiliateName: "Grace Okafor" }),
    sale("c", 3900, "reversed", { affiliateName: "Grace Okafor" }),
  ];

  it("searches by affiliate name, ignoring case and spacing", () => {
    assert.deepEqual(filterAffiliateSales(sales, { query: "  grace ", status: "all" }).map((s) => s.id), ["b", "c"]);
  });

  it("filters by commission status", () => {
    assert.deepEqual(filterAffiliateSales(sales, { query: "", status: "reversed" }).map((s) => s.id), ["c"]);
  });

  it("applies the search and the status together", () => {
    assert.deepEqual(
      filterAffiliateSales(sales, { query: "grace", status: "pending" }).map((s) => s.id),
      ["b"],
    );
    assert.deepEqual(filterAffiliateSales(sales, { query: "john", status: "pending" }), []);
  });

  it("returns everything when nothing is searched or filtered", () => {
    assert.equal(filterAffiliateSales(sales, { query: "", status: "all" }).length, 3);
  });
});

describe("byNewestSale", () => {
  it("puts the most recent sale first", () => {
    const older = sale("a", 1900, "paid", { saleAt: "2026-07-01T09:00:00Z" });
    const newer = sale("b", 1900, "paid", { saleAt: "2026-10-01T09:00:00Z" });
    assert.deepEqual([older, newer].sort(byNewestSale).map((s) => s.id), ["b", "a"]);
  });
});

describe("commissionStatusLabels", () => {
  it("names all four statuses", () => {
    assert.deepEqual(Object.keys(commissionStatusLabels).sort(), ["approved", "paid", "pending", "reversed"]);
  });
});
