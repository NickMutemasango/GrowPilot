"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";
import { CircleAlert, Info, UserPlus, X } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { MAX_REASON_LENGTH, isAlreadyEnrolled, validateManualEnrolment } from "@/lib/admin/manual-enrolment";
import {
  EMPTY_MANUAL_ENROLMENT,
  type AdminEnrolment,
  type EnrolmentCourseChoice,
  type EnrolmentStudentOption,
  type ManualEnrolmentDraft,
  type ManualEnrolmentErrors,
} from "@/types/admin-enrolments";
import { SearchableSelect, type SearchableOption } from "./SearchableSelect";
import { closeDialog } from "@/lib/ui/close-dialog";

type EnrolStudentDialogProps = {
  open: boolean;
  students: EnrolmentStudentOption[];
  courses: EnrolmentCourseChoice[];
  /** Every enrolment already on the page, so the same pair can't be added twice. */
  existing: readonly AdminEnrolment[];
  onCancel: () => void;
  onConfirm: (draft: ManualEnrolmentDraft) => void;
};

/**
 * "Enrol a Student": pick an existing student and an existing course, and
 * the browser adds one record to the list it is already showing.
 *
 * This is a FRONTEND DEMONSTRATION. Nothing is sent to a server, no course
 * access is granted and no payment is taken — the dialog says so, so an
 * administrator reviewing the design is never misled.
 */
export function EnrolStudentDialog({ open, students, courses, existing, onCancel, onConfirm }: EnrolStudentDialogProps) {
  const ref = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  const reasonId = useId();
  const [draft, setDraft] = useState<ManualEnrolmentDraft>(EMPTY_MANUAL_ENROLMENT);
  const [errors, setErrors] = useState<ManualEnrolmentErrors>({});
  // Messages only appear once Confirm has been pressed, so the form never scolds anyone mid-typing.
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) {
      setDraft(EMPTY_MANUAL_ENROLMENT);
      setErrors({});
      setChecked(false);
      dialog.showModal();
    }
    if (!open && dialog.open) closeDialog(dialog);
  }, [open]);

  const studentOptions: SearchableOption[] = useMemo(
    () => students.map((student) => ({ value: student.id, label: student.fullName, hint: student.email })),
    [students],
  );

  // A course the student already has stays visible but can't be chosen: that explains the gap.
  const courseOptions: SearchableOption[] = useMemo(
    () =>
      courses.map((course) => {
        const taken = draft.studentId ? isAlreadyEnrolled(draft.studentId, course.id, existing) : false;
        return {
          value: course.id,
          label: course.title,
          hint: `${course.totalLessons} ${course.totalLessons === 1 ? "lesson" : "lessons"}`,
          disabled: taken,
          disabledNote: taken ? "Already enrolled" : undefined,
        };
      }),
    [courses, draft.studentId, existing],
  );

  const revalidate = (next: ManualEnrolmentDraft) => {
    setDraft(next);
    if (checked) setErrors(validateManualEnrolment(next, existing));
  };

  const confirm = () => {
    const found = validateManualEnrolment(draft, existing);
    setChecked(true);
    setErrors(found);
    if (Object.keys(found).length > 0) return;
    onConfirm({ ...draft, reason: draft.reason.trim().slice(0, MAX_REASON_LENGTH) });
  };

  const messages = [errors.studentId, errors.courseId].filter(Boolean) as string[];

  return (
    <dialog
      ref={ref}
      aria-labelledby={titleId}
      onCancel={(event) => {
        event.preventDefault();
        onCancel();
      }}
      className="m-auto max-h-[calc(100dvh-2rem)] w-[min(36rem,calc(100vw-2rem))] overflow-y-auto rounded-3xl border border-line bg-surface p-0 text-ink shadow-menu backdrop:bg-ink/50"
    >
      {open && (
        <div className="p-6 sm:p-7">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <h2 id={titleId} className="text-2xl font-bold tracking-tight">
                Enrol a Student
              </h2>
              <p className="mt-1 text-base text-ink-muted">
                Select a student and the course you would like to enrol them in.
              </p>
            </div>
            <button
              type="button"
              onClick={onCancel}
              aria-label="Close without enrolling"
              title="Close without enrolling"
              className="inline-flex size-11 shrink-0 items-center justify-center rounded-xl text-ink-muted hover:bg-secondary hover:text-ink"
            >
              <X aria-hidden="true" className="size-5" />
            </button>
          </div>

          <p className="mt-4 flex items-start gap-2 rounded-2xl bg-accent/25 p-3 text-sm text-ink">
            <Info aria-hidden="true" className="mt-0.5 size-5 shrink-0 text-[#6b4e00]" />
            Frontend demonstration. This adds a sample record to the table on this screen only — no course access is
            granted, nothing is saved to a server and no payment is taken.
          </p>

          {checked && messages.length > 0 && (
            <div
              role="alert"
              className="mt-4 flex items-start gap-2 rounded-2xl bg-[#FDECEA] p-3 text-base font-semibold text-[#9A3412]"
            >
              <CircleAlert aria-hidden="true" className="mt-0.5 size-5 shrink-0" />
              <span>
                {messages.length === 1 ? messages[0] : "Please check the highlighted fields below."}
              </span>
            </div>
          )}

          <div className="mt-5 flex flex-col gap-5">
            <SearchableSelect
              label="Select Student"
              placeholder="Search by name or email address..."
              options={studentOptions}
              value={draft.studentId}
              // The course is kept when the student changes, so a pair that is now a duplicate is
              // reported rather than silently cleared.
              onChange={(studentId) => revalidate({ ...draft, studentId })}
              error={errors.studentId}
              help="Type to narrow the list, then choose one student."
              emptyText="No student matches that name or email address."
            />

            <SearchableSelect
              label="Select Course"
              placeholder="Search by course title..."
              options={courseOptions}
              value={draft.courseId}
              onChange={(courseId) => revalidate({ ...draft, courseId })}
              error={errors.courseId}
              help={
                draft.studentId
                  ? "Courses this student is already on cannot be chosen again."
                  : "Choose a student first to see which courses they are already on."
              }
              emptyText="No course matches that title."
            />

            <div>
              <label htmlFor={reasonId} className="block text-base font-semibold text-ink">
                Enrolment Reason <span className="font-normal text-ink-muted">(optional)</span>
              </label>
              <textarea
                id={reasonId}
                rows={3}
                maxLength={MAX_REASON_LENGTH}
                value={draft.reason}
                onChange={(event) => revalidate({ ...draft, reason: event.target.value })}
                placeholder="Reason for manual enrolment (optional)"
                className="mt-1.5 w-full rounded-xl border-2 border-line bg-surface px-4 py-3 text-base text-ink placeholder:text-ink-muted focus:border-primary"
              />
              <p className="mt-1.5 text-sm text-ink-muted">
                A note for your own records. It is not shown to the student.
              </p>
            </div>
          </div>

          <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <Button variant="secondary" size="lg" onClick={onCancel}>
              Cancel
            </Button>
            <Button size="lg" onClick={confirm}>
              <UserPlus aria-hidden="true" className="size-5" />
              Confirm Enrolment
            </Button>
          </div>
        </div>
      )}
    </dialog>
  );
}
