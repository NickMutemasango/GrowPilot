"use client";

import { useMemo, useState } from "react";
import { BadgePercent, Clock, Info, Receipt, Wallet } from "lucide-react";
import { rewardsPolicy } from "@/config/rewards";
import {
  byNewestSale,
  eligibleSalesValueMinor,
  filterAffiliateSales,
  summariseAffiliateSales,
} from "@/lib/admin/affiliate-sales";
import { formatMoney } from "@/lib/payments/money";
import { NO_SALE_FILTERS, type AdminAffiliateSale, type AffiliateSaleFilters } from "@/types/admin-affiliates";
import { AdminStatsCard } from "../AdminStatsCard";
import { AffiliateSalesFiltersBar } from "./AffiliateSalesFiltersBar";
import { AffiliateSalesTable } from "./AffiliateSalesTable";

type AffiliateSalesSectionProps = {
  /** Every sale made through an affiliate link. Searched and filtered in this page. */
  sales: AdminAffiliateSale[];
};

/**
 * "Affiliate Sales & Commissions": what the affiliate programme has sold
 * and what it has earned the people promoting it.
 *
 * VIEWING ONLY. Nothing here approves a commission, reverses one, marks
 * one as paid or pays anybody — no payout mechanism exists in this
 * project, so every figure is what has been EARNED, never what has been
 * paid out.
 *
 * A reversed commission is a refunded or failed sale. It is shown,
 * because hiding it would make the programme look better than it is, but
 * it earns nothing and is left out of every total above the table.
 */
export function AffiliateSalesSection({ sales }: AffiliateSalesSectionProps) {
  const [filters, setFilters] = useState<AffiliateSaleFilters>(NO_SALE_FILTERS);
  // Read from the policy, so the heading can never quote a rate the figures don't use.
  const rateLabel = `${rewardsPolicy.commissionRateBasisPoints / 100}%`;

  const sorted = useMemo(() => [...sales].sort(byNewestSale), [sales]);
  // The figures come from every sale, not the filtered list: a search is a
  // way of finding one row, not a way of restating the programme's totals.
  const totals = summariseAffiliateSales(sorted);
  const salesValueMinor = eligibleSalesValueMinor(sorted);
  const shown = useMemo(() => filterAffiliateSales(sorted, filters), [sorted, filters]);
  const unfiltered = filters.query.trim() === "" && filters.status === "all";

  return (
    <section aria-labelledby="affiliate-sales-heading" className="flex flex-col gap-4">
      <div>
        <h2 id="affiliate-sales-heading" className="text-2xl font-bold tracking-tight text-ink">
          Affiliate Sales &amp; Commissions
        </h2>
        <p className="mt-1 text-base text-ink-muted">
          Every sale made through an affiliate&rsquo;s referral link, and the {rateLabel} commission it earned.
        </p>
        {/*
          The icon and the whole sentence are the only two flex items: an
          inline <span> among loose text would become a flex item of its
          own and break the sentence into pieces.
        */}
        <p className="mt-3 flex items-start gap-2 text-base text-ink">
          <Info aria-hidden="true" className="mt-0.5 size-5 shrink-0 text-[#6b4e00]" />
          <span>
            Simulated sales. Each commission is {rateLabel} of the course&rsquo;s catalogue price. Refunded and failed
            sales are shown as <span className="font-semibold">Reversed</span> and earn nothing, so they are left out
            of every total below. Nothing has been paid: these are earnings, and no commission can be approved or paid
            from this screen.
          </span>
        </p>
      </div>

      {/* Four cards, so two across and then four: none is ever left alone on a row. */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <AdminStatsCard
          icon={Receipt}
          title="Total Affiliate Sales"
          description={`${formatMoney(salesValueMinor, totals.currency)} of courses sold.`}
          value={totals.totalSales}
          source="live"
        />
        <AdminStatsCard
          icon={BadgePercent}
          title="Total Commissions Earned"
          description={`${rateLabel} of every eligible sale.`}
          value={totals.totalCommissionMinor}
          valueLabel={formatMoney(totals.totalCommissionMinor, totals.currency)}
          source="live"
        />
        <AdminStatsCard
          icon={Clock}
          title="Pending Commissions"
          description={`Inside the ${rewardsPolicy.commissionHoldDays}-day refund window.`}
          value={totals.pendingCommissionMinor}
          valueLabel={formatMoney(totals.pendingCommissionMinor, totals.currency)}
          source="live"
        />
        <AdminStatsCard
          icon={Wallet}
          title="Approved Commissions"
          description="Confirmed as earned, not yet paid."
          value={totals.approvedCommissionMinor}
          valueLabel={formatMoney(totals.approvedCommissionMinor, totals.currency)}
          source="live"
        />
      </div>

      {totals.reversedSales > 0 && (
        <p className="text-base text-ink-muted">
          {totals.reversedSales} reversed{" "}
          {totals.reversedSales === 1 ? "sale was refunded or failed" : "sales were refunded or failed"}, worth{" "}
          {formatMoney(totals.reversedCommissionMinor, totals.currency)} in commission. None of it counts towards the
          figures above.
        </p>
      )}

      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h3 className="text-xl font-bold tracking-tight text-ink">All Affiliate Sales</h3>
        <p className="text-base text-ink-muted" aria-live="polite">
          {shown.length} {shown.length === 1 ? "sale" : "sales"} found
        </p>
      </div>
      <AffiliateSalesFiltersBar filters={filters} onChange={setFilters} />
      <AffiliateSalesTable sales={shown} unfiltered={unfiltered} rateLabel={rateLabel} />
    </section>
  );
}
