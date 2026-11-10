import Image from "next/image";
import { ArrowRight, BarChart3, BookOpen, CircleCheck, Clock, ShoppingBag, Tag } from "lucide-react";
import { EnrolForFreeButton } from "@/components/checkout/EnrolForFreeButton";
import { ButtonLink } from "@/components/ui/Button";
import { formatPrice, type Course } from "@/types/course";

type CourseEnrollmentCardProps = {
  course: Course;
  lessonCount: number;
  /** Worked out on the server for the signed-in student. */
  access: { enrolled: boolean; continueHref: string };
};

/**
 * Price, key facts and one clear next step: "Continue Learning" if the
 * student already has the course, otherwise "Enrol for Free" or
 * "Buy This Course".
 */
export function CourseEnrollmentCard({ course, lessonCount, access }: CourseEnrollmentCardProps) {
  const isFree = course.priceUsd === null;

  const facts = [
    { icon: Clock, label: "Duration", value: course.duration },
    { icon: BarChart3, label: "Level", value: course.level },
    { icon: BookOpen, label: "Lessons", value: `${lessonCount} lessons` },
  ];

  return (
    <aside
      aria-label="Course price and enrolment"
      className="overflow-hidden rounded-3xl border border-line bg-surface shadow-card"
    >
      <div className="relative aspect-[16/9] bg-secondary">
        <Image
          src={course.image.src}
          alt={course.image.alt}
          fill
          priority
          sizes="(min-width: 1024px) 400px, 100vw"
          className="object-cover"
        />
      </div>

      <div className="p-6 sm:p-7">
        <p className="flex items-center gap-2.5">
          <Tag aria-hidden="true" className="size-6 text-primary" />
          <span className="sr-only">Price: </span>
          <span className="text-3xl font-bold text-ink">{formatPrice(course.priceUsd)}</span>
          {isFree && (
            <span className="rounded-full bg-accent px-3 py-0.5 text-base font-semibold text-ink">
              No cost to join
            </span>
          )}
        </p>

        <dl className="mt-5 divide-y divide-line border-y border-line">
          {facts.map(({ icon: Icon, label, value }) => (
            <div key={label} className="flex items-center justify-between gap-4 py-3.5 text-lg">
              <dt className="flex items-center gap-2.5 text-ink-muted">
                <Icon aria-hidden="true" className="size-5 text-primary" />
                {label}
              </dt>
              <dd className="font-semibold text-ink">{value}</dd>
            </div>
          ))}
        </dl>

        <div id="enrol" className="mt-6 scroll-mt-28">
          {access.enrolled ? (
            <>
              <ButtonLink href={access.continueHref} size="lg" className="w-full">
                Continue Learning
                <ArrowRight aria-hidden="true" className="size-5" />
              </ButtonLink>
              <p className="mt-3 flex items-center justify-center gap-2 text-base text-ink-muted">
                <CircleCheck aria-hidden="true" className="size-5 text-primary" />
                You are enrolled in this course.
              </p>
            </>
          ) : isFree ? (
            <EnrolForFreeButton courseSlug={course.slug} />
          ) : (
            <>
              <ButtonLink href={`/checkout/${course.slug}`} size="lg" className="w-full">
                <ShoppingBag aria-hidden="true" className="size-5" />
                Buy This Course
              </ButtonLink>
              <p className="mt-3 text-center text-base text-ink-muted">
                One payment of {formatPrice(course.priceUsd)}. No subscription.
              </p>
            </>
          )}
        </div>
      </div>
    </aside>
  );
}
