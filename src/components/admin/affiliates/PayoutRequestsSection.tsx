"use client";

import { useMemo, useState } from "react";
import { Banknote, CircleCheck, Clock, HandCoins, Info } from "lucide-react";
import {
  byNewestPayoutRequest,
  filterPayoutRequests,
  outstandingPayoutMinor,
  summarisePayoutRequests,
} from "@/lib/admin/affiliate-payouts";
import {
  canDecidePayout,
  prunePayoutDecisions,
  payoutApproval,
  payoutRejection,
  withPayoutDecisions,
} from "@/lib/admin/payout-decisions";
import {
  canMarkPayoutPaid,
  prunePayoutPayments,
  payoutPayment,
  withPayoutPayments,
} from "@/lib/admin/payout-payments";
import { formatMoney } from "@/lib/payments/money";
import {
  NO_PAYOUT_FILTERS,
  type AdminPayoutRequest,
  type PayoutDecisionsById,
  type PayoutFilters,
  type PayoutPaymentsById,
} from "@/types/admin-affiliates";
import { AdminStatsCard } from "../AdminStatsCard";
import { ApprovePayoutDialog } from "./ApprovePayoutDialog";
import { MarkPayoutPaidDialog } from "./MarkPayoutPaidDialog";
import { RejectPayoutDialog } from "./RejectPayoutDialog";
import { PayoutFiltersBar } from "./PayoutFiltersBar";
import { PayoutRequestsTable } from "./PayoutRequestsTable";

type PayoutRequestsSectionProps = {
  /** Every payout an affiliate has asked for. Searched and filtered in this page. */
  requests: AdminPayoutRequest[];
  /** Shows the page's one confirmation message after a decision. */
  onDecided: (message: string) => void;
};

/**
 * "Payout Requests": what affiliates have asked to be paid of what they
 * have earned.
 *
 * A pending request can be approved or rejected here (Step 12E.7), and
 * an approved one marked as paid (Step 12E.8); each records the outcome
 * and nothing more. NOTHING ON THIS SCREEN PAYS ANYBODY: approving says
 * the money is owed, and marking as paid records a SIMULATED payout —
 * that an administrator says a transfer happened somewhere else. No
 * payment service is connected to this project, so "Paid" is a label on
 * a sample row and never a transfer made from here.
 *
 * NO BANK DETAILS. The payout method is the KIND of payout only; no
 * account number, sort code, wallet address or phone number exists in
 * this data, so this screen cannot show one.
 */
export function PayoutRequestsSection({ requests, onDecided }: PayoutRequestsSectionProps) {
  const [filters, setFilters] = useState<PayoutFilters>(NO_PAYOUT_FILTERS);
  const [approveId, setApproveId] = useState<string | null>(null);
  const [rejectId, setRejectId] = useState<string | null>(null);
  const [markPaidId, setMarkPaidId] = useState<string | null>(null);
  // Decisions made on this screen, kept against request ids so a sample
  // request can be decided without the sample data being rewritten.
  const [decisions, setDecisions] = useState<PayoutDecisionsById>({});
  // Simulated payouts recorded on this screen, kept the same way.
  const [payments, setPayments] = useState<PayoutPaymentsById>({});

  const decided = useMemo(
    () => (Object.keys(decisions).length ? withPayoutDecisions(requests, decisions) : requests),
    [requests, decisions],
  );
  // Payments go on after the decisions, so a request approved on this
  // screen can then be marked paid on it.
  const settled = useMemo(
    () => (Object.keys(payments).length ? withPayoutPayments(decided, payments) : decided),
    [decided, payments],
  );
  const sorted = useMemo(() => [...settled].sort(byNewestPayoutRequest), [settled]);
  // The figures come from every request, not the filtered list: a search is
  // a way of finding one row, not a way of restating what is owed.
  const totals = summarisePayoutRequests(sorted);
  const outstandingMinor = outstandingPayoutMinor(sorted);
  const shown = useMemo(() => filterPayoutRequests(sorted, filters), [sorted, filters]);
  const unfiltered = filters.query.trim() === "" && filters.status === "all";
  const approving = sorted.find((request) => request.id === approveId) ?? null;
  const rejecting = sorted.find((request) => request.id === rejectId) ?? null;
  const marking = sorted.find((request) => request.id === markPaidId) ?? null;

  /**
   * Record one decision against a request.
   *
   * The request is never removed and never rewritten beyond its status
   * and the decision fields: the id, affiliate, referral code, amount,
   * payout method and original request date all stay as they were.
   * Approving marks the money as owed; it never marks it Paid.
   */
  const decide = (request: AdminPayoutRequest | null, decision: ReturnType<typeof payoutApproval>, message: string) => {
    // Checked again here, not only in the dialogs, so a stale open dialog can
    // never decide a request that has since been settled.
    if (!request || !canDecidePayout(request)) return;
    const next = prunePayoutDecisions({ ...decisions, [request.id]: decision }, sorted);
    setDecisions(next);
    setApproveId(null);
    setRejectId(null);
    onDecided(message);
  };

  /**
   * Record a SIMULATED payout against an approved request.
   *
   * No money moves and none can: this sets the status to Paid and keeps
   * the date it was recorded. Everything else — the id, affiliate,
   * referral code, amount, payout method, request date and the approval
   * before it — is left exactly as it was.
   */
  const markPaid = (request: AdminPayoutRequest | null) => {
    // Checked again here, not only in the table and the dialog, so a stale
    // open dialog can never pay a request twice or pay an unapproved one.
    if (!request || !canMarkPayoutPaid(request)) return;
    const next = prunePayoutPayments({ ...payments, [request.id]: payoutPayment() }, sorted);
    setPayments(next);
    setMarkPaidId(null);
    onDecided("Payout marked as paid successfully (Demo).");
  };

  return (
    <section aria-labelledby="payout-requests-heading" className="flex flex-col gap-4">
      <div>
        <h2 id="payout-requests-heading" className="text-2xl font-bold tracking-tight text-ink">
          Payout Requests
        </h2>
        <p className="mt-1 text-base text-ink-muted">
          What affiliates have asked to be paid of the commission they have earned.
        </p>
        {/*
          The icon and the whole sentence are the only two flex items: an
          inline element among loose text would become a flex item of its
          own and break the sentence into pieces.
        */}
        <p className="mt-3 flex items-start gap-2 text-base text-ink">
          <Info aria-hidden="true" className="mt-0.5 size-5 shrink-0 text-[#6b4e00]" />
          <span>
            Simulated requests. A pending request can be approved or rejected here, and an approved one marked as
            paid; each is recorded on this screen only. No payment service is connected to GrowPilot, so{" "}
            <span className="font-semibold">no money moves</span>: approving marks the amount as owed, and marking a
            request <span className="font-semibold">Paid</span> is a simulated payout — a note that a transfer was
            made elsewhere, never one made from here. Only the kind of payout is shown — no bank or account details
            exist in this data at all.
          </span>
        </p>
      </div>

      {/* Four cards, so two across and then four: none is ever left alone on a row. */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <AdminStatsCard
          icon={HandCoins}
          title="Total Payout Requests"
          description={`${formatMoney(totals.totalAmountMinor, totals.currency)} requested in all.`}
          value={totals.total}
          source="live"
        />
        <AdminStatsCard
          icon={Clock}
          title="Pending Requests"
          description={`${formatMoney(totals.pendingAmountMinor, totals.currency)} waiting to be reviewed.`}
          value={totals.pending}
          source="live"
        />
        <AdminStatsCard
          icon={CircleCheck}
          title="Approved Requests"
          description={`${formatMoney(totals.approvedAmountMinor, totals.currency)} approved, not yet paid.`}
          value={totals.approved}
          source="live"
        />
        <AdminStatsCard
          icon={Banknote}
          title="Completed Payouts"
          description={`${formatMoney(totals.paidAmountMinor, totals.currency)} marked as paid.`}
          value={totals.paid}
          source="live"
        />
      </div>

      {outstandingMinor > 0 && (
        <p className="text-base text-ink-muted">
          {formatMoney(outstandingMinor, totals.currency)} is still outstanding across the pending and approved
          requests.{" "}
          {totals.rejected > 0 &&
            `${totals.rejected} rejected ${totals.rejected === 1 ? "request" : "requests"} worth ${formatMoney(
              totals.rejectedAmountMinor,
              totals.currency,
            )} ${totals.rejected === 1 ? "is" : "are"} kept on record and owe nothing.`}
        </p>
      )}

      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h3 className="text-xl font-bold tracking-tight text-ink">All Payout Requests</h3>
        <p className="text-base text-ink-muted" aria-live="polite">
          {shown.length} {shown.length === 1 ? "request" : "requests"} found
        </p>
      </div>
      <PayoutFiltersBar filters={filters} onChange={setFilters} />
      <PayoutRequestsTable
        requests={shown}
        unfiltered={unfiltered}
        onApprove={(request) => setApproveId(request.id)}
        onReject={(request) => setRejectId(request.id)}
        onMarkPaid={(request) => setMarkPaidId(request.id)}
      />

      <ApprovePayoutDialog
        request={approving}
        onCancel={() => setApproveId(null)}
        onConfirm={() => decide(approving, payoutApproval(), "Payout request approved successfully (Demo).")}
      />
      <RejectPayoutDialog
        request={rejecting}
        onCancel={() => setRejectId(null)}
        onConfirm={(reason) =>
          decide(rejecting, payoutRejection(reason), "Payout request rejected successfully (Demo).")
        }
      />
      <MarkPayoutPaidDialog
        request={marking}
        onCancel={() => setMarkPaidId(null)}
        onConfirm={() => markPaid(marking)}
      />
    </section>
  );
}
