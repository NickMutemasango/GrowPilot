import type { AffiliatePerformance } from "@/lib/admin/affiliate-reports";
import { formatMoney } from "@/lib/payments/money";

type TopAffiliatesBarChartProps = {
  affiliates: AffiliatePerformance[];
  currency: string;
};

/*
 * The best-performing affiliates, drawn as horizontal bars.
 *
 * The bar is the number of sales that STAND — reversed sales are not
 * performance — and the commission earned is said beside it, because
 * "most sales" and "most earned" are different questions and a reader
 * deserves both.
 */
export function TopAffiliatesBarChart({ affiliates, currency }: TopAffiliatesBarChartProps) {
  const max = Math.max(...affiliates.map((affiliate) => affiliate.sales), 1);

  return (
    <figure className="m-0 flex min-w-0 flex-col gap-3">
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
        <p className="flex items-center gap-2 text-sm font-semibold text-ink">
          <span aria-hidden="true" className="inline-block size-3 rounded-sm bg-primary" />
          Sales that stand
        </p>
        <p className="text-sm text-ink-muted">Scale runs to {max}</p>
      </div>

      <ol className="flex flex-col gap-4">
        {affiliates.map((affiliate) => (
          <li key={affiliate.affiliateId} className="flex flex-col gap-1.5">
            <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
              <p className="text-base font-semibold text-ink">
                {affiliate.affiliateName}{" "}
                <span className="font-mono text-sm font-semibold text-ink-muted">{affiliate.referralCode}</span>
              </p>
              <p className="text-base font-semibold text-ink tabular-nums">
                {affiliate.sales} {affiliate.sales === 1 ? "sale" : "sales"}{" "}
                <span className="font-normal text-ink-muted">
                  · {formatMoney(affiliate.commissionMinor, currency)} earned
                </span>
              </p>
            </div>
            <div
              className="h-3 w-full overflow-hidden rounded-full bg-secondary"
              role="img"
              aria-label={`${affiliate.affiliateName}: ${affiliate.sales} of ${max} sales`}
              title={`${affiliate.affiliateName}: ${affiliate.sales} ${affiliate.sales === 1 ? "sale" : "sales"}, ${formatMoney(affiliate.revenueMinor, currency)} sold, ${formatMoney(affiliate.commissionMinor, currency)} earned`}
            >
              <div
                className="h-full rounded-full bg-primary"
                style={{ width: `${Math.round((affiliate.sales / max) * 100)}%` }}
              />
            </div>
          </li>
        ))}
      </ol>

      <figcaption className="sr-only">
        Bar chart of the affiliates with the most sales that still stand, biggest first, in {currency}. Reversed
        sales are not counted.
      </figcaption>
    </figure>
  );
}
