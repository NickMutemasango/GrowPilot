"use client";

import Image from "next/image";
import { useActionState } from "react";
import { Gift, PartyPopper } from "lucide-react";
import { redeemRewardAction } from "@/app/earn/actions";
import { ActionMessage } from "@/components/checkout/ActionMessage";
import { Button } from "@/components/ui/Button";
import type { Course } from "@/types/course";

type RewardCourseOptionsProps = {
  rewardId: string;
  courses: Course[];
};

/** "Congratulations! You've Earned a Free Course!" and the courses it can be swapped for. */
export function RewardCourseOptions({ rewardId, courses }: RewardCourseOptionsProps) {
  const [state, action, pending] = useActionState(redeemRewardAction, { message: null });

  return (
    <section aria-labelledby="reward-heading" className="rounded-3xl border-2 border-primary bg-secondary p-6 sm:p-8">
      <span className="flex size-12 items-center justify-center rounded-full bg-accent text-ink">
        <PartyPopper aria-hidden="true" className="size-7" />
      </span>
      <h2 id="reward-heading" className="mt-4 text-2xl font-bold tracking-tight text-ink sm:text-3xl">
        Congratulations! You&apos;ve Earned a Free Course!
      </h2>
      <p className="mt-2 text-lg text-ink">
        Your friend successfully enrolled in a course. Thank you for helping someone learn!
      </p>

      <h3 id="choose-course" className="mt-6 scroll-mt-28 text-xl font-bold text-ink">
        Claim My Free Course
      </h3>
      {courses.length === 0 ? (
        <p className="mt-2 text-lg text-ink">
          GrowPilot is still choosing which courses you can pick. Your reward is saved and will be
          ready to use soon.
        </p>
      ) : (
        <>
          <p className="mt-1 text-lg text-ink-muted">Choose one course. You can only claim it once.</p>
          <ul className="mt-4 grid gap-4 md:grid-cols-2">
            {courses.map((course) => (
              <li key={course.slug} className="flex flex-col overflow-hidden rounded-2xl border border-line bg-surface">
                <div className="relative aspect-[16/9] bg-secondary">
                  <Image src={course.image.src} alt="" fill sizes="(min-width: 768px) 400px, 100vw" className="object-cover" />
                </div>
                <div className="flex flex-1 flex-col p-5">
                  <p className="text-lg font-bold text-ink">{course.title}</p>
                  <p className="mt-1 text-base text-ink-muted">
                    {course.duration} · {course.level}
                  </p>
                  <form action={action} className="mt-auto pt-4">
                    <input type="hidden" name="rewardId" value={rewardId} />
                    <input type="hidden" name="courseSlug" value={course.slug} />
                    <Button type="submit" size="lg" className="w-full" disabled={pending}>
                      <Gift aria-hidden="true" className="size-5" />
                      Claim This Course
                      <span className="sr-only">: {course.title}</span>
                    </Button>
                  </form>
                </div>
              </li>
            ))}
          </ul>
        </>
      )}
      <ActionMessage message={state.message} />
    </section>
  );
}
