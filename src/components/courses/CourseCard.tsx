import Image from "next/image";
import { ArrowRight, Clock } from "lucide-react";
import { ButtonLink } from "@/components/ui/Button";
import { formatPrice, getCategoryLabel, type Course } from "@/types/course";
import { CourseLevelBadge } from "./CourseLevelBadge";

/** One course in the catalogue: picture, what it is, and a clear next step. */
export function CourseCard({ course }: { course: Course }) {
  const isFree = course.priceUsd === null;

  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-2xl border border-line bg-surface shadow-header transition-shadow duration-200 hover:shadow-card">
      <div className="relative aspect-[16/10] overflow-hidden bg-secondary">
        <Image
          src={course.image.src}
          alt={course.image.alt}
          fill
          sizes="(min-width: 1280px) 400px, (min-width: 768px) 50vw, 100vw"
          className="object-cover transition-transform duration-300 motion-safe:group-hover:scale-[1.03]"
        />
        <span
          className={`absolute top-4 right-4 rounded-full px-3.5 py-1 text-base font-bold shadow-button ${
            isFree ? "bg-accent text-ink" : "bg-surface text-ink"
          }`}
        >
          <span className="sr-only">Price: </span>
          {formatPrice(course.priceUsd)}
        </span>
      </div>

      <div className="flex flex-1 flex-col p-6">
        <p className="text-base font-semibold text-primary">
          {getCategoryLabel(course.category)}
        </p>
        <h3 className="mt-1.5 text-lg leading-snug font-bold text-ink sm:text-xl">
          {course.title}
        </h3>
        {/*
          One line only, so every card in the grid lines up. The full
          sentence is still in the page for screen readers and for the
          tooltip, and it is shown in full on the course page.
        */}
        <p className="mt-2.5 truncate text-lg leading-relaxed text-ink-muted" title={course.description}>
          {course.description}
        </p>

        <dl className="mt-5 flex flex-col gap-2.5 text-base text-ink">
          {/* The instructor is named on the course page, not here, so the
              card stays short. */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <dt className="flex items-center">
                <Clock aria-hidden="true" className="size-5 text-primary" />
                <span className="sr-only">Duration</span>
              </dt>
              <dd>{course.duration}</dd>
            </div>
            <div>
              <dt className="sr-only">Level</dt>
              <dd>
                <CourseLevelBadge level={course.level} />
              </dd>
            </div>
          </div>
        </dl>

        <ButtonLink
          href={`/courses/${course.slug}`}
          size="lg"
          className="mt-6 w-full"
        >
          View Course
          <span className="sr-only">: {course.title}</span>
          <ArrowRight aria-hidden="true" className="size-5" />
        </ButtonLink>
      </div>
    </article>
  );
}
