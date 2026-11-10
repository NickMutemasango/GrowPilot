import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { ArrowLeft, ArrowRight, Ban, Clock, HandCoins, Info } from "lucide-react";
import { AffiliateApplyForm } from "@/components/rewards/AffiliateApplyForm";
import { ButtonLink } from "@/components/ui/Button";
import { getCurrentStudent, loginHref } from "@/lib/auth/session";
import { getAffiliate, isTrackingAvailable } from "@/lib/rewards/service";
import type { AffiliateStatus } from "@/types/rewards";

/*
 * Never prerendered and never cached: this page depends on who is signed
 * in, and it must be built fresh for each request so its Content Security
 * Policy can carry that request's nonce.
 */
export const dynamic = "force-dynamic";

export const metadata: Metadata = { title: "Become an Affiliate", robots: { index: false } };

/** Apply, or see how an application is going. Needs a login. */
export default async function AffiliateApplyPage() {
  const student = await getCurrentStudent();
  if (!student) redirect(loginHref("/affiliate/apply"));
  const affiliate = await getAffiliate(student.id);
  if (affiliate?.status === "approved") redirect("/affiliate/dashboard");
  const status: AffiliateStatus | null = affiliate?.status ?? null;
  const defaults = { fullName: student.fullName, email: student.email };

  return (
    <div className="mx-auto max-w-3xl px-4 pt-8 pb-20 sm:px-6 sm:pt-10">
      <ButtonLink href="/earn" variant="secondary">
        <ArrowLeft aria-hidden="true" className="size-5" />
        Back to Earn Rewards
      </ButtonLink>

      {status === "pending" ? (
        <StatusMessage
          icon={Clock}
          title="Thank You for Applying!"
          text="Your application is waiting for review by the GrowPilot team. We'll let you know by email once it has been checked. You don't need to do anything else."
        />
      ) : status === "suspended" ? (
        <StatusMessage
          icon={Ban}
          title="Your Affiliate Account Is Paused"
          text="Your affiliate links aren't active at the moment, so new sales won't earn commission. Please contact us if you have any questions."
        />
      ) : (
        <>
          <span className="mt-8 flex size-12 items-center justify-center rounded-2xl bg-secondary text-primary">
            <HandCoins aria-hidden="true" className="size-7" />
          </span>
          <h1 className="mt-4 text-3xl font-bold tracking-tight text-ink sm:text-4xl">Become an Affiliate</h1>
          <p className="mt-3 text-xl leading-relaxed text-ink-muted">
            Share GrowPilot courses with your own link and earn <strong className="text-ink">60% commission</strong> on
            each qualifying purchase. Tell us a little about yourself and we&apos;ll review your application.
          </p>
          {!isTrackingAvailable() && (
            <p className="mt-6 flex items-start gap-3 rounded-2xl border-2 border-accent bg-accent/15 p-4 text-base text-ink">
              <Info aria-hidden="true" className="mt-0.5 size-5 shrink-0 text-[#6b4e00]" />
              Applications aren&apos;t open yet. You can fill in the form, but it won&apos;t be sent until we&apos;re ready.
            </p>
          )}
          <div className="mt-8 rounded-3xl border border-line bg-surface p-6 shadow-card sm:p-8">
            <AffiliateApplyForm defaults={defaults} />
          </div>
        </>
      )}
    </div>
  );
}

function StatusMessage({ icon: Icon, title, text }: { icon: typeof Clock; title: string; text: string }) {
  return (
    <section className="mt-10 text-center">
      <span className="mx-auto flex size-14 items-center justify-center rounded-full bg-secondary text-primary">
        <Icon aria-hidden="true" className="size-10" />
      </span>
      <h1 className="mt-6 text-3xl font-bold tracking-tight text-ink sm:text-4xl">{title}</h1>
      <p className="mx-auto mt-4 max-w-xl text-xl leading-relaxed text-ink-muted">{text}</p>
      <ButtonLink href="/dashboard" size="lg" className="mt-8">
        Go to My Dashboard
        <ArrowRight aria-hidden="true" className="size-5" />
      </ButtonLink>
    </section>
  );
}
