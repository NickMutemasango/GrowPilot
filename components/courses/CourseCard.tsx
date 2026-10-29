import Link from "next/link";
import { BookOpen, Clock, Star, Users } from "lucide-react";
import type { Course, Level } from "@/lib/courses";
import { subjectStyle } from "@/lib/subjects";

export const levelStyle: Record<Level, string> = {
  Beginner: "bg-success-50 text-success-600",
  Intermediate: "bg-brand-50 text-brand-700",
  Advanced: "bg-accent-50 text-accent-700",
};

const compact = new Intl.NumberFormat("en", { notation: "compact", maximumFractionDigits: 1 });

export default function CourseCard({ course }: { course: Course }) {
  const s = subjectStyle[course.subject];
  const Icon = s.icon;

  return (
    <article className="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-soft transition-[transform,box-shadow,border-color] duration-200 hover:-translate-y-0.5 hover:border-brand-200 hover:shadow-card">
      <div className={`relative grid h-36 place-items-center bg-linear-to-br ${s.tile}`}>
        <Icon
          className={`size-12 transition-transform duration-200 group-hover:scale-110 ${s.iconColor}`}
          aria-hidden="true"
        />
        <span
          className={`absolute top-3 left-3 rounded-full px-2.5 py-1 text-xs font-semibold shadow-sm ${levelStyle[course.level]}`}
        >
          {course.level}
        </span>
      </div>

      <div className="flex flex-1 flex-col p-5">
        <p className="text-xs font-semibold tracking-wide text-slate-500 uppercase">
          {course.subject}
        </p>
        <h3 className="mt-1.5 font-display text-lg font-bold tracking-tight text-slate-900 group-hover:text-brand-700">
          {/* The ::after overlay stretches this link over the whole card. */}
          <Link
            href={`/courses/${course.slug}`}
            className="rounded-md after:absolute after:inset-0 after:rounded-2xl"
          >
            {course.title}
          </Link>
        </h3>
        <p className="mt-1 text-sm text-slate-500">{course.instructor}</p>
        <p className="mt-3 line-clamp-2 text-sm leading-relaxed text-pretty text-slate-600">
          {course.description}
        </p>

        <dl className="mt-auto flex flex-wrap items-center gap-x-4 gap-y-1 border-t border-slate-100 pt-4 text-sm text-slate-600">
          <div className="flex items-center gap-1">
            <dt className="sr-only">Rating</dt>
            <Star className="size-4 fill-accent-400 text-accent-400" aria-hidden="true" />
            <dd className="font-semibold text-slate-900">{course.rating.toFixed(1)}</dd>
          </div>
          <div className="flex items-center gap-1">
            <dt className="sr-only">Lessons</dt>
            <BookOpen className="size-4 text-slate-400" aria-hidden="true" />
            <dd>{course.lessons} lessons</dd>
          </div>
          <div className="flex items-center gap-1">
            <dt className="sr-only">Length</dt>
            <Clock className="size-4 text-slate-400" aria-hidden="true" />
            <dd>{course.hours}h</dd>
          </div>
          <div className="flex items-center gap-1">
            <dt className="sr-only">Students</dt>
            <Users className="size-4 text-slate-400" aria-hidden="true" />
            <dd>{compact.format(course.students)}</dd>
          </div>
        </dl>
      </div>
    </article>
  );
}
