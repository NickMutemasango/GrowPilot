"use client";

import { Ban, CircleCheck, CircleX, Gift, RotateCcw, SearchX } from "lucide-react";
import { canDecide } from "@/lib/admin/affiliate-decisions";
import { canReactivate, canSuspend } from "@/lib/admin/affiliate-suspension";
import { formatCertificateDate } from "@/lib/certificates/format";
import { formatMoney } from "@/lib/payments/money";
import type { AdminAffiliate } from "@/types/admin-affiliates";
import { AdminEmptyState } from "../AdminEmptyState";
import { AffiliateStatusBadge } from "./badges";

type AffiliatesTableProps = {
  affiliates: AdminAffiliate[];
  /** True when nothing has been searched or filtered, so an empty list really means "none yet". */
  unfiltered: boolean;
  /** Left out where deciding isn't offered, and then the actions simply aren't shown. */
  onApprove?: (affiliate: AdminAffiliate) => void;
  onReject?: (affiliate: AdminAffiliate) => void;
  /** Offered on approved affiliates only (Step 12E.3). */
  onSuspend?: (affiliate: AdminAffiliate) => void;
  /** Offered on suspended affiliates only (Step 12E.4). */
  onReactivate?: (affiliate: AdminAffiliate) => void;
};

/** The list of affiliates: a table on wide screens, cards on narrow ones. */
export function AffiliatesTable({
  affiliates,
  unfiltered,
  onApprove,
  onReject,
  onSuspend,
  onReactivate,
}: AffiliatesTableProps) {
  if (affiliates.length === 0) {
    return unfiltered ? (
      <AdminEmptyState icon={Gift} title="No affiliates have registered yet">
        People who apply to promote GrowPilot Academy courses will appear here.
      </AdminEmptyState>
    ) : (
      <AdminEmptyState icon={SearchX} title="No Affiliates Found">
        Try adjusting your search or filters.
      </AdminEmptyState>
    );
  }

  return (
    <>
      {/*
        Seven columns only read well on a genuinely wide screen, so the
        table waits for one (2xl). Below that — a tablet, a normal laptop,
        or a wide screen at 125–150% zoom — the same affiliates are shown
        as cards, two across where there's room, so nothing is ever
        squeezed into a column too narrow for it and the page never
        scrolls sideways.
      */}
      <div className="hidden overflow-x-auto rounded-2xl border border-line bg-surface 2xl:block">
        <table className="w-full min-w-[64rem] text-left text-base">
          <caption className="sr-only">
            Affiliates, newest first. Any action here changes this screen only until the affiliate store is connected.
          </caption>
          <thead className="bg-secondary/60 text-ink">
            <tr>
              <th scope="col" className="w-44 px-5 py-4 font-semibold">Affiliate Name</th>
              <th scope="col" className="w-56 px-5 py-4 font-semibold">Email Address</th>
              <th scope="col" className="px-5 py-4 font-semibold whitespace-nowrap">Referral Code</th>
              <th scope="col" className="px-5 py-4 text-right font-semibold whitespace-nowrap">Successful Sales</th>
              <th scope="col" className="px-5 py-4 text-right font-semibold whitespace-nowrap">Commission Earned</th>
              <th scope="col" className="px-5 py-4 font-semibold whitespace-nowrap">Account Status</th>
              <th scope="col" className="px-5 py-4 font-semibold whitespace-nowrap">Registration Date</th>
              <th scope="col" className="px-5 py-4 font-semibold"><span className="sr-only">Actions</span></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {affiliates.map((affiliate) => (
              <tr key={affiliate.id} className="align-middle hover:bg-canvas">
                <th scope="row" className="px-5 py-5 font-semibold text-ink">
                  {affiliate.name}
                </th>
                <td className="px-5 py-5 break-all text-ink">{affiliate.email}</td>
                <td className="px-5 py-5 font-mono text-sm font-semibold whitespace-nowrap text-ink">
                  {affiliate.referralCode}
                </td>
                <td className="px-5 py-5 text-right font-semibold text-ink tabular-nums">{affiliate.successfulSales}</td>
                <td className="px-5 py-5 text-right font-semibold whitespace-nowrap text-ink tabular-nums">
                  {formatMoney(affiliate.commissionEarnedMinor, affiliate.currency)}
                </td>
                <td className="px-5 py-5">
                  <AffiliateStatusBadge status={affiliate.status} />
                  {affiliate.rejectionReason && (
                    <span className="mt-1 block max-w-56 text-sm break-words text-ink-muted">
                      {affiliate.rejectionReason}
                    </span>
                  )}
                  {affiliate.suspensionReason && (
                    <span className="mt-1 block max-w-56 text-sm break-words text-ink-muted">
                      {affiliate.status === "suspended" ? "" : "Previously suspended: "}
                      {affiliate.suspensionReason}
                    </span>
                  )}
                </td>
                <td className="px-5 py-5 whitespace-nowrap text-ink">{formatCertificateDate(affiliate.joinedAt)}</td>
                <td className="px-5 py-5">
                  <AffiliateActions
                    affiliate={affiliate}
                    onApprove={onApprove}
                    onReject={onReject}
                    onSuspend={onSuspend}
                    onReactivate={onReactivate}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <ul className="grid gap-4 md:grid-cols-2 2xl:hidden">
        {affiliates.map((affiliate) => (
          <li key={affiliate.id} className="flex flex-col rounded-2xl border border-line bg-surface p-5">
            <div className="flex flex-wrap items-start justify-between gap-x-4 gap-y-2">
              <p className="text-lg font-bold text-ink">{affiliate.name}</p>
              <AffiliateStatusBadge status={affiliate.status} />
            </div>
            <p className="text-base break-all text-ink-muted">{affiliate.email}</p>
            <p className="mt-3 font-mono text-sm font-semibold text-ink">{affiliate.referralCode}</p>

            <div className="mt-4 flex flex-wrap gap-x-8 gap-y-3">
              <div>
                <p className="text-sm text-ink-muted">Successful sales</p>
                <p className="text-2xl font-bold tracking-tight text-ink tabular-nums">{affiliate.successfulSales}</p>
              </div>
              <div>
                <p className="text-sm text-ink-muted">Commission earned</p>
                <p className="text-2xl font-bold tracking-tight text-ink tabular-nums">
                  {formatMoney(affiliate.commissionEarnedMinor, affiliate.currency)}
                </p>
              </div>
            </div>

            <p className="mt-4 text-base text-ink-muted">
              Registered {formatCertificateDate(affiliate.joinedAt)}
            </p>
            {affiliate.rejectionReason && <ReasonNote label="Rejected" reason={affiliate.rejectionReason} />}
            {affiliate.suspensionReason && (
              <ReasonNote
                label={affiliate.status === "suspended" ? "Suspended" : "Previously suspended"}
                reason={affiliate.suspensionReason}
              />
            )}
            <AffiliateActions
              affiliate={affiliate}
              onApprove={onApprove}
              onReject={onReject}
              onSuspend={onSuspend}
              onReactivate={onReactivate}
              full
            />
          </li>
        ))}
      </ul>
    </>
  );
}

/**
 * The actions offered on one affiliate.
 *
 * Approve and Reject while an application is still pending (Step
 * 12E.2); Suspend on an approved affiliate (Step 12E.3); Reactivate on a
 * suspended one (Step 12E.4). Each status offers exactly one of
 * Suspend and Reactivate, never both, so the same act can never be done
 * twice in a row.
 */
function AffiliateActions({
  affiliate,
  onApprove,
  onReject,
  onSuspend,
  onReactivate,
  full,
}: {
  affiliate: AdminAffiliate;
  onApprove?: (affiliate: AdminAffiliate) => void;
  onReject?: (affiliate: AdminAffiliate) => void;
  onSuspend?: (affiliate: AdminAffiliate) => void;
  onReactivate?: (affiliate: AdminAffiliate) => void;
  full?: boolean;
}) {
  const deciding = canDecide(affiliate);
  const showApprove = deciding && onApprove;
  const showReject = deciding && onReject;
  const showSuspend = canSuspend(affiliate) && onSuspend;
  const showReactivate = canReactivate(affiliate) && onReactivate;
  if (!showApprove && !showReject && !showSuspend && !showReactivate) return null;

  const width = full ? "w-full" : "";

  return (
    <div className={`flex gap-2 ${full ? "mt-5 flex-col sm:flex-row" : "justify-end"}`}>
      {showApprove && (
        <button
          type="button"
          onClick={() => onApprove(affiliate)}
          className={`inline-flex min-h-11 items-center justify-center gap-1.5 rounded-xl bg-primary px-3 text-base font-semibold whitespace-nowrap text-white shadow-button hover:bg-primary-hover ${width}`}
        >
          <CircleCheck aria-hidden="true" className="size-4" />
          Approve
          <span className="sr-only">{" "}
            {affiliate.name}&rsquo;s affiliate application
          </span>
        </button>
      )}
      {showReject && (
        <button
          type="button"
          onClick={() => onReject(affiliate)}
          className={`inline-flex min-h-11 items-center justify-center gap-1.5 rounded-xl border-2 border-[#9A3412] px-3 text-base font-semibold whitespace-nowrap text-[#9A3412] hover:bg-[#FDECEA] ${width}`}
        >
          <CircleX aria-hidden="true" className="size-4" />
          Reject
          <span className="sr-only">{" "}
            {affiliate.name}&rsquo;s affiliate application
          </span>
        </button>
      )}
      {showReactivate && (
        <button
          type="button"
          onClick={() => onReactivate(affiliate)}
          className={`inline-flex min-h-11 items-center justify-center gap-1.5 rounded-xl bg-primary px-3 text-base font-semibold whitespace-nowrap text-white shadow-button hover:bg-primary-hover ${width}`}
        >
          <RotateCcw aria-hidden="true" className="size-4" />
          Reactivate Affiliate
          <span className="sr-only">: {affiliate.name}&rsquo;s account</span>
        </button>
      )}
      {showSuspend && (
        <button
          type="button"
          onClick={() => onSuspend(affiliate)}
          className={`inline-flex min-h-11 items-center justify-center gap-1.5 rounded-xl border-2 border-[#9A3412] px-3 text-base font-semibold whitespace-nowrap text-[#9A3412] hover:bg-[#FDECEA] ${width}`}
        >
          <Ban aria-hidden="true" className="size-4" />
          Suspend Affiliate
          <span className="sr-only">: {affiliate.name}&rsquo;s account</span>
        </button>
      )}
    </div>
  );
}

/** Why an application was turned down, or an account suspended, kept with the record on the card layout. */
function ReasonNote({ label, reason }: { label: string; reason: string }) {
  return (
    <p className="mt-3 rounded-xl bg-[#FDECEA] p-3 text-sm break-words text-ink">
      <span className="font-semibold text-[#9A3412]">{label}:</span> {reason}
    </p>
  );
}
