"use client";

import { useEffect, useId, useRef, useState } from "react";
import { CircleAlert, GraduationCap, Info, X } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { rewardCoursesFor, validateRewardCourse } from "@/lib/admin/referral-grants";
import type { AdminEnrolment, EnrolmentCourseChoice } from "@/types/admin-enrolments";
import type { AdminReferral } from "@/types/admin-referrals";
import { ReferralRewardBadge } from "./badges";
import { closeDialog } from "@/lib/ui/close-dialog";

type GrantFreeCourseDialogProps = {
  /** The approved referral being granted, or null when the dialog is closed. */
  referral: AdminReferral | null;
  /** The courses GrowPilot offers as a referral reward, and no others. */
  courses: EnrolmentCourseChoice[];
  /** Every enrolment on the page, so the same course is never granted twice. */
  enrolments: AdminEnrolment[];
  onCancel: () => void;
  onConfirm: (course: EnrolmentCourseChoice) => void;
};

/**
 * "Grant Free Course": choosing which reward course an approved
 * referral is swapped for.
 *
 * A FRONTEND DEMONSTRATION. Confirming records the claim and adds one
 * demonstration enrolment to the list the browser is already showing;
 * NOBODY IS GIVEN ACCESS TO ANYTHING, nothing is sent anywhere, and no
 * payment is involved — the course is free because the reward was
 * earned.
 */
export function GrantFreeCourseDialog({
  referral,
  courses,
  enrolments,
  onCancel,
  onConfirm,
}: GrantFreeCourseDialogProps) {
  const ref = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  const courseId = useId();
  const errorId = useId();
  const [chosen, setChosen] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (referral && !dialog.open) {
      setChosen("");
      setError(null);
      dialog.showModal();
    }
    if (!referral && dialog.open) closeDialog(dialog);
  }, [referral]);

  const options = referral ? rewardCoursesFor(referral.referrerStudentId, courses, enrolments) : [];

  const confirm = () => {
    if (!referral) return;
    const message = validateRewardCourse(referral.referrerStudentId, chosen, enrolments);
    setError(message);
    if (message) return;
    const course = courses.find((one) => one.id === chosen);
    if (course) onConfirm(course);
  };

  return (
    <dialog
      ref={ref}
      aria-labelledby={titleId}
      onCancel={(event) => {
        event.preventDefault();
        onCancel();
      }}
      className="m-auto max-h-[calc(100dvh-2rem)] w-[min(34rem,calc(100vw-2rem))] overflow-y-auto rounded-3xl border border-line bg-surface p-0 text-ink shadow-menu backdrop:bg-ink/50"
    >
      {referral && (
        <div className="p-6 sm:p-7">
          <div className="flex items-start justify-between gap-3">
            <div className="flex min-w-0 items-start gap-3">
              <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-secondary text-primary">
                <GraduationCap aria-hidden="true" className="size-5" />
              </span>
              <h2 id={titleId} className="text-2xl font-bold tracking-tight">
                Grant Free Course
              </h2>
            </div>
            <button
              type="button"
              onClick={onCancel}
              aria-label="Close without granting"
              title="Close without granting"
              className="inline-flex size-11 shrink-0 items-center justify-center rounded-xl text-ink-muted hover:bg-secondary hover:text-ink"
            >
              <X aria-hidden="true" className="size-5" />
            </button>
          </div>

          <p className="mt-4 text-base text-ink">
            Choose the course this approved reward is swapped for. The reward will be marked as Claimed and a
            demonstration enrolment added for the referrer.
          </p>

          <dl className="mt-5 grid gap-x-6 gap-y-3 rounded-2xl bg-canvas p-4 text-base sm:grid-cols-2">
            <Detail label="Referrer name">{referral.referrerName}</Detail>
            <Detail label="Referral code">
              <span className="font-mono text-sm">{referral.referralCode}</span>
            </Detail>
            <Detail label="Reward status">
              <ReferralRewardBadge status={referral.rewardStatus} />
            </Detail>
            <Detail label="Referred student">{referral.referredStudentName}</Detail>
          </dl>

          <div className="mt-5">
            <label htmlFor={courseId} className="block text-base font-semibold text-ink">
              Select free course <span className="font-normal text-ink-muted">(required)</span>
            </label>
            <select
              id={courseId}
              value={chosen}
              onChange={(event) => {
                setChosen(event.target.value);
                if (error) setError(validateRewardCourse(referral.referrerStudentId, event.target.value, enrolments));
              }}
              aria-invalid={error ? true : undefined}
              aria-describedby={error ? errorId : undefined}
              className={`mt-1.5 h-12 w-full rounded-xl border-2 bg-surface px-3 text-base text-ink focus:border-primary ${
                error ? "border-[#9A3412]" : "border-line"
              }`}
            >
              <option value="">Choose a reward course...</option>
              {options.map(({ course, enrolled }) => (
                <option key={course.id} value={course.id} disabled={enrolled}>
                  {course.title}
                  {enrolled ? " — already enrolled" : ""}
                </option>
              ))}
            </select>
            {error ? (
              <p id={errorId} role="alert" className="mt-1.5 flex items-start gap-2 text-sm font-semibold text-[#9A3412]">
                <CircleAlert aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
                {error}
              </p>
            ) : (
              <p className="mt-1.5 text-sm text-ink-muted">
                Only the courses GrowPilot offers as a referral reward are listed. One the referrer is already
                enrolled in cannot be chosen.
              </p>
            )}
          </div>

          <p className="mt-5 flex items-start gap-2 rounded-2xl bg-accent/25 p-3 text-sm text-ink">
            <Info aria-hidden="true" className="mt-0.5 size-5 shrink-0 text-[#6b4e00]" />
            <span>
              Frontend demonstration. The enrolment is a record in this browser only: no course access is given, no
              payment is involved, and nobody is notified from here.
            </span>
          </p>

          <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <Button variant="secondary" size="lg" onClick={onCancel}>
              Cancel
            </Button>
            <button
              type="button"
              onClick={confirm}
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-primary px-5 text-base font-semibold whitespace-nowrap text-white shadow-button transition-colors duration-150 hover:bg-primary-hover"
            >
              <GraduationCap aria-hidden="true" className="size-5" />
              Confirm Free Course
            </button>
          </div>
        </div>
      )}
    </dialog>
  );
}

function Detail({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1">
      <dt className="text-sm font-semibold text-ink-muted">{label}</dt>
      <dd className="font-semibold text-ink">{children}</dd>
    </div>
  );
}
