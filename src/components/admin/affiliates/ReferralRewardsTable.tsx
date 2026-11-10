"use client";

import { Ban, CircleCheck, CircleX, GraduationCap, SearchX, UserPlus } from "lucide-react";
import { canDecideReward } from "@/lib/admin/referral-decisions";
import { canGrantFreeCourse } from "@/lib/admin/referral-grants";
import { canRevokeReward } from "@/lib/admin/referral-revocations";
import { formatCertificateDate } from "@/lib/certificates/format";
import { CHECKOUT_CURRENCY, formatMoney } from "@/lib/payments/money";
import type { AdminReferral } from "@/types/admin-referrals";
import { AdminEmptyState } from "../AdminEmptyState";
import { ReferralPurchaseBadge, ReferralRewardBadge } from "./badges";

type ReferralRewardsTableProps = {
  referrals: AdminReferral[];
  /** True when nothing has been searched or filtered, so an empty list really means "none yet". */
  unfiltered: boolean;
  /** Left out where deciding isn't offered, and then the actions simply aren't shown. */
  onApprove?: (referral: AdminReferral) => void;
  onReject?: (referral: AdminReferral) => void;
  /** Offered on an approved reward only. Records a demonstration grant; it gives nobody access. */
  onGrant?: (referral: AdminReferral) => void;
  /** Offered on an approved or claimed reward. Takes the reward back; it withdraws no real access. */
  onRevoke?: (referral: AdminReferral) => void;
};

/**
 * The list of referrals: a table on wide screens, cards on narrow ones.
 *
 * An eligible reward can be approved or rejected here (Step 12E.10).
 * NOTHING ON THIS SCREEN GRANTS A COURSE: approving says the reward is
 * owed, never that it has been given, and no row can be marked Claimed
 * from here.
 */
export function ReferralRewardsTable({
  referrals,
  unfiltered,
  onApprove,
  onReject,
  onGrant,
  onRevoke,
}: ReferralRewardsTableProps) {
  if (referrals.length === 0) {
    return unfiltered ? (
      <AdminEmptyState icon={UserPlus} title="No referrals yet">
        When a student invites a friend who joins through their link, the referral will appear here.
      </AdminEmptyState>
    ) : (
      <AdminEmptyState icon={SearchX} title="No Referrals Found">
        Nothing matches that name, referral code or reward status. Try adjusting your search or filters.
      </AdminEmptyState>
    );
  }

  return (
    <>
      {/*
        Six columns, two of them names, only read well on a genuinely
        wide screen, so the table waits for one (xl). Below that the same
        referrals are shown as cards, so nothing is squeezed into a
        column too narrow for it and the page never scrolls sideways.
      */}
      <div className="hidden overflow-x-auto rounded-2xl border border-line bg-surface xl:block">
        <table className="w-full min-w-[64rem] text-left text-base">
          <caption className="sr-only">
            Referrals, newest first. An eligible reward can be approved or rejected; nothing here grants a
            course.
          </caption>
          <thead className="bg-secondary/60 text-ink">
            <tr>
              <th scope="col" className="w-44 px-5 py-4 font-semibold">Referrer Name</th>
              <th scope="col" className="w-44 px-5 py-4 font-semibold">Referred Student</th>
              <th scope="col" className="px-5 py-4 font-semibold whitespace-nowrap">Referral Code</th>
              <th scope="col" className="px-5 py-4 font-semibold whitespace-nowrap">Referral Date</th>
              <th scope="col" className="px-5 py-4 font-semibold whitespace-nowrap">Purchase Status</th>
              <th scope="col" className="px-5 py-4 font-semibold whitespace-nowrap">Reward Status</th>
              <th scope="col" className="px-5 py-4 font-semibold"><span className="sr-only">Actions</span></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {referrals.map((referral) => (
              <tr key={referral.id} className="align-top hover:bg-canvas">
                <th scope="row" className="px-5 py-5 font-semibold text-ink">
                  {referral.referrerName}
                  <span className="mt-0.5 block font-mono text-sm font-semibold text-ink-muted">{referral.id}</span>
                </th>
                <td className="px-5 py-5 text-ink">{referral.referredStudentName}</td>
                <td className="px-5 py-5 font-mono text-sm font-semibold whitespace-nowrap text-ink">
                  {referral.referralCode}
                </td>
                <td className="px-5 py-5 whitespace-nowrap text-ink">
                  {formatCertificateDate(referral.referredAt)}
                </td>
                <td className="px-5 py-5">
                  <ReferralPurchaseBadge status={referral.purchaseStatus} />
                  {referral.purchasedCourseTitle && (
                    <span className="mt-1 block max-w-56 text-sm text-ink-muted">
                      {referral.purchasedCourseTitle}
                      {referral.purchaseAmountMinor !== null && (
                        <> &middot; {formatMoney(referral.purchaseAmountMinor, CHECKOUT_CURRENCY)}</>
                      )}
                    </span>
                  )}
                </td>
                <td className="px-5 py-5">
                  <ReferralRewardBadge status={referral.rewardStatus} />
                  {referral.rewardStatus === "approved" && referral.approvedAt && (
              <p className="mt-3 rounded-xl bg-secondary p-3 text-sm text-ink">
                <span className="font-semibold text-primary">Approved:</span> agreed as owed on{" "}
                {formatCertificateDate(referral.approvedAt)}. The free course has not been granted.
              </p>
            )}
            {referral.rewardStatus === "claimed" && referral.claimedCourseTitle && (
                    <span className="mt-1 block max-w-56 text-sm text-ink-muted">
                      {referral.claimedCourseTitle}
                      {referral.claimedAt && <> &middot; {formatCertificateDate(referral.claimedAt)}</>}
                    </span>
                  )}
                  {referral.rewardStatus === "approved" && referral.approvedAt && (
                    <span className="mt-1 block text-sm text-ink-muted">
                      Approved {formatCertificateDate(referral.approvedAt)}
                    </span>
                  )}
                  {referral.rewardStatus === "revoked" && (
                    <span className="mt-1 block max-w-56 text-sm break-words text-ink-muted">
                      {referral.revokedAt && <>Revoked {formatCertificateDate(referral.revokedAt)}. </>}
                      {referral.revocationReason}
                    </span>
                  )}
                  {referral.rejectionReason && (
                    <span className="mt-1 block max-w-56 text-sm break-words text-ink-muted">
                      {referral.rejectionReason}
                    </span>
                  )}
                </td>
                <td className="px-5 py-5">
                  <RewardDecisionActions
                    referral={referral}
                    onApprove={onApprove}
                    onReject={onReject}
                    onGrant={onGrant}
                    onRevoke={onRevoke}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <ul className="grid gap-4 md:grid-cols-2 xl:hidden">
        {referrals.map((referral) => (
          <li key={referral.id} className="flex flex-col rounded-2xl border border-line bg-surface p-5">
            <div className="flex flex-wrap items-start justify-between gap-x-4 gap-y-2">
              <p className="font-mono text-sm font-semibold text-ink-muted">{referral.id}</p>
              <ReferralRewardBadge status={referral.rewardStatus} />
            </div>
            <p className="mt-2 text-lg font-bold text-ink">{referral.referrerName}</p>
            <p className="font-mono text-sm font-semibold text-ink-muted">{referral.referralCode}</p>

            <div className="mt-4">
              <p className="text-sm text-ink-muted">Referred student</p>
              <p className="text-base font-semibold text-ink">{referral.referredStudentName}</p>
            </div>

            <div className="mt-4">
              <p className="text-sm text-ink-muted">Purchase</p>
              <div className="mt-1">
                <ReferralPurchaseBadge status={referral.purchaseStatus} />
              </div>
              {referral.purchasedCourseTitle && (
                <p className="mt-1.5 text-sm text-ink-muted">
                  {referral.purchasedCourseTitle}
                  {referral.purchaseAmountMinor !== null && (
                    <> &middot; {formatMoney(referral.purchaseAmountMinor, CHECKOUT_CURRENCY)}</>
                  )}
                  {referral.purchasedAt && <> &middot; {formatCertificateDate(referral.purchasedAt)}</>}
                </p>
              )}
            </div>

            <p className="mt-4 text-base text-ink-muted">Referred {formatCertificateDate(referral.referredAt)}</p>

            {referral.rewardStatus === "approved" && referral.approvedAt && (
              <p className="mt-3 rounded-xl bg-secondary p-3 text-sm text-ink">
                <span className="font-semibold text-primary">Approved:</span> agreed as owed on{" "}
                {formatCertificateDate(referral.approvedAt)}. The free course has not been granted.
              </p>
            )}
            {referral.rewardStatus === "claimed" && referral.claimedCourseTitle && (
              <p className="mt-3 rounded-xl bg-secondary p-3 text-sm text-ink">
                <span className="font-semibold text-primary">Claimed:</span> {referral.claimedCourseTitle}
                {referral.claimedAt && <> on {formatCertificateDate(referral.claimedAt)}</>}.
              </p>
            )}
            {referral.rewardStatus === "revoked" && (
              <p className="mt-3 rounded-xl bg-canvas p-3 text-sm break-words text-ink ring-1 ring-line">
                <span className="font-semibold">Revoked:</span> {referral.revocationReason}
                {referral.revokedAt && <> (on {formatCertificateDate(referral.revokedAt)})</>}
                {referral.claimedCourseTitle && (
                  <> The free course granted was {referral.claimedCourseTitle}.</>
                )}
              </p>
            )}
            {referral.rejectionReason && (
              <p className="mt-3 rounded-xl bg-[#FDECEA] p-3 text-sm break-words text-ink">
                <span className="font-semibold text-[#9A3412]">Rejected:</span> {referral.rejectionReason}
              </p>
            )}
            <RewardDecisionActions
              referral={referral}
              onApprove={onApprove}
              onReject={onReject}
              onGrant={onGrant}
              onRevoke={onRevoke}
              full
            />
          </li>
        ))}
      </ul>
    </>
  );
}

/**
 * What can be done to a reward, which depends entirely on where it is:
 *
 *  - Eligible: Approve or Reject.
 *  - Approved: Grant Free Course — a DEMONSTRATION grant that records
 *    the claim and adds an enrolment record; it gives nobody access.
 *  - Approved: also Revoke Reward, to take the agreement back.
 *  - Claimed: Revoke Reward, which takes the granted course back.
 *  - Pending, Revoked or Rejected: nothing at all, so a reward can
 *    never be decided, granted or revoked twice, and none can be
 *    granted before it is earned and approved.
 */
function RewardDecisionActions({
  referral,
  onApprove,
  onReject,
  onGrant,
  onRevoke,
  full,
}: {
  referral: AdminReferral;
  onApprove?: (referral: AdminReferral) => void;
  onReject?: (referral: AdminReferral) => void;
  onGrant?: (referral: AdminReferral) => void;
  onRevoke?: (referral: AdminReferral) => void;
  full?: boolean;
}) {
  if (canRevokeReward(referral)) {
    const grant = canGrantFreeCourse(referral) ? onGrant : undefined;
    if (!grant && !onRevoke) return null;
    return (
      <div className={`flex gap-2 ${full ? "mt-5 flex-col sm:flex-row" : "justify-end"}`}>
        {grant && (
          <button
            type="button"
            onClick={() => grant(referral)}
            className={`inline-flex min-h-11 items-center justify-center gap-1.5 rounded-xl bg-primary px-3 text-base font-semibold whitespace-nowrap text-white shadow-button hover:bg-primary-hover ${full ? "w-full" : ""}`}
          >
            <GraduationCap aria-hidden="true" className="size-4" />
            Grant Free Course
            <span className="sr-only"> for referral reward {referral.id}</span>
          </button>
        )}
        {onRevoke && (
          <button
            type="button"
            onClick={() => onRevoke(referral)}
            className={`inline-flex min-h-11 items-center justify-center gap-1.5 rounded-xl border-2 border-[#9A3412] px-3 text-base font-semibold whitespace-nowrap text-[#9A3412] hover:bg-[#FDECEA] ${full ? "w-full" : ""}`}
          >
            <Ban aria-hidden="true" className="size-4" />
            Revoke Reward
            <span className="sr-only"> referral reward {referral.id}</span>
          </button>
        )}
      </div>
    );
  }

  if (!canDecideReward(referral) || (!onApprove && !onReject)) return null;

  return (
    <div className={`flex gap-2 ${full ? "mt-5 flex-col sm:flex-row" : "justify-end"}`}>
      {onApprove && (
        <button
          type="button"
          onClick={() => onApprove(referral)}
          className={`inline-flex min-h-11 items-center justify-center gap-1.5 rounded-xl bg-primary px-3 text-base font-semibold whitespace-nowrap text-white shadow-button hover:bg-primary-hover ${full ? "w-full" : ""}`}
        >
          <CircleCheck aria-hidden="true" className="size-4" />
          Approve
          <span className="sr-only"> referral reward {referral.id}</span>
        </button>
      )}
      {onReject && (
        <button
          type="button"
          onClick={() => onReject(referral)}
          className={`inline-flex min-h-11 items-center justify-center gap-1.5 rounded-xl border-2 border-[#9A3412] px-3 text-base font-semibold whitespace-nowrap text-[#9A3412] hover:bg-[#FDECEA] ${full ? "w-full" : ""}`}
        >
          <CircleX aria-hidden="true" className="size-4" />
          Reject
          <span className="sr-only"> referral reward {referral.id}</span>
        </button>
      )}
    </div>
  );
}
