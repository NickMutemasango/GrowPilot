import assert from "node:assert/strict";
import { describe, it } from "node:test";
import type { AdminEnrolment } from "@/types/admin-enrolments";
// Relative paths: only type imports may use the "@/" alias in these tests.
import { axisTicks, monthlyEnrolments, niceAxisMax, popularCourses } from "./reports.ts";

function enrolment(
  id: string,
  enrolledAt: string,
  courseId = "c-001",
  courseTitle = "Communication Skills",
  status: AdminEnrolment["status"] = "active",
): AdminEnrolment {
  return {
    id,
    studentId: `u-${id}`,
    studentName: "Sample Student",
    studentEmail: "sample@example.com",
    courseId,
    courseSlug: "communication-skills",
    courseTitle,
    enrolledAt,
    type: "paid",
    status,
    completedLessons: 0,
    totalLessons: 8,
    progress: 0,
  };
}

const NOW = new Date("2026-11-09T12:00:00Z");

describe("monthlyEnrolments", () => {
  it("returns one entry per month, ending with the current month", () => {
    const series = monthlyEnrolments([], { months: 6, now: NOW });
    assert.equal(series.length, 6);
    assert.deepEqual(
      series.map((month) => month.key),
      ["2026-06", "2026-07", "2026-08", "2026-09", "2026-10", "2026-11"],
    );
    assert.equal(series[5].label, "Nov");
    assert.equal(series[5].fullLabel, "November 2026");
  });

  it("counts each enrolment in the month it happened", () => {
    const series = monthlyEnrolments(
      [
        enrolment("1", "2026-09-02T10:00:00Z"),
        enrolment("2", "2026-09-28T23:59:00Z"),
        enrolment("3", "2026-11-01T00:00:00Z"),
      ],
      { months: 6, now: NOW },
    );
    const byKey = Object.fromEntries(series.map((month) => [month.key, month.enrolments]));
    assert.equal(byKey["2026-09"], 2);
    assert.equal(byKey["2026-11"], 1);
  });

  it("keeps the empty months, because a quiet month is part of the trend", () => {
    const series = monthlyEnrolments([enrolment("1", "2026-11-01T00:00:00Z")], { months: 6, now: NOW });
    assert.equal(series.filter((month) => month.enrolments === 0).length, 5);
  });

  it("counts a revoked enrolment too: it still happened", () => {
    const series = monthlyEnrolments([enrolment("1", "2026-10-05T10:00:00Z", "c-001", "Course", "revoked")], {
      months: 6,
      now: NOW,
    });
    assert.equal(series.find((month) => month.key === "2026-10")?.enrolments, 1);
  });

  it("leaves out anything older than the window, and ignores an unreadable date", () => {
    const series = monthlyEnrolments(
      [enrolment("1", "2025-01-01T00:00:00Z"), enrolment("2", "not a date")],
      { months: 6, now: NOW },
    );
    assert.equal(
      series.reduce((sum, month) => sum + month.enrolments, 0),
      0,
    );
  });

  it("crosses the year boundary correctly", () => {
    const series = monthlyEnrolments([], { months: 3, now: new Date("2027-01-15T00:00:00Z") });
    assert.deepEqual(
      series.map((month) => month.key),
      ["2026-11", "2026-12", "2027-01"],
    );
  });
});

describe("popularCourses", () => {
  const enrolments = [
    enrolment("1", "2026-10-01T00:00:00Z", "c-excel", "Microsoft Excel Made Easy"),
    enrolment("2", "2026-10-02T00:00:00Z", "c-excel", "Microsoft Excel Made Easy"),
    enrolment("3", "2026-10-03T00:00:00Z", "c-excel", "Microsoft Excel Made Easy"),
    enrolment("4", "2026-10-04T00:00:00Z", "c-comms", "Communication Skills"),
    enrolment("5", "2026-10-05T00:00:00Z", "c-comms", "Communication Skills"),
    enrolment("6", "2026-10-06T00:00:00Z", "c-web", "Introduction to Web Development"),
  ];

  it("counts enrolments per course, biggest first", () => {
    assert.deepEqual(
      popularCourses(enrolments).map((course) => [course.courseTitle, course.enrolments]),
      [
        ["Microsoft Excel Made Easy", 3],
        ["Communication Skills", 2],
        ["Introduction to Web Development", 1],
      ],
    );
  });

  it("keeps only as many as asked for", () => {
    assert.equal(popularCourses(enrolments, 2).length, 2);
    assert.equal(popularCourses(enrolments, 0).length, 0);
  });

  it("breaks ties by title, so the order never reshuffles", () => {
    const tied = [
      enrolment("1", "2026-10-01T00:00:00Z", "c-b", "Beta"),
      enrolment("2", "2026-10-02T00:00:00Z", "c-a", "Alpha"),
    ];
    assert.deepEqual(
      popularCourses(tied).map((course) => course.courseTitle),
      ["Alpha", "Beta"],
    );
  });

  it("comes back empty for no enrolments at all", () => {
    assert.deepEqual(popularCourses([]), []);
  });
});

describe("niceAxisMax", () => {
  it("rounds up to a figure a person would say", () => {
    assert.equal(niceAxisMax(0), 1);
    assert.equal(niceAxisMax(1), 1);
    assert.equal(niceAxisMax(3), 5);
    assert.equal(niceAxisMax(7), 10);
    assert.equal(niceAxisMax(12), 20);
    assert.equal(niceAxisMax(44), 50);
    assert.equal(niceAxisMax(120), 200);
  });

  it("is never zero, so a chart always has something to draw against", () => {
    assert.ok(niceAxisMax(0) > 0);
    assert.ok(niceAxisMax(-5) > 0);
  });

  it("is never below the value it has to fit", () => {
    for (const value of [1, 2, 6, 9, 19, 33, 67, 99, 101, 999]) {
      assert.ok(niceAxisMax(value) >= value, String(value));
    }
  });
});

describe("axisTicks", () => {
  it("runs from zero to the maximum, evenly spaced", () => {
    assert.deepEqual(axisTicks(20), [0, 5, 10, 15, 20]);
    assert.deepEqual(axisTicks(10, 2), [0, 5, 10]);
  });

  it("lands every line on a whole number", () => {
    for (const max of [1, 2, 5, 10, 20, 25, 50, 100, 200]) {
      for (const tick of axisTicks(max)) {
        assert.ok(Number.isInteger(tick), `${max} produced ${tick}`);
      }
    }
  });

  it("always starts at zero and ends at the maximum", () => {
    for (const max of [1, 5, 10, 25]) {
      const ticks = axisTicks(max);
      assert.equal(ticks[0], 0);
      assert.equal(ticks[ticks.length - 1], max);
    }
  });
});
