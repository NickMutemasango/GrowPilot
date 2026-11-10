"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";
import { ChevronDown, ListOrdered } from "lucide-react";
import { LearningProgressSummary } from "@/components/progress/LearningProgressSummary";
import { getLessonStatus } from "@/lib/progress/calculate";
import { courseProgress } from "@/lib/progress/course-progress";
import type { CourseProgressRecord } from "@/types/progress";
import type { LearningModule } from "@/types/learning";
import type { LessonStatus } from "@/types/student";
import { CurriculumModule } from "./CurriculumModule";

type CourseCurriculumSidebarProps = {
  courseSlug: string;
  courseTitle: string;
  modules: LearningModule[];
  currentSlug: string;
  currentNumber: number;
  totalLessons: number;
  /** This student's saved progress, read on the server. */
  record?: CourseProgressRecord;
};

/**
 * All the course's lessons, with the current one highlighted.
 * Desktop: always shown, and scrolls on its own for long courses.
 * Phones and tablets: a clearly labelled panel that starts closed, so it
 * never covers the video.
 */
export function CourseCurriculumSidebar({
  courseSlug: _courseSlug,
  courseTitle,
  modules,
  currentSlug,
  currentNumber,
  totalLessons,
  record,
}: CourseCurriculumSidebarProps) {
  const baseId = useId();
  const lessonSlugs = useMemo(
    () => modules.flatMap((module) => module.lessons.map((lesson) => lesson.slug)),
    [modules],
  );
  const progress = courseProgress(record, lessonSlugs);
  const statuses = useMemo(() => {
    const result: Record<string, LessonStatus> = {};
    for (const slug of lessonSlugs) {
      result[slug] = getLessonStatus(slug, progress.record.completed, progress.record.started);
    }
    return result;
  }, [lessonSlugs, progress.record]);
  const listRef = useRef<HTMLDivElement>(null);
  const [panelOpen, setPanelOpen] = useState(false);
  // Only the module with the current lesson starts open.
  const [open, setOpen] = useState<boolean[]>(() =>
    modules.map((module) => module.lessons.some((lesson) => lesson.slug === currentSlug)),
  );

  // Scroll the sidebar (not the page) so the current lesson is visible.
  useEffect(() => {
    const list = listRef.current;
    const current = list?.querySelector<HTMLElement>("[data-current]");
    if (!list || !current || list.scrollHeight <= list.clientHeight) return;
    list.scrollTop = current.offsetTop - list.clientHeight / 3;
  }, []);

  const toggle = (index: number) =>
    setOpen((current) => current.map((value, i) => (i === index ? !value : value)));

  return (
    <nav
      aria-label="Course lessons"
      className="overflow-hidden rounded-2xl border-2 border-line bg-surface"
    >
      <button
        type="button"
        aria-expanded={panelOpen}
        aria-controls={`${baseId}-lessons`}
        onClick={() => setPanelOpen((value) => !value)}
        className="flex min-h-16 w-full items-center gap-3 px-4 py-3 text-left hover:bg-secondary/60 lg:hidden"
      >
        <ListOrdered aria-hidden="true" className="size-6 shrink-0 text-primary" />
        <span className="flex-1">
          <span className="block text-lg font-bold text-ink">
            {panelOpen ? "Hide Course Lessons" : "Show Course Lessons"}
          </span>
          <span className="block text-base text-ink-muted">
            You are on lesson {currentNumber} of {totalLessons}
            {` · ${progress.progress}% complete`}
          </span>
        </span>
        <ChevronDown
          aria-hidden="true"
          className={`size-6 shrink-0 text-primary transition-transform ${panelOpen ? "rotate-180" : ""}`}
        />
      </button>

      <div id={`${baseId}-lessons`} className={`${panelOpen ? "block" : "hidden"} border-t border-line lg:block lg:border-t-0`}>
        <div className="border-b border-line bg-secondary/60 px-4 py-4">
          <h2 className="text-lg leading-snug font-bold text-ink">{courseTitle}</h2>
          <p className="text-base text-ink-muted">
            {modules.length} modules · {totalLessons} lessons
          </p>
          <div className="mt-3">
            <LearningProgressSummary
              courseTitle={courseTitle}
              completed={progress.completedCount}
              total={progress.total}
              progress={progress.progress}
            />
          </div>
        </div>
        <div
          ref={listRef}
          className="relative lg:max-h-[calc(100dvh-var(--learn-header-height)-17rem)] lg:overflow-y-auto lg:overscroll-contain"
        >
          <ul>
            {modules.map((module, index) => (
              <CurriculumModule
                key={module.title}
                id={`${baseId}-module-${index}`}
                module={module}
                number={index + 1}
                currentSlug={currentSlug}
                statuses={statuses}
                isOpen={open[index]}
                onToggle={() => toggle(index)}
              />
            ))}
          </ul>
        </div>
      </div>
    </nav>
  );
}
