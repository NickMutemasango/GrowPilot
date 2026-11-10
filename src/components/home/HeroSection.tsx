import { ArrowRight, Check, MonitorSmartphone } from "lucide-react";
import { HeroIllustration } from "@/components/illustrations/HeroIllustration";
import { ButtonLink } from "@/components/ui/Button";
import { mainNav } from "@/config/navigation";

const coursesHref =
  mainNav.find((item) => item.label === "Explore Courses")?.href ?? "/courses";

const benefits = [
  "Easy-to-follow lessons",
  "Learn at your own pace",
  "Beginner-friendly courses",
];

/** Homepage hero: what GrowPilot Academy is, plus one clear next step. */
export function HeroSection() {
  return (
    <section
      aria-labelledby="hero-heading"
      className="relative isolate overflow-hidden"
    >
      {/* Soft decorative shapes; purely visual. */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -top-40 -right-32 size-[34rem] rounded-full bg-secondary" />
        <div className="absolute top-1/2 -left-48 size-96 rounded-full bg-secondary/60" />
      </div>

      <div className="mx-auto grid max-w-7xl items-center gap-12 px-4 pt-10 pb-16 sm:px-6 sm:pt-14 md:pb-20 lg:grid-cols-[1.05fr_1fr] lg:gap-16 lg:px-8 lg:py-24">
        {/* Text */}
        <div className="max-w-2xl motion-safe:animate-fade-up">
          <p className="inline-flex items-center gap-2 rounded-full border border-primary/15 bg-surface px-4 py-1.5 text-base font-semibold text-primary-strong shadow-button">
            <span aria-hidden="true" className="size-2 rounded-full bg-accent" />
            Welcome to GrowPilot Academy
          </p>

          <h1
            id="hero-heading"
            className="mt-5 text-4xl leading-[1.15] font-bold tracking-tight text-balance text-ink sm:text-5xl lg:text-6xl"
          >
            Learning Made{" "}
            <span className="relative whitespace-nowrap text-primary">
              Simple
              <span
                aria-hidden="true"
                className="absolute inset-x-0 bottom-1 -z-10 h-3 rounded-full bg-accent/70 sm:h-4"
              />
            </span>
            , For Everyone.
          </h1>

          <p className="mt-6 max-w-xl text-lg leading-relaxed text-ink-muted sm:text-xl">
            Discover practical courses, learn at your own pace, and build
            valuable skills. Whether you&apos;re starting something new or
            improving what you already know, we&apos;re here to guide you every
            step of the way.
          </p>

          <ButtonLink
            href={coursesHref}
            size="lg"
            className="group mt-8 w-full sm:w-auto"
          >
            Explore Courses
            <ArrowRight
              aria-hidden="true"
              className="size-6 transition-transform duration-150 motion-safe:group-hover:translate-x-1"
            />
          </ButtonLink>

          <ul className="mt-8 flex flex-col gap-3">
            {benefits.map((benefit) => (
              <li key={benefit} className="flex items-center gap-2.5 text-lg font-medium text-ink">
                <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-secondary text-primary">
                  <Check aria-hidden="true" className="size-4" strokeWidth={3} />
                </span>
                {benefit}
              </li>
            ))}
          </ul>
        </div>

        {/* Illustration */}
        <div className="relative mx-auto w-full max-w-2xl motion-safe:animate-fade-in motion-safe:[animation-delay:150ms] lg:max-w-none">
          <div
            aria-hidden="true"
            className="absolute -top-4 -right-4 hidden size-28 rounded-3xl bg-accent/80 sm:block"
          />
          <HeroIllustration
            priority
            sizes="(min-width: 1024px) 50vw, (min-width: 672px) 42rem, 100vw"
            className="aspect-[4/3] rounded-3xl shadow-photo ring-1 ring-ink/5"
          />

          <div className="absolute -bottom-6 left-4 flex items-center gap-3 rounded-2xl bg-surface px-5 py-4 shadow-card ring-1 ring-ink/5 sm:left-8">
            <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-secondary text-primary">
              <MonitorSmartphone aria-hidden="true" className="size-6" />
            </span>
            <p className="text-lg font-semibold text-ink">Learn Anytime, Anywhere</p>
          </div>
        </div>
      </div>
    </section>
  );
}
