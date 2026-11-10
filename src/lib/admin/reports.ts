import type { AdminEnrolment } from "@/types/admin-enrolments";

/*
 * Reports & Analytics (Step 12F.1) — the figures behind the overview.
 * Pure functions only, so the same arithmetic runs on the server, in the
 * development preview and in the tests (reports.test.ts). Only type
 * imports, so the file runs under `node --test` without a bundler.
 *
 * Everything here is COUNTED from the records the other admin screens
 * already show — the enrolments, the users, the transactions — never
 * typed in. A figure on this page can therefore always be traced to a
 * list somebody can open and check, and the two can never disagree.
 *
 * MONEY IS NEVER ADDED ACROSS CURRENCIES. Revenue is reported one
 * currency at a time, because a single total would need an exchange
 * rate this project does not have, and inventing one would make the
 * figure a guess dressed up as a fact.
 */

/** One month on the enrolments chart. */
export type ReportMonth = {
  /** Sortable key, "2026-06". */
  key: string;
  /** Short label for the axis, "Jun". */
  label: string;
  /** Full label for the tooltip and the table, "June 2026". */
  fullLabel: string;
  enrolments: number;
};

/** One bar on the popular-courses chart. */
export type PopularCourse = {
  courseId: string;
  courseTitle: string;
  enrolments: number;
};

const MONTH_SHORT = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const MONTH_LONG = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

function monthKey(year: number, month: number): string {
  return `${year}-${String(month + 1).padStart(2, "0")}`;
}

/**
 * Enrolments per month, ending with the month we are in.
 *
 * Every month in the range is returned, including the empty ones: a gap
 * in a trend line is itself the finding, and dropping quiet months
 * would make the line flatter than the truth.
 *
 * A revoked enrolment still counts here. It happened, and this chart is
 * about what the platform did over time, not about who has access now.
 */
export function monthlyEnrolments(
  enrolments: readonly AdminEnrolment[],
  options: { months?: number; now?: Date } = {},
): ReportMonth[] {
  const months = Math.max(1, options.months ?? 6);
  const now = options.now ?? new Date();

  const counts = new Map<string, number>();
  for (const enrolment of enrolments) {
    const when = new Date(enrolment.enrolledAt);
    if (Number.isNaN(when.getTime())) continue;
    const key = monthKey(when.getUTCFullYear(), when.getUTCMonth());
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }

  const series: ReportMonth[] = [];
  for (let back = months - 1; back >= 0; back -= 1) {
    const date = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - back, 1));
    const month = date.getUTCMonth();
    const year = date.getUTCFullYear();
    const key = monthKey(year, month);
    series.push({
      key,
      label: MONTH_SHORT[month],
      fullLabel: `${MONTH_LONG[month]} ${year}`,
      enrolments: counts.get(key) ?? 0,
    });
  }
  return series;
}

/**
 * The courses with the most enrolments, biggest first.
 *
 * Ties are broken by title, so the same data always produces the same
 * order and the chart never reshuffles itself between renders.
 */
export function popularCourses(enrolments: readonly AdminEnrolment[], limit = 5): PopularCourse[] {
  const counts = new Map<string, PopularCourse>();
  for (const enrolment of enrolments) {
    const found = counts.get(enrolment.courseId);
    if (found) found.enrolments += 1;
    else counts.set(enrolment.courseId, { courseId: enrolment.courseId, courseTitle: enrolment.courseTitle, enrolments: 1 });
  }

  return [...counts.values()]
    .sort((a, b) => b.enrolments - a.enrolments || a.courseTitle.localeCompare(b.courseTitle))
    .slice(0, Math.max(0, limit));
}

/**
 * A round number at or above the tallest value, so the chart's grid
 * lines land on figures a person would actually say: 5, 10, 20, 50...
 *
 * Never returns 0, because a chart with no height has nothing to draw
 * against.
 */
export function niceAxisMax(highest: number): number {
  const top = Math.max(1, Math.ceil(highest));
  const magnitude = 10 ** Math.floor(Math.log10(top));
  for (const step of [1, 2, 2.5, 5, 10]) {
    const candidate = step * magnitude;
    if (top <= candidate) return candidate;
  }
  return 10 * magnitude;
}

/**
 * Evenly spaced grid values from 0 to the axis maximum, for the chart's
 * horizontal lines.
 *
 * The number of lines is chosen so every one of them lands on a whole
 * number: a scale that reads "0, 3, 5, 8, 10" is a rounding artefact,
 * and a reader would rightly wonder what it means.
 */
export function axisTicks(max: number, preferred = 4): number[] {
  const whole = Number.isInteger(max);
  const count = whole
    ? ([preferred, 5, 3, 2, 1].find((candidate) => max % candidate === 0) ?? 1)
    : preferred;

  const ticks: number[] = [];
  for (let index = 0; index <= count; index += 1) ticks.push((max / count) * index);
  return ticks;
}

/*
 * Student growth (Step 12F.2).
 *
 * Registrations are counted from the accounts' own joining dates, so
 * the figures move the moment the sample accounts do, and nothing has
 * to be kept in step by hand.
 */

/** One month on a growth chart: a count, whatever is being counted. */
export type ReportPoint = {
  key: string;
  label: string;
  fullLabel: string;
  value: number;
};

/** The months in the window, oldest first, each with however many of `dates` fall in it. */
export function monthlyCounts(
  dates: readonly string[],
  options: { months?: number; now?: Date } = {},
): ReportPoint[] {
  const months = Math.max(1, options.months ?? 12);
  const now = options.now ?? new Date();

  const counts = new Map<string, number>();
  for (const date of dates) {
    const when = new Date(date);
    if (Number.isNaN(when.getTime())) continue;
    const key = monthKey(when.getUTCFullYear(), when.getUTCMonth());
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }

  const series: ReportPoint[] = [];
  for (let back = months - 1; back >= 0; back -= 1) {
    const date = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - back, 1));
    const month = date.getUTCMonth();
    const year = date.getUTCFullYear();
    const key = monthKey(year, month);
    series.push({
      key,
      label: MONTH_SHORT[month],
      fullLabel: `${MONTH_LONG[month]} ${year}`,
      value: counts.get(key) ?? 0,
    });
  }
  return series;
}

/**
 * How many of `dates` fall before the first month of the window.
 *
 * This is what the cumulative chart has to start from: a platform that
 * had 40 students before the window did not start at zero, and drawing
 * it as though it did would invent a growth spurt that never happened.
 */
export function countBefore(dates: readonly string[], firstMonthKey: string): number {
  return dates.filter((date) => {
    const when = new Date(date);
    if (Number.isNaN(when.getTime())) return false;
    return monthKey(when.getUTCFullYear(), when.getUTCMonth()) < firstMonthKey;
  }).length;
}

/** A running total across the months, starting from whatever came before the window. */
export function runningTotals(points: readonly ReportPoint[], startingFrom = 0): ReportPoint[] {
  let total = startingFrom;
  return points.map((point) => {
    total += point.value;
    return { ...point, value: total };
  });
}

/**
 * The change from one month to the next, as a percentage.
 *
 * `null` means there is no percentage to give, and the screen must say
 * so rather than print a number:
 *
 *  - from 0 to anything, a rise from nothing has no percentage (dividing
 *    by zero is not "100%", and calling it infinite helps nobody);
 *  - from 0 to 0, nothing changed and there is nothing to divide.
 *
 * Otherwise it is rounded to one decimal place, and negative when the
 * month was quieter than the one before it.
 */
export function growthPercent(current: number, previous: number): number | null {
  if (previous <= 0) return null;
  return Math.round(((current - previous) / previous) * 1000) / 10;
}

/** The growth figures behind the four cards. */
export type StudentGrowth = {
  /** Everybody registered, whenever they joined. */
  total: number;
  thisMonth: number;
  lastMonth: number;
  /** Null where no percentage can honestly be given: see growthPercent. */
  growthPercent: number | null;
  /** New registrations per month, oldest first. */
  registrations: ReportPoint[];
  /** The running total of registered students at the end of each month. */
  cumulative: ReportPoint[];
};

/** Everything the Student Growth section shows, worked out from the joining dates alone. */
export function studentGrowth(
  joinDates: readonly string[],
  options: { months?: number; now?: Date } = {},
): StudentGrowth {
  const months = Math.max(2, options.months ?? 12);
  const registrations = monthlyCounts(joinDates, { months, now: options.now });
  const before = countBefore(joinDates, registrations[0].key);
  const thisMonth = registrations[registrations.length - 1].value;
  const lastMonth = registrations[registrations.length - 2].value;

  return {
    total: joinDates.filter((date) => !Number.isNaN(new Date(date).getTime())).length,
    thisMonth,
    lastMonth,
    growthPercent: growthPercent(thisMonth, lastMonth),
    registrations,
    cumulative: runningTotals(registrations, before),
  };
}

/*
 * Course performance (Step 12F.3).
 *
 * How each course is doing: how many joined, how many finished, and how
 * far the rest have got. Counted from the enrolments themselves, so
 * these figures and the Enrolments screen can never disagree.
 */

/** One course's figures. */
export type CoursePerformance = {
  courseId: string;
  courseTitle: string;
  instructorName: string;
  enrolments: number;
  completed: number;
  /** The mean of every enrolment's progress, 0–100. Null where nobody has enrolled. */
  averageProgress: number | null;
  /** Completed ÷ enrolled, as a percentage. Null where nobody has enrolled. */
  completionRate: number | null;
};

/** A published course, as this report needs it. */
export type ReportCourse = { id: string; title: string; instructorName: string };

/**
 * Completed ÷ total, as a whole percentage.
 *
 * `null` where nobody has enrolled: a course with no students has no
 * completion rate, and calling that 0% would read as failure when in
 * fact nothing has been attempted. Nothing here ever divides by zero.
 */
export function completionRate(completed: number, total: number): number | null {
  if (total <= 0) return null;
  return Math.round((completed / total) * 100);
}

/** The mean progress across these enrolments, 0–100. Null for an empty list. */
export function averageProgress(progresses: readonly number[]): number | null {
  if (progresses.length === 0) return null;
  return Math.round(progresses.reduce((sum, value) => sum + value, 0) / progresses.length);
}

/**
 * Every published course with its enrolment figures, busiest first.
 *
 * Courses nobody has enrolled in are KEPT, with null rates rather than
 * zeroes: "nobody has started this yet" is a different fact from "nobody
 * finishes it", and dropping those courses would hide the quiet ones
 * from the very report meant to find them.
 *
 * A revoked enrolment still counts in the total — it happened, and this
 * is a report about what the courses did, not about who has access now.
 */
export function coursePerformance(
  courses: readonly ReportCourse[],
  enrolments: readonly { courseId: string; status: string; progress: number }[],
): CoursePerformance[] {
  const byCourse = new Map<string, { completed: number; progresses: number[] }>();
  for (const enrolment of enrolments) {
    const found = byCourse.get(enrolment.courseId) ?? { completed: 0, progresses: [] };
    if (enrolment.status === "completed") found.completed += 1;
    found.progresses.push(enrolment.progress);
    byCourse.set(enrolment.courseId, found);
  }

  return courses
    .map((course) => {
      const found = byCourse.get(course.id) ?? { completed: 0, progresses: [] };
      const total = found.progresses.length;
      return {
        courseId: course.id,
        courseTitle: course.title,
        instructorName: course.instructorName,
        enrolments: total,
        completed: found.completed,
        averageProgress: averageProgress(found.progresses),
        completionRate: completionRate(found.completed, total),
      };
    })
    .sort((a, b) => b.enrolments - a.enrolments || a.courseTitle.localeCompare(b.courseTitle));
}

/*
 * Revenue and sales (Step 12F.4).
 *
 * SIMULATED SALES, NEVER PROFIT. These figures are what the sample
 * payments add up to. Nothing here is money GrowPilot has: no fees, no
 * tax, no instructor share and no payment-provider charges have been
 * taken off, because this project knows none of them.
 *
 * ONLY MONEY THAT ARRIVED IS COUNTED. A pending payment has not
 * arrived, and a failed or cancelled one never did, so all three are
 * left out of every total. A refunded payment DID arrive and then went
 * back, so it counts in the gross and is taken off again as a refund —
 * which is exactly what makes the net figure meaningful.
 *
 * MONEY IS NEVER ADDED ACROSS CURRENCIES. Every function here works on
 * one currency's transactions at a time.
 */

/** A payment, as these figures need it. */
export type ReportTransaction = {
  courseId: string;
  courseTitle: string;
  amountMinor: number;
  currency: string;
  status: string;
  createdAt: string;
};

/** Money that arrived: a payment still paid, or one that was paid and later refunded. */
export function isRealisedSale(transaction: Pick<ReportTransaction, "status">): boolean {
  return transaction.status === "paid" || transaction.status === "refunded";
}

/** The sales figures for one currency. */
export type RevenueTotals = {
  currency: string;
  /** Payments that stand: paid, not refunded. */
  successfulSales: number;
  /** Payments that arrived and then went back. */
  refundedSales: number;
  /** Everything that arrived, refunds included. */
  grossMinor: number;
  /** What went back out. */
  refundedMinor: number;
  /** Gross minus refunds. */
  netMinor: number;
};

/** Adds up one currency's transactions. Failed, cancelled and pending payments are left out. */
export function summariseRevenue(transactions: readonly ReportTransaction[], currency: string): RevenueTotals {
  const totals: RevenueTotals = {
    currency,
    successfulSales: 0,
    refundedSales: 0,
    grossMinor: 0,
    refundedMinor: 0,
    netMinor: 0,
  };

  for (const transaction of transactions) {
    if (transaction.currency !== currency || !isRealisedSale(transaction)) continue;
    totals.grossMinor += transaction.amountMinor;
    if (transaction.status === "refunded") {
      totals.refundedSales += 1;
      totals.refundedMinor += transaction.amountMinor;
    } else {
      totals.successfulSales += 1;
    }
  }

  totals.netMinor = totals.grossMinor - totals.refundedMinor;
  return totals;
}

/** Every currency that has a realised sale in it, so each can be reported on its own. */
export function currenciesWithSales(transactions: readonly ReportTransaction[]): string[] {
  const seen = new Set<string>();
  for (const transaction of transactions) if (isRealisedSale(transaction)) seen.add(transaction.currency);
  return [...seen].sort((a, b) => a.localeCompare(b));
}

/**
 * Net sales per month for one currency: what arrived that month, less
 * what was refunded that month.
 *
 * A refund is counted in the month of the payment it undid, because
 * that is the only date this project's sample data has. When refunds
 * carry their own dates, count them in the month they were made
 * instead — the figure would otherwise flatter whichever month the sale
 * happened in.
 */
export function monthlyRevenue(
  transactions: readonly ReportTransaction[],
  currency: string,
  options: { months?: number; now?: Date } = {},
): ReportPoint[] {
  const months = Math.max(1, options.months ?? 12);
  const now = options.now ?? new Date();

  const byMonth = new Map<string, number>();
  for (const transaction of transactions) {
    if (transaction.currency !== currency || !isRealisedSale(transaction)) continue;
    const when = new Date(transaction.createdAt);
    if (Number.isNaN(when.getTime())) continue;
    const key = monthKey(when.getUTCFullYear(), when.getUTCMonth());
    const net = transaction.status === "refunded" ? 0 : transaction.amountMinor;
    byMonth.set(key, (byMonth.get(key) ?? 0) + net);
  }

  const series: ReportPoint[] = [];
  for (let back = months - 1; back >= 0; back -= 1) {
    const date = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - back, 1));
    const month = date.getUTCMonth();
    const year = date.getUTCFullYear();
    const key = monthKey(year, month);
    series.push({
      key,
      label: MONTH_SHORT[month],
      fullLabel: `${MONTH_LONG[month]} ${year}`,
      value: byMonth.get(key) ?? 0,
    });
  }
  return series;
}

/** One course's sales. */
export type CourseRevenue = {
  courseId: string;
  courseTitle: string;
  /** Payments that arrived, refunds included: what was actually bought. */
  purchases: number;
  grossMinor: number;
  refundedMinor: number;
  netMinor: number;
};

/**
 * Sales per course for one currency, biggest net first.
 *
 * Only courses with a realised sale appear: a course nobody bought has
 * no sales figures to report, and a row of zeroes would just be noise
 * in a revenue table.
 */
export function revenueByCourse(transactions: readonly ReportTransaction[], currency: string): CourseRevenue[] {
  const byCourse = new Map<string, CourseRevenue>();

  for (const transaction of transactions) {
    if (transaction.currency !== currency || !isRealisedSale(transaction)) continue;
    const row = byCourse.get(transaction.courseId) ?? {
      courseId: transaction.courseId,
      courseTitle: transaction.courseTitle,
      purchases: 0,
      grossMinor: 0,
      refundedMinor: 0,
      netMinor: 0,
    };
    row.purchases += 1;
    row.grossMinor += transaction.amountMinor;
    if (transaction.status === "refunded") row.refundedMinor += transaction.amountMinor;
    row.netMinor = row.grossMinor - row.refundedMinor;
    byCourse.set(transaction.courseId, row);
  }

  return [...byCourse.values()].sort((a, b) => b.netMinor - a.netMinor || a.courseTitle.localeCompare(b.courseTitle));
}
