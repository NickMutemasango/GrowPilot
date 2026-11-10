import { describeRange, exportDate, exportReportLabels, type ReportDocument } from "./report-export.ts";
import {
  affiliatePerformance,
  summariseAffiliateSales,
  type AffiliateSaleLike,
  type DateRange,
} from "./affiliate-reports.ts";
import { filterReferralAnalytics, summariseReferralAnalytics, type ReferralAnalyticsFilters } from "./referral-analytics.ts";
import { referralRewardStatusLabels } from "./referral-rewards.ts";
import type { CoursePerformance, ReportPoint, StudentGrowth } from "@/lib/admin/reports";
import type { CurrencySales } from "@/lib/admin/report-service";
import type { AdminReferral } from "@/types/admin-referrals";
import type { AffiliateStatus } from "@/types/rewards";

/*
 * Turning what is on the Reports page into a document that can be
 * exported (Step 12F.7).
 *
 * Pure functions, so the same documents are built in the browser and
 * in the tests, and every figure comes from the SAME helpers the
 * screen uses — an export can never quote a number the page does not
 * show.
 *
 * Money is formatted by the caller and passed in as text, so these
 * builders never have to decide how a currency reads.
 */

/** Formats an amount; the caller supplies this so currency handling stays in one place. */
export type MoneyFormatter = (amountMinor: number, currency: string) => string;

const percent = (value: number | null): string => (value === null ? "—" : `${value}%`);

/** Student Growth: the four figures, then the two month-by-month series. */
export function studentGrowthDocument(
  growth: StudentGrowth,
  options: { months: number; now?: Date },
): ReportDocument {
  const monthRows = (points: readonly ReportPoint[]) => points.map((point) => [point.fullLabel, String(point.value)]);

  return {
    id: "student-growth",
    title: exportReportLabels["student-growth"],
    description: `New student registrations over the last ${options.months} months, counted from the sample accounts' own joining dates.`,
    meta: [
      ["Period", `Last ${options.months} months`],
      ["Filters", "None — this report always covers the whole period"],
      ["Exported", exportDate(options.now)],
    ],
    summary: [
      ["Total registered students", String(growth.total)],
      ["New students this month", String(growth.thisMonth)],
      ["New students last month", String(growth.lastMonth)],
      [
        "Monthly growth",
        growth.growthPercent === null
          ? "No percentage (nobody registered last month)"
          : `${growth.growthPercent > 0 ? "+" : ""}${growth.growthPercent.toFixed(1)}%`,
      ],
    ],
    tables: [
      {
        heading: "Student registration trends",
        columns: ["Month", "New students"],
        rows: monthRows(growth.registrations),
      },
      {
        heading: "Cumulative student growth",
        columns: ["Month", "Students in all"],
        rows: monthRows(growth.cumulative),
      },
    ],
  };
}

/** Course Performance: the four figures, then one row per published course. */
export function coursePerformanceDocument(
  input: {
    publishedCourses: number;
    enrolments: number;
    completedEnrolments: number;
    overallCompletionRate: number | null;
    courses: readonly CoursePerformance[];
  },
  options: { now?: Date } = {},
): ReportDocument {
  return {
    id: "course-performance",
    title: exportReportLabels["course-performance"],
    description: "How each published course is doing: enrolments, completions, average progress and completion rate.",
    meta: [
      ["Period", "The whole period"],
      ["Filters", "None — this report always covers every published course"],
      ["Exported", exportDate(options.now)],
    ],
    summary: [
      ["Total published courses", String(input.publishedCourses)],
      ["Total course enrolments", String(input.enrolments)],
      ["Completed enrolments", String(input.completedEnrolments)],
      ["Overall completion rate", percent(input.overallCompletionRate)],
    ],
    tables: [
      {
        heading: "Courses",
        columns: [
          "Course title",
          "Instructor",
          "Total enrolments",
          "Completed students",
          "Average progress",
          "Completion rate",
        ],
        rows: input.courses.map((course) => [
          course.courseTitle,
          course.instructorName,
          String(course.enrolments),
          String(course.completed),
          percent(course.averageProgress),
          course.completionRate === null ? "No enrolments yet" : `${course.completionRate}%`,
        ]),
        emptyNote: "No published courses.",
      },
    ],
  };
}

/** Revenue & Sales: one summary block and one table per currency. */
export function revenueSalesDocument(
  sales: readonly CurrencySales[],
  money: MoneyFormatter,
  options: { months: number; now?: Date },
): ReportDocument {
  const summary: ReportDocument["summary"] = [];
  const tables: ReportDocument["tables"] = [];

  for (const block of sales) {
    const { totals, courses, monthly } = block;
    const currency = totals.currency;
    summary.push(
      [`Total successful sales (${currency})`, String(totals.successfulSales)],
      [`Gross course revenue (${currency})`, money(totals.grossMinor, currency)],
      [`Total refunded amount (${currency})`, money(totals.refundedMinor, currency)],
      [`Net sales after refunds (${currency})`, money(totals.netMinor, currency)],
    );

    tables.push({
      heading: `Sales by course (${currency})`,
      columns: ["Course name", "Purchases", "Gross revenue", "Refunds", "Net sales"],
      rows: courses.map((course) => [
        course.courseTitle,
        String(course.purchases),
        money(course.grossMinor, currency),
        course.refundedMinor > 0 ? `-${money(course.refundedMinor, currency)}` : money(0, currency),
        money(course.netMinor, currency),
      ]),
      emptyNote: "No course sales in this period.",
    });

    tables.push({
      heading: `Monthly net sales (${currency})`,
      columns: ["Month", `Net sales (${currency})`],
      rows: monthly.map((point) => [point.fullLabel, money(point.value, currency)]),
    });
  }

  return {
    id: "revenue-sales",
    title: exportReportLabels["revenue-sales"],
    description:
      "Simulated course sales: what came in, what went back, and what is left. Pending, failed and cancelled payments are excluded; currencies are never added together.",
    meta: [
      ["Period", `Last ${options.months} months for the monthly figures`],
      ["Filters", "None — this report always covers every payment on record"],
      ["Exported", exportDate(options.now)],
    ],
    summary,
    tables,
  };
}

/** Affiliate Performance: the figures and the table, under the dates chosen on screen. */
export function affiliatePerformanceDocument(
  input: {
    sales: readonly AffiliateSaleLike[];
    statusById: Record<string, AffiliateStatus>;
    activeAffiliates: number;
    rateLabel: string;
    currencies: readonly string[];
  },
  range: DateRange,
  money: MoneyFormatter,
  options: { now?: Date } = {},
): ReportDocument {
  const summary: ReportDocument["summary"] = [["Total active affiliates", String(input.activeAffiliates)]];
  const tables: ReportDocument["tables"] = [];

  for (const currency of input.currencies) {
    const totals = summariseAffiliateSales(input.sales, currency);
    summary.push(
      [`Total affiliate-generated sales (${currency})`, String(totals.sales)],
      [`Total affiliate revenue (${currency})`, money(totals.revenueMinor, currency)],
      [`Total commissions earned at ${input.rateLabel} (${currency})`, money(totals.commissionMinor, currency)],
      [`Reversed sales, earning nothing (${currency})`, String(totals.reversedSales)],
    );

    tables.push({
      heading: `Affiliate performance (${currency})`,
      columns: [
        "Affiliate name",
        "Referral code",
        "Courses sold",
        "Total sales",
        "Sales value",
        "Commission earned",
        "Status",
      ],
      rows: affiliatePerformance(input.sales, currency).map((row) => [
        row.affiliateName,
        row.referralCode,
        String(row.coursesSold),
        String(row.sales),
        money(row.revenueMinor, currency),
        money(row.commissionMinor, currency),
        input.statusById[row.affiliateId] ?? "approved",
      ]),
      emptyNote: "No affiliate sales in this period.",
    });
  }

  return {
    id: "affiliate-performance",
    title: exportReportLabels["affiliate-performance"],
    description: `Simulated affiliate sales and the ${input.rateLabel} commission they earned. Reversed sales — refunded, cancelled or failed — are excluded. Nothing has been paid.`,
    meta: [
      ["Date range", describeRange(range.from, range.to)],
      ["Filters", range.from || range.to ? "Date range as chosen on the page" : "None"],
      ["Exported", exportDate(options.now)],
    ],
    summary,
    tables,
  };
}

/** Referral Performance: the figures and the table, under the filters chosen on screen. */
export function referralPerformanceDocument(
  referrals: readonly AdminReferral[],
  filters: ReferralAnalyticsFilters,
  money: MoneyFormatter,
  options: { currency: string; now?: Date },
): ReportDocument {
  const shown = filterReferralAnalytics(referrals, filters);
  const totals = summariseReferralAnalytics(shown);

  return {
    id: "referral-performance",
    title: exportReportLabels["referral-performance"],
    description:
      "Simulated Refer-a-Friend referrals. A referral counts as successful only after a qualifying purchase; refunded and cancelled purchases never qualified.",
    meta: [
      ["Date range", describeRange(filters.range.from, filters.range.to)],
      [
        "Reward status",
        filters.status === "all" ? "All rewards" : referralRewardStatusLabels[filters.status],
      ],
      ["Exported", exportDate(options.now)],
    ],
    summary: [
      ["Total referrals", String(totals.total)],
      ["Successful referrals", String(totals.successful)],
      ["Free courses awarded", String(totals.awarded)],
      ["Pending referral rewards", String(totals.pending)],
      ["Rejected or revoked rewards", String(totals.refused)],
    ],
    tables: [
      {
        heading: "Referrals",
        columns: [
          "Referrer name",
          "Referral code",
          "Referred student",
          "Course purchased",
          "Purchase status",
          "Referral date",
          "Reward status",
        ],
        rows: shown.map((referral) => [
          referral.referrerName,
          referral.referralCode,
          referral.referredStudentName,
          referral.purchasedCourseTitle
            ? referral.purchaseAmountMinor !== null
              ? `${referral.purchasedCourseTitle} (${money(referral.purchaseAmountMinor, options.currency)})`
              : referral.purchasedCourseTitle
            : "No purchase yet",
          referral.purchaseStatus === "none"
            ? "No purchase yet"
            : referral.purchaseStatus === "refunded"
              ? "Refunded — never qualified"
              : "Purchase completed",
          referral.referredAt.slice(0, 10),
          referralRewardStatusLabels[referral.rewardStatus],
        ]),
        emptyNote: "No referrals match these filters.",
      },
    ],
  };
}
