"use client";

import { useState } from "react";
import Link from "next/link";
import { BookOpen } from "lucide-react";
import { subjects, subjectStyle, type Subject } from "@/lib/subjects";

type Item = {
  title: string;
  subject: Subject;
  kind: "Course" | "Book";
  meta: string;
  href: string;
};

// Placeholder content — replace with real data once the platform has it.
const items: Item[] = [
  { title: "Algorithms in Five Levels", subject: "Computer Science", kind: "Course", meta: "18 lessons", href: "/courses/algorithms-in-five-levels" },
  { title: "Matrix Differential Equations", subject: "Mathematics", kind: "Course", meta: "12 lessons", href: "/courses/matrix-differential-equations" },
  { title: "Cell Biology Essentials", subject: "Biology", kind: "Book", meta: "PDF · 240 pages", href: "/library/cell-biology-essentials" },
  { title: "Introduction to Quantum Physics", subject: "Physics", kind: "Course", meta: "20 lessons", href: "/courses/introduction-to-quantum-physics" },
  { title: "Organic Chemistry Study Notes", subject: "Chemistry", kind: "Book", meta: "PDF · 96 pages", href: "/library/organic-chemistry-study-notes" },
  { title: "Principles of Marketing", subject: "Business", kind: "Course", meta: "14 lessons", href: "/courses/principles-of-marketing" },
  { title: "The Modern World, 1900–Today", subject: "History", kind: "Book", meta: "eBook · 312 pages", href: "/library/the-modern-world-1900-today" },
  { title: "UI Design Fundamentals", subject: "Design", kind: "Course", meta: "16 lessons", href: "/courses/ui-design-fundamentals" },
  { title: "Python for Beginners", subject: "Computer Science", kind: "Course", meta: "24 lessons", href: "/courses/python-for-beginners" },
];

function countFor(subject: Subject) {
  return items.filter((item) => item.subject === subject).length;
}

export default function ExploreSection() {
  const [active, setActive] = useState<Subject | "All">("All");
  const visible = active === "All" ? items : items.filter((item) => item.subject === active);

  return (
    <section aria-labelledby="explore-heading" className="border-t border-slate-100 bg-slate-50/60">
      <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
        <div className="flex items-end justify-between gap-4">
          <h2
            id="explore-heading"
            className="border-l-4 border-brand-500 pl-3 font-display text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl"
          >
            Explore
          </h2>
          <Link
            href="/courses"
            className="rounded-md text-sm font-semibold text-brand-700 hover:text-brand-800"
          >
            View all
          </Link>
        </div>

        {/* Scrolls sideways on small screens instead of wrapping into many rows. */}
        <div
          role="group"
          aria-label="Filter by subject"
          className="-mx-4 mt-6 flex gap-2 overflow-x-auto px-4 pb-2 [scrollbar-width:thin] sm:mx-0 sm:flex-wrap sm:overflow-visible sm:px-0"
        >
          {(["All", ...subjects] as const).map((subject) => {
            const selected = active === subject;
            return (
              <button
                key={subject}
                type="button"
                aria-pressed={selected}
                onClick={() => setActive(subject)}
                className={`shrink-0 rounded-full border px-4 py-2 text-sm font-medium transition-colors ${
                  selected
                    ? "border-brand-600 bg-brand-600 text-white"
                    : "border-slate-200 bg-white text-slate-700 hover:border-brand-200 hover:text-brand-700"
                }`}
              >
                {subject}
                {subject !== "All" && (
                  <span className={selected ? "ml-1.5 text-brand-100" : "ml-1.5 text-slate-400"}>
                    ({countFor(subject)})
                  </span>
                )}
              </button>
            );
          })}
        </div>

        <ul className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {visible.map((item) => {
            const s = subjectStyle[item.subject];
            const Icon = s.icon;
            return (
              <li key={item.title}>
                <Link
                  href={item.href}
                  className="group block h-full overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-soft transition-[transform,box-shadow,border-color] duration-200 hover:-translate-y-0.5 hover:border-brand-200 hover:shadow-card"
                >
                  <div className={`relative grid h-36 place-items-center bg-linear-to-br ${s.tile}`}>
                    <Icon
                      className={`size-12 transition-transform duration-200 group-hover:scale-110 ${s.iconColor}`}
                      aria-hidden="true"
                    />
                    <span className="absolute top-3 left-3 inline-flex items-center gap-1 rounded-full bg-white/90 px-2.5 py-1 text-xs font-semibold text-slate-700 shadow-sm">
                      {item.kind === "Book" && <BookOpen className="size-3.5" aria-hidden="true" />}
                      {item.kind}
                    </span>
                  </div>
                  <div className="p-5">
                    <p className="text-xs font-semibold tracking-wide text-slate-500 uppercase">
                      {item.subject}
                    </p>
                    <h3 className="mt-1.5 font-display text-lg font-bold tracking-tight text-slate-900 group-hover:text-brand-700">
                      {item.title}
                    </h3>
                    <p className="mt-2 text-sm text-slate-500">{item.meta}</p>
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
