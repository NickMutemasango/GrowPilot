import { Coins } from "lucide-react";
import { formatCertificateDate } from "@/lib/certificates/format";
import { formatMoney } from "@/lib/payments/money";
import type { EarningRow } from "@/types/rewards";
import { CommissionStatusBadge } from "./StatusBadge";

/** "My Earnings": a table on larger screens, simple cards on phones. Never shows who bought. */
export function EarningsTable({ rows }: { rows: EarningRow[] }) {
  return (
    <section aria-labelledby="earnings-heading">
      <h2 id="earnings-heading" className="text-2xl font-bold tracking-tight text-ink">
        My Earnings
      </h2>

      {rows.length === 0 ? (
        <div className="mt-4 flex flex-col items-center rounded-3xl border-2 border-dashed border-line bg-surface px-6 py-10 text-center">
          <span className="flex size-12 items-center justify-center rounded-full bg-secondary text-primary">
            <Coins aria-hidden="true" className="size-7" />
          </span>
          <p className="mt-4 text-xl font-bold text-ink">No sales yet</p>
          <p className="mt-1 text-lg text-ink-muted">When someone buys a course through your link, it will appear here.</p>
        </div>
      ) : (
        <>
          <table className="mt-4 hidden w-full overflow-hidden rounded-2xl border border-line bg-surface text-left md:table">
            <thead className="bg-secondary/60 text-base text-ink">
              <tr>
                <th scope="col" className="px-5 py-3 font-semibold">Course sold</th>
                <th scope="col" className="px-5 py-3 font-semibold">Sale date</th>
                <th scope="col" className="px-5 py-3 text-right font-semibold">Sale amount</th>
                <th scope="col" className="px-5 py-3 text-right font-semibold">Your commission</th>
                <th scope="col" className="px-5 py-3 font-semibold">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line text-base">
              {rows.map((row) => (
                <tr key={row.id}>
                  <td className="px-5 py-4 font-semibold text-ink">{row.courseTitle}</td>
                  <td className="px-5 py-4 text-ink">{formatCertificateDate(row.saleAt)}</td>
                  <td className="px-5 py-4 text-right text-ink">{formatMoney(row.baseAmountMinor, row.currency)}</td>
                  <td className={`px-5 py-4 text-right font-bold ${row.status === "reversed" ? "text-ink-muted line-through" : "text-ink"}`}>
                    {formatMoney(row.amountMinor, row.currency)}
                  </td>
                  <td className="px-5 py-4">
                    <CommissionStatusBadge status={row.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <ul className="mt-4 flex flex-col gap-3 md:hidden">
            {rows.map((row) => (
              <li key={row.id} className="rounded-2xl border border-line bg-surface p-5">
                <div className="flex items-start justify-between gap-3">
                  <p className="text-lg font-bold text-ink">{row.courseTitle}</p>
                  <CommissionStatusBadge status={row.status} />
                </div>
                <dl className="mt-3 grid grid-cols-2 gap-y-2 text-base">
                  <dt className="text-ink-muted">Sale date</dt>
                  <dd className="text-right text-ink">{formatCertificateDate(row.saleAt)}</dd>
                  <dt className="text-ink-muted">Sale amount</dt>
                  <dd className="text-right text-ink">{formatMoney(row.baseAmountMinor, row.currency)}</dd>
                  <dt className="text-ink-muted">Your commission</dt>
                  <dd className={`text-right font-bold ${row.status === "reversed" ? "text-ink-muted line-through" : "text-ink"}`}>
                    {formatMoney(row.amountMinor, row.currency)}
                  </dd>
                </dl>
              </li>
            ))}
          </ul>
          <p className="mt-3 text-base text-ink-muted">
            &ldquo;Reversed&rdquo; means the sale was refunded, so no commission is due.
          </p>
        </>
      )}
    </section>
  );
}
