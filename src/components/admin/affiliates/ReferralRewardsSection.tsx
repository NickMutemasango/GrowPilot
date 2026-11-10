"use client";

import { useMemo, useState } from "react";
import { CircleCheck, Clock, Gift, Info, UserPlus } from "lucide-react";
import {
  byNewestReferral,
  filterReferrals,
  summariseReferrals,
} from "@/lib/admin/referral-rewards";
import {
  canDecideReward,
  pruneReferralDecisions,
  rewardApproval,
  rewardRejection,
  withReferralDecisions,
} from "@/lib/admin/referral-decisions";
import {
  canGrantFreeCourse,
  createRewardEnrolment,
  isAlreadyEnrolled,
  pruneReferralClaims,
  referralClaim,
  withReferralClaims,
} from "@/lib/admin/referral-grants";
import {
  canRevokeReward,
  pruneRewardRevocations,
  rewardRevocation,
  withRewardRevocations,
} from "@/lib/admin/referral-revocations";
import type { AdminEnrolment, EnrolmentCourseChoice, EnrolmentStudentOption } from "@/types/admin-enrolments";
import {
  NO_REFERRAL_FILTERS,
  type AdminReferral,
  type ReferralClaimsById,
  type ReferralDecisionsById,
  type ReferralFilters,
  type ReferralRevocationsById,
} from "@/types/admin-referrals";
import { AdminStatsCard } from "../AdminStatsCard";
import { ApproveRewardDialog } from "./ApproveRewardDialog";
import { GrantFreeCourseDialog } from "./GrantFreeCourseDialog";
import { RevokeRewardDialog } from "./RevokeRewardDialog";
import { RejectRewardDialog } from "./RejectRewardDialog";
import { ReferralFiltersBar } from "./ReferralFiltersBar";
import { ReferralRewardsTable } from "./ReferralRewardsTable";

type ReferralRewardsSectionProps = {
  /** Every friend who joined through a referral link. Searched and filtered in this page. */
  referrals: AdminReferral[];
  /** Shows the page's one confirmation message after a decision. */
  onDecided: (message: string) => void;
  /** The courses GrowPilot offers as a referral reward, for the grant dialog (Step 12E.11). */
  rewardCourses: EnrolmentCourseChoice[];
  /** The referrers' own accounts, so a granted reward is enrolled against the right person. */
  referrerAccounts: EnrolmentStudentOption[];
  /** The sample enrolments, so the same course is never granted to the same person twice. */
  enrolments: AdminEnrolment[];
};

/**
 * "Referral Rewards": who invited whom, whether the friend bought
 * anything, and what became of the free-course reward it could earn.
 *
 * An eligible reward can be approved or rejected here (Step 12E.10);
 * that records the decision and nothing more. NOTHING ON THIS SCREEN
 * GRANTS A COURSE: approving says a free course is owed, never that it
 * has been given, and no reward can be marked Claimed from here —
 * claiming is the referrer's own act on their Rewards page, and no
 * reward mechanism is connected to this project at all.
 *
 * An approved reward can be granted a free course (Step 12E.11), and
 * an approved or granted one can be revoked (Step 12E.12). Revoking
 * takes back exactly what this screen gave: the reward, and the one
 * enrolment the grant created. It never resets anybody's progress and
 * never touches their other enrolments.
 *
 * A referral is SUCCESSFUL only when the friend completed a qualifying
 * purchase. A friend who joined and bought nothing has not made one, and
 * a refunded purchase never qualified — so neither is counted among the
 * successful referrals, however many people joined.
 *
 * NO CONTACT DETAILS. The row names the two people and the code that
 * joined them; no email address, phone number or address exists in this
 * data at all.
 */
export function ReferralRewardsSection({
  referrals,
  onDecided,
  rewardCourses,
  referrerAccounts,
  enrolments,
}: ReferralRewardsSectionProps) {
  const [filters, setFilters] = useState<ReferralFilters>(NO_REFERRAL_FILTERS);
  const [approveId, setApproveId] = useState<string | null>(null);
  const [rejectId, setRejectId] = useState<string | null>(null);
  const [grantId, setGrantId] = useState<string | null>(null);
  const [revokeId, setRevokeId] = useState<string | null>(null);
  // Decisions made on this screen, kept against referral ids so a sample
  // referral can be decided without the sample data being rewritten.
  const [decisions, setDecisions] = useState<ReferralDecisionsById>({});
  // Free courses granted on this screen, kept the same way.
  const [claims, setClaims] = useState<ReferralClaimsById>({});
  // Rewards taken back on this screen, kept the same way and applied last.
  const [revocations, setRevocations] = useState<ReferralRevocationsById>({});
  // The demonstration enrolments this browser holds — the same list the
  // Enrolments screen reads, so a granted course appears on both.
  const [demoEnrolments, setDemoEnrolments] = useState<AdminEnrolment[]>([]);

  const decided = useMemo(
    () => (Object.keys(decisions).length ? withReferralDecisions(referrals, decisions) : referrals),
    [referrals, decisions],
  );
  // Claims go on after the decisions, so a reward approved on this screen
  // can then be granted on it.
  const claimed = useMemo(
    () => (Object.keys(claims).length ? withReferralClaims(decided, claims) : decided),
    [decided, claims],
  );
  // Revocations go on last, so a reward approved or granted on this screen
  // can then be taken back on it.
  const settled = useMemo(
    () => (Object.keys(revocations).length ? withRewardRevocations(claimed, revocations) : claimed),
    [claimed, revocations],
  );
  const sorted = useMemo(() => [...settled].sort(byNewestReferral), [settled]);
  // Both lists together: a course granted a moment ago counts as an enrolment
  // just as much as a sample one does.
  const allEnrolments = useMemo(
    () => (demoEnrolments.length ? [...demoEnrolments, ...enrolments] : enrolments),
    [demoEnrolments, enrolments],
  );
  // The figures come from every referral, not the filtered list: a search
  // is a way of finding one row, not a way of restating the programme.
  const totals = summariseReferrals(sorted);
  const shown = useMemo(() => filterReferrals(sorted, filters), [sorted, filters]);
  const unfiltered = filters.query.trim() === "" && filters.status === "all";
  const approving = sorted.find((referral) => referral.id === approveId) ?? null;
  const rejecting = sorted.find((referral) => referral.id === rejectId) ?? null;
  const granting = sorted.find((referral) => referral.id === grantId) ?? null;
  const revoking = sorted.find((referral) => referral.id === revokeId) ?? null;

  /**
   * Record one decision against a referral.
   *
   * The referral is never removed and never rewritten beyond its reward
   * status and the decision fields: the id, referrer, referred student,
   * referral code, referral date and qualifying purchase all stay as
   * they were. Approving marks the free course as owed; it never claims
   * it and never grants it.
   */
  const decide = (referral: AdminReferral | null, decision: ReturnType<typeof rewardApproval>, message: string) => {
    // Checked again here, not only in the table and the dialogs, so a stale
    // open dialog can never decide a reward that has since been settled.
    if (!referral || !canDecideReward(referral)) return;
    const next = pruneReferralDecisions({ ...decisions, [referral.id]: decision }, sorted);
    setDecisions(next);
    setApproveId(null);
    setRejectId(null);
    onDecided(message);
  };

  /**
   * Grant the free course an approved reward has earned.
   *
   * Two records are written together: the claim against the referral,
   * and one demonstration enrolment for the referrer — active, no
   * progress, recorded as a Referral enrolment. NOBODY IS GIVEN ACCESS
   * TO ANYTHING: both live in this browser, and the referral's own
   * details are left exactly as they were.
   */
  const grant = (referral: AdminReferral | null, course: EnrolmentCourseChoice) => {
    // Checked again here, not only in the table and the dialog, so a stale open
    // dialog can never grant the same reward twice or grant an unapproved one.
    if (!referral || !canGrantFreeCourse(referral)) return;
    const account = referrerAccounts.find((one) => one.id === referral.referrerStudentId);
    if (!account) return;
    // And the same course is never granted to the same person twice.
    if (isAlreadyEnrolled(account.id, course.id, allEnrolments)) return;

    const enrolment = createRewardEnrolment(account, course);
    const nextEnrolments = [enrolment, ...demoEnrolments];
    const nextClaims = pruneReferralClaims(
      { ...claims, [referral.id]: referralClaim(course, enrolment.id) },
      sorted,
    );

    setDemoEnrolments(nextEnrolments);
    setClaims(nextClaims);
    setGrantId(null);
    onDecided("Free course granted successfully (Demo).");
  };

  /**
   * Take an approved or granted reward back.
   *
   * The reward is marked Revoked with its reason and date, and where
   * the free course was granted here, THAT ONE ENROLMENT is revoked
   * with it — by id, through the same status-change store the
   * Enrolments screen reads, so no other enrolment of theirs, paid or
   * free, is touched. The student keeps every lesson they have
   * finished: revoking an enrolment never resets progress.
   */
  const revoke = (referral: AdminReferral | null, reason: string) => {
    // Checked again here, not only in the table and the dialog, so a stale open
    // dialog can never revoke the same reward twice.
    if (!referral || !canRevokeReward(referral)) return;
    const enrolmentId = claims[referral.id]?.enrolmentId ?? null;
    const next = pruneRewardRevocations(
      { ...revocations, [referral.id]: rewardRevocation(reason, enrolmentId) },
      sorted,
    );
    setRevocations(next);

    setRevokeId(null);
    onDecided("Referral reward revoked successfully (Demo).");
  };

  return (
    <section aria-labelledby="referral-rewards-heading" className="flex flex-col gap-4">
      <div>
        <h2 id="referral-rewards-heading" className="text-2xl font-bold tracking-tight text-ink">
          Referral Rewards
        </h2>
        <p className="mt-1 text-base text-ink-muted">
          Friends invited through Refer-a-Friend, and the free-course reward each referral could earn.
        </p>
        {/*
          The icon and the whole sentence are the only two flex items: an
          inline element among loose text would become a flex item of its
          own and break the sentence into pieces.
        */}
        <p className="mt-3 flex items-start gap-2 text-base text-ink">
          <Info aria-hidden="true" className="mt-0.5 size-5 shrink-0 text-[#6b4e00]" />
          <span>
            Simulated referrals. A referral counts as successful only when the friend{" "}
            <span className="font-semibold">completed a qualifying purchase</span>; a refunded purchase never
            qualified. An eligible reward can be approved or rejected here, and that is recorded on this screen only:
            approving agrees a free course is <span className="font-semibold">owed</span>, and an approved reward can
            then be granted — which records the claim and adds a demonstration enrolment in this browser. No course
            access is given to anybody: there is no access control in this project to give it with. Only names and
            codes are shown: no contact details exist in this data.
          </span>
        </p>
      </div>

      {/* Four cards, so two across and then four: none is ever left alone on a row. */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <AdminStatsCard
          icon={UserPlus}
          title="Total Referrals"
          description="Friends who joined through a referral link."
          value={totals.total}
          source="live"
        />
        <AdminStatsCard
          icon={CircleCheck}
          title="Successful Referrals"
          description="The friend completed a qualifying purchase."
          value={totals.successful}
          source="live"
        />
        <AdminStatsCard
          icon={Clock}
          title="Pending Rewards"
          description="Still waiting on a qualifying purchase."
          value={totals.pending}
          source="live"
        />
        <AdminStatsCard
          icon={Gift}
          title="Claimed Free Courses"
          description="Rewards already swapped for a course."
          value={totals.claimed}
          source="live"
        />
      </div>

      {(totals.eligible > 0 || totals.approved > 0 || totals.revoked > 0 || totals.rejected > 0) && (
        <p className="text-base text-ink-muted">
          {totals.eligible > 0 && (
            <>
              {totals.eligible} earned {totals.eligible === 1 ? "reward is" : "rewards are"} eligible and waiting to
              be reviewed.{" "}
            </>
          )}
          {totals.approved > 0 && (
            <>
              {totals.approved} {totals.approved === 1 ? "reward has" : "rewards have"} been approved and not yet
              granted.{" "}
            </>
          )}
          {totals.revoked > 0 && (
            <>
              {totals.revoked} {totals.revoked === 1 ? "reward has" : "rewards have"} been revoked; the referral and
              the course it was swapped for are kept on record.{" "}
            </>
          )}
          {totals.rejected > 0 && (
            <>
              {totals.rejected} rejected {totals.rejected === 1 ? "referral is" : "referrals are"} kept on record with
              the reason and earn nothing.
            </>
          )}
        </p>
      )}

      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h3 className="text-xl font-bold tracking-tight text-ink">All Referrals</h3>
        <p className="text-base text-ink-muted" aria-live="polite">
          {shown.length} {shown.length === 1 ? "referral" : "referrals"} found
        </p>
      </div>
      <ReferralFiltersBar filters={filters} onChange={setFilters} />
      <ReferralRewardsTable
        referrals={shown}
        unfiltered={unfiltered}
        onApprove={(referral) => setApproveId(referral.id)}
        onReject={(referral) => setRejectId(referral.id)}
        onGrant={(referral) => setGrantId(referral.id)}
        onRevoke={(referral) => setRevokeId(referral.id)}
      />

      <ApproveRewardDialog
        referral={approving}
        onCancel={() => setApproveId(null)}
        onConfirm={() => decide(approving, rewardApproval(), "Referral reward approved successfully (Demo).")}
      />
      <RejectRewardDialog
        referral={rejecting}
        onCancel={() => setRejectId(null)}
        onConfirm={(reason) =>
          decide(rejecting, rewardRejection(reason), "Referral reward rejected successfully (Demo).")
        }
      />
      <GrantFreeCourseDialog
        referral={granting}
        courses={rewardCourses}
        enrolments={allEnrolments}
        onCancel={() => setGrantId(null)}
        onConfirm={(course) => grant(granting, course)}
      />
      <RevokeRewardDialog
        referral={revoking}
        hasGrantedEnrolment={Boolean(revoking && claims[revoking.id]?.enrolmentId)}
        onCancel={() => setRevokeId(null)}
        onConfirm={(reason) => revoke(revoking, reason)}
      />
    </section>
  );
}
