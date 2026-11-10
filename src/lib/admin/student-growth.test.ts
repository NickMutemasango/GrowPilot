import assert from "node:assert/strict";
import { describe, it } from "node:test";
// Relative paths: only type imports may use the "@/" alias in these tests.
import { countBefore, growthPercent, monthlyCounts, runningTotals, studentGrowth } from "./reports.ts";

const NOW = new Date("2026-11-09T12:00:00Z");

describe("monthlyCounts", () => {
  it("returns one entry per month, ending with the current month", () => {
    const series = monthlyCounts([], { months: 12, now: NOW });
    assert.equal(series.length, 12);
    assert.equal(series[0].key, "2025-12");
    assert.equal(series[11].key, "2026-11");
    assert.equal(series[11].fullLabel, "November 2026");
  });

  it("counts each date in the month it falls in", () => {
    const series = monthlyCounts(
      ["2026-10-01T15:30:00Z", "2026-10-30T23:59:00Z", "2026-11-03T16:40:00Z"],
      { months: 12, now: NOW },
    );
    const byKey = Object.fromEntries(series.map((point) => [point.key, point.value]));
    assert.equal(byKey["2026-10"], 2);
    assert.equal(byKey["2026-11"], 1);
    assert.equal(byKey["2026-09"], 0);
  });

  it("ignores a date it cannot read, rather than counting it somewhere wrong", () => {
    const series = monthlyCounts(["nonsense", ""], { months: 3, now: NOW });
    assert.equal(
      series.reduce((sum, point) => sum + point.value, 0),
      0,
    );
  });
});

describe("countBefore", () => {
  it("counts only what happened before the window opened", () => {
    const dates = ["2025-05-01T09:00:00Z", "2025-11-30T09:00:00Z", "2025-12-01T09:00:00Z", "2026-03-01T09:00:00Z"];
    assert.equal(countBefore(dates, "2025-12"), 2);
  });

  it("is zero when everything falls inside the window", () => {
    assert.equal(countBefore(["2026-06-01T09:00:00Z"], "2026-01"), 0);
  });
});

describe("runningTotals", () => {
  const months = monthlyCounts(["2026-10-01T00:00:00Z", "2026-11-01T00:00:00Z", "2026-11-02T00:00:00Z"], {
    months: 3,
    now: NOW,
  });

  it("adds each month onto the one before it", () => {
    assert.deepEqual(
      runningTotals(months).map((point) => point.value),
      [0, 1, 3],
    );
  });

  it("starts from what came before, so the line never pretends the platform began at zero", () => {
    assert.deepEqual(
      runningTotals(months, 40).map((point) => point.value),
      [40, 41, 43],
    );
  });

  it("never goes down: a running total only ever holds or rises", () => {
    const totals = runningTotals(monthlyCounts(["2026-09-01T00:00:00Z"], { months: 6, now: NOW }), 5);
    for (let index = 1; index < totals.length; index += 1) {
      assert.ok(totals[index].value >= totals[index - 1].value);
    }
  });
});

describe("growthPercent", () => {
  it("works out an ordinary rise and fall", () => {
    assert.equal(growthPercent(6, 4), 50);
    assert.equal(growthPercent(3, 6), -50);
    assert.equal(growthPercent(4, 4), 0);
  });

  it("rounds to one decimal place", () => {
    assert.equal(growthPercent(4, 3), 33.3);
    assert.equal(growthPercent(2, 3), -33.3);
  });

  it("gives no percentage when last month was zero: there is nothing to divide by", () => {
    assert.equal(growthPercent(5, 0), null);
    assert.equal(growthPercent(0, 0), null);
  });
});

describe("studentGrowth", () => {
  const joined = [
    // Before the window: these count towards the total and the running total only.
    "2025-01-10T09:00:00Z",
    "2025-02-11T09:00:00Z",
    // Inside it.
    "2026-09-14T09:00:00Z",
    "2026-10-01T15:30:00Z",
    "2026-10-12T11:15:00Z",
    "2026-11-01T13:05:00Z",
    "2026-11-02T08:30:00Z",
    "2026-11-03T15:10:00Z",
  ];

  const growth = studentGrowth(joined, { months: 12, now: NOW });

  it("counts everybody in the total, including those who joined before the window", () => {
    assert.equal(growth.total, 8);
  });

  it("reads this month and last month off the series", () => {
    assert.equal(growth.thisMonth, 3);
    assert.equal(growth.lastMonth, 2);
  });

  it("works the growth out from those two months", () => {
    assert.equal(growth.growthPercent, 50);
  });

  it("ends the running total at today's total", () => {
    assert.equal(growth.cumulative[growth.cumulative.length - 1].value, growth.total);
  });

  it("starts the running total above zero where people joined earlier", () => {
    assert.equal(growth.cumulative[0].value, 2);
  });

  it("keeps the two charts the same length, one point per month", () => {
    assert.equal(growth.registrations.length, 12);
    assert.equal(growth.cumulative.length, 12);
  });

  it("gives no percentage when nobody joined last month", () => {
    const quiet = studentGrowth(["2026-11-01T00:00:00Z"], { months: 12, now: NOW });
    assert.equal(quiet.lastMonth, 0);
    assert.equal(quiet.thisMonth, 1);
    assert.equal(quiet.growthPercent, null);
  });

  it("handles no students at all without breaking", () => {
    const empty = studentGrowth([], { months: 12, now: NOW });
    assert.equal(empty.total, 0);
    assert.equal(empty.thisMonth, 0);
    assert.equal(empty.lastMonth, 0);
    assert.equal(empty.growthPercent, null);
    assert.equal(empty.cumulative[11].value, 0);
  });

  it("follows the data: add a registration this month and every figure moves with it", () => {
    const before = studentGrowth(joined, { months: 12, now: NOW });
    const after = studentGrowth([...joined, "2026-11-08T10:00:00Z"], { months: 12, now: NOW });
    assert.equal(after.total, before.total + 1);
    assert.equal(after.thisMonth, before.thisMonth + 1);
    assert.equal(after.growthPercent, 100);
    assert.equal(after.cumulative[11].value, before.cumulative[11].value + 1);
  });
});
