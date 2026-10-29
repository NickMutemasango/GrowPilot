"use client";

import type { ReactNode } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { FileText, PlayCircle } from "lucide-react";

// Decorative mock activity shown beside the headline on wide screens.
const nowLearning = { title: "UI Design Basics", progress: 64 };
const newInLibrary = { title: "Intro to Data Science", meta: "PDF · 248 pages" };

const ease = [0.22, 1, 0.36, 1] as const;

function Floating({
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
      initial={{ opacity: 0, y: reduce ? 0 : 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: reduce ? 0 : 0.7, delay: reduce ? 0 : delay, ease }}
      className={`absolute ${className}`}
    >
      {/* Idle bob runs in CSS; framer's infinite loop didn't always paint. */}
      <div
        style={{ animationDelay: `${delay + 0.7}s` }}
        className="w-56 rounded-2xl border border-slate-200/80 bg-white/90 p-4 shadow-float backdrop-blur-sm motion-safe:animate-float"
      >
        {children}
      </div>
    </motion.div>
  );
}

export default function HeroFloatingCards() {
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 hidden xl:block">
      <Floating delay={0.6} className="top-24 left-6 -rotate-3">
        <div className="flex items-center gap-3">
          <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-brand-50 text-brand-600">
            <PlayCircle className="size-5" />
          </span>
          <div className="min-w-0">
            <p className="text-xs font-medium text-slate-500">Now learning</p>
            <p className="truncate font-display text-sm font-bold text-slate-900">
              {nowLearning.title}
            </p>
          </div>
        </div>
        <div className="mt-3 flex items-center gap-2">
          <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-slate-100">
            <div
              className="h-full rounded-full bg-brand-500"
              style={{ width: `${nowLearning.progress}%` }}
            />
          </div>
          <span className="text-xs font-semibold text-brand-700">{nowLearning.progress}%</span>
        </div>
      </Floating>

      <Floating delay={0.8} className="top-44 right-6 rotate-3">
        <div className="flex items-center gap-3">
          <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-accent-50 text-accent-600">
            <FileText className="size-5" />
          </span>
          <div className="min-w-0">
            <p className="text-xs font-medium text-slate-500">New in Library</p>
            <p className="truncate font-display text-sm font-bold text-slate-900">
              {newInLibrary.title}
            </p>
            <p className="text-xs text-slate-500">{newInLibrary.meta}</p>
          </div>
        </div>
      </Floating>
    </div>
  );
}
