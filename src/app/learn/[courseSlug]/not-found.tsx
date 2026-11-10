import { ArrowLeft, SearchX } from "lucide-react";
import { LessonHeader } from "@/components/learning/LessonHeader";
import { ButtonLink } from "@/components/ui/Button";

export default function LessonNotFound() {
  return (
    <div className="[--learn-header-height:4.5rem] sm:[--learn-header-height:5rem]">
      <LessonHeader />
      <section className="mx-auto max-w-2xl px-4 py-20 text-center sm:px-6 sm:py-28">
        <span className="mx-auto flex size-14 items-center justify-center rounded-full bg-secondary text-primary">
          <SearchX aria-hidden="true" className="size-10" />
        </span>
        <h1 className="mt-6 text-4xl font-bold tracking-tight text-ink">Lesson not found</h1>
        <p className="mt-4 text-xl leading-relaxed text-ink-muted">
          We couldn&apos;t find this lesson. The link may be wrong, or the lessons for this course
          may not be open yet.
        </p>
        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <ButtonLink href="/dashboard" size="lg">
            <ArrowLeft aria-hidden="true" className="size-5" />
            Back to My Courses
          </ButtonLink>
          <ButtonLink href="/courses" variant="secondary" size="lg">
            Browse All Courses
          </ButtonLink>
        </div>
      </section>
    </div>
  );
}
