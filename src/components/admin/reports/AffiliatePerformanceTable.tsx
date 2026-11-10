import { SearchX } from "lucide-react";
import type { AffiliatePerformance } from "@/lib/admin/affiliate-reports";
import { formatMoney } from "@/lib/payments/money";
import type { AffiliateStatus } from "@/types/rewards";
import { AdminEmptyState } from "../AdminEmptyState";
import { AffiliateStatusBadge } from "../affiliates/badges";

type AffiliatePerformanceTableProps = {
  affiliates: AffiliatePerformance[];
  /** Each affiliate's account status, looked up by id so this table never restates it. */
  statusById: Record<string, AffiliateStatus>;
  currency: string;
};

/**
 * Affiliate performance: a table on wide screens, cards on narrow ones.
 *
 * The commission is what has been EARNED under the programme's rule.
 * No payout mechanism exists in this project, so none of it has been
 * paid.
 */
export function AffiliatePerformanceTable({ affiliates, statusById, currency }: AffiliatePerformanceTableProps) {
  if (affiliates.length === 0) {
    return (
      <AdminEmptyState icon={SearchX} title="No affiliate sales in this period">
        Try widening the dates, or clear them to see the whole period.
      </AdminEmptyState>
    );
  }

  return (
    <>
      {/*
        Five columns, two of them money, only read well on a genuinely
        wide screen, so the table waits for one (xl). Below that the same
        affiliates are shown as cards, so nothing is squeezed into a
        column too narrow for it and the page never scrolls sideways.
      */}
      <div className="hidden overflow-x-auto rounded-2xl border border-line bg-surface xl:block">
        <table className="w-full min-w-[56rem] text-left text-base">
          <caption className="sr-only">
            Affiliate performance in {currency}: courses sold, sales that stand, commission earned and account
            status, best first.
          </caption>
          <thead className="bg-secondary/60 text-ink">
            <tr>
              <th scope="col" className="px-5 py-4 font-semibold">Affiliate Name</th>
              <th scope="col" className="px-5 py-4 text-right font-semibold whitespace-nowrap">Courses Sold</th>
              <th scope="col" className="px-5 py-4 text-right font-semibold whitespace-nowrap">Total Sales</th>
              <th scope="col" className="px-5 py-4 text-right font-semibold whitespace-nowrap">Commission Earned</th>
              <th scope="col" className="px-5 py-4 font-semibold whitespace-nowrap">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {affiliates.map((affiliate) => (
              <tr key={affiliate.affiliateId} className="align-middle hover:bg-canvas">
                <th scope="row" className="px-5 py-5 font-semibold text-ink">
                  {affiliate.affiliateName}
                  <span className="mt-0.5 block font-mono text-sm font-semibold text-ink-muted">
                    {affiliate.referralCode}
                  </span>
                </th>
                <td className="px-5 py-5 text-right text-ink tabular-nums">{affiliate.coursesSold}</td>
                <td className="px-5 py-5 text-right text-ink tabular-nums">
                  {affiliate.sales}
                  <span className="block text-sm text-ink-muted">
                    {formatMoney(affiliate.revenueMinor, currency)}
                  </span>
                </td>
                <td className="px-5 py-5 text-right font-semibold text-ink tabular-nums">
                  {formatMoney(affiliate.commissionMinor, currency)}
                </td>
                <td className="px-5 py-5">
                  <AffiliateStatusBadge status={statusById[affiliate.affiliateId] ?? "approved"} />
                  {affiliate.reversedSales > 0 && (
                    <span className="mt-1 block text-sm text-ink-muted">
                      {affiliate.reversedSales} reversed {affiliate.reversedSales === 1 ? "sale" : "sales"}
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <ul className="grid gap-4 md:grid-cols-2 xl:hidden">
        {affiliates.map((affiliate) => (
          <li key={affiliate.affiliateId} className="flex flex-col rounded-2xl border border-line bg-surface p-5">
            <div className="flex flex-wrap items-start justify-between gap-x-4 gap-y-2">
              <div>
                <p className="text-lg font-bold text-ink">{affiliate.affiliateName}</p>
                <p className="font-mono text-sm font-semibold text-ink-muted">{affiliate.referralCode}</p>
              </div>
              <AffiliateStatusBadge status={statusById[affiliate.affiliateId] ?? "approved"} />
            </div>

            <div className="mt-4 flex flex-wrap gap-x-8 gap-y-3">
              <div>
                <p className="text-sm text-ink-muted">Courses sold</p>
                <p className="text-2xl font-bold tracking-tight text-ink tabular-nums">{affiliate.coursesSold}</p>
              </div>
              <div>
                <p className="text-sm text-ink-muted">Total sales</p>
                <p className="text-2xl font-bold tracking-tight text-ink tabular-nums">{affiliate.sales}</p>
                <p className="text-sm text-ink-muted">{formatMoney(affiliate.revenueMinor, currency)}</p>
              </div>
              <div>
                <p className="text-sm text-ink-muted">Commission earned</p>
                <p className="text-2xl font-bold tracking-tight text-ink tabular-nums">
                  {formatMoney(affiliate.commissionMinor, currency)}
                </p>
              </div>
            </div>

            {affiliate.reversedSales > 0 && (
              <p className="mt-4 text-sm text-ink-muted">
                {affiliate.reversedSales} reversed {affiliate.reversedSales === 1 ? "sale" : "sales"} earned nothing
                and {affiliate.reversedSales === 1 ? "is" : "are"} left out of these figures.
              </p>
            )}
          </li>
        ))}
      </ul>
    </>
  );
}
