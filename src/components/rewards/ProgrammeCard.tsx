import { ArrowRight, type LucideIcon } from "lucide-react";
import { ButtonLink } from "@/components/ui/Button";

type ProgrammeCardProps = {
  icon: LucideIcon;
  eyebrow: string;
  title: string;
  description: string;
  points: string[];
  href: string;
  action: string;
};

/** One of the two programmes on /earn. */
export function ProgrammeCard({ icon: Icon, eyebrow, title, description, points, href, action }: ProgrammeCardProps) {
  return (
    <article className="flex h-full flex-col rounded-3xl border border-line bg-surface p-6 shadow-card sm:p-8">
      <span className="flex size-12 items-center justify-center rounded-2xl bg-secondary text-primary">
        <Icon aria-hidden="true" className="size-7" />
      </span>
      <p className="mt-5 text-base font-semibold tracking-wide text-primary uppercase">{eyebrow}</p>
      <h2 className="mt-1 text-2xl font-bold tracking-tight text-ink sm:text-3xl">{title}</h2>
      <p className="mt-3 text-lg leading-relaxed text-ink-muted">{description}</p>
      <ul className="mt-5 flex flex-col gap-2 text-base text-ink">
        {points.map((point) => (
          <li key={point} className="flex gap-2">
            <span aria-hidden="true" className="mt-2 size-2 shrink-0 rounded-full bg-accent" />
            {point}
          </li>
        ))}
      </ul>
      <div className="mt-auto pt-6">
        <ButtonLink href={href} size="lg" className="w-full sm:w-auto">
          {action}
          <ArrowRight aria-hidden="true" className="size-5" />
        </ButtonLink>
      </div>
    </article>
  );
}
