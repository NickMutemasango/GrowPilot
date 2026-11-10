import Link from "next/link";
import { ChevronDown, CircleCheck, FileText, PlayCircle } from "lucide-react";
import { LessonCompletionStatus } from "@/components/progress/LessonCompletionStatus";
import { formatMinutes } from "@/types/course";
import type { LearningModule } from "@/types/learning";
import type { LessonStatus } from "@/types/student";

const lessonTypes = {
  video: { icon: PlayCircle, label: "Video" },
  reading: { icon: FileText, label: "Reading" },
};

type CurriculumModuleProps = {
  module: LearningModule;
  number: number;
  currentSlug: string;
  /** Each lesson's status by slug; missing means "not started". */
  statuses: Record<string, LessonStatus>;
  isOpen: boolean;
  onToggle: () => void;
  id: string;
};

/** One module in the lesson sidebar: a button that opens and closes its lessons. */
export function CurriculumModule({
  module,
  number,
  currentSlug,
  statuses,
  isOpen,
  onToggle,
  id,
}: CurriculumModuleProps) {
  const containsCurrent = module.lessons.some((lesson) => lesson.slug === currentSlug);
  const completedCount = module.lessons.filter((lesson) => statuses[lesson.slug] === "completed").length;

  return (
    <li className="border-b border-line last:border-b-0">
      <h3>
        <button
          id={`${id}-button`}
          type="button"
          aria-expanded={isOpen}
          aria-controls={`${id}-panel`}
          onClick={onToggle}
          className="flex min-h-16 w-full items-center gap-3 px-4 py-3 text-left hover:bg-secondary/60"
        >
          <span className="flex-1">
            <span className="block text-sm font-semibold text-primary">
              Module {number}
              {containsCurrent && !isOpen && <span className="text-ink-muted"> · current lesson inside</span>}
            </span>
            <span className="block text-lg leading-snug font-bold text-ink">{module.title}</span>
            <span className="block text-sm text-ink-muted">
              {completedCount} of {module.lessons.length} lessons completed
            </span>
          </span>
          <ChevronDown
            aria-hidden="true"
            className={`size-6 shrink-0 text-primary transition-transform ${isOpen ? "rotate-180" : ""}`}
          />
        </button>
      </h3>

      <div id={`${id}-panel`} role="region" aria-labelledby={`${id}-button`} hidden={!isOpen}>
        <ol className="flex flex-col gap-1 px-2 pb-3">
          {module.lessons.map((lesson) => {
            const { icon: TypeIcon, label } = lessonTypes[lesson.type];
            const current = lesson.slug === currentSlug;
            const status = statuses[lesson.slug] ?? "not-started";
            // A green tick replaces the lesson-type icon once a lesson is done.
            const Icon = status === "completed" ? CircleCheck : TypeIcon;
            return (
              <li key={lesson.slug}>
                <Link
                  href={lesson.href}
                  aria-current={current ? "page" : undefined}
                  data-current={current || undefined}
                  className={`flex min-h-14 items-start gap-3 rounded-xl px-3 py-2.5 transition-colors ${
                    current
                      ? "bg-primary text-white"
                      : "text-ink hover:bg-secondary"
                  }`}
                >
                  <Icon
                    aria-hidden="true"
                    className={`mt-0.5 size-6 shrink-0 ${
                      current ? "text-white" : status === "completed" ? "fill-secondary text-primary" : "text-primary"
                    }`}
                  />
                  <span className="flex-1">
                    <span className="block text-base leading-snug font-semibold">
                      <span className={current ? "text-white/85" : "text-ink-muted"}>
                        Lesson {lesson.number}:{" "}
                      </span>
                      {lesson.title}
                    </span>
                    <span className={`block text-sm ${current ? "text-white/90" : "text-ink-muted"}`}>
                      {current && <span className="font-bold">You are here · </span>}
                      {label}, {formatMinutes(lesson.minutes)}
                    </span>
                    <span className="block text-sm">
                      <LessonCompletionStatus status={status} inverted={current} hideNotStarted />
                    </span>
                  </span>
                </Link>
              </li>
            );
          })}
        </ol>
      </div>
    </li>
  );
}
