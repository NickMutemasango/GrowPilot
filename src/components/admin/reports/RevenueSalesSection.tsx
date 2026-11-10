import { Banknote, Info, Receipt, Undo2, Wallet } from "lucide-react";
import type { CurrencySales } from "@/lib/admin/report-service";
import { formatMoney } from "@/lib/payments/money";
import { AdminEmptyState } from "../AdminEmptyState";
import { AdminStatsCard } from "../AdminStatsCard";
import { RevenueByCourseBarChart } from "./RevenueByCourseBarChart";
import { RevenueByCourseTable } from "./RevenueByCourseTable";
import { TrendLineChart } from "./TrendLineChart";

type RevenueSalesSectionProps = {
  /** One block per currency. Money is never added across them. */
  sales: CurrencySales[];
  months: number;
};

/**
 * "Revenue & Sales Analytics": what the sample payments add up to.
 *
 * SIMULATED SALES, NOT PROFIT. No money has been taken by GrowPilot,
 * and nothing has been deducted: no payment-provider fees, no tax, no
 * instructor share. These are the amounts the sample transactions
 * carry, and nothing more.
 *
 * Only money that arrived is counted: pending payments have not
 * arrived, and failed or cancelled ones never did. A refunded payment
 * arrived and went back, so it is in the gross and taken off again as
 * a refund — which is what makes "net" mean anything.
 *
 * EVERY CURRENCY STANDS ALONE. Each gets its own cards, charts and
 * table, because adding dollars to anything else would need an
 * exchange rate this project does not have.
 */
export function RevenueSalesSection({ sales, months }: RevenueSalesSectionProps) {
  return (
    <section aria-labelledby="revenue-sales-heading" className="flex flex-col gap-4">
      <div>
        <h2 id="revenue-sales-heading" className="text-2xl font-bold tracking-tight text-ink">
          Revenue &amp; Sales Analytics
        </h2>
        <p className="mt-1 text-base text-ink-muted">
          What the sample course payments add up to: what came in, what went back, and what is left.
        </p>
        {/*
          The icon and the whole sentence are the only two flex items: an
          inline element among loose text would become a flex item of its
          own and break the sentence into pieces.
        */}
        <p className="mt-3 flex items-start gap-2 text-base text-ink">
          <Info aria-hidden="true" className="mt-0.5 size-5 shrink-0 text-[#6b4e00]" />
          <span>
            <span className="font-semibold">Simulated sales, not profit.</span> No money has been taken and nothing
            has been deducted — no payment fees, no tax and no instructor share. Pending, failed and cancelled
            payments are left out entirely; a refunded payment counts in the gross and is taken off again as a
            refund. Each currency is reported on its own and never added to another.
          </span>
        </p>
      </div>

      {sales.length === 0 ? (
        <AdminEmptyState icon={Receipt} title="No sales yet">
          Course payments will appear here once there are some. Pending, failed and cancelled payments are never
          counted as sales.
        </AdminEmptyState>
      ) : (
        sales.map((block) => <CurrencyBlock key={block.totals.currency} block={block} months={months} />)
      )}
    </section>
  );
}

function CurrencyBlock({ block, months }: { block: CurrencySales; months: number }) {
  const { totals, monthly, courses } = block;
  const currency = totals.currency;
  const money = (amountMinor: number) => formatMoney(amountMinor, currency);
  const monthlyTotal = monthly.reduce((sum, point) => sum + point.value, 0);

  return (
    <div className="flex flex-col gap-4">
      {/* Four cards, so two across and then four: none is ever left alone on a row. */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <AdminStatsCard
          icon={Receipt}
          title="Total Successful Sales"
          description={`Payments that stand, in ${currency}. Refunded ones are counted separately.`}
          value={totals.successfulSales}
          source="live"
        />
        <AdminStatsCard
          icon={Wallet}
          title="Gross Course Revenue"
          description="Everything that came in, refunds included."
          value={totals.grossMinor}
          valueLabel={money(totals.grossMinor)}
          source="live"
        />
        <AdminStatsCard
          icon={Undo2}
          title="Total Refunded Amount"
          description={
            totals.refundedSales === 0
              ? "Nothing has been refunded."
              : `${totals.refundedSales} refunded ${totals.refundedSales === 1 ? "payment" : "payments"} went back.`
          }
          value={totals.refundedMinor}
          valueLabel={totals.refundedMinor > 0 ? `−${money(totals.refundedMinor)}` : money(0)}
          source="live"
        />
        <AdminStatsCard
          icon={Banknote}
          title="Net Sales After Refunds"
          description={`${money(totals.grossMinor)} less ${money(totals.refundedMinor)} in refunds.`}
          value={totals.netMinor}
          valueLabel={money(totals.netMinor)}
          source="live"
        />
      </div>

      <div className="grid gap-6 2xl:grid-cols-2">
        <div className="flex min-w-0 flex-col gap-4 rounded-2xl border border-line bg-surface p-5 sm:p-6">
          <div>
            <h3 className="text-xl font-bold tracking-tight text-ink">Monthly Revenue ({currency})</h3>
            <p className="mt-1 text-base text-ink-muted">
              Net sales in each of the last {months} months, including the months nothing sold. A refunded payment
              adds nothing to its month.
            </p>
          </div>
          <TrendLineChart
            points={monthly}
            legend={`Net sales per month (${currency})`}
            unit={{ one: "sale", many: "sales" }}
            summary={`${money(monthlyTotal)} in this period`}
            valueHeading={`Net sales (${currency})`}
            description={`Line chart of net sales per month in ${currency}.`}
            formatValue={(value) => money(value)}
          />
        </div>

        <div className="flex min-w-0 flex-col gap-4 rounded-2xl border border-line bg-surface p-5 sm:p-6">
          <div>
            <h3 className="text-xl font-bold tracking-tight text-ink">Revenue by Course ({currency})</h3>
            <p className="mt-1 text-base text-ink-muted">
              What each course sold, after refunds. Only courses somebody bought appear.
            </p>
          </div>
          <RevenueByCourseBarChart courses={courses} currency={currency} />
        </div>
      </div>

      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h3 className="text-xl font-bold tracking-tight text-ink">Sales by Course ({currency})</h3>
        <p className="text-base text-ink-muted">
          {courses.length} {courses.length === 1 ? "course" : "courses"} with sales
        </p>
      </div>
      <RevenueByCourseTable courses={courses} currency={currency} />
    </div>
  );
}
