import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { ButtonLink } from "@/components/ui/Button";

type LessonHeaderProps = {
  /** Left out on pages without a lesson, such as "lesson not found". */
  courseTitle?: string;
  lessonLabel?: string;
  /** For phones, e.g. "Lesson 5 of 9". */
  lessonShortLabel?: string;
};

/**
 * The lesson player's own header: logo, where you are, and one clear way
 * back. No marketing links, so nothing pulls attention from the lesson.
 */
export function LessonHeader({ courseTitle, lessonLabel, lessonShortLabel }: LessonHeaderProps) {
  return (
    <header className="sticky top-0 z-40 border-b border-line bg-surface shadow-header">
      <div className="mx-auto flex min-h-[var(--learn-header-height)] max-w-[100rem] items-center gap-3 px-4 py-2 sm:gap-5 sm:px-6 lg:px-8">
        <Link
          href="/"
          aria-label="GrowPilot, go to the home page"
          className="inline-flex min-h-11 shrink-0 items-center rounded-lg"
        >
          <span aria-hidden="true" className="text-xl font-bold tracking-tight text-ink">
            GrowPilot
          </span>
        </Link>

        <div className="min-w-0 flex-1 border-l border-line pl-3 sm:pl-5">
          {courseTitle && (
            <>
              <p className="line-clamp-2 text-sm leading-snug font-semibold text-primary sm:truncate sm:text-base">
                <span className="sr-only">Course: </span>
                {courseTitle}
              </p>
              {lessonLabel && (
                <p className="text-base leading-snug font-bold text-ink sm:truncate sm:text-lg">
                  {/* Phones show the short label; the full title is right under the video. */}
                  <span className="whitespace-nowrap sm:hidden">{lessonShortLabel ?? lessonLabel}</span>
                  <span className="hidden sm:inline">{lessonLabel}</span>
                </p>
              )}
            </>
          )}
        </div>

        <ButtonLink href="/dashboard" variant="secondary" className="shrink-0 px-3 max-sm:text-base sm:px-5">
          <ArrowLeft aria-hidden="true" className="size-5" />
          <span className="sm:hidden">
            <span className="sr-only">Back to </span>My Courses
          </span>
          <span className="hidden sm:inline">Back to My Courses</span>
        </ButtonLink>
      </div>
    </header>
  );
}
