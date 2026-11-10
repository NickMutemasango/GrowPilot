"use client";

import { Eye, Receipt, SearchX } from "lucide-react";
import { formatCertificateDate } from "@/lib/certificates/format";
import { formatMoney } from "@/lib/payments/money";
import type { AdminTransaction } from "@/types/admin-payments";
import { AdminEmptyState } from "../AdminEmptyState";
import { PaymentMethodLabel, TransactionStatusBadge } from "./badges";

type TransactionsTableProps = {
  transactions: AdminTransaction[];
  /** True when nothing has been searched or filtered, so an empty list really means "none yet". */
  unfiltered: boolean;
  onView: (transaction: AdminTransaction) => void;
};

/** The list of transactions: a table on wide screens, cards on narrow ones. */
export function TransactionsTable({ transactions, unfiltered, onView }: TransactionsTableProps) {
  if (transactions.length === 0) {
    return unfiltered ? (
      <AdminEmptyState icon={Receipt} title="No payment transactions available yet">
        Course payments will appear here once students start buying courses.
      </AdminEmptyState>
    ) : (
      <AdminEmptyState icon={SearchX} title="No Transactions Found">
        Try adjusting your search or filters.
      </AdminEmptyState>
    );
  }

  return (
    <>
      {/*
        Seven columns only read well on a genuinely wide screen, so the
        table waits for one (2xl). Below that — a tablet, a normal laptop,
        or a wide screen at 125–150% zoom — the same transactions are shown
        as cards, two across where there's room, so nothing is ever
        squeezed into a column too narrow for it.
      */}
      <div className="hidden overflow-x-auto rounded-2xl border border-line bg-surface 2xl:block">
        <table className="w-full min-w-[64rem] text-left text-base">
          <caption className="sr-only">
            Course payment transactions, newest first. Viewing only: nothing on this page can be changed.
          </caption>
          <thead className="bg-secondary/60 text-ink">
            <tr>
              <th scope="col" className="px-5 py-4 font-semibold whitespace-nowrap">Transaction ID</th>
              <th scope="col" className="w-44 px-5 py-4 font-semibold">Student Name</th>
              <th scope="col" className="w-56 px-5 py-4 font-semibold">Course Name</th>
              <th scope="col" className="px-5 py-4 text-right font-semibold">Amount</th>
              <th scope="col" className="px-5 py-4 font-semibold whitespace-nowrap">Payment Method</th>
              <th scope="col" className="px-5 py-4 font-semibold whitespace-nowrap">Payment Status</th>
              <th scope="col" className="px-5 py-4 font-semibold whitespace-nowrap">Transaction Date</th>
              <th scope="col" className="px-5 py-4 font-semibold"><span className="sr-only">Actions</span></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {transactions.map((transaction) => (
              <tr key={transaction.id} className="align-middle hover:bg-canvas">
                <th scope="row" className="px-5 py-5 font-mono text-sm font-semibold whitespace-nowrap text-ink">
                  {transaction.id}
                </th>
                <td className="px-5 py-5 font-semibold text-ink">{transaction.studentName}</td>
                <td className="px-5 py-5 text-ink">{transaction.courseTitle}</td>
                <td className="px-5 py-5 text-right font-semibold whitespace-nowrap text-ink tabular-nums">
                  {formatMoney(transaction.amountMinor, transaction.currency)}
                </td>
                <td className="px-5 py-5">
                  <PaymentMethodLabel method={transaction.paymentMethod} />
                </td>
                <td className="px-5 py-5">
                  <TransactionStatusBadge status={transaction.status} />
                </td>
                <td className="px-5 py-5 whitespace-nowrap text-ink">{formatCertificateDate(transaction.createdAt)}</td>
                <td className="px-5 py-5 text-right">
                  <ViewButton transaction={transaction} onView={onView} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <ul className="grid gap-4 md:grid-cols-2 2xl:hidden">
        {transactions.map((transaction) => (
          <li key={transaction.id} className="flex flex-col rounded-2xl border border-line bg-surface p-5">
            <div className="flex flex-wrap items-start justify-between gap-x-4 gap-y-2">
              <p className="font-mono text-sm font-semibold text-ink-muted">{transaction.id}</p>
              <TransactionStatusBadge status={transaction.status} />
            </div>
            <p className="mt-3 text-lg font-bold text-ink">{transaction.studentName}</p>
            <p className="text-base break-words text-ink">{transaction.courseTitle}</p>
            <p className="mt-3 text-2xl font-bold tracking-tight text-ink tabular-nums">
              {formatMoney(transaction.amountMinor, transaction.currency)}
            </p>
            <dl className="mt-3 flex flex-col gap-1.5 text-base">
              <div className="flex flex-wrap gap-x-2">
                <dt className="text-ink-muted">Method:</dt>
                <dd>
                  <PaymentMethodLabel method={transaction.paymentMethod} />
                </dd>
              </div>
              <div className="flex flex-wrap gap-x-2">
                <dt className="text-ink-muted">Date:</dt>
                <dd className="text-ink">{formatCertificateDate(transaction.createdAt)}</dd>
              </div>
            </dl>
            <div className="mt-5">
              <ViewButton transaction={transaction} onView={onView} full />
            </div>
          </li>
        ))}
      </ul>
    </>
  );
}

/** Opens the read-only details panel for one transaction. */
function ViewButton({
  transaction,
  onView,
  full,
}: {
  transaction: AdminTransaction;
  onView: (transaction: AdminTransaction) => void;
  full?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={() => onView(transaction)}
      className={`inline-flex min-h-11 items-center justify-center gap-1.5 rounded-xl border-2 border-primary px-3 text-base font-semibold whitespace-nowrap text-primary hover:bg-secondary ${full ? "w-full" : ""}`}
    >
      <Eye aria-hidden="true" className="size-4" />
      View Details
      <span className="sr-only">
        : transaction {transaction.id} for {transaction.studentName}
      </span>
    </button>
  );
}
