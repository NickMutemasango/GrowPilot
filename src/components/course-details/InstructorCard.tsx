import type { Instructor } from "@/types/course";
import { CourseSection } from "./CourseSection";

const initials = (name: string) =>
  name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2);

/**
 * "Meet Your Instructor". Shows an initials placeholder instead of a photo
 * until real, approved instructor photos are available.
 */
export function InstructorCard({ instructor }: { instructor: Instructor }) {
  return (
    <CourseSection id="instructor" title="Meet Your Instructor">
      <div className="flex flex-col gap-5 rounded-3xl border border-line bg-surface p-6 sm:flex-row sm:items-start sm:gap-7 sm:p-8">
        <div
          aria-hidden="true"
          className="flex size-24 shrink-0 items-center justify-center rounded-full bg-primary text-3xl font-bold text-white ring-4 ring-secondary"
        >
          {initials(instructor.name)}
        </div>
        <div>
          <p className="text-2xl font-bold text-ink">{instructor.name}</p>
          <p className="mt-1 text-lg font-semibold text-primary">{instructor.title}</p>
          <p className="mt-3 max-w-2xl text-lg leading-relaxed text-ink-muted">{instructor.bio}</p>
          <p className="mt-4 text-base text-ink-muted italic">
            Sample profile. Full instructor details coming soon.
          </p>
        </div>
      </div>
    </CourseSection>
  );
}
