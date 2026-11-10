import assert from "node:assert/strict";
import { describe, it } from "node:test";
import type { ReportDocument } from "@/lib/admin/report-export";
import type { StudentGrowth } from "@/lib/admin/reports";
// Relative paths: only type imports may use the "@/" alias in these tests.
import {
  csvField,
  csvRow,
  describeRange,
  exportDate,
  exportFilename,
  isEmptyReport,
  toCsv,
} from "./report-export.ts";
import { coursePerformanceDocument, referralPerformanceDocument, studentGrowthDocument } from "./report-documents.ts";
import { studentGrowth } from "./reports.ts";
import type { AdminReferral, ReferralRewardStatus } from "@/types/admin-referrals";

const NOW = new Date("2026-11-09T12:00:00Z");

function document(overrides: Partial<ReportDocument> = {}): ReportDocument {
  return {
    id: "student-growth",
    title: "Student Growth Report",
    description: "A description.",
    meta: [["Exported", "2026-11-09"]],
    summary: [["Total registered students", "13"]],
    tables: [{ heading: "Months", columns: ["Month", "New students"], rows: [["June 2026", "3"]] }],
    ...overrides,
  };
}

describe("csvField", () => {
  it("leaves a plain value alone", () => {
    assert.equal(csvField("Microsoft Excel Made Easy"), "Microsoft Excel Made Easy");
  });

  it("quotes a value with a comma, a quote or a line break", () => {
    assert.equal(csvField("Moyo, John"), '"Moyo, John"');
    assert.equal(csvField('He said "hello"'), '"He said ""hello"""');
    assert.equal(csvField("one\ntwo"), '"one\ntwo"');
  });

  it("quotes a value with leading or trailing spaces, so they survive", () => {
    assert.equal(csvField(" padded "), '" padded "');
  });

  it("defuses anything a spreadsheet would run as a formula", () => {
    assert.equal(csvField("=SUM(A1:A9)"), "'=SUM(A1:A9)");
    assert.equal(csvField("+1"), "'+1");
    assert.equal(csvField("-1"), "'-1");
    assert.equal(csvField("@here"), "'@here");
  });
});

describe("csvRow", () => {
  it("joins fields with commas", () => {
    assert.equal(csvRow(["a", "b, c", "d"]), 'a,"b, c",d');
  });
});

describe("describeRange", () => {
  it("says what the period is, however it was given", () => {
    assert.equal(describeRange("", ""), "The whole period");
    assert.equal(describeRange("2026-10-01", "2026-10-31"), "2026-10-01 to 2026-10-31");
    assert.equal(describeRange("2026-10-01", ""), "2026-10-01 onwards");
    assert.equal(describeRange("", "2026-10-31"), "Up to 2026-10-31");
  });
});

describe("exportDate and exportFilename", () => {
  it("dates the export", () => {
    assert.equal(exportDate(NOW), "2026-11-09");
  });

  it("names the file after the report and the day", () => {
    assert.equal(exportFilename("student-growth", "csv", NOW), "growpilot-student-growth-report-2026-11-09.csv");
    assert.equal(exportFilename("revenue-sales", "pdf", NOW), "growpilot-revenue-sales-report-2026-11-09.pdf");
  });
});

describe("toCsv", () => {
  const csv = toCsv(document());
  const lines = csv.split("\r\n");

  it("opens with the title, the description and the title block", () => {
    assert.equal(lines[0], "Student Growth Report");
    assert.equal(lines[1], "A description.");
    assert.equal(lines[2], "Exported,2026-11-09");
  });

  it("says on every export that the figures are simulated", () => {
    assert.ok(csv.includes("Simulated data from GrowPilot Academy"));
  });

  it("writes the summary and then each table under its own heading", () => {
    assert.ok(csv.includes("Summary\r\nFigure,Value\r\nTotal registered students,13"));
    assert.ok(csv.includes("Months\r\nMonth,New students\r\nJune 2026,3"));
  });

  it("ends lines with CRLF, as spreadsheets expect", () => {
    assert.ok(csv.endsWith("\r\n"));
  });

  it("says so in place of an empty table rather than leaving a bare heading", () => {
    const empty = toCsv(
      document({ tables: [{ heading: "Months", columns: ["Month"], rows: [], emptyNote: "Nothing yet." }] }),
    );
    assert.ok(empty.includes("Months\r\nNothing yet."));
    assert.ok(!empty.includes("Month\r\n\r\n"));
  });
});

describe("isEmptyReport", () => {
  it("is false while there is anything to show", () => {
    assert.equal(isEmptyReport(document()), false);
  });

  it("is true when there are no figures and no rows", () => {
    assert.equal(
      isEmptyReport(document({ summary: [], tables: [{ heading: "Months", columns: ["Month"], rows: [] }] })),
      true,
    );
  });

  it("is true even when the summary is full of zeroes: a sheet of zeroes is not a report", () => {
    assert.equal(
      isEmptyReport(
        document({
          summary: [["Total referrals", "0"]],
          tables: [{ heading: "Referrals", columns: ["Referrer"], rows: [] }],
        }),
      ),
      true,
    );
  });
});

describe("studentGrowthDocument", () => {
  const growth: StudentGrowth = studentGrowth(
    ["2026-10-01T10:00:00Z", "2026-11-02T10:00:00Z", "2026-11-03T10:00:00Z"],
    { months: 12, now: NOW },
  );
  const doc = studentGrowthDocument(growth, { months: 12, now: NOW });

  it("carries the four figures from the cards", () => {
    assert.deepEqual(doc.summary, [
      ["Total registered students", "3"],
      ["New students this month", "2"],
      ["New students last month", "1"],
      ["Monthly growth", "+100.0%"],
    ]);
  });

  it("says plainly when there is no percentage to give", () => {
    const quiet = studentGrowthDocument(studentGrowth(["2026-11-02T10:00:00Z"], { months: 12, now: NOW }), {
      months: 12,
      now: NOW,
    });
    assert.equal(quiet.summary[3][1], "No percentage (nobody registered last month)");
  });

  it("writes one row per month in both tables", () => {
    assert.equal(doc.tables[0].rows.length, 12);
    assert.equal(doc.tables[1].rows.length, 12);
  });

  it("dates the export", () => {
    assert.deepEqual(doc.meta.at(-1), ["Exported", "2026-11-09"]);
  });
});

describe("coursePerformanceDocument", () => {
  const doc = coursePerformanceDocument(
    {
      publishedCourses: 2,
      enrolments: 3,
      completedEnrolments: 1,
      overallCompletionRate: 33,
      courses: [
        {
          courseId: "c-1",
          courseTitle: "Communication Skills",
          instructorName: "John Moyo",
          enrolments: 3,
          completed: 1,
          averageProgress: 50,
          completionRate: 33,
        },
        {
          courseId: "c-2",
          courseTitle: "Graphic Design",
          instructorName: "Grace Okafor",
          enrolments: 0,
          completed: 0,
          averageProgress: null,
          completionRate: null,
        },
      ],
    },
    { now: NOW },
  );

  it("writes a dash and a plain note where there is no rate to give", () => {
    assert.deepEqual(doc.tables[0].rows[1], ["Graphic Design", "Grace Okafor", "0", "0", "—", "No enrolments yet"]);
  });

  it("survives the round trip into CSV", () => {
    assert.ok(toCsv(doc).includes("Communication Skills,John Moyo,3,1,50%,33%"));
  });
});

describe("referralPerformanceDocument", () => {
  const referral = (id: string, rewardStatus: ReferralRewardStatus): AdminReferral => ({
    id,
    referrerId: "aff-001",
    referrerStudentId: "u-john-moyo",
    referrerName: "John Moyo",
    referredStudentName: "Tendai Mukoko",
    referralCode: "GP-REF-001",
    referredAt: "2026-09-01T10:00:00Z",
    purchaseStatus: rewardStatus === "pending" ? "none" : "completed",
    purchasedCourseTitle: rewardStatus === "pending" ? null : "Microsoft Excel Made Easy",
    purchaseAmountMinor: rewardStatus === "pending" ? null : 2_900,
    purchasedAt: rewardStatus === "pending" ? null : "2026-09-20T10:00:00Z",
    rewardStatus,
    approvedAt: null,
    claimedCourseTitle: null,
    claimedCourseSlug: null,
    claimedAt: null,
    revokedAt: null,
    revocationReason: null,
    rejectionReason: null,
  });

  const money = (amountMinor: number) => `$${(amountMinor / 100).toFixed(2)}`;

  it("exports only what the filters leave, and says what they were", () => {
    const doc = referralPerformanceDocument(
      [referral("RF-1", "claimed"), referral("RF-2", "pending")],
      { range: { from: "", to: "" }, status: "claimed" },
      money,
      { currency: "USD", now: NOW },
    );
    assert.equal(doc.tables[0].rows.length, 1);
    assert.equal(doc.tables[0].rows[0][0], "John Moyo");
    assert.deepEqual(doc.meta[1], ["Reward status", "Claimed"]);
    assert.deepEqual(doc.meta[0], ["Date range", "The whole period"]);
  });

  it("handles a filter that matches nothing without breaking", () => {
    const doc = referralPerformanceDocument(
      [referral("RF-1", "claimed")],
      { range: { from: "2020-01-01", to: "2020-12-31" }, status: "all" },
      money,
      { currency: "USD", now: NOW },
    );
    assert.equal(doc.tables[0].rows.length, 0);
    assert.equal(doc.summary[0][1], "0");
    assert.ok(toCsv(doc).includes("No referrals match these filters."));
  });

  it("says when a friend has bought nothing rather than leaving the cell blank", () => {
    const doc = referralPerformanceDocument(
      [referral("RF-2", "pending")],
      { range: { from: "", to: "" }, status: "all" },
      money,
      { currency: "USD", now: NOW },
    );
    assert.equal(doc.tables[0].rows[0][3], "No purchase yet");
    assert.equal(doc.tables[0].rows[0][4], "No purchase yet");
  });
});
