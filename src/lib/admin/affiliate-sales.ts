import type {
  AdminAffiliateSale,
  AffiliateSaleFilters,
  AffiliateSalesTotals,
} from "@/types/admin-affiliates";
import type { Currency } from "@/types/payments";
import type { CommissionStatus } from "@/types/rewards";

/*
 * Affiliate sales and commissions for the admin area (Step 12E.5).
 * Pure functions only, so the same rules run on the server, in the
 * development preview and in the tests (affiliate-sales.test.ts).
 *
 * VIEWING ONLY. Nothing here approves a commission, reverses one, marks
 * one as paid or pays anybody: no payout mechanism exists in this
 * project. The figures are what has been EARNED under the rule, never
 * what has been paid out.
 *
 * Only type imports here, so the same file runs under `node --test`
 * without a bundler.
 *
 * The one rule that matters most: a REVERSED commission is a refunded or
 * failed sale. It earns nothing, it is not a successful sale, and it is
 * left out of every eligible total. It is still shown, because hiding a
 * reversal would make the list look better than the truth.
 */

export const commissionStatusLabels: Record<CommissionStatus, string> = {
  pending: "Pending",
  approved: "Approved",
  paid: "Paid",
  reversed: "Reversed",
};

/**
 * Whether this sale still earns its commission.
 *
 * Pending, approved and paid all do — a pending commission is earned but
 * not yet out of the refund window. Only a reversal takes the money back
 * off the table.
 */
export function isEligible(sale: AdminAffiliateSale): boolean {
  return sale.status !== "reversed";
}

/** Search by affiliate name, plus the commission status drop-down. They apply together. */
export function filterAffiliateSales(
  sales: readonly AdminAffiliateSale[],
  filters: AffiliateSaleFilters,
): AdminAffiliateSale[] {
  const query = filters.query.trim().toLocaleLowerCase();
  return sales.filter((sale) => {
    if (query && !sale.affiliateName.toLocaleLowerCase().includes(query)) return false;
    if (filters.status !== "all" && sale.status !== filters.status) return false;
    return true;
  });
}

/**
 * The four figures above the sales table, worked out from the same rows
 * the table shows, so the two can never disagree.
 *
 * Reversed sales are counted and totalled separately and are never added
 * into the eligible figures.
 */
export function summariseAffiliateSales(sales: readonly AdminAffiliateSale[]): AffiliateSalesTotals {
  // Taken from the rows themselves: a total can only ever be in the
  // currency of the sales it adds up. Every sale in this project is in
  // the one checkout currency (see src/lib/payments/money.ts).
  const currency: Currency = sales[0]?.currency ?? "USD";
  const totals: AffiliateSalesTotals = {
    totalSales: 0,
    totalCommissionMinor: 0,
    pendingCommissionMinor: 0,
    approvedCommissionMinor: 0,
    reversedCommissionMinor: 0,
    reversedSales: 0,
    currency,
  };

  for (const sale of sales) {
    if (!isEligible(sale)) {
      totals.reversedSales += 1;
      totals.reversedCommissionMinor += sale.commissionMinor;
      continue;
    }
    totals.totalSales += 1;
    totals.totalCommissionMinor += sale.commissionMinor;
    if (sale.status === "pending") totals.pendingCommissionMinor += sale.commissionMinor;
    if (sale.status === "approved") totals.approvedCommissionMinor += sale.commissionMinor;
  }

  return totals;
}

/** The value of the eligible sales themselves, as opposed to the commission on them. */
export function eligibleSalesValueMinor(sales: readonly AdminAffiliateSale[]): number {
  return sales.reduce((total, sale) => (isEligible(sale) ? total + sale.saleAmountMinor : total), 0);
}

/** Newest sales first, so the most recent activity is at the top. */
export function byNewestSale(a: AdminAffiliateSale, b: AdminAffiliateSale): number {
  return b.saleAt.localeCompare(a.saleAt);
}
