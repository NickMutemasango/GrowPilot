import assert from "node:assert/strict";
import { describe, it } from "node:test";
import type { ReportTransaction } from "@/lib/admin/reports";
// Relative paths: only type imports may use the "@/" alias in these tests.
import {
  currenciesWithSales,
  isRealisedSale,
  monthlyRevenue,
  revenueByCourse,
  summariseRevenue,
} from "./reports.ts";

const NOW = new Date("2026-11-09T12:00:00Z");

function payment(
  status: string,
  amountMinor: number,
  options: { courseId?: string; courseTitle?: string; currency?: string; createdAt?: string } = {},
): ReportTransaction {
  return {
    courseId: options.courseId ?? "c-003",
    courseTitle: options.courseTitle ?? "Microsoft Excel Made Easy",
    amountMinor,
    currency: options.currency ?? "USD",
    status,
    createdAt: options.createdAt ?? "2026-10-05T10:00:00Z",
  };
}

describe("isRealisedSale", () => {
  it("counts money that arrived: paid, and paid then refunded", () => {
    assert.equal(isRealisedSale({ status: "paid" }), true);
    assert.equal(isRealisedSale({ status: "refunded" }), true);
  });

  it("leaves out money that never arrived", () => {
    for (const status of ["pending", "failed", "cancelled"]) {
      assert.equal(isRealisedSale({ status }), false, status);
    }
  });
});

describe("summariseRevenue", () => {
  const transactions = [
    payment("paid", 2_900),
    payment("paid", 3_900),
    payment("refunded", 1_900),
    payment("pending", 4_900),
    payment("failed", 9_900),
    payment("cancelled", 7_500),
  ];

  const totals = summariseRevenue(transactions, "USD");

  it("counts only payments that stand as successful sales", () => {
    assert.equal(totals.successfulSales, 2);
    assert.equal(totals.refundedSales, 1);
  });

  it("puts everything that arrived in the gross, refunds included", () => {
    assert.equal(totals.grossMinor, 2_900 + 3_900 + 1_900);
  });

  it("keeps the refunded amount separate", () => {
    assert.equal(totals.refundedMinor, 1_900);
  });

  it("works the net out as gross minus refunds", () => {
    assert.equal(totals.netMinor, totals.grossMinor - totals.refundedMinor);
    assert.equal(totals.netMinor, 6_800);
  });

  it("leaves pending, failed and cancelled payments out of every figure", () => {
    const onlyUnrealised = summariseRevenue(
      [payment("pending", 4_900), payment("failed", 9_900), payment("cancelled", 7_500)],
      "USD",
    );
    assert.deepEqual(onlyUnrealised, {
      currency: "USD",
      successfulSales: 0,
      refundedSales: 0,
      grossMinor: 0,
      refundedMinor: 0,
      netMinor: 0,
    });
  });

  it("never mixes one currency into another", () => {
    const mixed = [payment("paid", 2_900, { currency: "USD" }), payment("paid", 5_000, { currency: "EUR" })];
    assert.equal(summariseRevenue(mixed, "USD").grossMinor, 2_900);
    assert.equal(summariseRevenue(mixed, "EUR").grossMinor, 5_000);
  });

  it("comes back at zero for no transactions at all", () => {
    const empty = summariseRevenue([], "USD");
    assert.equal(empty.grossMinor, 0);
    assert.equal(empty.netMinor, 0);
  });
});

describe("currenciesWithSales", () => {
  it("lists each currency that has money in it, in order", () => {
    const mixed = [
      payment("paid", 1_000, { currency: "USD" }),
      payment("refunded", 2_000, { currency: "EUR" }),
      payment("paid", 3_000, { currency: "USD" }),
    ];
    assert.deepEqual(currenciesWithSales(mixed), ["EUR", "USD"]);
  });

  it("ignores a currency whose only payments never arrived", () => {
    assert.deepEqual(currenciesWithSales([payment("failed", 1_000, { currency: "GBP" })]), []);
  });
});

describe("monthlyRevenue", () => {
  const transactions = [
    payment("paid", 2_900, { createdAt: "2026-10-05T10:00:00Z" }),
    payment("paid", 3_900, { createdAt: "2026-10-20T10:00:00Z" }),
    payment("refunded", 1_900, { createdAt: "2026-10-28T10:00:00Z" }),
    payment("paid", 4_900, { createdAt: "2026-11-02T10:00:00Z" }),
    payment("pending", 9_900, { createdAt: "2026-11-03T10:00:00Z" }),
  ];

  const series = monthlyRevenue(transactions, "USD", { months: 12, now: NOW });
  const byKey = Object.fromEntries(series.map((point) => [point.key, point.value]));

  it("returns one point per month, ending with this month", () => {
    assert.equal(series.length, 12);
    assert.equal(series[11].key, "2026-11");
  });

  it("adds up what was kept in each month", () => {
    assert.equal(byKey["2026-10"], 6_800);
    assert.equal(byKey["2026-11"], 4_900);
  });

  it("gives a refunded payment nothing, so a refunded month is not flattered", () => {
    const refundOnly = monthlyRevenue([payment("refunded", 5_000, { createdAt: "2026-09-10T10:00:00Z" })], "USD", {
      months: 12,
      now: NOW,
    });
    assert.equal(refundOnly.find((point) => point.key === "2026-09")?.value, 0);
  });

  it("keeps the quiet months, so the line never pretends they did not happen", () => {
    assert.equal(byKey["2026-08"], 0);
  });

  it("counts only the currency asked for", () => {
    const mixed = monthlyRevenue(
      [payment("paid", 5_000, { currency: "EUR", createdAt: "2026-10-05T10:00:00Z" })],
      "USD",
      { months: 12, now: NOW },
    );
    assert.equal(
      mixed.reduce((sum, point) => sum + point.value, 0),
      0,
    );
  });
});

describe("revenueByCourse", () => {
  const transactions = [
    payment("paid", 4_900, { courseId: "c-005", courseTitle: "Introduction to Web Development" }),
    payment("paid", 2_900, { courseId: "c-003", courseTitle: "Microsoft Excel Made Easy" }),
    payment("paid", 2_900, { courseId: "c-003", courseTitle: "Microsoft Excel Made Easy" }),
    payment("refunded", 2_900, { courseId: "c-003", courseTitle: "Microsoft Excel Made Easy" }),
    payment("failed", 3_900, { courseId: "c-004", courseTitle: "Starting a Small Business" }),
  ];

  const rows = revenueByCourse(transactions, "USD");
  const byId = Object.fromEntries(rows.map((row) => [row.courseId, row]));

  it("counts every purchase that arrived, refunds included", () => {
    assert.equal(byId["c-003"].purchases, 3);
    assert.equal(byId["c-005"].purchases, 1);
  });

  it("works each course out as gross, refunds and net", () => {
    assert.equal(byId["c-003"].grossMinor, 8_700);
    assert.equal(byId["c-003"].refundedMinor, 2_900);
    assert.equal(byId["c-003"].netMinor, 5_800);
  });

  it("leaves out a course whose only payment failed", () => {
    assert.equal(byId["c-004"], undefined);
  });

  it("puts the biggest net first", () => {
    assert.deepEqual(
      rows.map((row) => row.courseId),
      ["c-003", "c-005"],
    );
  });

  it("adds up to the same figures as the summary above it", () => {
    const totals = summariseRevenue(transactions, "USD");
    assert.equal(
      rows.reduce((sum, row) => sum + row.grossMinor, 0),
      totals.grossMinor,
    );
    assert.equal(
      rows.reduce((sum, row) => sum + row.netMinor, 0),
      totals.netMinor,
    );
    assert.equal(
      rows.reduce((sum, row) => sum + row.purchases, 0),
      totals.successfulSales + totals.refundedSales,
    );
  });
});
