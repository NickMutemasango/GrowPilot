"use client";

import { useId, useState } from "react";
import { ChevronDown, FileText, PlayCircle } from "lucide-react";
import { countLessons, formatMinutes, type CourseModule } from "@/types/course";
import { CourseSection } from "./CourseSection";

const lessonTypes = {
  video: { icon: PlayCircle, label: "Video" },
  reading: { icon: FileText, label: "Reading" },
};

const totalMinutes = (module: CourseModule) =>
  module.lessons.reduce((sum, lesson) => sum + lesson.minutes, 0);

/**
 * "Course Content": modules that open and close to show their lessons.
 * Each module header is a real button (Enter / Space work), and the first
 * module starts open so people immediately see what a lesson looks like.
 */
export function CourseCurriculum({ modules }: { modules: CourseModule[] }) {
  const baseId = useId();
  const [open, setOpen] = useState<boolean[]>(() => modules.map((_, index) => index === 0));
  const allOpen = open.every(Boolean);
  const lessonCount = countLessons(modules);
  const courseMinutes = modules.reduce((sum, module) => sum + totalMinutes(module), 0);

  const toggle = (index: number) =>
    setOpen((current) => current.map((value, i) => (i === index ? !value : value)));

  // Lessons are numbered across the whole course, not per module.
  const firstLessonNumbers = modules.map((_, index) => countLessons(modules.slice(0, index)) + 1);

  return (
    <CourseSection id="content" title="Course Content">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-lg text-ink-muted">
          {modules.length} modules · {lessonCount} lessons · {formatMinutes(courseMinutes)} in total
        </p>
        <button
          type="button"
          onClick={() => setOpen(modules.map(() => !allOpen))}
          className="inline-flex min-h-11 items-center rounded-xl px-3 text-lg font-semibold text-primary underline-offset-4 hover:bg-secondary hover:underline"
        >
          {allOpen ? "Close all modules" : "Open all modules"}
        </button>
      </div>

      <ul className="mt-4 flex flex-col gap-3">
        {modules.map((module, index) => {
          const isOpen = open[index];
          const buttonId = `${baseId}-module-${index}`;
          const panelId = `${baseId}-panel-${index}`;
          const firstLesson = firstLessonNumbers[index];

          return (
            <li
              key={module.title}
              className={`overflow-hidden rounded-2xl border-2 bg-surface transition-colors ${
                isOpen ? "border-primary/40" : "border-line"
              }`}
            >
              <h3>
                <button
                  id={buttonId}
                  type="button"
                  aria-expanded={isOpen}
                  aria-controls={panelId}
                  onClick={() => toggle(index)}
                  className="flex min-h-16 w-full items-center gap-4 px-5 py-4 text-left hover:bg-secondary/60 sm:px-6"
                >
                  <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-secondary text-lg font-bold text-primary-strong">
                    {index + 1}
                  </span>
                  <span className="flex-1">
                    <span className="block text-base font-semibold text-primary">
                      Module {index + 1}
                    </span>
                    <span className="block text-xl font-bold text-ink">{module.title}</span>
                    <span className="mt-0.5 block text-base text-ink-muted">
                      {module.lessons.length} lessons · {formatMinutes(totalMinutes(module))}
                    </span>
                  </span>
                  <span className="hidden text-base font-semibold text-primary sm:inline">
                    {isOpen ? "Close" : "Open"}
                  </span>
                  <ChevronDown
                    aria-hidden="true"
                    className={`size-6 shrink-0 text-primary transition-transform ${isOpen ? "rotate-180" : ""}`}
                  />
                </button>
              </h3>

              <div id={panelId} role="region" aria-labelledby={buttonId} hidden={!isOpen}>
                <ol start={firstLesson} className="border-t border-line">
                  {module.lessons.map((lesson, lessonIndex) => {
                    const { icon: Icon, label } = lessonTypes[lesson.type];
                    return (
                      <li
                        key={lesson.title}
                        className="flex items-center gap-4 border-b border-line px-5 py-4 last:border-b-0 sm:pl-[4.75rem]"
                      >
                        <Icon aria-hidden="true" className="size-6 shrink-0 text-primary" />
                        <span className="flex-1 text-lg text-ink">
                          <span className="text-ink-muted">Lesson {firstLesson + lessonIndex}: </span>
                          {lesson.title}
                        </span>
                        <span className="shrink-0 text-right text-base text-ink-muted">
                          <span className="block font-medium">{label}</span>
                          {formatMinutes(lesson.minutes)}
                        </span>
                      </li>
                    );
                  })}
                </ol>
              </div>
            </li>
          );
        })}
      </ul>
    </CourseSection>
  );
}
