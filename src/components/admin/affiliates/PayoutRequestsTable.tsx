"use client";

import { Banknote, CircleCheck, CircleX, HandCoins, SearchX } from "lucide-react";
import { payoutMethodLabels } from "@/lib/admin/affiliate-payouts";
import { canDecidePayout } from "@/lib/admin/payout-decisions";
import { canMarkPayoutPaid } from "@/lib/admin/payout-payments";
import { formatCertificateDate } from "@/lib/certificates/format";
import { formatMoney } from "@/lib/payments/money";
import type { AdminPayoutRequest } from "@/types/admin-affiliates";
import { AdminEmptyState } from "../AdminEmptyState";
import { PayoutStatusBadge } from "./badges";

type PayoutRequestsTableProps = {
  requests: AdminPayoutRequest[];
  /** True when nothing has been searched or filtered, so an empty list really means "none yet". */
  unfiltered: boolean;
  /** Left out where deciding isn't offered, and then the actions simply aren't shown. */
  onApprove?: (request: AdminPayoutRequest) => void;
  onReject?: (request: AdminPayoutRequest) => void;
  /** Offered on an approved request only. Records a simulated payout; it never pays one. */
  onMarkPaid?: (request: AdminPayoutRequest) => void;
};

/**
 * The list of payout requests: a table on wide screens, cards on narrow
 * ones.
 *
 * The payout method is the KIND of payout only. No account number, sort
 * code, wallet address or phone number exists in this data, so none can
 * be shown here.
 */
export function PayoutRequestsTable({
  requests,
  unfiltered,
  onApprove,
  onReject,
  onMarkPaid,
}: PayoutRequestsTableProps) {
  if (requests.length === 0) {
    return unfiltered ? (
      <AdminEmptyState icon={HandCoins} title="No payout requests yet">
        When an affiliate asks to be paid what they have earned, their request will appear here for review.
      </AdminEmptyState>
    ) : (
      <AdminEmptyState icon={SearchX} title="No Payout Requests Found">
        Nothing matches that name, request ID or status. Try adjusting your search or filters.
      </AdminEmptyState>
    );
  }

  return (
    <>
      {/*
        Seven columns — six of data plus the actions — only read well on
        a genuinely wide screen, so the table waits for one (2xl), the
        same width the affiliates table waits for. Below that the same
        requests are shown as cards, so nothing is squeezed into a column
        too narrow for it and the page never scrolls sideways.
      */}
      <div className="hidden overflow-x-auto rounded-2xl border border-line bg-surface 2xl:block">
        <table className="w-full min-w-[66rem] text-left text-base">
          <caption className="sr-only">
            Payout requests, newest first. A pending request can be approved or rejected, and an approved one
            marked as paid; every payout here is simulated and no money moves.
          </caption>
          <thead className="bg-secondary/60 text-ink">
            <tr>
              <th scope="col" className="px-5 py-4 font-semibold whitespace-nowrap">Request ID</th>
              <th scope="col" className="w-44 px-5 py-4 font-semibold">Affiliate Name</th>
              <th scope="col" className="px-5 py-4 text-right font-semibold whitespace-nowrap">Requested Amount</th>
              <th scope="col" className="px-5 py-4 font-semibold whitespace-nowrap">Payout Method</th>
              <th scope="col" className="px-5 py-4 font-semibold whitespace-nowrap">Request Date</th>
              <th scope="col" className="px-5 py-4 font-semibold whitespace-nowrap">Payout Status</th>
              <th scope="col" className="px-5 py-4 font-semibold"><span className="sr-only">Actions</span></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {requests.map((request) => (
              <tr key={request.id} className="align-middle hover:bg-canvas">
                <th scope="row" className="px-5 py-5 font-mono text-sm font-semibold whitespace-nowrap text-ink">
                  {request.id}
                </th>
                <td className="px-5 py-5 text-ink">
                  <span className="font-semibold">{request.affiliateName}</span>
                  <span className="mt-0.5 block font-mono text-sm font-semibold text-ink-muted">
                    {request.referralCode}
                  </span>
                </td>
                <td className="px-5 py-5 text-right font-semibold whitespace-nowrap text-ink tabular-nums">
                  {formatMoney(request.amountMinor, request.currency)}
                </td>
                <td className="px-5 py-5 whitespace-nowrap text-ink">{payoutMethodLabels[request.method]}</td>
                <td className="px-5 py-5 whitespace-nowrap text-ink">{formatCertificateDate(request.requestedAt)}</td>
                <td className="px-5 py-5">
                  <PayoutStatusBadge status={request.status} />
                  {request.rejectionReason && (
                    <span className="mt-1 block max-w-56 text-sm break-words text-ink-muted">
                      {request.rejectionReason}
                    </span>
                  )}
                  {request.status === "paid" && request.paidAt && (
                    <span className="mt-1 block text-sm text-ink-muted">
                      Simulated {formatCertificateDate(request.paidAt)}
                    </span>
                  )}
                </td>
                <td className="px-5 py-5">
                  <PayoutRowActions
                    request={request}
                    onApprove={onApprove}
                    onReject={onReject}
                    onMarkPaid={onMarkPaid}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <ul className="grid gap-4 md:grid-cols-2 2xl:hidden">
        {requests.map((request) => (
          <li key={request.id} className="flex flex-col rounded-2xl border border-line bg-surface p-5">
            <div className="flex flex-wrap items-start justify-between gap-x-4 gap-y-2">
              <p className="font-mono text-sm font-semibold text-ink-muted">{request.id}</p>
              <PayoutStatusBadge status={request.status} />
            </div>
            <p className="mt-2 text-lg font-bold text-ink">{request.affiliateName}</p>
            <p className="font-mono text-sm font-semibold text-ink-muted">{request.referralCode}</p>

            <div className="mt-4 flex flex-wrap gap-x-8 gap-y-3">
              <div>
                <p className="text-sm text-ink-muted">Requested amount</p>
                <p className="text-2xl font-bold tracking-tight text-ink tabular-nums">
                  {formatMoney(request.amountMinor, request.currency)}
                </p>
              </div>
              <div>
                <p className="text-sm text-ink-muted">Payout method</p>
                <p className="text-base font-semibold text-ink">{payoutMethodLabels[request.method]}</p>
              </div>
            </div>

            <p className="mt-4 text-base text-ink-muted">
              Requested {formatCertificateDate(request.requestedAt)}
            </p>
            {request.rejectionReason && (
              <p className="mt-3 rounded-xl bg-[#FDECEA] p-3 text-sm break-words text-ink">
                <span className="font-semibold text-[#9A3412]">Rejected:</span> {request.rejectionReason}
              </p>
            )}
            {request.status === "paid" && request.paidAt && (
              <p className="mt-3 rounded-xl bg-secondary p-3 text-sm text-ink">
                <span className="font-semibold text-primary">Simulated payout:</span> recorded{" "}
                {formatCertificateDate(request.paidAt)}. No money was transferred.
              </p>
            )}
            <PayoutRowActions
              request={request}
              onApprove={onApprove}
              onReject={onReject}
              onMarkPaid={onMarkPaid}
              full
            />
          </li>
        ))}
      </ul>
    </>
  );
}

/**
 * What can be done to a request, which depends entirely on where it is:
 *
 *  - Pending: Approve or Reject.
 *  - Approved: Mark as Paid — a SIMULATED payout that records a date and
 *    moves no money.
 *  - Rejected or Paid: nothing at all. A rejected request is settled,
 *    and a paid one is done, so the same payout can never be recorded
 *    twice or turned back into something else.
 */
function PayoutRowActions({
  request,
  onApprove,
  onReject,
  onMarkPaid,
  full,
}: {
  request: AdminPayoutRequest;
  onApprove?: (request: AdminPayoutRequest) => void;
  onReject?: (request: AdminPayoutRequest) => void;
  onMarkPaid?: (request: AdminPayoutRequest) => void;
  full?: boolean;
}) {
  if (canMarkPayoutPaid(request)) {
    if (!onMarkPaid) return null;
    return (
      <div className={`flex gap-2 ${full ? "mt-5 flex-col sm:flex-row" : "justify-end"}`}>
        <button
          type="button"
          onClick={() => onMarkPaid(request)}
          className={`inline-flex min-h-11 items-center justify-center gap-1.5 rounded-xl bg-primary px-3 text-base font-semibold whitespace-nowrap text-white shadow-button hover:bg-primary-hover ${full ? "w-full" : ""}`}
        >
          <Banknote aria-hidden="true" className="size-4" />
          Mark as Paid
          <span className="sr-only"> payout request {request.id} (simulated)</span>
        </button>
      </div>
    );
  }

  if (!canDecidePayout(request) || (!onApprove && !onReject)) return null;

  return (
    <div className={`flex gap-2 ${full ? "mt-5 flex-col sm:flex-row" : "justify-end"}`}>
      {onApprove && (
        <button
          type="button"
          onClick={() => onApprove(request)}
          className={`inline-flex min-h-11 items-center justify-center gap-1.5 rounded-xl bg-primary px-3 text-base font-semibold whitespace-nowrap text-white shadow-button hover:bg-primary-hover ${full ? "w-full" : ""}`}
        >
          <CircleCheck aria-hidden="true" className="size-4" />
          Approve
          <span className="sr-only"> payout request {request.id}</span>
        </button>
      )}
      {onReject && (
        <button
          type="button"
          onClick={() => onReject(request)}
          className={`inline-flex min-h-11 items-center justify-center gap-1.5 rounded-xl border-2 border-[#9A3412] px-3 text-base font-semibold whitespace-nowrap text-[#9A3412] hover:bg-[#FDECEA] ${full ? "w-full" : ""}`}
        >
          <CircleX aria-hidden="true" className="size-4" />
          Reject
          <span className="sr-only"> payout request {request.id}</span>
        </button>
      )}
    </div>
  );
}
