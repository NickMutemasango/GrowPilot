"use client";

import { CircleAlert, CircleCheck } from "lucide-react";
import { publishingProblems } from "@/lib/admin/courses";
import type { AdminCourse } from "@/types/admin-courses";
import { CourseActionDialog } from "./CourseActionDialog";

type ApproveCourseDialogProps = {
  course: AdminCourse | null;
  busy?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
};

/**
 * "Approve & Publish". The minimum publishing requirements are checked
 * here and again on the server, so an incomplete course can never go live.
 */
export function ApproveCourseDialog({ course, busy, onConfirm, onCancel }: ApproveCourseDialogProps) {
  const problems = course ? publishingProblems(course) : [];
  const republish = course?.status === "unpublished";

  return (
    <CourseActionDialog
      open={course !== null}
      title={republish ? "Publish This Course Again?" : "Approve and Publish This Course?"}
      confirmLabel={republish ? "Publish Again" : "Approve & Publish"}
      confirmDisabled={problems.length > 0}
      busy={busy}
      onConfirm={onConfirm}
      onCancel={onCancel}
    >
      {course && (
        <>
          <p>
            <strong className="text-ink">{course.title}</strong> by {course.instructorName} will appear in the public
            course catalogue, where students can find and enrol in it.
          </p>
          {problems.length === 0 ? (
            <p className="flex items-start gap-2 rounded-xl bg-secondary p-3 text-base text-primary-strong">
              <CircleCheck aria-hidden="true" className="mt-0.5 size-5 shrink-0" />
              This course meets every publishing requirement.
            </p>
          ) : (
            <div className="rounded-xl border-2 border-[#f3c7c2] bg-[#FDECEA] p-3 text-base text-[#9A3412]">
              <p className="flex items-start gap-2 font-semibold">
                <CircleAlert aria-hidden="true" className="mt-0.5 size-5 shrink-0" />
                This course can&apos;t be published yet:
              </p>
              <ul className="mt-2 list-disc pl-9">
                {problems.map((problem) => (
                  <li key={problem}>{problem}</li>
                ))}
              </ul>
              <p className="mt-2 pl-9">Please return it to the instructor instead, explaining what to change.</p>
            </div>
          )}
        </>
      )}
    </CourseActionDialog>
  );
}
