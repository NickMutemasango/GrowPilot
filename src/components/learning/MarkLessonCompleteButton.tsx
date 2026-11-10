"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { ArrowRight, Award, CircleAlert, CircleCheck } from "lucide-react";
import { markLessonCompleteAction, recordLessonVisitAction } from "@/app/learn/actions";
import { CourseCompletionMessage } from "@/components/progress/CourseCompletionMessage";
import { Button, ButtonLink } from "@/components/ui/Button";
import { certificateHref } from "@/lib/certificates/links";
import { courseProgress } from "@/lib/progress/course-progress";
import type { CourseProgressRecord } from "@/types/progress";
import type { LessonSummary } from "@/types/learning";

type MarkLessonCompleteButtonProps = {
  courseSlug: string;
  courseTitle: string;
  lessonSlug: string;
  lessonTitle: string;
  /** Every lesson slug in the course, in order. */
  lessonSlugs: string[];
  /** This student's saved progress, read on the server. */
  record?: CourseProgressRecord;
  next: LessonSummary | null;
};

/**
 * Marks the lesson complete. The work happens in a server action, which
 * takes the student from the session and writes to the progress store, so
 * nobody can complete a lesson on somebody else's behalf. Until a store is
 * configured the action says plainly that progress cannot be saved yet,
 * rather than showing the lesson as done.
 */
export function MarkLessonCompleteButton({
  courseSlug,
  courseTitle,
  lessonSlug,
  lessonTitle,
  lessonSlugs,
  record,
  next,
}: MarkLessonCompleteButtonProps) {
  const [saved, setSaved] = useState<CourseProgressRecord | undefined>(record);
  const [problem, setProblem] = useState<string | null>(null);
  const [justCompleted, setJustCompleted] = useState(false);
  const [saving, startSaving] = useTransition();
  const messageRef = useRef<HTMLParagraphElement>(null);
  const problemRef = useRef<HTMLParagraphElement>(null);
  const courseMessageRef = useRef<HTMLHeadingElement>(null);

  const progress = courseProgress(saved, lessonSlugs);

  useEffect(() => {
    void recordLessonVisitAction({ courseSlug, lessonSlug });
  }, [courseSlug, lessonSlug]);

  const isDone = progress.record.completed.includes(lessonSlug);
  const showCourseMessage = justCompleted && progress.certificate !== null;

  // The button is replaced by a message, so move keyboard focus to it.
  useEffect(() => {
    if (justCompleted) (showCourseMessage ? courseMessageRef : messageRef).current?.focus();
  }, [justCompleted, showCourseMessage]);

  useEffect(() => {
    if (problem) problemRef.current?.focus();
  }, [problem]);

  const complete = () => {
    setProblem(null);
    startSaving(async () => {
      const result = await markLessonCompleteAction({ courseSlug, lessonSlug });
      if (result.ok) {
        setSaved(result.record);
        setJustCompleted(true);
      } else {
        setProblem(result.message);
      }
    });
  };

  if (showCourseMessage && progress.certificate) {
    return (
      <CourseCompletionMessage
        ref={courseMessageRef}
        courseTitle={courseTitle}
        certificateHref={certificateHref(progress.certificate.id)}
        celebrate
      />
    );
  }

  if (!isDone) {
    return (
      <div className="flex flex-col gap-3">
        <div>
          <Button size="lg" variant="secondary" className="w-full sm:w-auto" disabled={saving} onClick={complete}>
            <CircleCheck aria-hidden="true" className="size-6" />
            {saving ? "Saving…" : "Mark Lesson as Complete"}
            <span className="sr-only">: {lessonTitle}</span>
          </Button>
        </div>
        {problem && <Problem ref={problemRef} message={problem} />}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 rounded-2xl border-2 border-primary bg-secondary p-4 sm:p-5">
      <p ref={messageRef} tabIndex={-1} className="flex items-center gap-3 text-lg font-bold text-primary-strong">
        <CircleCheck aria-hidden="true" className="size-7 shrink-0 fill-surface text-primary" />
        {justCompleted ? "Well done! You've completed this lesson." : "You have completed this lesson."}
      </p>
      <div className="flex flex-col gap-3 sm:flex-row">
        {next && (
          <ButtonLink href={next.href} size="lg" className="w-full sm:w-auto">
            Continue to Lesson {next.number}
            <ArrowRight aria-hidden="true" className="size-5" />
          </ButtonLink>
        )}
        {progress.certificate && (
          <ButtonLink
            href={certificateHref(progress.certificate.id)}
            variant={next ? "secondary" : "primary"}
            size="lg"
            className="w-full sm:w-auto"
          >
            <Award aria-hidden="true" className="size-5" />
            View My Certificate
          </ButtonLink>
        )}
      </div>
    </div>
  );
}

/** Says why nothing was saved, in plain words, and takes the keyboard to it. */
function Problem({ ref, message }: { ref: React.Ref<HTMLParagraphElement>; message: string }) {
  return (
    <p
      ref={ref}
      tabIndex={-1}
      role="status"
      className="flex items-start gap-2 text-base font-semibold text-[#9A3412]"
    >
      <CircleAlert aria-hidden="true" className="mt-0.5 size-5 shrink-0" />
      {message}
    </p>
  );
}
