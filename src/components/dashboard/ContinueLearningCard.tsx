import Image from "next/image";
import { ArrowRight, Info, PartyPopper } from "lucide-react";
import { ButtonLink } from "@/components/ui/Button";
import type { StudentCourse } from "@/types/student";
import { ProgressBar } from "./ProgressBar";

/**
 * The most important card: one big, obvious way to pick up where you left
 * off. The button opens the next lesson in the lesson player; for courses
 * whose lessons are not open yet, it opens the course page's lesson list
 * and a note says so.
 */
export function ContinueLearningCard({ item }: { item: StudentCourse | null }) {
  return (
    <section aria-labelledby="continue-heading">
      <h2 id="continue-heading" className="text-2xl font-bold tracking-tight text-ink sm:text-3xl">
        Continue Learning
      </h2>

      {item ? <ResumeCard item={item} /> : <AllDoneCard />}
    </section>
  );
}

function ResumeCard({ item }: { item: StudentCourse }) {
  const { course, nextLesson, progress, completedLessons, totalLessons } = item;
  const starting = item.status === "not-started";

  return (
    <article className="mt-5 grid overflow-hidden rounded-3xl border border-line bg-surface shadow-card md:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]">
      <div className="relative hidden bg-secondary md:block md:min-h-full">
        <Image
          src={course.image.src}
          alt={course.image.alt}
          fill
          priority
          sizes="(min-width: 768px) 40vw, 100vw"
          className="object-cover"
        />
      </div>

      <div className="flex flex-col p-6 sm:p-8">
        <div className="flex items-center gap-4">
          {/* Phones get a small thumbnail so the button stays near the top. */}
          <div className="relative size-16 shrink-0 overflow-hidden rounded-xl bg-secondary md:hidden">
            <Image src={course.image.src} alt="" fill sizes="64px" className="object-cover" />
          </div>
          <h3 className="text-2xl leading-snug font-bold text-ink sm:text-3xl">{course.title}</h3>
        </div>
        {nextLesson && (
          <p className="mt-3 text-lg text-ink">
            <span className="text-ink-muted">{starting ? "First lesson:" : "Current lesson:"} </span>
            <span className="font-semibold">{nextLesson.title}</span>
            <span className="mt-1 block text-base text-ink-muted">
              Lesson {nextLesson.number} · Module: {nextLesson.moduleTitle}
            </span>
          </p>
        )}

        <div className="mt-6">
          <ProgressBar
            value={progress}
            label={course.title}
            detail={`${completedLessons} of ${totalLessons} lessons done`}
            size="lg"
          />
        </div>

        <ButtonLink
          href={item.nextLessonHref ?? `/courses/${course.slug}#content`}
          size="lg"
          className="mt-7 w-full sm:w-auto sm:self-start"
        >
          {starting ? "Start Learning" : "Continue Learning"}
          <ArrowRight aria-hidden="true" className="size-6" />
        </ButtonLink>
        {!item.nextLessonHref && (
          <p className="mt-3 flex items-start gap-2 text-base text-ink-muted">
            <Info aria-hidden="true" className="mt-0.5 size-5 shrink-0" />
            Video lessons for this course are coming soon. For now, this opens the course&apos;s lesson list.
          </p>
        )}
      </div>
    </article>
  );
}

function AllDoneCard() {
  return (
    <div className="mt-5 flex flex-col items-start gap-4 rounded-3xl border border-line bg-surface p-6 shadow-card sm:flex-row sm:items-center sm:p-8">
      <span className="flex size-12 shrink-0 items-center justify-center rounded-full bg-accent text-ink">
        <PartyPopper aria-hidden="true" className="size-7" />
      </span>
      <div className="flex-1">
        <p className="text-xl font-bold text-ink">You have finished all your courses. Well done!</p>
        <p className="mt-1 text-lg text-ink-muted">Pick a new course whenever you are ready.</p>
      </div>
      <ButtonLink href="/courses" size="lg" className="w-full sm:w-auto">
        Explore Courses
      </ButtonLink>
    </div>
  );
}
