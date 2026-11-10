"use client";

import { useEffect, useId, useState } from "react";
import { CircleAlert } from "lucide-react";
import type { AdminCourse } from "@/types/admin-courses";
import { CourseActionDialog, ReasonField } from "./CourseActionDialog";

type UnpublishCourseDialogProps = {
  course: AdminCourse | null;
  busy?: boolean;
  onConfirm: (reason: string) => void;
  onCancel: () => void;
};

/**
 * "Unpublish Course": takes a course out of the catalogue. Students who
 * already enrolled keep their access, progress and certificates, so the
 * dialog says exactly what does and doesn't change, and the administrator
 * has to accept that policy before the action is allowed.
 */
export function UnpublishCourseDialog({ course, busy, onConfirm, onCancel }: UnpublishCourseDialogProps) {
  const [reason, setReason] = useState("");
  const [accepted, setAccepted] = useState(false);
  const checkboxId = useId();

  useEffect(() => {
    if (course) {
      setReason("");
      setAccepted(false);
    }
  }, [course]);

  const enrolled = course?.enrolment?.enrolled ?? null;

  return (
    <CourseActionDialog
      open={course !== null}
      title="Unpublish This Course?"
      confirmLabel="Unpublish Course"
      danger
      confirmDisabled={reason.trim().length === 0 || !accepted}
      busy={busy}
      onConfirm={() => onConfirm(reason)}
      onCancel={onCancel}
    >
      {course && (
        <>
          <p>
            <strong className="text-ink">{course.title}</strong> will be removed from the public course catalogue.
          </p>
          <div className="rounded-xl bg-canvas p-4 text-base text-ink">
            <p className="font-semibold">What changes</p>
            <ul className="mt-1 list-disc pl-5 text-ink-muted">
              <li>New students can no longer find, buy or enrol in the course.</li>
              <li>It disappears from the catalogue, search and course links.</li>
            </ul>
            <p className="mt-3 font-semibold">What stays exactly as it is</p>
            <ul className="mt-1 list-disc pl-5 text-ink-muted">
              <li>
                {enrolled === null ? "Students already enrolled" : `The ${enrolled} students already enrolled`} keep
                access to their lessons.
              </li>
              <li>Payments, learning progress and certificates are all kept.</li>
            </ul>
          </div>
          <p className="flex items-start gap-2 text-base text-ink">
            <CircleAlert aria-hidden="true" className="mt-0.5 size-5 shrink-0 text-[#6b4e00]" />
            If you ever need existing learners to lose access as well, that is a separate policy decision and has to be
            agreed and recorded before anyone acts on it. This action never does it.
          </p>
          <ReasonField label="Why is this course being unpublished?" hint="Kept with the course for the record." value={reason} onChange={setReason} />
          <label htmlFor={checkboxId} className="flex items-start gap-3 text-base text-ink">
            <input
              id={checkboxId}
              type="checkbox"
              checked={accepted}
              onChange={(event) => setAccepted(event.target.checked)}
              className="mt-1 size-5 shrink-0 accent-[#176b52]"
            />
            I am authorised to remove this course from the catalogue, and I understand enrolled students keep their
            access.
          </label>
        </>
      )}
    </CourseActionDialog>
  );
}
