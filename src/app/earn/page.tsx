import type { Metadata } from "next";
import { ArrowRight, Gift, HandCoins, Info } from "lucide-react";
import { ProgrammeCard } from "@/components/rewards/ProgrammeCard";
import { ButtonLink } from "@/components/ui/Button";
import { getCurrentStudent } from "@/lib/auth/session";
import { getAffiliate, isTrackingAvailable } from "@/lib/rewards/service";

export const metadata: Metadata = {
  title: "Earn Rewards",
  description: "Share GrowPilot Academy with others and get rewarded: earn commission as an affiliate, or a free course for referring a friend.",
};

/** The two programmes, side by side. Open to everyone. */
export default async function EarnPage() {
  const student = await getCurrentStudent();
  const affiliate = student ? await getAffiliate(student.id) : null;

  return (
    <div className="mx-auto max-w-6xl px-4 pt-10 pb-20 sm:px-6 sm:pt-14 lg:px-8">
      <header className="max-w-3xl">
        <h1 className="text-4xl font-bold tracking-tight text-ink sm:text-5xl">Learn, Share &amp; Earn with GrowPilot</h1>
        <p className="mt-4 text-xl leading-relaxed text-ink-muted">
          Share the opportunity to learn with others and get rewarded for helping them grow.
        </p>
      </header>

      {affiliate?.status === "approved" && (
        <div className="mt-8 flex flex-col gap-3 rounded-2xl border-2 border-primary bg-secondary p-5 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-lg font-semibold text-ink">You&apos;re a GrowPilot affiliate.</p>
          <ButtonLink href="/affiliate/dashboard">
            Open My Affiliate Dashboard
            <ArrowRight aria-hidden="true" className="size-4" />
          </ButtonLink>
        </div>
      )}

      <div className="mt-10 grid gap-6 md:grid-cols-2">
        <ProgrammeCard
          icon={HandCoins}
          eyebrow="Become an Affiliate"
          title="Earn 60% Commission"
          description="Promote GrowPilot courses and earn commission whenever someone makes a qualifying purchase through your affiliate link."
          points={[
            "Example: a $20 course sale earns you $12.",
            "Share links to any course, or to the whole site.",
            "GrowPilot reviews each application before links are switched on.",
          ]}
          href={affiliate?.status === "approved" ? "/affiliate/dashboard" : "/affiliate/apply"}
          action={affiliate?.status === "approved" ? "Open Affiliate Dashboard" : "Become an Affiliate"}
        />
        <ProgrammeCard
          icon={Gift}
          eyebrow="Refer a Friend"
          title="Invite a Friend, Get a Free Course"
          description="Share GrowPilot with your friends. When an eligible friend joins and successfully purchases a course, you can earn a free course."
          points={[
            "Your friend joins using your personal link.",
            "Their first paid course earns you a free course.",
            "Open to every GrowPilot student.",
          ]}
          href="/refer"
          action="Refer a Friend"
        />
      </div>

      {!isTrackingAvailable() && (
        <p className="mt-8 flex items-start gap-3 rounded-2xl border-2 border-accent bg-accent/15 p-4 text-base text-ink">
          <Info aria-hidden="true" className="mt-0.5 size-5 shrink-0 text-[#6b4e00]" />
          <span>
            <strong className="font-semibold">Coming soon.</strong> We&apos;re still setting up both
            programmes, so links, sales and rewards aren&apos;t being tracked yet. Nobody has earned
            anything so far.
          </span>
        </p>
      )}
    </div>
  );
}
