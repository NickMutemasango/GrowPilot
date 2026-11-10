import type { Metadata } from "next";
import { CircleCheck, Clock, Gift, Info, PackageCheck, Users } from "lucide-react";
import { LearningProgressCard } from "@/components/dashboard/LearningProgressCard";
import { CopyLinkField } from "@/components/rewards/CopyLinkField";
import { HowReferralsWork } from "@/components/rewards/HowReferralsWork";
import { RewardCourseOptions } from "@/components/rewards/RewardCourseOptions";
import { ButtonLink } from "@/components/ui/Button";
import { getCurrentStudent, loginHref } from "@/lib/auth/session";
import { getReferralOverview, getRewardCourses } from "@/lib/rewards/service";
import { getSiteUrl } from "@/lib/site";
import type { Course } from "@/types/course";
import type { ReferralSummary } from "@/types/rewards";

export const metadata: Metadata = {
  title: "Refer a Friend",
  description: "Invite a friend to GrowPilot Academy and earn a free course when they buy their first course.",
};

/** Open to everyone; the personal link and totals appear once signed in. */
export default async function ReferPage() {
  let personal: { code: string; summary: ReferralSummary; rewardId: string | null; rewardCourses: Course[] } | null = null;

  const student = await getCurrentStudent();
  const overview = student ? await getReferralOverview(student.id) : null;
  const trackingOff = student !== null && overview === null;
  if (overview) {
    personal = {
      code: overview.code,
      summary: overview.summary,
      rewardId: overview.availableRewards[0]?.id ?? null,
      rewardCourses: await getRewardCourses(),
    };
  }
  const siteUrl = await getSiteUrl();

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-12 px-4 pt-8 pb-20 sm:px-6 sm:pt-10 lg:px-8">
      <header className="max-w-3xl">
        <span className="flex size-12 items-center justify-center rounded-2xl bg-accent text-ink">
          <Gift aria-hidden="true" className="size-7" />
        </span>
        <h1 className="mt-4 text-4xl font-bold tracking-tight text-ink sm:text-5xl">Invite a Friend, Earn a Free Course!</h1>
        <p className="mt-4 text-xl leading-relaxed text-ink-muted">
          Help someone discover new skills. When your friend makes a qualifying course purchase,
          you&apos;ll earn a free course reward.
        </p>
      </header>

      {personal ? (
        <>
          <section aria-labelledby="link-heading" className="rounded-3xl border border-line bg-surface p-6 shadow-card sm:p-8">
            <h2 id="link-heading" className="text-2xl font-bold tracking-tight text-ink">
              Your Personal Referral Link
            </h2>
            <p className="mt-1 mb-5 text-lg text-ink-muted">Send this link to a friend by message or email.</p>
            <CopyLinkField
              link={`${siteUrl}/register?ref=${personal.code}`}
              label="Your link"
              copyLabel="Copy Link"
              shareText="I'm learning with GrowPilot Academy. Join me using my link!"
            />
          </section>

          {personal.rewardId && (
            <RewardCourseOptions rewardId={personal.rewardId} courses={personal.rewardCourses} />
          )}

          <ReferralTotals summary={personal.summary} />
        </>
      ) : (
        <section className="flex flex-col gap-4 rounded-3xl border border-line bg-surface p-6 shadow-card sm:flex-row sm:items-center sm:justify-between sm:p-8">
          <p className="text-lg text-ink">
            {trackingOff ? (
              <span className="flex items-start gap-3">
                <Info aria-hidden="true" className="mt-1 size-5 shrink-0 text-[#6b4e00]" />
                Personal referral links are coming soon. Nobody has earned rewards yet.
              </span>
            ) : (
              "Log in to get your personal referral link."
            )}
          </p>
          {!trackingOff && (
            <div className="flex flex-col gap-3 sm:flex-row">
              <ButtonLink href={loginHref("/refer")} size="lg">
                Log In to Get My Link
              </ButtonLink>
              <ButtonLink href="/register?next=%2Frefer" variant="secondary" size="lg">
                Create an Account
              </ButtonLink>
            </div>
          )}
        </section>
      )}

      <HowReferralsWork />
    </div>
  );
}

function ReferralTotals({ summary }: { summary: ReferralSummary }) {
  const plural = (count: number, one: string, many: string) => `${count} ${count === 1 ? one : many}`;
  return (
    <section aria-labelledby="totals-heading">
      <h2 id="totals-heading" className="text-2xl font-bold tracking-tight text-ink">
        Your Referrals
      </h2>
      <p className="mt-1 text-lg text-ink-muted">
        {plural(summary.successful, "successful referral", "successful referrals")} ·{" "}
        {plural(summary.rewardsAvailable, "free course available", "free courses available")}
      </p>
      <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <LearningProgressCard icon={Users} title="Friends Invited" value={summary.friendsInvited} description="Joined with your link." />
        <LearningProgressCard icon={Clock} title="Pending" value={summary.pending} description="Joined, not bought a course yet." />
        <LearningProgressCard icon={CircleCheck} title="Successful" value={summary.successful} description="Bought a course." />
        <LearningProgressCard icon={Gift} title="Free Courses Earned" value={summary.rewardsEarned} description="One per successful friend." />
        <LearningProgressCard icon={PackageCheck} title="Rewards Used" value={summary.rewardsRedeemed} description="Free courses you've claimed." />
      </div>
    </section>
  );
}
