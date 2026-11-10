import type { ReactNode } from "react";

type LearningLayoutProps = {
  header: ReactNode;
  /** Video, lesson title, completion and Next / Previous. */
  lesson: ReactNode;
  sidebar: ReactNode;
  /** Resources and notes, below the lesson on every screen size. */
  extras: ReactNode;
};

/**
 * Lesson player page frame.
 * Phones and tablets: one column, with the course lessons (a closed panel)
 * between the Next / Previous buttons and the notes, so the video stays first.
 * Desktop: the lesson on the left and the course lessons in a sticky sidebar.
 */
export function LearningLayout({ header, lesson, sidebar, extras }: LearningLayoutProps) {
  return (
    <div className="[--learn-header-height:4rem] sm:[--learn-header-height:4.5rem]">
      {header}
      <div className="mx-auto grid max-w-[100rem] gap-8 px-4 pt-5 pb-20 sm:px-6 sm:pt-8 lg:grid-cols-[minmax(0,1fr)_23rem] lg:gap-x-10 lg:gap-y-12 lg:px-8 xl:grid-cols-[minmax(0,1fr)_26rem]">
        <div className="min-w-0 lg:col-start-1 lg:row-start-1">{lesson}</div>
        <div className="min-w-0 lg:col-start-2 lg:row-span-2 lg:row-start-1">
          <div className="lg:sticky lg:top-[calc(var(--learn-header-height)+1.5rem)]">{sidebar}</div>
        </div>
        <div className="min-w-0 lg:col-start-1 lg:row-start-2">{extras}</div>
      </div>
    </div>
  );
}
