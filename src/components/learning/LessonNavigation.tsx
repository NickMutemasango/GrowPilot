import Link from "next/link";
import { ArrowLeft, ArrowRight } from "lucide-react";
import type { LessonSummary } from "@/types/learning";

type LessonNavigationProps = {
  previous: LessonSummary | null;
  next: LessonSummary | null;
};

const base =
  "flex min-h-16 items-center gap-3 rounded-2xl border-2 px-4 py-2.5 transition-colors";

/**
 * Big Previous / Next buttons. Each says which lesson it opens. On the first
 * or last lesson the button stays in place but is greyed out and explains why.
 */
export function LessonNavigation({ previous, next }: LessonNavigationProps) {
  return (
    <nav aria-label="Previous and next lesson" className="grid gap-3 sm:grid-cols-2">
      {previous ? (
        <Link
          href={previous.href}
          className={`${base} border-primary bg-surface text-primary hover:bg-secondary`}
        >
          <ArrowLeft aria-hidden="true" className="size-6 shrink-0" />
          <span className="min-w-0">
            <span className="block text-base font-bold">Previous Lesson</span>
            <span className="block text-sm text-ink-muted">
              Lesson {previous.number}: {previous.title}
            </span>
          </span>
        </Link>
      ) : (
        <Disabled icon="left" label="Previous Lesson" reason="This is the first lesson" />
      )}

      {next ? (
        <Link
          href={next.href}
          className={`${base} justify-between border-primary bg-primary text-left text-white shadow-button hover:bg-primary-hover sm:justify-end sm:text-right sm:col-start-2`}
        >
          <span className="min-w-0">
            <span className="block text-base font-bold">Next Lesson</span>
            <span className="block text-sm text-white/90">
              Lesson {next.number}: {next.title}
            </span>
          </span>
          <ArrowRight aria-hidden="true" className="size-6 shrink-0" />
        </Link>
      ) : (
        <Disabled icon="right" label="Next Lesson" reason="This is the last lesson" />
      )}
    </nav>
  );
}

function Disabled({ icon, label, reason }: { icon: "left" | "right"; label: string; reason: string }) {
  const Icon = icon === "left" ? ArrowLeft : ArrowRight;
  return (
    <button
      type="button"
      disabled
      className={`${base} cursor-not-allowed border-line bg-canvas text-ink-muted ${
        icon === "right" ? "justify-between text-left sm:justify-end sm:text-right" : "text-left"
      }`}
    >
      {icon === "left" && <Icon aria-hidden="true" className="size-6 shrink-0" />}
      <span>
        <span className="block text-base font-bold">{label}</span>
        <span className="block text-sm">{reason}</span>
      </span>
      {icon === "right" && <Icon aria-hidden="true" className="size-6 shrink-0" />}
    </button>
  );
}
