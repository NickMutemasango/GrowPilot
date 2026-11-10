import { SearchX } from "lucide-react";
import { formatCertificateDate } from "@/lib/certificates/format";
import { CHECKOUT_CURRENCY, formatMoney } from "@/lib/payments/money";
import type { AdminReferral } from "@/types/admin-referrals";
import { AdminEmptyState } from "../AdminEmptyState";
import { ReferralRewardBadge } from "../affiliates/badges";

type ReferralAnalyticsTableProps = {
  referrals: AdminReferral[];
};

/**
 * Referrals as this report lists them: a table on wide screens, cards
 * on narrow ones.
 *
 * The course column is the QUALIFYING PURCHASE — what the friend
 * bought — and says plainly when there isn't one, because that is the
 * difference between a referral that succeeded and one that has not
 * yet.
 *
 * Names and codes only: no contact detail for either person exists in
 * this data.
 */
export function ReferralAnalyticsTable({ referrals }: ReferralAnalyticsTableProps) {
  if (referrals.length === 0) {
    return (
      <AdminEmptyState icon={SearchX} title="No referrals match these filters">
        Try another reward status, widen the dates, or clear them to see the whole period.
      </AdminEmptyState>
    );
  }

  return (
    <>
      {/*
        Five columns, two of them names, only read well on a genuinely
        wide screen, so the table waits for one (xl). Below that the same
        referrals are shown as cards, so nothing is squeezed into a
        column too narrow for it and the page never scrolls sideways.
      */}
      <div className="hidden overflow-x-auto rounded-2xl border border-line bg-surface xl:block">
        <table className="w-full min-w-[62rem] text-left text-base">
          <caption className="sr-only">
            Referrals with the course the friend bought, the date they joined and where the reward has got to,
            newest first.
          </caption>
          <thead className="bg-secondary/60 text-ink">
            <tr>
              <th scope="col" className="w-44 px-5 py-4 font-semibold">Referrer Name</th>
              <th scope="col" className="w-44 px-5 py-4 font-semibold">Referred Student</th>
              <th scope="col" className="px-5 py-4 font-semibold">Course Purchased</th>
              <th scope="col" className="px-5 py-4 font-semibold whitespace-nowrap">Referral Date</th>
              <th scope="col" className="px-5 py-4 font-semibold whitespace-nowrap">Reward Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {referrals.map((referral) => (
              <tr key={referral.id} className="align-top hover:bg-canvas">
                <th scope="row" className="px-5 py-5 font-semibold text-ink">
                  {referral.referrerName}
                  <span className="mt-0.5 block font-mono text-sm font-semibold text-ink-muted">
                    {referral.referralCode}
                  </span>
                </th>
                <td className="px-5 py-5 text-ink">{referral.referredStudentName}</td>
                <td className="px-5 py-5 text-ink">
                  {referral.purchasedCourseTitle ? (
                    <>
                      {referral.purchasedCourseTitle}
                      <span className="mt-0.5 block text-sm text-ink-muted">
                        {referral.purchaseAmountMinor !== null &&
                          `${formatMoney(referral.purchaseAmountMinor, CHECKOUT_CURRENCY)} · `}
                        {referral.purchaseStatus === "refunded"
                          ? "Refunded, so it never qualified"
                          : referral.purchasedAt
                            ? formatCertificateDate(referral.purchasedAt)
                            : "Purchase completed"}
                      </span>
                    </>
                  ) : (
                    <span className="text-ink-muted">No purchase yet</span>
                  )}
                </td>
                <td className="px-5 py-5 whitespace-nowrap text-ink">
                  {formatCertificateDate(referral.referredAt)}
                </td>
                <td className="px-5 py-5">
                  <ReferralRewardBadge status={referral.rewardStatus} />
                  {referral.rewardStatus === "claimed" && referral.claimedCourseTitle && (
                    <span className="mt-1 block max-w-56 text-sm text-ink-muted">
                      {referral.claimedCourseTitle}
                    </span>
                  )}
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
              <p className="text-sm text-ink-muted">Course purchased</p>
              {referral.purchasedCourseTitle ? (
                <>
                  <p className="text-base font-semibold text-ink">{referral.purchasedCourseTitle}</p>
                  <p className="text-sm text-ink-muted">
                    {referral.purchaseAmountMinor !== null &&
                      `${formatMoney(referral.purchaseAmountMinor, CHECKOUT_CURRENCY)} · `}
                    {referral.purchaseStatus === "refunded"
                      ? "Refunded, so it never qualified"
                      : referral.purchasedAt
                        ? formatCertificateDate(referral.purchasedAt)
                        : "Purchase completed"}
                  </p>
                </>
              ) : (
                <p className="text-base text-ink-muted">No purchase yet</p>
              )}
            </div>

            <p className="mt-4 text-base text-ink-muted">Referred {formatCertificateDate(referral.referredAt)}</p>

            {referral.rewardStatus === "claimed" && referral.claimedCourseTitle && (
              <p className="mt-3 rounded-xl bg-secondary p-3 text-sm text-ink">
                <span className="font-semibold text-primary">Free course awarded:</span>{" "}
                {referral.claimedCourseTitle}
              </p>
            )}
          </li>
        ))}
      </ul>
    </>
  );
}
