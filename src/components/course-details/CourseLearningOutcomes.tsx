import { Check } from "lucide-react";
import { CourseSection } from "./CourseSection";

/** "What You'll Learn": outcomes in a two-column grid with check marks. */
export function CourseLearningOutcomes({ outcomes }: { outcomes: string[] }) {
  return (
    <CourseSection id="outcomes" title="What You'll Learn">
      <ul className="grid gap-3 rounded-3xl border border-line bg-surface p-5 sm:grid-cols-2 sm:gap-4 sm:p-7">
        {outcomes.map((outcome) => (
          <li key={outcome} className="flex items-start gap-3 rounded-2xl bg-canvas p-4 text-lg text-ink">
            <span className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-full bg-primary text-white">
              <Check aria-hidden="true" className="size-4" strokeWidth={3} />
            </span>
            {outcome}
          </li>
        ))}
      </ul>
    </CourseSection>
  );
}
