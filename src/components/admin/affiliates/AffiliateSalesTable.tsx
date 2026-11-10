import { Receipt, SearchX } from "lucide-react";
import { formatCertificateDate } from "@/lib/certificates/format";
import { formatMoney } from "@/lib/payments/money";
import type { AdminAffiliateSale } from "@/types/admin-affiliates";
import { AdminEmptyState } from "../AdminEmptyState";
import { CommissionStatusBadge } from "./badges";

type AffiliateSalesTableProps = {
  sales: AdminAffiliateSale[];
  /** True when nothing has been searched or filtered, so an empty list really means "none yet". */
  unfiltered: boolean;
  /** The commission rate as a percentage, for the column heading: "Commission (60%)". */
  rateLabel: string;
};

/** The list of affiliate sales: a table on wide screens, cards on narrow ones. */
export function AffiliateSalesTable({ sales, unfiltered, rateLabel }: AffiliateSalesTableProps) {
  if (sales.length === 0) {
    return unfiltered ? (
      <AdminEmptyState icon={Receipt} title="No affiliate sales yet">
        Sales made through an affiliate&rsquo;s referral link will appear here.
      </AdminEmptyState>
    ) : (
      <AdminEmptyState icon={SearchX} title="No Sales Found">
        Try adjusting your search or filters.
      </AdminEmptyState>
    );
  }

  return (
    <>
      {/*
        Six columns, two of them money, only read well on a genuinely
        wide screen, so the table waits for one (xl). Below that the same
        sales are shown as cards, so nothing is squeezed into a column
        too narrow for it and the page never scrolls sideways.
      */}
      <div className="hidden overflow-x-auto rounded-2xl border border-line bg-surface xl:block">
        <table className="w-full min-w-[60rem] text-left text-base">
          <caption className="sr-only">
            Affiliate sales, newest first. Viewing only: no commission can be approved, reversed or paid here.
          </caption>
          <thead className="bg-secondary/60 text-ink">
            <tr>
              <th scope="col" className="w-44 px-5 py-4 font-semibold">Affiliate Name</th>
              <th scope="col" className="px-5 py-4 font-semibold">Course Sold</th>
              <th scope="col" className="px-5 py-4 text-right font-semibold whitespace-nowrap">Sale Amount</th>
              <th scope="col" className="px-5 py-4 text-right font-semibold whitespace-nowrap">
                Commission ({rateLabel})
              </th>
              <th scope="col" className="px-5 py-4 font-semibold whitespace-nowrap">Sale Date</th>
              <th scope="col" className="px-5 py-4 font-semibold whitespace-nowrap">Commission Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {sales.map((sale) => (
              <tr key={sale.id} className="align-middle hover:bg-canvas">
                <th scope="row" className="px-5 py-5 font-semibold text-ink">
                  {sale.affiliateName}
                  <span className="mt-0.5 block font-mono text-sm font-semibold text-ink-muted">
                    {sale.referralCode}
                  </span>
                </th>
                <td className="px-5 py-5 text-ink">{sale.courseTitle}</td>
                <td className="px-5 py-5 text-right font-semibold whitespace-nowrap text-ink tabular-nums">
                  {formatMoney(sale.saleAmountMinor, sale.currency)}
                </td>
                <td
                  className={`px-5 py-5 text-right font-semibold whitespace-nowrap tabular-nums ${
                    sale.status === "reversed" ? "text-ink-muted line-through" : "text-ink"
                  }`}
                >
                  {formatMoney(sale.commissionMinor, sale.currency)}
                </td>
                <td className="px-5 py-5 whitespace-nowrap text-ink">{formatCertificateDate(sale.saleAt)}</td>
                <td className="px-5 py-5">
                  <CommissionStatusBadge status={sale.status} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <ul className="grid gap-4 md:grid-cols-2 xl:hidden">
        {sales.map((sale) => (
          <li key={sale.id} className="flex flex-col rounded-2xl border border-line bg-surface p-5">
            <div className="flex flex-wrap items-start justify-between gap-x-4 gap-y-2">
              <p className="text-lg font-bold text-ink">{sale.affiliateName}</p>
              <CommissionStatusBadge status={sale.status} />
            </div>
            <p className="mt-0.5 font-mono text-sm font-semibold text-ink-muted">{sale.referralCode}</p>
            <p className="mt-3 text-base text-ink">{sale.courseTitle}</p>

            <div className="mt-4 flex flex-wrap gap-x-8 gap-y-3">
              <div>
                <p className="text-sm text-ink-muted">Sale amount</p>
                <p className="text-2xl font-bold tracking-tight text-ink tabular-nums">
                  {formatMoney(sale.saleAmountMinor, sale.currency)}
                </p>
              </div>
              <div>
                <p className="text-sm text-ink-muted">Commission ({rateLabel})</p>
                <p
                  className={`text-2xl font-bold tracking-tight tabular-nums ${
                    sale.status === "reversed" ? "text-ink-muted line-through" : "text-ink"
                  }`}
                >
                  {formatMoney(sale.commissionMinor, sale.currency)}
                </p>
              </div>
            </div>

            <p className="mt-4 text-base text-ink-muted">Sold {formatCertificateDate(sale.saleAt)}</p>
            {sale.status === "reversed" && (
              <p className="mt-3 rounded-xl bg-[#FDECEA] p-3 text-sm text-ink">
                <span className="font-semibold text-[#9A3412]">Reversed:</span> refunded or failed, so it earns nothing
                and is left out of the totals.
              </p>
            )}
          </li>
        ))}
      </ul>
    </>
  );
}
