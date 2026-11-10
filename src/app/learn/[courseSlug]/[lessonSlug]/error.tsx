"use client";

import { ArrowLeft, RotateCcw, TriangleAlert } from "lucide-react";
import { LessonHeader } from "@/components/learning/LessonHeader";
import { Button, ButtonLink } from "@/components/ui/Button";

/** Shown if the lesson page fails to load. Never shows the technical error. */
export default function LessonError({ reset }: { error: Error; reset: () => void }) {
  return (
    <div className="[--learn-header-height:4.5rem] sm:[--learn-header-height:5rem]">
      <LessonHeader />
      <section className="mx-auto max-w-2xl px-4 py-20 text-center sm:px-6 sm:py-28">
        <span className="mx-auto flex size-14 items-center justify-center rounded-full bg-accent/30 text-[#6b4e00]">
          <TriangleAlert aria-hidden="true" className="size-10" />
        </span>
        <h1 className="mt-6 text-4xl font-bold tracking-tight text-ink">
          We couldn&apos;t open this lesson
        </h1>
        <p className="mt-4 text-xl leading-relaxed text-ink-muted">
          Something went wrong while loading the lesson. Please check your internet connection and
          try again.
        </p>
        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <Button size="lg" onClick={reset}>
            <RotateCcw aria-hidden="true" className="size-5" />
            Try Again
          </Button>
          <ButtonLink href="/dashboard" variant="secondary" size="lg">
            <ArrowLeft aria-hidden="true" className="size-5" />
            Back to My Courses
          </ButtonLink>
        </div>
      </section>
    </div>
  );
}
