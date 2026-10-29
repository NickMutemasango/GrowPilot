import Link from "next/link";
import { ArrowRight, type LucideIcon } from "lucide-react";

export type DepartmentTone = "brand" | "accent";

export type Department = {
  title: string;
  description: string;
  href: string;
  actionLabel: string;
  icon: LucideIcon;
  tone: DepartmentTone;
  stat: { value: string; label: string };
  tags: string[];
  /** Heading level for the title; use "h3" when the card sits under a section heading. */
  headingAs?: "h2" | "h3";
};

const tones: Record<
  DepartmentTone,
  { icon: string; glow: string; border: string; tag: string; link: string }
> = {
  brand: {
    icon: "from-brand-400 to-brand-600 shadow-brand-500/30",
    glow: "bg-brand-100",
    border: "hover:border-brand-200",
    tag: "bg-brand-50 text-brand-700 ring-brand-100",
    link: "text-brand-700",
  },
  accent: {
    icon: "from-accent-400 to-accent-600 shadow-accent-500/30",
    glow: "bg-accent-100",
    border: "hover:border-accent-200",
    tag: "bg-accent-50 text-accent-700 ring-accent-100",
    link: "text-accent-700",
  },
};

export default function DepartmentCard({
  title,
  description,
  href,
  actionLabel,
  icon: Icon,
  tone,
  stat,
  tags,
  headingAs: Heading = "h2",
}: Department) {
  const t = tones[tone];

  return (
    <article
      className={`group relative isolate h-full overflow-hidden rounded-3xl border border-slate-200 bg-white p-6 text-left shadow-soft transition-[transform,box-shadow,border-color] duration-300 hover:-translate-y-1 hover:shadow-card sm:p-8 ${t.border}`}
    >
      {/* Corner glow that warms up on hover. */}
      <div
        aria-hidden="true"
        className={`absolute -top-24 -right-24 -z-10 size-64 rounded-full opacity-60 blur-3xl transition-opacity duration-300 group-hover:opacity-100 ${t.glow}`}
      />

      <div className="flex items-start justify-between gap-4">
        <span
          className={`grid size-14 shrink-0 place-items-center rounded-2xl bg-linear-to-br text-white shadow-lg transition-transform duration-300 group-hover:scale-105 group-hover:-rotate-3 ${t.icon}`}
        >
          <Icon className="size-7" aria-hidden="true" />
        </span>
        <p className="text-right">
          <span className="block font-display text-2xl font-extrabold tracking-tight text-slate-900">
            {stat.value}
          </span>
          <span className="text-sm text-slate-500">{stat.label}</span>
        </p>
      </div>

      <Heading className="mt-6 font-display text-2xl font-bold tracking-tight text-slate-900">
        {title}
      </Heading>
      <p className="mt-2 leading-relaxed text-pretty text-slate-600">{description}</p>

      <ul className="mt-5 flex flex-wrap gap-2" aria-label={`${title} highlights`}>
        {tags.map((tag) => (
          <li
            key={tag}
            className={`rounded-full px-3 py-1 text-xs font-semibold ring-1 ring-inset ${t.tag}`}
          >
            {tag}
          </li>
        ))}
      </ul>

      {/* The ::after overlay stretches this link over the whole card. */}
      <Link
        href={href}
        className={`mt-7 inline-flex items-center gap-1.5 rounded-md font-semibold after:absolute after:inset-0 after:rounded-3xl ${t.link}`}
      >
        {actionLabel}
        <ArrowRight
          className="size-4 transition-transform duration-300 group-hover:translate-x-1"
          aria-hidden="true"
        />
      </Link>
    </article>
  );
}
