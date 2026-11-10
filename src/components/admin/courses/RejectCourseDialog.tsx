"use client";

import { useEffect, useState } from "react";
import type { AdminCourse } from "@/types/admin-courses";
import { CourseActionDialog, ReasonField } from "./CourseActionDialog";

type RejectCourseDialogProps = {
  course: AdminCourse | null;
  busy?: boolean;
  onConfirm: (reason: string) => void;
  onCancel: () => void;
};

/**
 * "Reject Course": returns the course to its instructor with feedback.
 * Nothing is deleted, and the instructor can edit and submit it again.
 */
export function RejectCourseDialog({ course, busy, onConfirm, onCancel }: RejectCourseDialogProps) {
  const [reason, setReason] = useState("");

  useEffect(() => {
    if (course) setReason("");
  }, [course]);

  return (
    <CourseActionDialog
      open={course !== null}
      title="Return This Course for Improvements?"
      confirmLabel="Reject Course"
      danger
      confirmDisabled={reason.trim().length === 0}
      busy={busy}
      onConfirm={() => onConfirm(reason)}
      onCancel={onCancel}
    >
      {course && (
        <>
          <p>
            <strong className="text-ink">{course.title}</strong> will go back to {course.instructorName} with your
            feedback. The course and everything in it are kept, and they can send it for review again.
          </p>
          <ReasonField
            label="What needs improving?"
            hint="The instructor will see this, so please be specific and kind."
            value={reason}
            onChange={setReason}
          />
        </>
      )}
    </CourseActionDialog>
  );
}
