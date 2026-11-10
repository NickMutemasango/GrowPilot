import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { CircleCheck, Clock, MousePointerClick, ShoppingBag } from "lucide-react";
import { LearningProgressCard } from "@/components/dashboard/LearningProgressCard";
import { CopyLinkField } from "@/components/rewards/CopyLinkField";
import { CourseLinkBuilder } from "@/components/rewards/CourseLinkBuilder";
import { EarningsTable } from "@/components/rewards/EarningsTable";
import { rewardsPolicy } from "@/config/rewards";
import { getCurrentStudent, loginHref } from "@/lib/auth/session";
import { getAllCourses } from "@/lib/courses";
import { formatMoney } from "@/lib/payments/money";
import { calculateCommission } from "@/lib/rewards/rules";
import { getAffiliate, getAffiliateDashboard } from "@/lib/rewards/service";
import { getSiteUrl } from "@/lib/site";

/*
 * Never prerendered and never cached: this page depends on who is signed
 * in, and it must be built fresh for each request so its Content Security
 * Policy can carry that request's nonce.
 */
export const dynamic = "force-dynamic";

export const metadata: Metadata = { title: "Affiliate Dashboard", robots: { index: false } };

/** For approved affiliates only: links, totals and earnings. */
export default async function AffiliateDashboardPage() {
  const student = await getCurrentStudent();
  if (!student) redirect(loginHref("/affiliate/dashboard"));
  const affiliate = await getAffiliate(student.id);
  if (affiliate?.status !== "approved") redirect("/affiliate/apply");
  const data = { code: affiliate.code, ...(await getAffiliateDashboard(affiliate)) };

  const [siteUrl, courses] = await Promise.all([getSiteUrl(), getAllCourses()]);
  const paidCourses = courses.filter((course) => course.priceUsd !== null);
  const { summary } = data;
  const rate = rewardsPolicy.commissionRateBasisPoints / 100;

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-12 px-4 pt-8 pb-20 sm:px-6 sm:pt-10 lg:px-8">
      <header>
        <h1 className="text-3xl font-bold tracking-tight text-ink sm:text-4xl">Welcome to Your Affiliate Dashboard</h1>
        <p className="mt-2 text-xl text-ink-muted">Track your referrals, sales and commissions all in one place.</p>
      </header>

      <section aria-label="Your totals" className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <h2 className="sr-only">Your totals</h2>
        <LearningProgressCard
          icon={MousePointerClick}
          title="Total Referral Visits"
          value={summary.visits}
          description="People who opened your links."
        />
        <LearningProgressCard
          icon={ShoppingBag}
          title="Successful Sales"
          value={summary.successfulSales}
          description="Confirmed purchases through your links."
        />
        <MoneyCard
          icon={Clock}
          title="Pending Commissions"
          amount={formatMoney(summary.pendingMinor, summary.currency)}
          description="Waiting for the refund period to end."
        />
        <MoneyCard
          icon={CircleCheck}
          title="Approved Earnings"
          amount={formatMoney(summary.approvedMinor, summary.currency)}
          description="Checked and ready for payout."
        />
      </section>

      <section aria-labelledby="links-heading" className="grid gap-6 lg:grid-cols-2">
        <h2 id="links-heading" className="sr-only">
          Your affiliate links
        </h2>
        <div className="rounded-3xl border border-line bg-surface p-6 shadow-card sm:p-7">
          <h3 className="text-xl font-bold text-ink">Your Affiliate Link</h3>
          <p className="mt-1 mb-4 text-base text-ink-muted">Share this link to GrowPilot&apos;s courses.</p>
          <CopyLinkField
            link={`${siteUrl}/courses?ref=${data.code}`}
            label="Link to all courses"
            copyLabel="Copy Affiliate Link"
            shareText="Learn new skills at your own pace with GrowPilot Academy."
          />
        </div>
        <div className="rounded-3xl border border-line bg-surface p-6 shadow-card sm:p-7">
          <h3 className="text-xl font-bold text-ink">Link to One Course</h3>
          <p className="mt-1 mb-4 text-base text-ink-muted">Send someone straight to a course you recommend.</p>
          <CourseLinkBuilder siteUrl={siteUrl} code={data.code} courses={paidCourses} />
        </div>
      </section>

      <section aria-labelledby="commission-heading" className="rounded-3xl bg-secondary p-6 sm:p-8">
        <h2 id="commission-heading" className="text-2xl font-bold tracking-tight text-ink">
          How Your Commission Works
        </h2>
        <p className="mt-3 text-lg text-ink">
          You earn <strong>{rate}%</strong> of each qualifying course purchase made through your links.
          For example, a <strong>{formatMoney(2000)}</strong> sale earns you{" "}
          <strong>{formatMoney(calculateCommission(2000, rewardsPolicy.commissionRateBasisPoints))}</strong>.
        </p>
        <ul className="mt-4 flex flex-col gap-2 text-base text-ink">
          <li><strong>Pending:</strong> the payment is confirmed, and we wait {rewardsPolicy.commissionHoldDays} days in case of a refund.</li>
          <li><strong>Approved:</strong> checked and owed to you.</li>
          <li><strong>Paid:</strong> sent to you.</li>
          <li><strong>Reversed:</strong> the purchase was refunded, so no commission is due.</li>
        </ul>
        <p className="mt-4 text-base text-ink-muted">
          Payouts aren&apos;t available yet. GrowPilot will confirm how commission is worked out and how
          you&apos;ll be paid before the first payout. Buying through your own link doesn&apos;t earn commission.
        </p>
      </section>

      <EarningsTable rows={data.earnings} />
    </div>
  );
}

function MoneyCard({ icon: Icon, title, amount, description }: { icon: typeof Clock; title: string; amount: string; description: string }) {
  return (
    <div className="flex items-start gap-4 rounded-2xl border border-line bg-surface p-6 shadow-header">
      <span className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-secondary text-primary">
        <Icon aria-hidden="true" className="size-6" />
      </span>
      <div>
        <h3 className="text-lg font-semibold text-ink">{title}</h3>
        <p className="mt-1 text-4xl font-bold text-ink">{amount}</p>
        <p className="mt-1 text-base text-ink-muted">{description}</p>
      </div>
    </div>
  );
}
