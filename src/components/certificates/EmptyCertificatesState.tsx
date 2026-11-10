import { ArrowRight, Award } from "lucide-react";
import { ButtonLink } from "@/components/ui/Button";

/** Shown in "My Certificates" before any course is completed. */
export function EmptyCertificatesState() {
  return (
    <div className="mt-5 flex flex-col items-center rounded-3xl border-2 border-dashed border-line bg-surface px-6 py-12 text-center">
      <span className="flex size-12 items-center justify-center rounded-full bg-secondary text-primary">
        <Award aria-hidden="true" className="size-8" />
      </span>
      <h3 className="mt-5 text-2xl font-bold text-ink">Your Certificates Will Appear Here</h3>
      <p className="mt-2 max-w-md text-lg text-ink-muted">
        Complete a course to earn your first GrowPilot Academy certificate.
      </p>
      <ButtonLink href="/courses" variant="secondary" size="lg" className="mt-6 w-full sm:w-auto">
        Explore Courses
        <ArrowRight aria-hidden="true" className="size-5" />
      </ButtonLink>
    </div>
  );
}
