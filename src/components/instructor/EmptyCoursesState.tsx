import { BookPlus, Plus } from "lucide-react";
import { ButtonLink } from "@/components/ui/Button";

/** "You Haven't Created Any Courses Yet" */
export function EmptyCoursesState() {
  return (
    <div className="flex flex-col items-center rounded-3xl border-2 border-dashed border-line bg-surface px-6 py-14 text-center">
      <span className="flex size-12 items-center justify-center rounded-full bg-secondary text-primary">
        <BookPlus aria-hidden="true" className="size-8" />
      </span>
      <h2 className="mt-5 text-2xl font-bold text-ink">You Haven&apos;t Created Any Courses Yet</h2>
      <p className="mt-2 max-w-md text-lg text-ink-muted">Share your knowledge by creating your first course.</p>
      <ButtonLink href="/instructor/courses/create" size="lg" className="mt-6 w-full sm:w-auto">
        <Plus aria-hidden="true" className="size-5" />
        Create Your First Course
      </ButtonLink>
    </div>
  );
}
