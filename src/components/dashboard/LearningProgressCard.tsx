import { BookOpen, CircleCheck, CirclePlay, type LucideIcon } from "lucide-react";
import type { StudentCourse } from "@/types/student";

type LearningProgressCardProps = {
  icon: LucideIcon;
  title: string;
  value: number;
  description: string;
};

/** One simple number with a label. */
export function LearningProgressCard({ icon: Icon, title, value, description }: LearningProgressCardProps) {
  return (
    <div className="flex items-start gap-4 rounded-2xl border border-line bg-surface p-6 shadow-header">
      <span className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-secondary text-primary">
        <Icon aria-hidden="true" className="size-6" />
      </span>
      <div>
        <h3 className="text-lg font-semibold text-ink">{title}</h3>
        <p className="mt-1 text-4xl font-bold text-ink">{value}</p>
        <p className="mt-1 text-base text-ink-muted">{description}</p>
      </div>
    </div>
  );
}

/** "Your Learning Progress": three counts worked out from the student's courses. */
export function LearningProgressOverview({ courses }: { courses: StudentCourse[] }) {
  const inProgress = courses.filter((course) => course.status === "in-progress").length;
  const completed = courses.filter((course) => course.status === "completed").length;
  const plural = (count: number) => (count === 1 ? "course" : "courses");

  return (
    <section aria-labelledby="progress-heading">
      <h2 id="progress-heading" className="text-2xl font-bold tracking-tight text-ink sm:text-3xl">
        Your Learning Progress
      </h2>
      <div className="mt-5 grid gap-4 sm:grid-cols-3">
        <LearningProgressCard
          icon={BookOpen}
          title="Courses Enrolled"
          value={courses.length}
          description={`You have joined ${courses.length} ${plural(courses.length)}.`}
        />
        <LearningProgressCard
          icon={CirclePlay}
          title="Courses In Progress"
          value={inProgress}
          description="Started but not finished yet."
        />
        <LearningProgressCard
          icon={CircleCheck}
          title="Courses Completed"
          value={completed}
          description={completed ? "Well done!" : "Your first one is on its way."}
        />
      </div>
    </section>
  );
}
