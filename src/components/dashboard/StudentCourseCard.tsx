import Image from "next/image";
import { Award, CircleCheck, CircleDashed, CirclePlay, UserRound } from "lucide-react";
import { ButtonLink } from "@/components/ui/Button";
import { certificateHref } from "@/lib/certificates/links";
import type { CourseStatus, StudentCourse } from "@/types/student";
import { ProgressBar } from "./ProgressBar";

const statusStyles: Record<
  CourseStatus,
  { label: string; icon: typeof CircleCheck; className: string }
> = {
  "not-started": {
    label: "Not Started",
    icon: CircleDashed,
    className: "bg-canvas text-ink ring-1 ring-line",
  },
  "in-progress": {
    label: "In Progress",
    icon: CirclePlay,
    className: "bg-accent/35 text-[#6b4e00]",
  },
  completed: {
    label: "Completed",
    icon: CircleCheck,
    className: "bg-primary text-white",
  },
};

/** One enrolled course with its status, progress and next step. */
export function StudentCourseCard({ item }: { item: StudentCourse }) {
  const { course, status, progress, completedLessons, totalLessons } = item;
  const { label, icon: StatusIcon, className } = statusStyles[status];
  const inProgress = status === "in-progress";

  return (
    <article className="flex h-full flex-col overflow-hidden rounded-2xl border border-line bg-surface shadow-header transition-shadow duration-200 hover:shadow-card">
      <div className="relative aspect-[16/9] bg-secondary">
        <Image
          src={course.image.src}
          alt={course.image.alt}
          fill
          sizes="(min-width: 1280px) 400px, (min-width: 768px) 50vw, 100vw"
          className="object-cover"
        />
        <span
          className={`absolute top-4 left-4 inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-base font-semibold shadow-button ${className}`}
        >
          <StatusIcon aria-hidden="true" className="size-5" />
          <span className="sr-only">Status: </span>
          {label}
        </span>
      </div>

      <div className="flex flex-1 flex-col p-6">
        <h3 className="text-xl leading-snug font-bold text-ink">{course.title}</h3>
        <p className="mt-2 flex items-center gap-2 text-base text-ink-muted">
          <UserRound aria-hidden="true" className="size-5 text-primary" />
          <span className="sr-only">Instructor: </span>
          {course.instructor.name}
        </p>

        <div className="mt-5">
          <ProgressBar
            value={progress}
            label={course.title}
            detail={`${completedLessons} of ${totalLessons} lessons completed`}
          />
        </div>

        <div className="mt-6 flex flex-col gap-3">
          {status === "completed" ? (
            <>
              <p className="flex items-center gap-2 text-lg font-bold text-primary-strong">
                <CircleCheck aria-hidden="true" className="size-6 text-primary" />
                Course Completed
              </p>
              {item.certificate && (
                <ButtonLink href={certificateHref(item.certificate.id)} size="lg" className="w-full">
                  <Award aria-hidden="true" className="size-5" />
                  View My Certificate
                  <span className="sr-only">: {course.title}</span>
                </ButtonLink>
              )}
              <ButtonLink
                href={item.firstLessonHref ?? `/courses/${course.slug}#content`}
                variant="secondary"
                size="lg"
                className="w-full"
              >
                Review Lessons
                <span className="sr-only">: {course.title}</span>
              </ButtonLink>
            </>
          ) : (
            <ButtonLink
              href={item.nextLessonHref ?? `/courses/${course.slug}${inProgress ? "#content" : ""}`}
              variant={inProgress ? "primary" : "secondary"}
              size="lg"
              className="w-full"
            >
              {inProgress ? "Continue Learning" : item.nextLessonHref ? "Start Learning" : "View Course"}
              <span className="sr-only">: {course.title}</span>
            </ButtonLink>
          )}
        </div>
      </div>
    </article>
  );
}
