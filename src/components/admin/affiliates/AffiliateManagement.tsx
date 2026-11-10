"use client";

import { useCallback, useMemo, useState } from "react";
import { Ban, CircleCheck, CircleX, Clock, Info, Users } from "lucide-react";
import { rewardsPolicy } from "@/config/rewards";
import { approvalDecision, pruneDecisions, rejectionDecision, withDecisions } from "@/lib/admin/affiliate-decisions";
import {
  canReactivate,
  canSuspend,
  pruneReactivations,
  pruneSuspensions,
  reactivationRecord,
  suspensionRecord,
  withReactivations,
  withSuspensions,
  withoutReactivation,
} from "@/lib/admin/affiliate-suspension";
import { byNewestAffiliate, earningsByCurrency, filterAffiliates, summariseAffiliates } from "@/lib/admin/affiliates";
import { formatMoney } from "@/lib/payments/money";
import {
  NO_AFFILIATE_FILTERS,
  type AdminAffiliate,
  type AdminAffiliateSale,
  type AdminPayoutRequest,
  type AffiliateFilters,
  type DecisionsById,
  type ReactivationsById,
  type SuspensionsById,
} from "@/types/admin-affiliates";
import type { AdminReferral } from "@/types/admin-referrals";
import type { AdminEnrolment, EnrolmentCourseChoice, EnrolmentStudentOption } from "@/types/admin-enrolments";
import { AdminStatsCard } from "../AdminStatsCard";
import { DemoToast } from "../DemoToast";
import { ApproveAffiliateDialog } from "./ApproveAffiliateDialog";
import { RejectAffiliateDialog } from "./RejectAffiliateDialog";
import { ReactivateAffiliateDialog } from "./ReactivateAffiliateDialog";
import { SuspendAffiliateDialog } from "./SuspendAffiliateDialog";
import { AffiliateFiltersBar } from "./AffiliateFiltersBar";
import { AffiliatesTable } from "./AffiliatesTable";
import { AffiliateSalesSection } from "./AffiliateSalesSection";
import { PayoutRequestsSection } from "./PayoutRequestsSection";
import { ReferralRewardsSection } from "./ReferralRewardsSection";

type AffiliateManagementProps = {
  /**
   * The affiliates to show. Today these are always the preview's sample
   * records, searched and filtered in this page; when an affiliate store
   * exists, searching and paging move to the server.
   */
  affiliates: AdminAffiliate[];
  /** Every sale made through an affiliate link, for the sales section (Step 12E.5). */
  sales: AdminAffiliateSale[];
  /** Every payout an affiliate has asked for, for the payouts section (Step 12E.6). */
  payoutRequests: AdminPayoutRequest[];
  /** Every friend referred through Refer-a-Friend, for the rewards section (Step 12E.9). */
  referrals: AdminReferral[];
  /** The courses a referral reward can be swapped for, and the referrers' own accounts (Step 12E.11). */
  rewardCourses: EnrolmentCourseChoice[];
  referrerAccounts: EnrolmentStudentOption[];
  /** The sample enrolments, so a granted reward is never a duplicate. */
  enrolments: AdminEnrolment[];
};

/**
 * "Affiliate Management": view and monitor the people promoting
 * GrowPilot Academy courses.
 *
 * A pending application can be approved or rejected here (Step 12E.2),
 * an approved affiliate can be suspended (Step 12E.3), and a suspended
 * one can be reactivated (Step 12E.4); each records the act and nothing
 * more. A suspension keeps the account and every figure on it, and a
 * reactivation keeps the suspension as history: nothing on this page
 * pays an affiliate, changes a
 * commission, blocks anyone's access, switches on referral tracking or
 * touches the referral reward programme — and no
 * payout mechanism exists in this project at all, so the earnings shown
 * are what has been earned, never what has been paid.
 */
export function AffiliateManagement({
  affiliates,
  sales,
  payoutRequests,
  referrals,
  rewardCourses,
  referrerAccounts,
  enrolments,
}: AffiliateManagementProps) {
  const [filters, setFilters] = useState<AffiliateFilters>(NO_AFFILIATE_FILTERS);
  // Read from the policy, so the notice can never quote a rate the figures don't use.
  const commissionRate = `${rewardsPolicy.commissionRateBasisPoints / 100}%`;
  const [approveId, setApproveId] = useState<string | null>(null);
  const [rejectId, setRejectId] = useState<string | null>(null);
  const [suspendId, setSuspendId] = useState<string | null>(null);
  const [reactivateId, setReactivateId] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  // Decisions made on this screen, kept against affiliate ids so a sample
  // record can be decided without the sample data being rewritten.
  const [decisions, setDecisions] = useState<DecisionsById>({});
  // Suspensions (Step 12E.3), kept the same way and applied after the decisions.
  const [suspensions, setSuspensions] = useState<SuspensionsById>({});
  // Reactivations (Step 12E.4), applied last of all.
  const [reactivations, setReactivations] = useState<ReactivationsById>({});

  const decided = useMemo(
    () => (Object.keys(decisions).length ? withDecisions(affiliates, decisions) : affiliates),
    [affiliates, decisions],
  );
  // After the decisions, so an application approved in this browser can then be suspended.
  const current = useMemo(
    () => (Object.keys(suspensions).length ? withSuspensions(decided, suspensions) : decided),
    [decided, suspensions],
  );
  // After the suspensions, so an affiliate suspended in this browser can be let back in.
  const live = useMemo(
    () => (Object.keys(reactivations).length ? withReactivations(current, reactivations) : current),
    [current, reactivations],
  );
  const sorted = useMemo(() => [...live].sort(byNewestAffiliate), [live]);
  // Both the figures and the list come from the same records, so they can never disagree.
  const summary = summariseAffiliates(sorted);
  const earnings = earningsByCurrency(sorted);
  const shown = useMemo(() => filterAffiliates(sorted, filters), [sorted, filters]);
  const unfiltered = filters.query.trim() === "" && filters.status === "all";
  const approving = sorted.find((affiliate) => affiliate.id === approveId) ?? null;
  const rejecting = sorted.find((affiliate) => affiliate.id === rejectId) ?? null;
  const suspending = sorted.find((affiliate) => affiliate.id === suspendId) ?? null;
  const reactivating = sorted.find((affiliate) => affiliate.id === reactivateId) ?? null;

  const dismissToast = useCallback(() => setToast(null), []);

  /**
   * Record one decision against an application.
   *
   * The record is never removed and never rewritten beyond its status
   * and the decision fields: the id, name, email address, referral code
   * and original application date all stay as they were.
   */
  const decide = (affiliate: AdminAffiliate | null, decision: ReturnType<typeof approvalDecision>, message: string) => {
    if (!affiliate) return;
    const next = pruneDecisions({ ...decisions, [affiliate.id]: decision }, sorted);
    setDecisions(next);
    setApproveId(null);
    setRejectId(null);
    setToast(message);
  };

  /**
   * Record one suspension against an approved affiliate.
   *
   * The account is never deleted and never rewritten beyond its status
   * and the two suspension fields: the id, name, email address, referral
   * code, registration date, successful sales and commission earned all
   * stay exactly as they were. The figures above the table follow from
   * the same records, so Approved falls by one and Suspended rises by
   * one while the total is untouched.
   */
  const suspend = (affiliate: AdminAffiliate | null, reason: string) => {
    // Checked again here, not only in the dialog, so a stale open dialog
    // can never suspend an account twice.
    if (!affiliate || !canSuspend(affiliate)) return;
    const next = pruneSuspensions({ ...suspensions, [affiliate.id]: suspensionRecord(reason) }, sorted);
    setSuspensions(next);
    // An earlier reactivation has to go, or it would simply undo this one:
    // the overlays are read in order and the last one wins.
    const stillReactivated = withoutReactivation(reactivations, affiliate.id);
    setReactivations(stillReactivated);
    setSuspendId(null);
    setToast("Affiliate account suspended successfully (Demo).");
  };

  /**
   * Put one suspended affiliate back to Approved.
   *
   * The suspension is deliberately kept: its date and reason stay on the
   * record as the history of why the account was stopped. Nothing else
   * moves either — the sales and the commission earned are exactly as
   * they were — so above the table Suspended falls by one, Approved
   * rises by one, and the total is untouched.
   */
  const reactivate = (affiliate: AdminAffiliate | null) => {
    // Checked again here, not only in the dialog, so a stale open dialog can
    // never reactivate an account that is already active.
    if (!affiliate || !canReactivate(affiliate)) return;
    const next = pruneReactivations({ ...reactivations, [affiliate.id]: reactivationRecord() }, sorted);
    setReactivations(next);
    setReactivateId(null);
    setToast("Affiliate reactivated successfully (Demo).");
  };

  return (
    <div className="flex flex-col gap-8">
      <header>
        <h1 className="text-3xl font-bold tracking-tight text-ink sm:text-4xl">Affiliate Management</h1>
        <p className="mt-2 text-lg text-ink-muted">
          View and monitor affiliates promoting GrowPilot Academy courses.
        </p>
        <p className="mt-3 flex items-start gap-2 text-base text-ink">
          <Info aria-hidden="true" className="mt-0.5 size-5 shrink-0 text-[#6b4e00]" />
          Demonstration affiliates. The people and sales are made up and the amounts are not real money: they are worked
          out from the sample sales at GrowPilot&rsquo;s {commissionRate} commission rate. Nothing has been paid, and
          deciding an application or changing an affiliate&rsquo;s status here records it on this screen only.
        </p>
      </header>

      <section aria-label="Affiliate totals" className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <h2 className="sr-only">Affiliate totals</h2>
        <AdminStatsCard
          icon={Users}
          title="Total Affiliates"
          description="Everyone who has applied."
          value={summary.total}
          source="live"
        />
        <AdminStatsCard
          icon={CircleCheck}
          title="Approved Affiliates"
          description={
            earnings.length === 1
              ? `${formatMoney(earnings[0].amountMinor, earnings[0].currency)} earned in total.`
              : "Promoting courses now."
          }
          value={summary.approved}
          source="live"
        />
        <AdminStatsCard
          icon={Clock}
          title="Pending Applications"
          description="Waiting to be reviewed."
          value={summary.pending}
          source="live"
        />
        <AdminStatsCard
          icon={CircleX}
          title="Rejected Applications"
          description="Turned down, and kept on record."
          value={summary.rejected}
          source="live"
        />
        <AdminStatsCard
          icon={Ban}
          title="Suspended Affiliates"
          description="Not promoting at the moment."
          value={summary.suspended}
          source="live"
        />
      </section>

      {/* Amounts are only ever added up within one currency: see earningsByCurrency. */}
      {earnings.length > 1 && (
        <p className="text-base text-ink">
          Commission earned by currency:{" "}
          {earnings.map((total) => formatMoney(total.amountMinor, total.currency)).join(" · ")}
        </p>
      )}

      <section aria-labelledby="all-affiliates-heading" className="flex flex-col gap-4">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h2 id="all-affiliates-heading" className="text-2xl font-bold tracking-tight text-ink">
            All Affiliates
          </h2>
          <p className="text-base text-ink-muted" aria-live="polite">
            {shown.length} {shown.length === 1 ? "affiliate" : "affiliates"} found
          </p>
        </div>
        <AffiliateFiltersBar filters={filters} onChange={setFilters} />
        <AffiliatesTable
          affiliates={shown}
          unfiltered={unfiltered}
          onApprove={(affiliate) => setApproveId(affiliate.id)}
          onReject={(affiliate) => setRejectId(affiliate.id)}
          onSuspend={(affiliate) => setSuspendId(affiliate.id)}
          onReactivate={(affiliate) => setReactivateId(affiliate.id)}
        />
      </section>

      <AffiliateSalesSection sales={sales} />

      <PayoutRequestsSection requests={payoutRequests} onDecided={setToast} />

      <ReferralRewardsSection
        referrals={referrals}
        onDecided={setToast}
        rewardCourses={rewardCourses}
        referrerAccounts={referrerAccounts}
        enrolments={enrolments}
      />

      <ApproveAffiliateDialog
        affiliate={approving}
        onCancel={() => setApproveId(null)}
        onConfirm={() => decide(approving, approvalDecision(), "Affiliate application approved successfully (Demo).")}
      />
      <RejectAffiliateDialog
        affiliate={rejecting}
        onCancel={() => setRejectId(null)}
        onConfirm={(reason) =>
          decide(rejecting, rejectionDecision(reason), "Affiliate application rejected successfully (Demo).")
        }
      />
      <SuspendAffiliateDialog
        affiliate={suspending}
        onCancel={() => setSuspendId(null)}
        onConfirm={(reason) => suspend(suspending, reason)}
      />
      <ReactivateAffiliateDialog
        affiliate={reactivating}
        onCancel={() => setReactivateId(null)}
        onConfirm={() => reactivate(reactivating)}
      />
      <DemoToast message={toast} onDismiss={dismissToast} />
    </div>
  );
}
