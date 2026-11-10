"use client";

import { useEffect, useId, useState } from "react";
import { CircleAlert } from "lucide-react";
import { formatCoursePrice, type PriceChange } from "@/lib/admin/courses";
import { MAX_PRICE_USD } from "@/lib/instructor/course-draft";
import type { AdminCourse } from "@/types/admin-courses";
import { CourseActionDialog } from "./CourseActionDialog";

type EditCoursePriceDialogProps = {
  course: AdminCourse | null;
  busy?: boolean;
  onConfirm: (change: PriceChange) => void;
  onCancel: () => void;
};

/**
 * "Edit Price". New prices apply to future purchases only: payments
 * already made keep the price that was paid, and commissions already
 * earned from those sales are never recalculated. Changing a published
 * course's price needs one extra confirmation.
 */
export function EditCoursePriceDialog({ course, busy, onConfirm, onCancel }: EditCoursePriceDialogProps) {
  const [free, setFree] = useState(false);
  const [amount, setAmount] = useState("");
  const [accepted, setAccepted] = useState(false);
  const amountId = useId();
  const confirmId = useId();
  const groupName = useId();

  useEffect(() => {
    if (!course) return;
    setFree(course.priceUsd === null);
    setAmount(course.priceUsd === null ? "" : String(course.priceUsd));
    setAccepted(false);
  }, [course]);

  const published = course?.status === "published";
  const invalidAmount = !free && !/^\$?\d+(\.\d{1,2})?$/.test(amount.trim());

  return (
    <CourseActionDialog
      open={course !== null}
      title="Edit Course Price"
      confirmLabel="Save Changes"
      confirmDisabled={invalidAmount || (published && !accepted)}
      busy={busy}
      onConfirm={() => onConfirm(free ? { free: true } : { free: false, amount })}
      onCancel={onCancel}
    >
      {course && (
        <>
          <dl className="grid gap-x-6 gap-y-2 text-base sm:grid-cols-2">
            <div>
              <dt className="text-sm font-semibold text-ink-muted">Course name</dt>
              <dd className="font-semibold text-ink">{course.title}</dd>
            </div>
            <div>
              <dt className="text-sm font-semibold text-ink-muted">Current price</dt>
              <dd className="font-semibold text-ink">
                {formatCoursePrice(course.priceUsd, course.currency)} <span className="font-normal text-ink-muted">({course.currency})</span>
              </dd>
            </div>
          </dl>

          <fieldset className="flex flex-col gap-2">
            <legend className="text-base font-semibold text-ink">New price</legend>
            <label className="flex items-center gap-3 text-base text-ink">
              <input type="radio" name={groupName} checked={free} onChange={() => setFree(true)} className="size-5 accent-[#176b52]" />
              Free for everyone
            </label>
            <label className="flex items-center gap-3 text-base text-ink">
              <input type="radio" name={groupName} checked={!free} onChange={() => setFree(false)} className="size-5 accent-[#176b52]" />
              Paid course
            </label>
          </fieldset>

          {!free && (
            <div>
              <label htmlFor={amountId} className="text-base font-semibold text-ink">
                New price in {course.currency}
              </label>
              <div className="mt-2 flex items-center gap-2">
                <span aria-hidden="true" className="text-lg font-semibold text-ink">
                  $
                </span>
                <input
                  id={amountId}
                  type="text"
                  inputMode="decimal"
                  value={amount}
                  onChange={(event) => setAmount(event.target.value)}
                  aria-describedby={`${amountId}-help`}
                  className="h-12 w-40 rounded-xl border-2 border-line bg-surface px-4 text-base text-ink focus:border-primary"
                />
              </div>
              <p id={`${amountId}-help`} className={`mt-1 text-base ${invalidAmount && amount ? "text-[#9A3412]" : "text-ink-muted"}`}>
                Between $1 and ${MAX_PRICE_USD}, for example 29 or 29.99. Negative amounts aren&apos;t allowed.
              </p>
            </div>
          )}

          <p className="flex items-start gap-2 rounded-xl bg-canvas p-3 text-base text-ink">
            <CircleAlert aria-hidden="true" className="mt-0.5 size-5 shrink-0 text-[#6b4e00]" />
            The new price applies to future purchases only. Students who already paid keep the price they paid, past
            payment records are unchanged, and affiliate commissions already earned stay as they are.
          </p>

          {published && (
            <label htmlFor={confirmId} className="flex items-start gap-3 text-base text-ink">
              <input
                id={confirmId}
                type="checkbox"
                checked={accepted}
                onChange={(event) => setAccepted(event.target.checked)}
                className="mt-1 size-5 shrink-0 accent-[#176b52]"
              />
              This course is published. I confirm the new price should show in the catalogue from now on.
            </label>
          )}
        </>
      )}
    </CourseActionDialog>
  );
}
