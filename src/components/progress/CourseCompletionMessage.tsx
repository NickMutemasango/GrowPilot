import { forwardRef } from "react";
import { Award, PartyPopper } from "lucide-react";
import { ButtonLink } from "@/components/ui/Button";

type CourseCompletionMessageProps = {
  courseTitle: string;
  certificateHref: string;
  /** Show the short confetti burst (never shown when the device asks for reduced motion). */
  celebrate?: boolean;
};

const CONFETTI = [
  { left: "8%", delay: "0ms", color: "bg-accent" },
  { left: "18%", delay: "120ms", color: "bg-primary" },
  { left: "30%", delay: "60ms", color: "bg-accent" },
  { left: "44%", delay: "200ms", color: "bg-secondary-hover" },
  { left: "57%", delay: "40ms", color: "bg-primary" },
  { left: "69%", delay: "160ms", color: "bg-accent" },
  { left: "81%", delay: "90ms", color: "bg-primary" },
  { left: "92%", delay: "230ms", color: "bg-accent" },
];

/** "Congratulations! You've Completed Your Course!" with the way to the certificate. */
export const CourseCompletionMessage = forwardRef<HTMLHeadingElement, CourseCompletionMessageProps>(
  function CourseCompletionMessage({ courseTitle, certificateHref, celebrate }, headingRef) {
    return (
      <section
        aria-labelledby="course-complete-heading"
        className="relative overflow-hidden rounded-3xl border-2 border-primary bg-secondary p-6 text-center sm:p-8"
      >
        {celebrate && (
          <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-0 h-40 motion-reduce:hidden">
            {CONFETTI.map((piece) => (
              <span
                key={piece.left}
                className={`absolute -top-3 h-3 w-2 rounded-sm ${piece.color} motion-safe:animate-confetti`}
                style={{ left: piece.left, animationDelay: piece.delay }}
              />
            ))}
          </div>
        )}

        <span className="mx-auto flex size-12 items-center justify-center rounded-full bg-accent text-ink">
          <PartyPopper aria-hidden="true" className="size-8" />
        </span>
        <h2
          id="course-complete-heading"
          ref={headingRef}
          tabIndex={-1}
          className="mt-4 text-2xl font-bold tracking-tight text-ink sm:text-3xl"
        >
          Congratulations! You&apos;ve Completed Your Course!
        </h2>
        <p className="mx-auto mt-3 max-w-xl text-lg leading-relaxed text-ink">
          You&apos;ve worked hard and successfully completed <strong>{courseTitle}</strong>. We&apos;re
          proud of your achievement!
        </p>
        <ButtonLink href={certificateHref} size="lg" className="mt-6 w-full sm:w-auto">
          <Award aria-hidden="true" className="size-6" />
          View My Certificate
        </ButtonLink>
      </section>
    );
  },
);
