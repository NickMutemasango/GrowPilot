import type { ReportPoint } from "@/lib/admin/reports";

/*
 * Affiliate performance for the Reports page (Step 12F.5).
 * Pure functions only, so the same arithmetic runs on the server, in
 * the development preview and in the tests (affiliate-reports.test.ts).
 * Only type imports, so the file runs under `node --test` without a
 * bundler.
 *
 * SIMULATED FIGURES, AND EARNINGS RATHER THAN PAYMENTS. A commission
 * here is what an affiliate has EARNED under the programme's rule; no
 * payout mechanism exists in this project, so none of it has been
 * paid.
 *
 * ONLY SALES THAT STAND ARE COUNTED. A reversed commission is a sale
 * that was refunded, cancelled or failed: the money went back, so it
 * earns nothing and is left out of every revenue and commission
 * figure. It is still counted separately, because a programme whose
 * sales keep reversing is exactly what a report should show.
 *
 * MONEY IS NEVER ADDED ACROSS CURRENCIES. Every function works on one
 * currency's sales at a time.
 */

/** An affiliate sale, as these figures need it. */
export type AffiliateSaleLike = {
  affiliateId: string;
  affiliateName: string;
  referralCode: string;
  courseId: string;
  saleAmountMinor: number;
  commissionMinor: number;
  currency: string;
  /** The commission's status: pending, approved, paid — or reversed, which earns nothing. */
  status: string;
  saleAt: string;
};

/** A date range, either end of which may be left open. Both are "YYYY-MM-DD". */
export type DateRange = { from: string; to: string };

export const WHOLE_PERIOD: DateRange = { from: "", to: "" };

/** A sale still earns unless it was reversed — refunded, cancelled or failed. */
export function earnsCommission(sale: Pick<AffiliateSaleLike, "status">): boolean {
  return sale.status !== "reversed";
}

/**
 * Whether this moment falls inside the range.
 *
 * Both ends are inclusive and read as whole days, so "to" includes
 * everything that happened on that date rather than stopping at
 * midnight — which is what somebody picking a date in a filter means.
 * An unreadable date is never inside a range.
 */
export function isWithinRange(when: string, range: DateRange): boolean {
  const date = new Date(when);
  if (Number.isNaN(date.getTime())) return false;
  const day = date.toISOString().slice(0, 10);
  if (range.from && day < range.from) return false;
  if (range.to && day > range.to) return false;
  return true;
}

/** The sales inside the range. An empty range means the whole period. */
export function filterSalesByRange<T extends { saleAt: string }>(sales: readonly T[], range: DateRange): T[] {
  if (!range.from && !range.to) return [...sales];
  return sales.filter((sale) => isWithinRange(sale.saleAt, range));
}

/** True when the two ends are the wrong way round, so the screen can say so instead of showing nothing. */
export function isBackwardsRange(range: DateRange): boolean {
  return Boolean(range.from && range.to && range.from > range.to);
}

/** The affiliate programme's figures for one currency. */
export type AffiliateTotals = {
  currency: string;
  /** Sales that still stand. */
  sales: number;
  /** What those sales were worth. */
  revenueMinor: number;
  /** What they earned the affiliates, at the programme's rate. */
  commissionMinor: number;
  /** Sales that were refunded, cancelled or failed, and earn nothing. */
  reversedSales: number;
  reversedRevenueMinor: number;
};

/** Adds up one currency's affiliate sales. Reversed sales are kept apart, never added in. */
export function summariseAffiliateSales(sales: readonly AffiliateSaleLike[], currency: string): AffiliateTotals {
  const totals: AffiliateTotals = {
    currency,
    sales: 0,
    revenueMinor: 0,
    commissionMinor: 0,
    reversedSales: 0,
    reversedRevenueMinor: 0,
  };

  for (const sale of sales) {
    if (sale.currency !== currency) continue;
    if (earnsCommission(sale)) {
      totals.sales += 1;
      totals.revenueMinor += sale.saleAmountMinor;
      totals.commissionMinor += sale.commissionMinor;
    } else {
      totals.reversedSales += 1;
      totals.reversedRevenueMinor += sale.saleAmountMinor;
    }
  }

  return totals;
}

/** Every currency these sales are in, so each can be reported on its own. */
export function affiliateCurrencies(sales: readonly AffiliateSaleLike[]): string[] {
  return [...new Set(sales.map((sale) => sale.currency))].sort((a, b) => a.localeCompare(b));
}

/** One affiliate's figures. */
export type AffiliatePerformance = {
  affiliateId: string;
  affiliateName: string;
  referralCode: string;
  /** Sales that stand. */
  sales: number;
  /** Distinct courses they have sold at least one of. */
  coursesSold: number;
  revenueMinor: number;
  commissionMinor: number;
  /** Sales that reversed, shown for honesty and counted in nothing else. */
  reversedSales: number;
};

/**
 * Each affiliate's performance in one currency, best first.
 *
 * An affiliate whose only sales reversed still appears, with zeroes and
 * their reversal count: dropping them would hide exactly the pattern
 * this report exists to show. Ties are broken by name, so the same data
 * always produces the same order.
 */
export function affiliatePerformance(
  sales: readonly AffiliateSaleLike[],
  currency: string,
): AffiliatePerformance[] {
  const rows = new Map<string, AffiliatePerformance & { courses: Set<string> }>();

  for (const sale of sales) {
    if (sale.currency !== currency) continue;
    const row = rows.get(sale.affiliateId) ?? {
      affiliateId: sale.affiliateId,
      affiliateName: sale.affiliateName,
      referralCode: sale.referralCode,
      sales: 0,
      coursesSold: 0,
      revenueMinor: 0,
      commissionMinor: 0,
      reversedSales: 0,
      courses: new Set<string>(),
    };

    if (earnsCommission(sale)) {
      row.sales += 1;
      row.revenueMinor += sale.saleAmountMinor;
      row.commissionMinor += sale.commissionMinor;
      row.courses.add(sale.courseId);
    } else {
      row.reversedSales += 1;
    }

    rows.set(sale.affiliateId, row);
  }

  return [...rows.values()]
    .map(({ courses, ...row }) => ({ ...row, coursesSold: courses.size }))
    .sort(
      (a, b) =>
        b.sales - a.sales ||
        b.commissionMinor - a.commissionMinor ||
        a.affiliateName.localeCompare(b.affiliateName),
    );
}

/** The best performers, by sales that stand. Affiliates with none are left off the chart. */
export function topAffiliates(rows: readonly AffiliatePerformance[], limit = 5): AffiliatePerformance[] {
  return rows.filter((row) => row.sales > 0).slice(0, Math.max(0, limit));
}

/**
 * Affiliate revenue per month for one currency, oldest first.
 *
 * Reversed sales add nothing, so a month whose sales all came back
 * reads as the quiet month it really was.
 */
export function monthlyAffiliateRevenue(
  sales: readonly AffiliateSaleLike[],
  currency: string,
  options: { months?: number; now?: Date } = {},
): ReportPoint[] {
  const months = Math.max(1, options.months ?? 12);
  const now = options.now ?? new Date();
  const short = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const long = [
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
  const key = (year: number, month: number) => `${year}-${String(month + 1).padStart(2, "0")}`;

  const byMonth = new Map<string, number>();
  for (const sale of sales) {
    if (sale.currency !== currency || !earnsCommission(sale)) continue;
    const when = new Date(sale.saleAt);
    if (Number.isNaN(when.getTime())) continue;
    const monthKey = key(when.getUTCFullYear(), when.getUTCMonth());
    byMonth.set(monthKey, (byMonth.get(monthKey) ?? 0) + sale.saleAmountMinor);
  }

  const series: ReportPoint[] = [];
  for (let back = months - 1; back >= 0; back -= 1) {
    const date = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - back, 1));
    const month = date.getUTCMonth();
    const year = date.getUTCFullYear();
    series.push({
      key: key(year, month),
      label: short[month],
      fullLabel: `${long[month]} ${year}`,
      value: byMonth.get(key(year, month)) ?? 0,
    });
  }
  return series;
}
