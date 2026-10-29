import type { ReactNode } from "react";
import { BookOpen, GraduationCap, Sparkles } from "lucide-react";
import { courses } from "@/lib/courses";
import { resources } from "@/lib/library";

const highlights = [
  { icon: GraduationCap, text: `${courses.length} expert-led courses, beginner to advanced` },
  { icon: BookOpen, text: `${resources.length} books, study notes and research papers` },
  { icon: Sparkles, text: "Learn at your own pace, on any device" },
];

/** Split layout for auth pages: form on the left, brand panel on large screens. */
export default function AuthShell({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="relative isolate overflow-hidden">
      <div
        aria-hidden="true"
        className="absolute -top-40 left-1/4 -z-10 h-96 w-[min(700px,120vw)] -translate-x-1/2 rounded-full bg-brand-100/70 blur-3xl"
      />
      <div className="mx-auto grid max-w-6xl gap-12 px-4 py-12 sm:px-6 sm:py-16 lg:grid-cols-2 lg:items-center lg:px-8">
        <div className="mx-auto w-full max-w-md">
          <h1 className="font-display text-3xl font-extrabold tracking-tight text-slate-900">
            {title}
          </h1>
          <p className="mt-2 text-slate-600">{subtitle}</p>
          <div className="mt-8">{children}</div>
        </div>

        <aside
          aria-label="Why GrowPilot"
          className="relative isolate hidden overflow-hidden rounded-3xl bg-brand-600 p-10 text-white shadow-float lg:block"
        >
          <div
            aria-hidden="true"
            className="absolute -top-24 -right-24 -z-10 size-80 rounded-full bg-brand-400/50 blur-3xl"
          />
          <div
            aria-hidden="true"
            className="absolute -bottom-28 -left-20 -z-10 size-72 rounded-full bg-accent-400/30 blur-3xl"
          />
          <p className="font-display text-3xl font-extrabold tracking-tight text-balance">
            Learn. Explore. Grow.
          </p>
          <p className="mt-3 max-w-sm text-brand-100">
            One account for every course and the whole digital library.
          </p>
          <ul className="mt-10 space-y-5">
            {highlights.map(({ icon: Icon, text }) => (
              <li key={text} className="flex items-center gap-4">
                <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-white/15 ring-1 ring-white/20">
                  <Icon className="size-5" aria-hidden="true" />
                </span>
                <span className="font-medium">{text}</span>
              </li>
            ))}
          </ul>
        </aside>
      </div>
    </div>
  );
}
