import type { ReactNode } from "react";

type CourseSectionProps = {
  id: string;
  title: string;
  children: ReactNode;
};

/** A titled block on the course page, with consistent spacing and heading. */
export function CourseSection({ id, title, children }: CourseSectionProps) {
  const headingId = `${id}-heading`;

  return (
    <section id={id} aria-labelledby={headingId} className="scroll-mt-28">
      <h2 id={headingId} className="text-xl font-bold tracking-tight text-ink sm:text-2xl">
        {title}
      </h2>
      <div className="mt-5">{children}</div>
    </section>
  );
}
