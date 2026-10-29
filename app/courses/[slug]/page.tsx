import { Suspense } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  BarChart3,
  BookOpen,
  Check,
  ChevronLeft,
  Clock,
  Infinity as InfinityIcon,
  Star,
  Users,
} from "lucide-react";
import DetailFallback from "@/components/catalog/DetailFallback";
import CourseCard, { levelStyle } from "@/components/courses/CourseCard";
import { ButtonLink } from "@/components/ui/Button";
import { courses, getCourse, getRelatedCourses } from "@/lib/courses";
import { subjectStyle } from "@/lib/subjects";

export function generateStaticParams() {
  return courses.map((course) => ({ slug: course.slug }));
}

export async function generateMetadata({ params }: PageProps<"/courses/[slug]">): Promise<Metadata> {
  const course = getCourse((await params).slug);
  if (!course) return {};
  return { title: `${course.title} — GrowPilot`, description: course.description };
}

function initials(name: string) {
  return name
    .replace(/^(Dr|Prof)\.\s+/, "")
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2);
}

const number = new Intl.NumberFormat("en");

// The route's shared shell can't depend on the URL, so the slug is read inside Suspense.
export default function CoursePage({ params }: PageProps<"/courses/[slug]">) {
  return (
    <Suspense fallback={<DetailFallback />}>
      <CourseDetail params={params} />
    </Suspense>
  );
}

async function CourseDetail({ params }: Pick<PageProps<"/courses/[slug]">, "params">) {
  const course = getCourse((await params).slug);
  if (!course) notFound();

  const s = subjectStyle[course.subject];
  const Icon = s.icon;
  const related = getRelatedCourses(course);

  return (
    <>
      <div className="relative isolate overflow-hidden">
        <div
          aria-hidden="true"
          className="absolute -top-32 left-1/2 -z-10 h-72 w-[48rem] -translate-x-1/2 rounded-full bg-brand-100/70 blur-3xl"
        />

        <div className="mx-auto grid max-w-6xl gap-10 px-4 py-8 sm:px-6 sm:py-12 lg:grid-cols-[minmax(0,1fr)_20rem] lg:px-8">
          <div className="min-w-0">
            <nav aria-label="Breadcrumb">
              <Link
                href="/courses"
                className="inline-flex items-center gap-1 rounded-md text-sm font-semibold text-brand-700 hover:text-brand-800"
              >
                <ChevronLeft className="size-4" aria-hidden="true" />
                All courses
              </Link>
            </nav>

            <header className="mt-6">
              <div className="flex flex-wrap items-center gap-2">
                <Link
                  href={`/courses?subject=${encodeURIComponent(course.subject)}`}
                  className="rounded-full bg-white px-3 py-1 text-xs font-semibold tracking-wide text-slate-600 uppercase ring-1 ring-slate-200 ring-inset hover:text-brand-700 hover:ring-brand-200"
                >
                  {course.subject}
                </Link>
                <span
                  className={`rounded-full px-3 py-1 text-xs font-semibold ${levelStyle[course.level]}`}
                >
                  {course.level}
                </span>
              </div>
              <h1 className="mt-4 font-display text-3xl font-extrabold tracking-tight text-balance text-slate-900 sm:text-4xl lg:text-5xl">
                {course.title}
              </h1>
              <p className="mt-4 max-w-2xl text-lg leading-relaxed text-pretty text-slate-600">
                {course.description}
              </p>

              <dl className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-slate-600">
                <div className="flex items-center gap-1.5">
                  <dt className="sr-only">Rating</dt>
                  <Star className="size-4 fill-accent-400 text-accent-400" aria-hidden="true" />
                  <dd>
                    <span className="font-semibold text-slate-900">{course.rating.toFixed(1)}</span>{" "}
                    rating
                  </dd>
                </div>
                <div className="flex items-center gap-1.5">
                  <dt className="sr-only">Students</dt>
                  <Users className="size-4 text-slate-400" aria-hidden="true" />
                  <dd>{number.format(course.students)} students</dd>
                </div>
                <div className="flex items-center gap-1.5">
                  <dt className="sr-only">Instructor</dt>
                  <dd>
                    Taught by <span className="font-semibold text-slate-900">{course.instructor}</span>
                  </dd>
                </div>
              </dl>
            </header>

            <section aria-labelledby="outcomes-heading" className="mt-12">
              <h2
                id="outcomes-heading"
                className="font-display text-2xl font-bold tracking-tight text-slate-900"
              >
                What you&apos;ll learn
              </h2>
              <ul className="mt-5 grid gap-3 rounded-2xl border border-slate-200 bg-white p-6 shadow-soft sm:grid-cols-2">
                {course.outcomes.map((outcome) => (
                  <li key={outcome} className="flex gap-3 text-slate-700">
                    <span className="mt-0.5 grid size-5 shrink-0 place-items-center rounded-full bg-success-50 text-success-600">
                      <Check className="size-3.5" aria-hidden="true" />
                    </span>
                    {outcome}
                  </li>
                ))}
              </ul>
            </section>

            <section aria-labelledby="curriculum-heading" className="mt-12">
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <h2
                  id="curriculum-heading"
                  className="font-display text-2xl font-bold tracking-tight text-slate-900"
                >
                  Curriculum
                </h2>
                <p className="text-sm text-slate-500">
                  {course.modules.length} modules · {course.lessons} lessons · {course.hours}h total
                </p>
              </div>
              <ol className="mt-5 divide-y divide-slate-100 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-soft">
                {course.modules.map((module, i) => (
                  <li key={module.title} className="flex items-center gap-4 px-5 py-4 sm:px-6">
                    <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-brand-50 font-display text-sm font-bold text-brand-700">
                      {i + 1}
                    </span>
                    <span className="min-w-0 flex-1 font-medium text-slate-900">{module.title}</span>
                    <span className="shrink-0 text-sm text-slate-500">{module.lessons} lessons</span>
                  </li>
                ))}
              </ol>
            </section>

            <section aria-labelledby="instructor-heading" className="mt-12">
              <h2
                id="instructor-heading"
                className="font-display text-2xl font-bold tracking-tight text-slate-900"
              >
                Your instructor
              </h2>
              <div className="mt-5 flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-soft">
                <span
                  aria-hidden="true"
                  className="grid size-14 shrink-0 place-items-center rounded-full bg-linear-to-br from-brand-400 to-brand-600 font-display text-lg font-bold text-white"
                >
                  {initials(course.instructor)}
                </span>
                <div>
                  <p className="font-display text-lg font-bold text-slate-900">{course.instructor}</p>
                  <p className="text-sm text-slate-500">{course.subject} instructor</p>
                </div>
              </div>
            </section>
          </div>

          {/* Desktop enrol card; small screens get the sticky bar below instead. */}
          <aside className="hidden lg:block">
            <div className="sticky top-24 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-card">
              <div className={`grid h-40 place-items-center bg-linear-to-br ${s.tile}`}>
                <Icon className={`size-16 ${s.iconColor}`} aria-hidden="true" />
              </div>
              <div className="p-6">
                <ButtonLink href="/signup" size="lg" className="w-full">
                  Start learning
                </ButtonLink>
                <p className="mt-3 text-center text-xs text-slate-500">
                  Create a free account to enrol.
                </p>
                <h2 className="mt-6 text-sm font-semibold text-slate-900">This course includes</h2>
                <ul className="mt-3 space-y-2.5 text-sm text-slate-600">
                  <li className="flex items-center gap-2.5">
                    <BookOpen className="size-4 text-slate-400" aria-hidden="true" />
                    {course.lessons} lessons in {course.modules.length} modules
                  </li>
                  <li className="flex items-center gap-2.5">
                    <Clock className="size-4 text-slate-400" aria-hidden="true" />
                    {course.hours} hours of content
                  </li>
                  <li className="flex items-center gap-2.5">
                    <BarChart3 className="size-4 text-slate-400" aria-hidden="true" />
                    {course.level} level
                  </li>
                  <li className="flex items-center gap-2.5">
                    <InfinityIcon className="size-4 text-slate-400" aria-hidden="true" />
                    Learn at your own pace
                  </li>
                </ul>
              </div>
            </div>
          </aside>
        </div>
      </div>

      {/* On small screens the enrol action stays reachable at the bottom of the viewport. */}
      <div className="sticky bottom-0 z-40 border-t border-slate-200 bg-white/95 px-4 py-3 backdrop-blur-md lg:hidden">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4">
          <p className="min-w-0 text-sm text-slate-600">
            <span className="font-semibold text-slate-900">{course.lessons} lessons</span> ·{" "}
            {course.hours}h
          </p>
          <ButtonLink href="/signup" className="shrink-0">
            Start learning
          </ButtonLink>
        </div>
      </div>

      {related.length > 0 && (
        <section aria-labelledby="related-heading" className="border-t border-slate-100 bg-slate-50/60">
          <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
            <h2
              id="related-heading"
              className="border-l-4 border-brand-500 pl-3 font-display text-2xl font-bold tracking-tight text-slate-900"
            >
              You might also like
            </h2>
            <ul className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {related.map((c) => (
                <li key={c.slug}>
                  <CourseCard course={c} />
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}
    </>
  );
}
