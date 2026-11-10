import { CircleCheck, UsersRound } from "lucide-react";
import { CourseSection } from "./CourseSection";

/** "Before You Start": what you need, written to reassure beginners. */
export function CourseRequirements({ requirements }: { requirements: string[] }) {
  return (
    <CourseSection id="before-you-start" title="Before You Start">
      <div className="rounded-3xl border border-line bg-surface p-6 sm:p-8">
        <p className="text-lg text-ink">Here is everything you need to take part:</p>
        <ul className="mt-4 flex flex-col gap-3.5">
          {requirements.map((item) => (
            <li key={item} className="flex items-start gap-3 text-lg text-ink">
              <CircleCheck aria-hidden="true" className="mt-0.5 size-6 shrink-0 text-primary" />
              {item}
            </li>
          ))}
        </ul>
      </div>
    </CourseSection>
  );
}

/** "Who Should Take This Course?": simple examples of suitable learners. */
export function CourseAudience({ audience }: { audience: string[] }) {
  return (
    <CourseSection id="who-is-it-for" title="Who Should Take This Course?">
      <ul className="grid gap-3 sm:grid-cols-2">
        {audience.map((item) => (
          <li
            key={item}
            className="flex items-center gap-3.5 rounded-2xl bg-secondary px-5 py-4 text-lg font-medium text-ink"
          >
            <UsersRound aria-hidden="true" className="size-6 shrink-0 text-primary" />
            {item}
          </li>
        ))}
      </ul>
    </CourseSection>
  );
}
