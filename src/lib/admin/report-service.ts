import type {
  CoursePerformance,
  CourseRevenue,
  PopularCourse,
  ReportMonth,
  ReportPoint,
  RevenueTotals,
  StudentGrowth,
} from "@/lib/admin/reports";

/*
 * The shapes the Reports & Analytics screen and its exports are built from.
 *
 * There is no figure-building function here any more: every number it used
 * to return was counted from sample records, and nothing is invented.
 *
 * To fill the screen in, build an `AdminReports` from the database — the
 * user, enrolment, payment and affiliate stores each document the queries
 * — and pass it to the sections in src/components/admin/reports, which are
 * all still here. Keep the rule those sections rely on: a figure must be
 * countable from records somebody can open, so a report can never disagree
 * with the list behind it, and money is never added across currencies.
 */

export type ReportRevenue = { currency: string; amountMinor: number };

export type AdminReports = {
  students: number;
  instructors: number;
  enrolments: number;
  completedCourses: number;
  /** One entry per currency: money is never added across currencies. */
  revenue: ReportRevenue[];
  /** Paid transactions behind the revenue figures, so the card can say what it counted. */
  paidTransactions: number;
  monthly: ReportMonth[];
  popular: PopularCourse[];
  /** Registrations over time (Step 12F.2), worked out from the accounts own joining dates. */
  growth: StudentGrowth;
  /** Published courses in the catalogue (Step 12F.3). */
  publishedCourses: number;
  /** Completed ÷ enrolled across the whole platform, as a percentage. Null with no enrolments at all. */
  overallCompletionRate: number | null;
  /** One row per published course, busiest first. */
  courses: CoursePerformance[];
  /** Sales (Step 12F.4), one block per currency: money is never added across currencies. */
  sales: CurrencySales[];
};

/** Everything the Revenue and Sales section shows, for one currency. */
export type CurrencySales = {
  totals: RevenueTotals;
  monthly: ReportPoint[];
  courses: CourseRevenue[];
};

/** How many months the enrolments chart covers. */
export const REPORT_MONTHS = 6;

/** How many courses the popular-courses chart shows. */
export const REPORT_TOP_COURSES = 5;

/** How many months the student growth charts cover. */
export const GROWTH_MONTHS = 12;
