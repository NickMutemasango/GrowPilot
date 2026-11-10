import { ArrowRight, Sprout } from "lucide-react";
import { ButtonLink } from "@/components/ui/Button";

/** Shown to students with no courses: no empty stats, just one clear next step. */
export function EmptyDashboardState() {
  return (
    <section
      aria-labelledby="empty-heading"
      className="flex flex-col items-center rounded-3xl border border-line bg-surface px-6 py-14 text-center shadow-card sm:px-12 sm:py-20"
    >
      <span className="flex size-14 items-center justify-center rounded-full bg-secondary text-primary">
        <Sprout aria-hidden="true" className="size-10" />
      </span>
      <h2 id="empty-heading" className="mt-6 text-3xl font-bold tracking-tight text-ink sm:text-4xl">
        Your Learning Journey Starts Here!
      </h2>
      <p className="mt-4 max-w-xl text-lg leading-relaxed text-ink-muted sm:text-xl">
        You haven&apos;t enrolled in any courses yet. Explore our courses and find something
        you&apos;d love to learn.
      </p>
      <ButtonLink href="/courses" size="lg" className="mt-8 w-full sm:w-auto">
        Browse Courses
        <ArrowRight aria-hidden="true" className="size-6" />
      </ButtonLink>
    </section>
  );
}

/** "Ready to Learn Something New?" banner at the bottom of the dashboard. */
export function ExploreMoreCourses() {
  return (
    <section
      aria-labelledby="explore-heading"
      className="flex flex-col items-start gap-6 rounded-3xl bg-primary p-8 text-white shadow-photo sm:p-10 md:flex-row md:items-center md:justify-between"
    >
      <div>
        <h2 id="explore-heading" className="text-2xl font-bold tracking-tight sm:text-3xl">
          Ready to Learn Something New?
        </h2>
        <p className="mt-2 text-lg text-white/90 sm:text-xl">
          Explore more courses and continue building your skills.
        </p>
      </div>
      <ButtonLink
        href="/courses"
        variant="secondary"
        size="lg"
        className="w-full shrink-0 border-white md:w-auto"
      >
        Explore Courses
        <ArrowRight aria-hidden="true" className="size-6" />
      </ButtonLink>
    </section>
  );
}
