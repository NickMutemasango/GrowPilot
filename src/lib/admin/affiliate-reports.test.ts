import assert from "node:assert/strict";
import { describe, it } from "node:test";
import type { AffiliateSaleLike } from "@/lib/admin/affiliate-reports";
// Relative paths: only type imports may use the "@/" alias in these tests.
import {
  affiliateCurrencies,
  affiliatePerformance,
  earnsCommission,
  filterSalesByRange,
  isBackwardsRange,
  isWithinRange,
  monthlyAffiliateRevenue,
  summariseAffiliateSales,
  topAffiliates,
} from "./affiliate-reports.ts";

const NOW = new Date("2026-11-09T12:00:00Z");

function sale(
  affiliateId: string,
  status: string,
  saleAmountMinor: number,
  options: { courseId?: string; saleAt?: string; currency?: string; name?: string } = {},
): AffiliateSaleLike {
  return {
    affiliateId,
    affiliateName: options.name ?? `Affiliate ${affiliateId}`,
    referralCode: `GP-AFF-${affiliateId}`,
    courseId: options.courseId ?? "communication-skills",
    saleAmountMinor,
    // 60% of the sale, as the programme's rule gives it.
    commissionMinor: Math.round(saleAmountMinor * 0.6),
    currency: options.currency ?? "USD",
    status,
    saleAt: options.saleAt ?? "2026-10-15T10:00:00Z",
  };
}

describe("earnsCommission", () => {
  it("counts a sale that still stands", () => {
    for (const status of ["pending", "approved", "paid"]) {
      assert.equal(earnsCommission({ status }), true, status);
    }
  });

  it("never counts a reversed sale: refunded, cancelled or failed earns nothing", () => {
    assert.equal(earnsCommission({ status: "reversed" }), false);
  });
});

describe("isWithinRange", () => {
  it("includes both ends, as whole days", () => {
    const range = { from: "2026-10-01", to: "2026-10-31" };
    assert.equal(isWithinRange("2026-10-01T00:00:00Z", range), true);
    assert.equal(isWithinRange("2026-10-31T23:59:00Z", range), true);
    assert.equal(isWithinRange("2026-09-30T23:59:00Z", range), false);
    assert.equal(isWithinRange("2026-11-01T00:01:00Z", range), false);
  });

  it("leaves an end open when its date is empty", () => {
    assert.equal(isWithinRange("2020-01-01T00:00:00Z", { from: "", to: "2026-10-31" }), true);
    assert.equal(isWithinRange("2030-01-01T00:00:00Z", { from: "2026-10-01", to: "" }), true);
  });

  it("never admits a date it cannot read", () => {
    assert.equal(isWithinRange("nonsense", { from: "", to: "" }), false);
  });
});

describe("filterSalesByRange", () => {
  const sales = [
    sale("001", "paid", 1_900, { saleAt: "2026-09-10T10:00:00Z" }),
    sale("002", "paid", 2_900, { saleAt: "2026-10-15T10:00:00Z" }),
    sale("003", "paid", 3_900, { saleAt: "2026-11-02T10:00:00Z" }),
  ];

  it("returns everything when no dates are set", () => {
    assert.equal(filterSalesByRange(sales, { from: "", to: "" }).length, 3);
  });

  it("keeps only what falls inside", () => {
    const shown = filterSalesByRange(sales, { from: "2026-10-01", to: "2026-10-31" });
    assert.deepEqual(shown.map((one) => one.affiliateId), ["002"]);
  });

  it("works with one end open", () => {
    assert.equal(filterSalesByRange(sales, { from: "2026-10-01", to: "" }).length, 2);
    assert.equal(filterSalesByRange(sales, { from: "", to: "2026-09-30" }).length, 1);
  });
});

describe("isBackwardsRange", () => {
  it("spots dates the wrong way round", () => {
    assert.equal(isBackwardsRange({ from: "2026-11-01", to: "2026-10-01" }), true);
    assert.equal(isBackwardsRange({ from: "2026-10-01", to: "2026-11-01" }), false);
    assert.equal(isBackwardsRange({ from: "", to: "2026-10-01" }), false);
  });
});

describe("summariseAffiliateSales", () => {
  const sales = [
    sale("001", "paid", 2_900),
    sale("001", "approved", 3_900),
    sale("002", "pending", 1_900),
    sale("002", "reversed", 4_900),
  ];

  const totals = summariseAffiliateSales(sales, "USD");

  it("counts only the sales that stand", () => {
    assert.equal(totals.sales, 3);
    assert.equal(totals.revenueMinor, 2_900 + 3_900 + 1_900);
  });

  it("adds up the commission on those sales", () => {
    assert.equal(totals.commissionMinor, 1_740 + 2_340 + 1_140);
  });

  it("keeps reversed sales apart, out of revenue and commission", () => {
    assert.equal(totals.reversedSales, 1);
    assert.equal(totals.reversedRevenueMinor, 4_900);
  });

  it("never mixes one currency into another", () => {
    const mixed = [sale("001", "paid", 2_900, { currency: "USD" }), sale("002", "paid", 5_000, { currency: "EUR" })];
    assert.equal(summariseAffiliateSales(mixed, "USD").revenueMinor, 2_900);
    assert.equal(summariseAffiliateSales(mixed, "EUR").revenueMinor, 5_000);
  });
});

describe("affiliateCurrencies", () => {
  it("lists each currency once, in order", () => {
    const mixed = [sale("001", "paid", 1, { currency: "USD" }), sale("002", "paid", 1, { currency: "EUR" })];
    assert.deepEqual(affiliateCurrencies(mixed), ["EUR", "USD"]);
  });
});

describe("affiliatePerformance", () => {
  const sales = [
    sale("001", "paid", 2_900, { courseId: "excel", name: "John Moyo" }),
    sale("001", "paid", 1_900, { courseId: "comms", name: "John Moyo" }),
    sale("001", "paid", 1_900, { courseId: "comms", name: "John Moyo" }),
    sale("002", "approved", 3_900, { courseId: "business", name: "Grace Okafor" }),
    sale("003", "reversed", 4_900, { courseId: "web", name: "Peter Ndlovu" }),
  ];

  const rows = affiliatePerformance(sales, "USD");
  const byId = Object.fromEntries(rows.map((row) => [row.affiliateId, row]));

  it("counts sales, revenue and commission per affiliate", () => {
    assert.equal(byId["001"].sales, 3);
    assert.equal(byId["001"].revenueMinor, 6_700);
    assert.equal(byId["001"].commissionMinor, 1_740 + 1_140 + 1_140);
  });

  it("counts distinct courses, not sales", () => {
    assert.equal(byId["001"].coursesSold, 2);
    assert.equal(byId["002"].coursesSold, 1);
  });

  it("keeps an affiliate whose sales all reversed, with zeroes and the reversal count", () => {
    assert.equal(byId["003"].sales, 0);
    assert.equal(byId["003"].revenueMinor, 0);
    assert.equal(byId["003"].commissionMinor, 0);
    assert.equal(byId["003"].reversedSales, 1);
    assert.equal(byId["003"].coursesSold, 0);
  });

  it("puts the best performer first", () => {
    assert.deepEqual(rows.map((row) => row.affiliateId), ["001", "002", "003"]);
  });

  it("adds up to the same figures as the summary", () => {
    const totals = summariseAffiliateSales(sales, "USD");
    assert.equal(rows.reduce((sum, row) => sum + row.sales, 0), totals.sales);
    assert.equal(rows.reduce((sum, row) => sum + row.revenueMinor, 0), totals.revenueMinor);
    assert.equal(rows.reduce((sum, row) => sum + row.commissionMinor, 0), totals.commissionMinor);
  });
});

describe("topAffiliates", () => {
  const rows = affiliatePerformance(
    [
      sale("001", "paid", 1_000),
      sale("001", "paid", 1_000),
      sale("002", "paid", 1_000),
      sale("003", "reversed", 1_000),
    ],
    "USD",
  );

  it("keeps the best few", () => {
    assert.deepEqual(topAffiliates(rows, 1).map((row) => row.affiliateId), ["001"]);
  });

  it("leaves off anybody with no sale that stands", () => {
    assert.deepEqual(topAffiliates(rows, 5).map((row) => row.affiliateId), ["001", "002"]);
  });
});

describe("monthlyAffiliateRevenue", () => {
  const sales = [
    sale("001", "paid", 2_900, { saleAt: "2026-10-05T10:00:00Z" }),
    sale("002", "paid", 1_900, { saleAt: "2026-10-20T10:00:00Z" }),
    sale("003", "reversed", 9_900, { saleAt: "2026-10-28T10:00:00Z" }),
    sale("004", "approved", 3_900, { saleAt: "2026-11-02T10:00:00Z" }),
  ];

  const series = monthlyAffiliateRevenue(sales, "USD", { months: 12, now: NOW });
  const byKey = Object.fromEntries(series.map((point) => [point.key, point.value]));

  it("returns one point per month, ending with this month", () => {
    assert.equal(series.length, 12);
    assert.equal(series[11].key, "2026-11");
  });

  it("adds up the sales that stand in each month", () => {
    assert.equal(byKey["2026-10"], 4_800);
    assert.equal(byKey["2026-11"], 3_900);
  });

  it("gives a reversed sale nothing", () => {
    const reversedOnly = monthlyAffiliateRevenue([sale("001", "reversed", 5_000, { saleAt: "2026-09-01T10:00:00Z" })], "USD", {
      months: 12,
      now: NOW,
    });
    assert.equal(reversedOnly.find((point) => point.key === "2026-09")?.value, 0);
  });

  it("keeps the quiet months", () => {
    assert.equal(byKey["2026-08"], 0);
  });
});
