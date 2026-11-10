"use client";

import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { courseAction } from "@/app/admin/courses/actions";
import type { PriceChange } from "@/lib/admin/courses";
import type { AdminCourse } from "@/types/admin-courses";

/*
 * Running an administrator's decision from the browser.
 *
 * On the live site the server action does the work and checks everything
 * again. In the development preview the same rules run here on sample
 * data, the decision is remembered in this browser only, and every
 * message says so, so nothing ever pretends to be saved or sent.
 */

export type CourseDecisionInput =
  | { kind: "approve"; course: AdminCourse }
  | { kind: "reject"; course: AdminCourse; reason: string }
  | { kind: "unpublish"; course: AdminCourse; reason: string }
  | { kind: "price"; course: AdminCourse; price: PriceChange };

export type DecisionNotice = { ok: boolean; text: string } | null;

export function useCourseDecisions({ actorId: _actorId }: { actorId: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState<DecisionNotice>(null);
  const noticeRef = useRef<HTMLDivElement>(null);

  const announce = (next: DecisionNotice) => {
    setNotice(next);
    requestAnimationFrame(() => noticeRef.current?.focus());
  };

  const run = async (input: CourseDecisionInput): Promise<boolean> => {
    setBusy(true);
    try {
      const result = await courseAction(toRequest(input));
      announce({ ok: result.ok, text: result.message });
      if (result.ok) router.refresh();
      return result.ok;
    } catch {
      announce({ ok: false, text: "Something went wrong and nothing was changed. Please try again." });
      return false;
    } finally {
      setBusy(false);
    }
  };

  return { busy, notice, noticeRef, run, clearNotice: () => setNotice(null) };
}

function toRequest(input: CourseDecisionInput) {
  switch (input.kind) {
    case "approve":
      return { kind: "approve" as const, courseId: input.course.id };
    case "reject":
      return { kind: "reject" as const, courseId: input.course.id, reason: input.reason };
    case "unpublish":
      return { kind: "unpublish" as const, courseId: input.course.id, reason: input.reason };
    case "price":
      return { kind: "price" as const, courseId: input.course.id, price: input.price };
  }
}

