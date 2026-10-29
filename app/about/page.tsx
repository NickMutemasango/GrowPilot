import type { Metadata } from "next";
import {
  Accessibility,
  BadgeCheck,
  BookMarked,
  Compass,
  GraduationCap,
  HeartHandshake,
  Library,
  PlayCircle,
  type LucideIcon,
} from "lucide-react";
import DepartmentCard, { type Department } from "@/components/home/DepartmentCard";
import { ButtonLink } from "@/components/ui/Button";
import { courses } from "@/lib/courses";
import { resources } from "@/lib/library";
import { subjects } from "@/lib/subjects";

export const metadata: Metadata = {
  title: "About — GrowPilot",
  description:
    "GrowPilot brings expert-led courses and a digital library together, so anyone can learn at their own pace.",
};

const instructorCount = new Set(courses.map((c) => c.instructor)).size;

const stats = [
  { value: courses.length, label: "Courses" },
  { value: resources.length, label: "Library resources" },
  { value: subjects.length, label: "Subjects" },
  { value: instructorCount, label: "Instructors" },
];

const offerings: Department[] = [
  {
    title: "Courses",
    description:
      "Structured, expert-led courses that take you from first steps to advanced topics, one module at a time.",
    href: "/courses",
    actionLabel: "Explore Courses",
    icon: GraduationCap,
    tone: "brand",
    stat: { value: String(courses.length), label: "courses" },
    tags: ["Beginner to advanced", "Self-paced", "Expert instructors"],
  },
  {
    title: "Digital Library",
    description:
      "Books, study notes and research papers to support every course — or to explore on their own.",
    href: "/library",
    actionLabel: "Browse Library",
    icon: Library,
    tone: "accent",
    stat: { value: String(resources.length), label: "resources" },
    tags: ["Books", "Study notes", "Research papers"],
  },
];

const steps: { icon: LucideIcon; title: string; body: string }[] = [
  {
    icon: Compass,
    title: "Find your topic",
    body: "Search or filter by subject and level to find the course or resource that fits where you are.",
  },
  {
    icon: PlayCircle,
    title: "Learn at your pace",
    body: "Work through lessons and modules whenever suits you — there are no deadlines or timetables.",
  },
  {
    icon: BookMarked,
    title: "Go deeper",
    body: "Every subject links courses and library resources together, so you can always keep exploring.",
  },
];

const values: { icon: LucideIcon; title: string; body: string }[] = [
  {
    icon: BadgeCheck,
    title: "Quality first",
    body: "Courses are taught by subject experts and organised so each lesson builds on the last.",
  },
  {
    icon: Accessibility,
    title: "Open to everyone",
    body: "Clear language, accessible design and self-paced learning that works on any device.",
  },
  {
    icon: HeartHandshake,
    title: "Learner-focused",
    body: "We design around what helps people understand, not around what keeps them clicking.",
  },
];

export default function AboutPage() {
  return (
    <>
      <section className="relative isolate overflow-hidden border-b border-slate-100">
        <div
          aria-hidden="true"
          className="absolute -top-40 left-1/2 -z-10 h-96 w-[min(900px,140vw)] -translate-x-1/2 rounded-full bg-brand-100/80 blur-3xl"
        />
        <div className="mx-auto max-w-4xl px-4 py-16 text-center sm:px-6 sm:py-24 lg:px-8">
          <p className="text-sm font-semibold text-brand-700">About GrowPilot</p>
          <h1 className="mt-3 font-display text-4xl font-extrabold tracking-tight text-balance text-slate-900 sm:text-5xl">
            Learning should have <span className="text-brand-600">no limits</span>
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-lg leading-relaxed text-pretty text-slate-600">
            GrowPilot brings expert-led courses and a digital library together in one place, so
            anyone can build new skills and explore new subjects at their own pace.
          </p>

          <dl className="mx-auto mt-12 grid max-w-3xl grid-cols-2 gap-4 sm:grid-cols-4">
            {stats.map((stat) => (
              <div
                key={stat.label}
                className="rounded-2xl border border-slate-200 bg-white/80 px-4 py-5 shadow-soft"
              >
                <dt className="text-sm text-slate-500">{stat.label}</dt>
                <dd className="mt-1 font-display text-3xl font-extrabold tracking-tight text-slate-900">
                  {stat.value}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      <section aria-labelledby="offer-heading" className="bg-slate-50/60">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
          <h2
            id="offer-heading"
            className="border-l-4 border-brand-500 pl-3 font-display text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl"
          >
            What we offer
          </h2>
          <ul className="mt-8 grid gap-6 md:grid-cols-2">
            {offerings.map((offering) => (
              <li key={offering.title}>
                <DepartmentCard {...offering} headingAs="h3" />
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section aria-labelledby="how-heading" className="border-t border-slate-100">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
          <h2
            id="how-heading"
            className="border-l-4 border-brand-500 pl-3 font-display text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl"
          >
            How it works
          </h2>
          <ol className="mt-8 grid gap-6 md:grid-cols-3">
            {steps.map(({ icon: Icon, title, body }, i) => (
              <li key={title} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-soft">
                <div className="flex items-center gap-3">
                  <span className="grid size-11 place-items-center rounded-xl bg-brand-50 text-brand-600">
                    <Icon className="size-5" aria-hidden="true" />
                  </span>
                  <span className="text-sm font-semibold text-slate-400">Step {i + 1}</span>
                </div>
                <h3 className="mt-5 font-display text-lg font-bold tracking-tight text-slate-900">
                  {title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-pretty text-slate-600">{body}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section aria-labelledby="values-heading" className="border-t border-slate-100 bg-slate-50/60">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
          <h2
            id="values-heading"
            className="border-l-4 border-accent-500 pl-3 font-display text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl"
          >
            What we believe
          </h2>
          <ul className="mt-8 grid gap-8 md:grid-cols-3">
            {values.map(({ icon: Icon, title, body }) => (
              <li key={title}>
                <span className="grid size-11 place-items-center rounded-xl bg-accent-50 text-accent-600">
                  <Icon className="size-5" aria-hidden="true" />
                </span>
                <h3 className="mt-4 font-display text-lg font-bold tracking-tight text-slate-900">
                  {title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-pretty text-slate-600">{body}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="border-t border-slate-100">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
          <div className="relative isolate overflow-hidden rounded-3xl bg-brand-600 px-6 py-12 text-center shadow-float sm:px-12">
            <div
              aria-hidden="true"
              className="absolute -top-24 -right-24 -z-10 size-72 rounded-full bg-brand-400/50 blur-3xl"
            />
            <h2 className="font-display text-2xl font-bold tracking-tight text-white sm:text-3xl">
              Ready to start learning?
            </h2>
            <p className="mx-auto mt-3 max-w-xl text-brand-100">
              Create a free account to enrol in courses and read the library.
            </p>
            <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
              <ButtonLink
                href="/signup"
                size="lg"
                variant="secondary"
                className="border-transparent text-brand-700"
              >
                Create free account
              </ButtonLink>
              <ButtonLink
                href="/courses"
                size="lg"
                className="bg-brand-700 shadow-none hover:bg-brand-800"
              >
                Browse courses
              </ButtonLink>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
