"use client";

import type { ReactNode } from "react";
import { motion, useReducedMotion } from "framer-motion";
import {
  BookOpen,
  Clock,
  Code2,
  Flame,
  Library,
  PlayCircle,
  Star,
  Trophy,
} from "lucide-react";

// Mock data for the illustrative dashboard preview.
const course = {
  category: "Development",
  title: "Web Development Fundamentals",
  instructor: "Daniel Okafor",
  lessons: 12,
  duration: "6h 30m",
  rating: 4.8,
  progress: 72,
  nextLesson: "Lesson 9 · Responsive Layouts",
};

const streakDays = ["M", "T", "W", "T", "F", "S", "S"];
const streakDone = 5;

const ease = [0.22, 1, 0.36, 1] as const;

function FloatingCard({
  children,
  className,
  delay,
}: {
  children: ReactNode;
  className: string;
  delay: number;
}) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay, ease }}
      className={`absolute z-10 ${className}`}
    >
      <motion.div
        animate={reduce ? undefined : { y: [0, -6, 0] }}
        transition={{
          duration: 6,
          delay: delay + 0.6,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="rounded-2xl border border-slate-200/80 bg-white p-3 shadow-float sm:p-3.5"
      >
        {children}
      </motion.div>
    </motion.div>
  );
}

function IconTile({ children, className }: { children: ReactNode; className: string }) {
  return (
    <span className={`grid size-9 shrink-0 place-items-center rounded-xl sm:size-10 ${className}`}>
      {children}
    </span>
  );
}

export default function HeroVisual() {
  const reduce = useReducedMotion();

  return (
    <figure
      aria-label="Preview of the GrowPilot learning dashboard"
      className="relative mx-auto w-full max-w-[540px] pt-12 pb-16 sm:px-10 sm:pt-14 sm:pb-14 lg:max-w-none xl:px-14"
    >
      {/* Main course card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease }}
        className="relative mx-auto w-full max-w-[400px] overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-card"
      >
        <div className="relative h-32 bg-brand-600 sm:h-36">
          <div
            aria-hidden="true"
            className="absolute inset-0 bg-[radial-gradient(rgb(255_255_255/0.18)_1px,transparent_1px)] [background-size:16px_16px]"
          />
          <div className="absolute right-5 bottom-5 grid size-14 place-items-center rounded-2xl bg-white/15 ring-1 ring-white/25 backdrop-blur-sm">
            <Code2 className="size-7 text-white" aria-hidden="true" />
          </div>
          <span className="absolute bottom-5 left-5 rounded-full bg-white/95 px-2.5 py-1 text-xs font-semibold text-brand-700">
            {course.category}
          </span>
        </div>

        <div className="p-5 sm:p-6">
          <h2 className="font-display text-lg leading-snug font-bold text-slate-900 sm:text-xl">
            {course.title}
          </h2>
          <p className="mt-1 text-sm text-slate-500">with {course.instructor}</p>

          <ul className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-sm text-slate-600">
            <li className="flex items-center gap-1.5">
              <BookOpen className="size-4 text-slate-400" aria-hidden="true" />
              {course.lessons} Lessons
            </li>
            <li className="flex items-center gap-1.5">
              <Clock className="size-4 text-slate-400" aria-hidden="true" />
              {course.duration}
            </li>
            <li className="flex items-center gap-1.5">
              <Star className="size-4 fill-accent-500 text-accent-500" aria-hidden="true" />
              {course.rating}
            </li>
          </ul>

          <div className="mt-5">
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium text-slate-700">Progress</span>
              <span className="font-semibold text-brand-700">{course.progress}%</span>
            </div>
            <div
              role="progressbar"
              aria-label="Course progress"
              aria-valuenow={course.progress}
              aria-valuemin={0}
              aria-valuemax={100}
              className="mt-2 h-2 overflow-hidden rounded-full bg-slate-100"
            >
              <motion.div
                initial={{ width: reduce ? `${course.progress}%` : 0 }}
                animate={{ width: `${course.progress}%` }}
                transition={{ duration: 1.1, delay: 0.5, ease }}
                className="h-full rounded-full bg-brand-600"
              />
            </div>
            <p className="mt-2 text-xs text-slate-500">Up next: {course.nextLesson}</p>
          </div>

          {/* Illustrative only — the real action will live on the course page. */}
          <div
            aria-hidden="true"
            className="mt-5 flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-slate-900 text-sm font-semibold text-white"
          >
            <PlayCircle className="size-4" />
            Continue Learning
          </div>
        </div>
      </motion.div>

      {/* Floating cards */}
      <FloatingCard delay={0.35} className="top-0 left-0 sm:top-20">
        <div className="flex items-center gap-3 pr-1">
          <IconTile className="bg-brand-50 text-brand-600">
            <Library className="size-5" aria-hidden="true" />
          </IconTile>
          <div>
            <p className="text-xs font-medium text-slate-500">Digital Library</p>
            <p className="font-display text-sm font-bold text-slate-900 sm:text-base">
              2,000+ Resources
            </p>
          </div>
        </div>
      </FloatingCard>

      <FloatingCard delay={0.5} className="top-0 right-0 hidden sm:block">
        <div className="flex items-center gap-2">
          <IconTile className="bg-accent-50 text-accent-600">
            <Flame className="size-5" aria-hidden="true" />
          </IconTile>
          <div>
            <p className="text-xs font-medium text-slate-500">Learning streak</p>
            <p className="font-display text-base font-bold text-slate-900">7 days</p>
          </div>
        </div>
        <ul className="mt-3 flex gap-1" aria-label={`${streakDone} of 7 days completed this week`}>
          {streakDays.map((day, i) => (
            <li
              key={i}
              aria-hidden="true"
              className={`grid size-6 place-items-center rounded-md text-[10px] font-semibold ${
                i < streakDone ? "bg-accent-500 text-white" : "bg-slate-100 text-slate-400"
              }`}
            >
              {day}
            </li>
          ))}
        </ul>
      </FloatingCard>

      <FloatingCard delay={0.65} className="bottom-0 right-0 sm:right-auto sm:left-0">
        <div className="flex items-center gap-3 pr-1">
          <IconTile className="bg-success-50 text-success-600">
            <Trophy className="size-5" aria-hidden="true" />
          </IconTile>
          <div>
            <p className="text-xs font-medium text-slate-500">Courses Completed</p>
            <p className="font-display text-sm font-bold text-slate-900 sm:text-base">12</p>
          </div>
        </div>
      </FloatingCard>
    </figure>
  );
}
