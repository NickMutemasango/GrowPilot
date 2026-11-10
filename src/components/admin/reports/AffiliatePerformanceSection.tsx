"use client";

import { useMemo } from "react";
import { BadgePercent, Handshake, Info, Receipt, Wallet } from "lucide-react";
import {
  affiliateCurrencies,
  affiliatePerformance,
  filterSalesByRange,
  isBackwardsRange,
  monthlyAffiliateRevenue,
  summariseAffiliateSales,
  topAffiliates,
  type AffiliateSaleLike,
} from "@/lib/admin/affiliate-reports";
import { formatMoney } from "@/lib/payments/money";
import type { AffiliateStatus } from "@/types/rewards";
import { AdminEmptyState } from "../AdminEmptyState";
import { AdminStatsCard } from "../AdminStatsCard";
import { AffiliateDateRangeBar } from "./AffiliateDateRangeBar";
import { useReportFilters } from "./ReportFiltersContext";
import { AffiliatePerformanceTable } from "./AffiliatePerformanceTable";
import { TopAffiliatesBarChart } from "./TopAffiliatesBarChart";
import { TrendLineChart } from "./TrendLineChart";

type AffiliatePerformanceSectionProps = {
  /** Every sale made through an affiliate link, in the whole period. */
  sales: AffiliateSaleLike[];
  /** Each affiliate's account status, so the table never restates it. */
  statusById: Record<string, AffiliateStatus>;
  /** Affiliates whose account is approved: the ones who can be earning. */
  activeAffiliates: number;
  /** The commission rate as a percentage, for the heading: "60%". */
  rateLabel: string;
  months: number;
};

/**
 * "Affiliate Performance Analytics": what the affiliate programme has
 * sold, and what it has earned the people promoting it.
 *
 * EARNINGS, NEVER PAYMENTS. A commission here is what an affiliate has
 * earned under the programme's rule; no payout mechanism exists in
 * this project, so none of it has been paid.
 *
 * A REVERSED SALE EARNS NOTHING. Refunded, cancelled and failed sales
 * are left out of every revenue and commission figure, and counted
 * separately instead — hiding them would make the programme look
 * better than it is.
 *
 * The dates filter the sales, and every figure on the screen is worked
 * out from the sales that remain, so the cards, the charts and the
 * table always agree with each other and with the filter.
 */
export function AffiliatePerformanceSection({
  sales,
  statusById,
  activeAffiliates,
  rateLabel,
  months,
}: AffiliatePerformanceSectionProps) {
  // Held in the shared context, not here, so the Export panel can take a copy
  // of exactly what this section is showing.
  const { affiliateRange: range, setAffiliateRange: setRange } = useReportFilters();
  const backwards = isBackwardsRange(range);

  const shown = useMemo(() => (backwards ? [] : filterSalesByRange(sales, range)), [sales, range, backwards]);
  const currencies = useMemo(() => affiliateCurrencies(shown), [shown]);

  const filtered = Boolean(range.from || range.to);
  const summary = `${shown.length} ${shown.length === 1 ? "sale" : "sales"} ${filtered ? "in this period" : "in the whole period"}.`;

  return (
    <section aria-labelledby="affiliate-performance-heading" className="flex flex-col gap-4">
      <div>
        <h2 id="affiliate-performance-heading" className="text-2xl font-bold tracking-tight text-ink">
          Affiliate Performance Analytics
        </h2>
        <p className="mt-1 text-base text-ink-muted">
          What the affiliate programme has sold, and the {rateLabel} commission it has earned the people promoting
          GrowPilot.
        </p>
        {/*
          The icon and the whole sentence are the only two flex items: an
          inline element among loose text would become a flex item of its
          own and break the sentence into pieces.
        */}
        <p className="mt-3 flex items-start gap-2 text-base text-ink">
          <Info aria-hidden="true" className="mt-0.5 size-5 shrink-0 text-[#6b4e00]" />
          <span>
            Simulated sales, and <span className="font-semibold">earnings rather than payments</span>: no payout
            mechanism is connected to GrowPilot, so nothing here has been paid. Reversed sales — refunded,
            cancelled or failed — earn nothing and are left out of every figure below. Each currency is reported on
            its own and never added to another.
          </span>
        </p>
      </div>

      <AffiliateDateRangeBar
        range={range}
        onChange={setRange}
        summary={summary}
        warning={backwards ? "The From date is after the To date, so nothing can match. Swap them or clear them." : null}
      />

      {currencies.length === 0 ? (
        <AdminEmptyState icon={Receipt} title="No affiliate sales in this period">
          {backwards
            ? "Put the dates the right way round, or clear them to see the whole period."
            : "Try widening the dates, or clear them to see the whole period."}
        </AdminEmptyState>
      ) : (
        currencies.map((currency) => (
          <CurrencyBlock
            key={currency}
            currency={currency}
            sales={shown}
            statusById={statusById}
            activeAffiliates={activeAffiliates}
            rateLabel={rateLabel}
            months={months}
          />
        ))
      )}
    </section>
  );
}

function CurrencyBlock({
  currency,
  sales,
  statusById,
  activeAffiliates,
  rateLabel,
  months,
}: {
  currency: string;
  sales: AffiliateSaleLike[];
  statusById: Record<string, AffiliateStatus>;
  activeAffiliates: number;
  rateLabel: string;
  months: number;
}) {
  const totals = useMemo(() => summariseAffiliateSales(sales, currency), [sales, currency]);
  const rows = useMemo(() => affiliatePerformance(sales, currency), [sales, currency]);
  const top = useMemo(() => topAffiliates(rows, 5), [rows]);
  const monthly = useMemo(() => monthlyAffiliateRevenue(sales, currency, { months }), [sales, currency, months]);
  const money = (amountMinor: number) => formatMoney(amountMinor, currency);

  return (
    <div className="flex flex-col gap-4">
      {/* Four cards, so two across and then four: none is ever left alone on a row. */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <AdminStatsCard
          icon={Handshake}
          title="Total Active Affiliates"
          description="Approved accounts, able to earn."
          value={activeAffiliates}
          source="live"
        />
        <AdminStatsCard
          icon={Receipt}
          title="Total Affiliate-Generated Sales"
          description={
            totals.reversedSales === 0
              ? "Sales made through an affiliate link."
              : `${totals.reversedSales} reversed ${totals.reversedSales === 1 ? "sale is" : "sales are"} left out.`
          }
          value={totals.sales}
          source="live"
        />
        <AdminStatsCard
          icon={Wallet}
          title="Total Affiliate Revenue"
          description={`What those sales were worth, in ${currency}.`}
          value={totals.revenueMinor}
          valueLabel={money(totals.revenueMinor)}
          source="live"
        />
        <AdminStatsCard
          icon={BadgePercent}
          title={`Total Commissions Earned (${rateLabel})`}
          description="Earned under the programme's rule. Nothing has been paid."
          value={totals.commissionMinor}
          valueLabel={money(totals.commissionMinor)}
          source="live"
        />
      </div>

      {totals.reversedSales > 0 && (
        <p className="text-base text-ink-muted">
          {totals.reversedSales} reversed {totals.reversedSales === 1 ? "sale was" : "sales were"} refunded,
          cancelled or failed, worth {money(totals.reversedRevenueMinor)}. None of it counts towards the figures
          above.
        </p>
      )}

      <div className="grid gap-6 2xl:grid-cols-2">
        <div className="flex min-w-0 flex-col gap-4 rounded-2xl border border-line bg-surface p-5 sm:p-6">
          <div>
            <h3 className="text-xl font-bold tracking-tight text-ink">Top 5 Performing Affiliates</h3>
            <p className="mt-1 text-base text-ink-muted">
              By sales that still stand, with what each has earned beside it.
            </p>
          </div>
          {top.length === 0 ? (
            <p className="text-base text-ink-muted">No affiliate has a sale that stands in this period.</p>
          ) : (
            <TopAffiliatesBarChart affiliates={top} currency={currency} />
          )}
        </div>

        <div className="flex min-w-0 flex-col gap-4 rounded-2xl border border-line bg-surface p-5 sm:p-6">
          <div>
            <h3 className="text-xl font-bold tracking-tight text-ink">Affiliate Revenue by Month ({currency})</h3>
            <p className="mt-1 text-base text-ink-muted">
              What affiliate links sold in each of the last {months} months, within the dates chosen above.
            </p>
          </div>
          <TrendLineChart
            points={monthly}
            legend={`Affiliate sales per month (${currency})`}
            unit={{ one: "sale", many: "sales" }}
            summary={`${money(totals.revenueMinor)} sold in this period`}
            valueHeading={`Sales value (${currency})`}
            description={`Line chart of affiliate revenue per month in ${currency}.`}
            formatValue={(value) => money(value)}
          />
        </div>
      </div>

      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h3 className="text-xl font-bold tracking-tight text-ink">All Affiliates ({currency})</h3>
        <p className="text-base text-ink-muted" aria-live="polite">
          {rows.length} {rows.length === 1 ? "affiliate" : "affiliates"} with sales in this period
        </p>
      </div>
      <AffiliatePerformanceTable affiliates={rows} statusById={statusById} currency={currency} />
    </div>
  );
}
