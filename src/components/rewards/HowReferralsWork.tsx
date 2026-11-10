import { Gift, Send, UserPlus } from "lucide-react";

const steps = [
  { icon: Send, title: "Share Your Link", text: "Send your personal referral link to a friend." },
  { icon: UserPlus, title: "Your Friend Joins", text: "Your friend creates a GrowPilot account using your link." },
  {
    icon: Gift,
    title: "Get Rewarded",
    text: "When your friend successfully purchases an eligible course, you earn a free course reward.",
  },
];

/** The three steps of Refer a Friend. */
export function HowReferralsWork() {
  return (
    <section aria-labelledby="how-heading">
      <h2 id="how-heading" className="text-2xl font-bold tracking-tight text-ink">
        How It Works
      </h2>
      <ol className="mt-5 grid gap-4 md:grid-cols-3">
        {steps.map(({ icon: Icon, title, text }, index) => (
          <li key={title} className="rounded-2xl border border-line bg-surface p-6">
            <div className="flex items-center gap-3">
              <span className="flex size-12 items-center justify-center rounded-xl bg-secondary text-primary">
                <Icon aria-hidden="true" className="size-6" />
              </span>
              <span className="text-base font-semibold text-primary">Step {index + 1}</span>
            </div>
            <h3 className="mt-4 text-xl font-bold text-ink">{title}</h3>
            <p className="mt-1 text-lg text-ink-muted">{text}</p>
          </li>
        ))}
      </ol>
      <p className="mt-4 text-base text-ink-muted">
        Signing up alone doesn&apos;t count: the reward comes after your friend&apos;s first paid course
        purchase is confirmed. You can&apos;t refer yourself, and each friend can earn you one reward.
      </p>
    </section>
  );
}
