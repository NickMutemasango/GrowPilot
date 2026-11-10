"use client";

import { useActionState } from "react";
import { GraduationCap, LoaderCircle } from "lucide-react";
import { enrolInFreeCourseAction } from "@/app/checkout/actions";
import { Button } from "@/components/ui/Button";
import { ActionMessage } from "./ActionMessage";

/** "Enrol for Free": no payment page. Students who aren't logged in are sent to log in first. */
export function EnrolForFreeButton({ courseSlug }: { courseSlug: string }) {
  const [state, action, pending] = useActionState(enrolInFreeCourseAction, { message: null });

  return (
    <form action={action}>
      <input type="hidden" name="courseSlug" value={courseSlug} />
      <Button type="submit" size="lg" className="w-full" disabled={pending}>
        {pending ? (
          <LoaderCircle aria-hidden="true" className="size-5 motion-safe:animate-spin" />
        ) : (
          <GraduationCap aria-hidden="true" className="size-5" />
        )}
        {pending ? "Enrolling…" : "Enrol for Free"}
      </Button>
      <ActionMessage message={state.message} />
    </form>
  );
}
