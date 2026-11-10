import Image from "next/image";
import { ArrowRight, LayoutDashboard, PartyPopper } from "lucide-react";
import { ButtonLink } from "@/components/ui/Button";
import type { Course } from "@/types/course";

/** "You're Officially Enrolled!", shown only after the server has recorded the enrolment. */
export function EnrolmentConfirmation({ course, startHref }: { course: Course; startHref: string }) {
  return (
    <section aria-labelledby="enrolled-heading" className="mx-auto max-w-2xl text-center">
      <span className="mx-auto flex size-14 items-center justify-center rounded-full bg-accent text-ink">
        <PartyPopper aria-hidden="true" className="size-10" />
      </span>
      <h1 id="enrolled-heading" className="mt-6 text-4xl font-bold tracking-tight text-ink">
        You&apos;re Officially Enrolled!
      </h1>
      <p className="mt-4 text-xl leading-relaxed text-ink-muted">
        Congratulations on taking the next step in your learning journey. We&apos;re excited to have
        you with us!
      </p>

      <div className="mt-8 overflow-hidden rounded-3xl border border-line bg-surface text-left shadow-card">
        <div className="relative aspect-[16/7] bg-secondary">
          <Image src={course.image.src} alt={course.image.alt} fill sizes="(min-width: 672px) 672px, 100vw" className="object-cover" />
        </div>
        <div className="p-5 sm:p-6">
          <p className="text-base font-semibold text-primary">Your new course</p>
          <p className="text-2xl font-bold text-ink">{course.title}</p>
          <p className="mt-1 text-base text-ink-muted">
            With {course.instructor.name} · {course.duration}
          </p>
        </div>
      </div>

      <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
        <ButtonLink href={startHref} size="lg" className="w-full sm:w-auto">
          Start Learning
          <ArrowRight aria-hidden="true" className="size-5" />
        </ButtonLink>
        <ButtonLink href="/dashboard" variant="secondary" size="lg" className="w-full sm:w-auto">
          <LayoutDashboard aria-hidden="true" className="size-5" />
          Go to Dashboard
        </ButtonLink>
      </div>
    </section>
  );
}
