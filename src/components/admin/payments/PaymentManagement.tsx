"use client";

import { useCallback, useMemo, useState } from "react";
import { CircleCheck, CircleX, Clock, Info, Receipt, RotateCcw } from "lucide-react";
import { byNewestTransaction, filterTransactions, summarisePayments, totalsByCurrency } from "@/lib/admin/payments";
import { newRefund, pruneRefunds, withRefunds } from "@/lib/admin/refunds";
import { formatMoney } from "@/lib/payments/money";
import {
  NO_TRANSACTION_FILTERS,
  type AdminTransaction,
  type RefundsById,
  type TransactionFilters,
} from "@/types/admin-payments";
import { AdminStatsCard } from "../AdminStatsCard";
import { DemoToast } from "../DemoToast";
import { RefundTransactionDialog } from "./RefundTransactionDialog";
import { TransactionDetailsDialog } from "./TransactionDetailsDialog";
import { TransactionFiltersBar } from "./TransactionFiltersBar";
import { TransactionsTable } from "./TransactionsTable";

type PaymentManagementProps = {
  /**
   * The transactions to show. Today these are always the preview's sample
   * records, searched and filtered in this page; when a payment store
   * exists, searching and paging move to the server.
   */
  transactions: AdminTransaction[];
};

/**
 * "Payment Management": view and monitor course payment transactions.
 *
 * Read-only, and a demonstration throughout. No payment provider is
 * connected to this project: nothing here takes a payment, issues a
 * refund or changes a status, and no card or provider detail is held.
 * "View Details" opens a panel on one transaction, whose single action is
 * to mark a successful payment as refunded (Step 12D.7). That records the
 * refund against the record and nothing more: no money moves, nothing is
 * deleted, and no second transaction is created.
 */
export function PaymentManagement({ transactions }: PaymentManagementProps) {
  const [filters, setFilters] = useState<TransactionFilters>(NO_TRANSACTION_FILTERS);
  const [detailsId, setDetailsId] = useState<string | null>(null);
  const [refundId, setRefundId] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  // Refunds recorded on this screen, kept against transaction ids so a sample
  // record can be marked without the sample data being rewritten.
  const [refunds, setRefunds] = useState<RefundsById>({});

  const withDemoRefunds = useMemo(
    () => (Object.keys(refunds).length ? withRefunds(transactions, refunds) : transactions),
    [transactions, refunds],
  );
  const sorted = useMemo(() => [...withDemoRefunds].sort(byNewestTransaction), [withDemoRefunds]);
  // Both the figures and the list come from the same records, so they can never disagree.
  const summary = summarisePayments(sorted);
  const totals = totalsByCurrency(sorted);
  const shown = useMemo(() => filterTransactions(sorted, filters), [sorted, filters]);
  const unfiltered = filters.query.trim() === "" && filters.status === "all";
  // Found by id in the full list, so the panel always shows the transaction that was picked.
  const details = sorted.find((transaction) => transaction.id === detailsId) ?? null;
  const refunding = sorted.find((transaction) => transaction.id === refundId) ?? null;

  const dismissToast = useCallback(() => setToast(null), []);

  /**
   * Confirm Refund: record the refund against the transaction.
   *
   * The original record is never deleted and no second transaction is
   * created; the reference, amount, date, student and course all stay as
   * they were. Enrolments, course access and affiliate commissions are
   * not touched — they are separate records with their own steps.
   */
  const refund = (reason: string) => {
    if (!refunding) return;
    const next = pruneRefunds({ ...refunds, [refunding.id]: newRefund(refunding, reason) }, sorted);
    setRefunds(next);
    setRefundId(null);
    setToast("Transaction marked as refunded successfully (Demo).");
  };

  return (
    <div className="flex flex-col gap-8">
      <header>
        <h1 className="text-3xl font-bold tracking-tight text-ink sm:text-4xl">Payment Management</h1>
        <p className="mt-2 text-lg text-ink-muted">
          View and monitor course payment transactions across GrowPilot Academy.
        </p>
        <p className="mt-3 flex items-start gap-2 text-base text-ink">
          <Info aria-hidden="true" className="mt-0.5 size-5 shrink-0 text-[#6b4e00]" />
          Demonstration transactions. No payment provider is connected, nobody was charged and no money has moved. The
          people are made up; the courses and prices come from the real catalogue. Marking a payment refunded here
          records it on this screen only — no money is returned.
        </p>
      </header>

      <section aria-label="Payment totals" className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        <h2 className="sr-only">Payment totals</h2>
        <AdminStatsCard
          icon={Receipt}
          title="Total Transactions"
          description="Every payment attempt recorded."
          value={summary.total}
          source="live"
        />
        <AdminStatsCard
          icon={CircleCheck}
          title="Successful Payments"
          description={
            totals.length === 1
              ? `${formatMoney(totals[0].amountMinor, totals[0].currency)} taken in total.`
              : "Payments that went through."
          }
          value={summary.successful}
          source="live"
        />
        <AdminStatsCard
          icon={Clock}
          title="Pending Payments"
          description="Started, not yet confirmed."
          value={summary.pending}
          source="live"
        />
        <AdminStatsCard
          icon={CircleX}
          title="Failed Payments"
          description="The payment did not go through."
          value={summary.failed}
          source="live"
        />
        <AdminStatsCard
          icon={RotateCcw}
          title="Refunded Payments"
          description="Paid, then given back."
          value={summary.refunded}
          source="live"
        />
      </section>

      {/* Amounts are only ever added up within one currency: see totalsByCurrency. */}
      {totals.length > 1 && (
        <p className="text-base text-ink">
          Successful payments by currency:{" "}
          {totals.map((total) => formatMoney(total.amountMinor, total.currency)).join(" · ")}
        </p>
      )}

      <section aria-labelledby="all-transactions-heading" className="flex flex-col gap-4">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h2 id="all-transactions-heading" className="text-2xl font-bold tracking-tight text-ink">
            All Transactions
          </h2>
          <p className="text-base text-ink-muted" aria-live="polite">
            {shown.length} {shown.length === 1 ? "transaction" : "transactions"} found
          </p>
        </div>
        <TransactionFiltersBar filters={filters} onChange={setFilters} />
        <TransactionsTable
          transactions={shown}
          unfiltered={unfiltered}
          onView={(transaction) => setDetailsId(transaction.id)}
        />
      </section>

      <TransactionDetailsDialog
        transaction={details}
        onClose={() => setDetailsId(null)}
        onRefund={(transaction) => {
          // The details panel steps aside so the confirmation has the screen to itself.
          setDetailsId(null);
          setRefundId(transaction.id);
        }}
      />
      <RefundTransactionDialog
        transaction={refunding}
        onCancel={() => setRefundId(null)}
        onConfirm={refund}
      />
      <DemoToast message={toast} onDismiss={dismissToast} />
    </div>
  );
}
